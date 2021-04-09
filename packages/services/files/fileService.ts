/**
 * @file 实现文件服务
 */
import {IFileService} from './files';
import EventEmitter from 'events';
import fs from 'fs';
import paths from 'path';

export const fileEvent = new EventEmitter();
// 域名设计
export const FS_EDIT = 'fs:edit';
export const FS_SAVE = 'fs:save';

import {directoryTree, IOnEachFile, IOnEachDirectory} from 'shared/utils/file';

export class FileService implements IFileService{
    constructor() {

    }

    private onEachFile: IOnEachFile = (item: Record<string, any>) => {
        item.key = item.path;
        item.title = item.name;
        item.isLeaf = true;
    }

    private onEachDirectory: IOnEachDirectory = (item: Record<string, any>) => {
        if (item.children.length === 0) {
            item.isLeaf = true;
        }
        item.key = item.path;
        item.title = item.name;
    }

    getDirTree(dirPath: string) {
        console.log('fs', fs);
        let treeData = null;
        if (dirPath) {
            const files = directoryTree(
                dirPath,
                {excludeHidden: true},
                this.onEachFile,
                this.onEachDirectory
            );
            treeData = files ? [files] : [];
        }
        return treeData;
    }

    async renameFile(oldPath: string, newName: string) {
        const oldDir = paths.dirname(oldPath);
        const newPath = paths.join(oldDir, newName);
        console.log('newPath', newPath);
        return await fs.promises.rename(oldPath, newPath).then(() => {
            return newPath;
        }).catch(err => {
            return '';
        });
    }
    async readFile(path: string): Promise<string> {
        if (typeof path !== 'string') {
            return Promise.reject();
        }
        return await fs.promises.readFile(path, {
            encoding: 'utf8'
        });
    }
    // TODO：换成stream
    async writeFile(path: string, content: string): Promise<any> {
        if (typeof path !== 'string') {
            return Promise.reject();
        }
        return await fs.promises.writeFile(path, content, {
            encoding: 'utf8'
        });
    }
}
