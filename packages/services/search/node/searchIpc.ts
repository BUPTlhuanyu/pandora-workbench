/**
 * @file
 */
import {IServerChannel, Event, IChannel} from 'core/base/ipc/common/ipc';
import {ISearchService} from 'services/search/common/searchService';
export class SearchChannel implements IServerChannel {

    constructor(private service: ISearchService) { }

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

export class SearchChannelClient implements ISearchService {

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
