/**
 * @file
 */
import {Client} from 'core/base/ipc/node/ipc.cp';
import {SearchChannelClient} from 'services/search/node/searchIpc';
import {registerSingleton} from 'core/base/dependency-inject';
import {ISearchService} from 'services/search/common/searchService';

import {app} from 'electron';
import path from 'path';

const MODE = process.env.NODE_ENV === 'production';

export class DiskSearch implements ISearchService {
    private raw: ISearchService;

    constructor() {
        const opts = {
            serverName: 'Search'
        };
        const searchServerPath = MODE
            ? path.resolve(app.getAppPath(), './dist/search.js')
            : path.resolve(app.getAppPath(), './search.js');
        const client = new Client(searchServerPath, opts);
        const channel = client.getChannel('search');
        this.raw = new SearchChannelClient(channel);
    }

    textSearch(query: any) {
        return this.raw.textSearch(query);
    }

    fileSearch(query: any) {
        return this.raw.fileSearch(query);
    }

    clearCache(cacheKey: string): Promise<void> {
        return this.raw.clearCache(cacheKey);
    }
}

registerSingleton(ISearchService, DiskSearch);
