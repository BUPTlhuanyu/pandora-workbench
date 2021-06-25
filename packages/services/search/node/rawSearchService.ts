/**
 * @file
 */
import {SyncFindTextInDir} from 'core/base/common/node/search';
import {ISearchService as IRawSearchService} from 'services/search/common/searchService';

export class SearchService implements IRawSearchService {
    private caches: { [cacheKey: string]: Cache; } = Object.create(null);

    fileSearch(arg: any) {
        if (!arg.query) {
            return null;
        }
        const finder = new SyncFindTextInDir({
            pattern: arg.query.value,
            caseSensitive: arg.query.caseSensitive,
            wholeWord: arg.query.wholeWord,
            targetDir: arg.dir,
            fileFilter: /\.md$/
        });
        return finder.findSync();
    }

    textSearch() {

    }



	clearCache(cacheKey: string): Promise<void> {
		delete this.caches[cacheKey];
		return Promise.resolve(undefined);
	}
}
