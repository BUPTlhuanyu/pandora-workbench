/**
 * @file
 */
import { IChannel, ChannelServer as IPCServer, ChannelClient as IPCClient, IChannelClient } from 'core/base/ipc/common/ipc';
export class Server<TContext extends string> extends IPCServer<TContext> {
	constructor(ctx: TContext) {
		super({
			send: r => {
				try {
					if (process.send) {
						process.send((<Buffer>r.buffer).toString('base64'));
					}
				} catch (e) { /* not much to do */ }
			},
			onMessage: () => {}
		}, ctx);

		process.once('disconnect', () => this.dispose());
	}
}