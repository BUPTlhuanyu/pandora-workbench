/**
 * @file 定义服务接口
 */
import {createDecorator} from 'core/base/dependency-inject';

// TODO: uri
type URI = string;

// 创建装饰器
export const IFileService = createDecorator<IFileService>('fileService');

/**
 * 定义服务的接口
 * 参考vscode中platform/files
 */
export interface IFileService {
    /**
     * Read the contents of the provided resource unbuffered.
     */
    readFile(resource: URI): Promise<string>;

    /**
     * rename
     */
    renameFile(resource: URI, newResource: URI, content: string): Promise<URI | void>;

    /**
     * Updates the content replacing its previous value.
     */
    writeFile(resource: URI, content: string): Promise<string>;

    getDirTree(resource: URI): any[] | null
}
