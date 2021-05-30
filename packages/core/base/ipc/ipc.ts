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

/////////////////////////////////////////////////////////////////////////////
////                          request type                               ////
/////////////////////////////////////////////////////////////////////////////
export const enum RequestType {
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
export const enum ResponseType {
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
    onMessage: Event<any>;
}

// TODO: buffer
// allocate size to buffer

export class ChannelServer<TContext = string> implements IChannelServer<TContext>, IDisposable {
    private channels = new Map<string, IServerChannel<TContext>>();
    private protocolListener: IDisposable | null;

    constructor(private protocol: IMessagePassingProtocol, channelName: string) {
        this.protocolListener = this.protocol.onMessage(msg => this.onRawMessage(msg));
    }
    registerChannel(channelName: string, channel: IServerChannel<TContext>) {
        this.channels.set(channelName, channel);
    }
    dispose() {

    }
    private onRawMessage(message: any) {
        
    }
}
