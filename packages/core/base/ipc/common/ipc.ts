/**
 * 可取消的
 */
export interface IDisposable {
    dispose(): void;
}

export interface Event<T> {
    (listener: (e: T) => any, thisArgs?: any): IDisposable;
}

/////////////////////////////////////////////////////////////////////////////
////                          server interface                           ////
/////////////////////////////////////////////////////////////////////////////
/**
 * `IServerChannel` 与 `IChannel` 是对应的, 前者在服务端。
 * call 用于处理远程命令，返回一个promise
 * listen 用于处理远程事件，返回一个event事件
 */
export interface IServerChannel<TContext = string> {
    call<T>(ctx: TContext, command: string, arg?: any): Promise<T>;
    listen<T>(ctx: TContext, event: string, arg?: any): Event<T>;
}

/**
 * An `IChannelServer` hosts a collection of channels. You are
 * able to register channels onto it, provided a channel name.
 */
export interface IChannelServer<TContext = string> {
    registerChannel(channelName: string, channel: IServerChannel<TContext>): void;
}

/////////////////////////////////////////////////////////////////////////////
////                          client interface                           ////
/////////////////////////////////////////////////////////////////////////////

/**
 * `IChannel`
 */
export interface IChannel {
    call<T>(command: string, arg?: any): Promise<T>;
    listen<T>(event: string, arg?: any): Event<T>;
}

/**
 * An `IChannelClient` has access to a collection of channels. You
 * are able to get those channels, given their channel name.
 */
export interface IChannelClient {
    getChannel<T extends IChannel>(channelName: string): T;
}

interface IHandler {
	(response: IRawResponse): void;
}

/////////////////////////////////////////////////////////////////////////////
////                          request type                               ////
/////////////////////////////////////////////////////////////////////////////
export enum RequestType {
    Promise = 100,
    PromiseCancel = 101,
    EventListen = 102,
    EventDispose = 103
}

function requestTypeToStr(type: RequestType): string {
    switch (type) {
        case RequestType.Promise:
            return 'req';
        case RequestType.PromiseCancel:
            return 'cancel';
        case RequestType.EventListen:
            return 'subscribe';
        case RequestType.EventDispose:
            return 'unsubscribe';
    }
}

type IRawPromiseRequest = {type: RequestType.Promise; id: number; channelName: string; name: string; arg: any};
type IRawPromiseCancelRequest = {type: RequestType.PromiseCancel; id: number};
type IRawEventListenRequest = {type: RequestType.EventListen; id: number; channelName: string; name: string; arg: any};
type IRawEventDisposeRequest = {type: RequestType.EventDispose; id: number};
type IRawRequest = IRawPromiseRequest | IRawPromiseCancelRequest | IRawEventListenRequest | IRawEventDisposeRequest;

/////////////////////////////////////////////////////////////////////////////
////                          response type                              ////
/////////////////////////////////////////////////////////////////////////////
export enum ResponseType {
    Initialize = 200,
    PromiseSuccess = 201,
    PromiseError = 202,
    PromiseErrorObj = 203,
    EventFire = 204
}

function responseTypeToStr(type: ResponseType): string {
    switch (type) {
        case ResponseType.Initialize:
            return `init`;
        case ResponseType.PromiseSuccess:
            return `reply:`;
        case ResponseType.PromiseError:
        case ResponseType.PromiseErrorObj:
            return `replyErr:`;
        case ResponseType.EventFire:
            return `event:`;
    }
}

type IRawInitializeResponse = { type: ResponseType.Initialize };
type IRawPromiseSuccessResponse = { type: ResponseType.PromiseSuccess; id: number; data: any };
type IRawPromiseErrorResponse = { type: ResponseType.PromiseError; id: number; data: { message: string, name: string, stack: string[] | undefined } };
type IRawPromiseErrorObjResponse = { type: ResponseType.PromiseErrorObj; id: number; data: any };
type IRawEventFireResponse = { type: ResponseType.EventFire; id: number; data: any };
type IRawResponse = IRawInitializeResponse | IRawPromiseSuccessResponse | IRawPromiseErrorResponse | IRawPromiseErrorObjResponse | IRawEventFireResponse;

