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

// TODO: 封装成常用的文件服务
export class FileService implements IFileService {
    private readonly onEachFile: IOnEachFile = (item: Record<string, any>) => {
        item.key = item.path;
        item.title = item.name;
        item.exist = true;
        item.isLeaf = true;
    };

    private readonly onEachDirectory: IOnEachDirectory = (item: Record<string, any>) => {
        item.key = item.path;
        item.exist = true;
        item.title = item.name;
    };

    getDirTree(dirPath: string) {
        let treeData = null;
        if (dirPath) {
            const files = directoryTree(
                dirPath,
                {
                    excludeHidden: true,
                    extensions: /\.md$/
                },
                this.onEachFile,
                this.onEachDirectory
            );
            treeData = files ? [files] : [];
        }
        return treeData;
    }

    async renameFile(oldPath: string, newName: string, content: string) {
        const oldDir = paths.dirname(oldPath);
        const newPath = paths.join(oldDir, newName);
        if (fs.existsSync(newPath)) {
            return Promise.reject('');
        }
        if (!fs.existsSync(oldPath)) {
            return await fs.promises.writeFile(newPath, content, {
                encoding: 'utf8'
            }).then(() => {
                return newPath;
            }).catch(() => {
                return Promise.reject('');
            });
        } else {
            return await fs.promises.rename(oldPath, newPath).then(() => {
                return newPath;
            }).catch(err => { // eslint-disable-line
                return Promise.reject('');;
            });
        }
    }

    async renameDir(oldPath: string, newName: string) {
        const oldDir = paths.dirname(oldPath);
        const newPath = paths.join(oldDir, newName);
        if (fs.existsSync(newPath)) {
            return Promise.reject('');
        }
        if (!fs.existsSync(oldPath)) {
            return await fs.promises.mkdir(newPath).then(() => {
                return newPath;
            }).catch(() => {
                return Promise.reject('');
            });
        } else {
            return await fs.promises.rename(oldPath, newPath).then(() => {
                return newPath;
            }).catch(err => { // eslint-disable-line
                return Promise.reject('');;
            });
        }
        // 修改文件夹的名称
    }

    async readFile(path: string): Promise<string> {
        if (typeof path !== 'string') {
            return Promise.reject('');
        }
        if (fs.statSync(path).isDirectory()) {
            return Promise.reject('');
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
