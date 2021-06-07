/**
 * @file
 */
import {createDecorator} from 'core/base/dependency-inject';
export const IRawSearchService = createDecorator<IRawSearchService>('search');

export interface IRawSearchService {
    fileSearch(search: any): any;
    textSearch(search: any): any;
    clearCache(cacheKey: string): Promise<void>;
}

export class SearchService implements IRawSearchService {
    private caches: { [cacheKey: string]: Cache; } = Object.create(null);

    fileSearch(arg: any) {
        console.log('pandora:fileSearch', arg);
    }

    textSearch() {

    }



	clearCache(cacheKey: string): Promise<void> {
		delete this.caches[cacheKey];
		return Promise.resolve(undefined);
	}
}