/////////////////////////////////////////////////////////////////////////////
////                        protocol interface                           ////
/////////////////////////////////////////////////////////////////////////////

export interface IMessagePassingProtocol {
    send(data: any): void;
    onMessage(e: any): any;
}

// TODO: buffer
// allocate size to buffer

export class ChannelServer<TContext = string> implements IChannelServer<TContext>, IDisposable {
    private channels = new Map<string, IServerChannel<TContext>>();
    private protocolListener: IDisposable | null;

    constructor(private protocol: IMessagePassingProtocol, channelName: string) {
        this.protocolListener = this.protocol.onMessage((msg: any) => this.onRawMessage(msg));
    }
    registerChannel(channelName: string, channel: IServerChannel<TContext>) {
        this.channels.set(channelName, channel);
    }
    dispose() {
        if (this.protocolListener) {
            this.protocolListener = null;
        }
    }
    private onRawMessage(message: any) {
        const {channelName, command, arg, id} = message;
        const channel = this.channels.get(channelName);
        return this.protocol.send({
            id,
            data: channel?.listen(channelName, command, arg)
        });
    }
}

/**
 * ChannelClient 客户端是主线程中创建的，在创建客户端的过程中会创建子进程
 */
export class ChannelClient implements IChannelClient, IDisposable {
    private protocolListener: IDisposable | null;
    private handlers = new Map<number, Function>();
    private isDisposed: boolean = false;
    private lastRequestId: number = 0;

    constructor(private protocol: IMessagePassingProtocol) {
		this.protocolListener = this.protocol.onMessage((msg: any) => this.onBuffer(msg));
	}

    // TODO: should be buffer data
    private onBuffer(message: any): void {
        // deserialize 反序列化之后的数据
		// const reader = new BufferReader(message);
		// const header = deserialize(reader);
		// const body = deserialize(reader);
		// const type: ResponseType = header[0];
        // switch (type) {
            // case 'A': return this.onResponse({ type: header[0], id: header[1], data: body });
        // }
        // const data = JSON.parse(message);
        return this.onResponse(message);
    }

	private onResponse(response: IRawResponse): void {
        if (response.type === ResponseType.Initialize) {
            // 初始消息
            return;
        }

		const handler = this.handlers.get(response.id);

		if (handler) {
			handler(response);
		}
	}

    getChannel<T extends IChannel>(channelName: string): T {
        const that = this;

        return {
            call(command: string, arg?: any) {
                if (that.isDisposed) {
                    return Promise.reject();
                }
                return that.requestPromise(channelName, command, arg);
            },
            // listen(event: string, arg: any) {
            //     if (that.isDisposed) {
            //         return Promise.reject();
            //     }
            //     return that.requestEvent(channelName, event, arg);
            // }
        } as T;
    }

    private requestPromise(channelName: string, command: string, arg?: any): Promise<any> {
        const id = this.lastRequestId++;
        const request = {id, channelName, command, arg};
        const result = new Promise((resolve, reject) => {
            const doRequest = () => {
                const handler = (response: any) => {
                    resolve(response);
                }
                this.handlers.set(id, handler);
				this.sendRequest(request);
            };
            doRequest();
        })
        return result.finally(() => {
            // do something
        });
    }

    // private requestEvent(channelName: string, name: string, arg?: any): Event<any> {
    //     const id = this.lastRequestId++;
    //     // 当onResponse的时候，执行handler并且利用event.emit触发事件处理函数
    //     const handler: IHandler = (res: IRawResponse) => emitter.fire((res as IRawEventFireResponse).data);
    //     this.handlers.set(id, handler);

    //     return emitter.event;
    // }
    
    private sendRequest(message: any): number {
        try {
            this.protocol.send(message);
            return message.byteLength;
        } catch (err) {
            // noop
            return 0;
        }
    }

    dispose() {
        this.isDisposed = true;
        if (this.protocolListener) {
            this.protocolListener = null;
        }
    }
}
