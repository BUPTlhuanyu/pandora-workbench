import EventEmitter from 'events';
import fs from 'fs';
import paths from 'path';

export const fileEvent = new EventEmitter();
// 域名设计
export const FS_EDIT = 'fs:edit';

export async function renameFile(oldPath: string, newName: string) {
    const oldDir = paths.dirname(oldPath);
    const newPath = paths.join(oldDir, newName);
    console.log('newPath', newPath);
    return fs.promises.rename(oldPath, newPath).then(() => {
        return newPath;
    });
}

export async function getFileString(path: string) {
    if (typeof path !== 'string') {
        return Promise.reject();
    }
    return fs.promises.readFile(path, {
        encoding: 'utf8'
    });
}
