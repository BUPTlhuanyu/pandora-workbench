/**
 * @file
 */
import { ChildProcess, fork, ForkOptions } from 'child_process';
import {
    IChannel,
    ChannelServer as IPCServer,
    ChannelClient as IPCClient,
    IChannelClient
} from 'core/base/ipc/common/ipc';
export class Server<TContext extends string> extends IPCServer<TContext> {
    constructor(ctx: TContext) {
        super(
            {
                send: r => {
                    try {
                        if (process.send) {
                        	process.send(r);
                        }
                    } catch (e) {
                        /* not much to do */
                    }
                },
                onMessage: fn => {
					process.on('message', (msg: any) => {
						fn(msg)
					});
				}
            },
            ctx
        );

        process.once('disconnect', () => this.dispose());
    }
}

export interface IIPCOptions {
    /**
     * A descriptive name for the server this connection is to. Used in logging.
     */
    serverName: string;

    /**
     * Time in millies before killing the ipc process. The next request after killing will start it again.
     */
    timeout?: number;

    /**
     * Arguments to the module to execute.
     */
    args?: string[];

    /**
     * Environment key-value pairs to be passed to the process that gets spawned for the ipc.
     */
    env?: any;

    /**
     * Enables our createQueuedSender helper for this Client. Uses a queue when the internal Node.js queue is
     * full of messages - see notes on that method.
     */
    useQueue?: boolean;
}

export class Client implements IChannelClient {
	private child: ChildProcess | null; // 子进程
	private _client: IPCClient | null;
	private channels = new Map<string, IChannel>();

    constructor(private modulePath: string, private options: IIPCOptions) {
        this.child = null;
        this._client = null;
    }

	getChannel<T extends IChannel>(channelName: string): T {
		const that = this;

		return {
			call<T>(command: string, arg?: any): Promise<T> {
				return that.requestPromise<T>(channelName, command, arg);
			}
			// TODO: Event
		} as T;
	}

	private requestPromise<T>(channelName: string, command: string, arg?: any) {
		const channel = this.getCachedChannel(channelName);
		return channel.call<T>(command, arg);
	}

	private getCachedChannel(name: string): IChannel {
		let channel = this.channels.get(name);

		if (!channel) {
			channel = this.client.getChannel(name);
			this.channels.set(name, channel);
		}

		return channel;
	}

	private get client(): IPCClient {
		if (!this._client) {
			const args = this.options && this.options.args ? this.options.args : [];
			const forkOpts: ForkOptions = Object.create(null);
			if (this.options && this.options.env) {
				forkOpts.env = { ...this.options.env };
			}
			console.log('this.modulePath', this.modulePath);
			this.child = fork(this.modulePath, args, forkOpts);
			const send = (r: any) => this.child && this.child.connected && this.child.send(r);
			const onMessage = (fn: any) => {
				this.child && this.child.on('message', (msg: any) => {
					// 从子进程传递过来的数据
					fn(msg);
				});
			};
			const protocol = { send, onMessage };
			this._client = new IPCClient(protocol);

			const onExit = () => this.disposeClient();
			process.once('exit', onExit);

			this.child.on('error', err => console.warn('IPC "' + this.options.serverName + '" errored with ' + err));

			this.child.on('exit', (code: any, signal: any) => {
				process.removeListener('exit' as 'loaded', onExit); // https://github.com/electron/electron/issues/21475

				if (code !== 0 && signal !== 'SIGTERM') {
					console.warn('IPC "' + this.options.serverName + '" crashed with exit code ' + code + ' and signal ' + signal);
				}

				this.disposeClient();
			});
		}
		return this._client;
	}

	private disposeClient() {
		if (this._client) {
			if (this.child) {
				this.child.kill();
				this.child = null;
			}
			this._client = null;
			this.channels.clear();
		}
	}

}
