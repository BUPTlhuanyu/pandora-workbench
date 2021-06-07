/**
 * @file
 */
import {IServerChannel, Event, IChannel} from 'core/base/ipc/common/ipc';
import {IRawSearchService} from './rawSearchService';
export class SearchChannel implements IServerChannel {

    constructor(private service: IRawSearchService) { }

    listen(_: unknown, event: string, arg?: any): Event<any> {
        switch (event) {
			case 'fileSearch': return this.service.fileSearch(arg);
			case 'textSearch': return this.service.textSearch(arg);
		}
		throw new Error('Event not found');
    }
    call(_: unknown, command: string, arg?: any): Promise<any> {
        switch (command) {
			case 'clearCache': return this.service.clearCache(arg);
		}
		throw new Error('Call not found');
    }
}

export class SearchChannelClient implements IRawSearchService {

	constructor(private channel: IChannel) {}

	fileSearch(search: any) {
		return this.channel.call('fileSearch', search);
	}

	textSearch(search: any) {
		return this.channel.call('textSearch', search);
	}

	clearCache(cacheKey: string): Promise<void> {
		return this.channel.call('clearCache', cacheKey);
	}
}
