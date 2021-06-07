/**
 * @file
 */
import {createDecorator} from 'core/base/dependency-inject';
export const ISearchService = createDecorator<ISearchService>('search');

/**
 * A service that enables to search for files or with in files.
 */
export interface ISearchService {
    textSearch(query: any): any;
    fileSearch(query: any): any;
    clearCache(query: any): any;
}
