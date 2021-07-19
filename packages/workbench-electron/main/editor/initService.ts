/**
 * @file 应用启动的时候需要启动的service
 */
import {ipcMain} from 'electron';
import {IFileService} from 'services/files/files';
import {IDialogService} from 'services/dialog/dialog';
import {INativeService} from 'services/native/native';
import {ISearchService} from 'services/search/common/searchService';

export const IPC_CHANNEL = [
    'pandora:writeFile',
    'pandora:readFile',
    'pandora:renameFile',
    'pandora:renameDir',
    'pandora:getDirFiles',
    'pandora:dialog',
    'pandora:revealFileInOs',
    'pandora:moveFileToTrash',
    'pandora:fileSearch',
    'pandora:storeImage'
];

class CodeApplication {
    constructor(
        @IFileService private readonly fileService: IFileService,
        @IDialogService private readonly dialogService: IDialogService,
        @INativeService private readonly nativeService: INativeService,
        @ISearchService private readonly diskSearch: ISearchService
    ) {
        // TODO：返回数据格式
        IPC_CHANNEL.forEach((item: string) => {
            const handlerName = item.split(':')[1];
            ipcMain.handle(item, (this[handlerName as keyof CodeApplication] as Function).bind(this))
        });
    }

    private async writeFile (event: Electron.IpcMainInvokeEvent, path: string, data: string) {
        if (typeof data !== 'string') {
            throw new Error('Invalid operation (vscode:writeNlsFile)');
        }

        return this.fileService.writeFile(path, data);
    }

    private async readFile (event: Electron.IpcMainInvokeEvent, path: string) {
        return this.fileService.readFile(path);
    }

    private async renameFile (event: Electron.IpcMainInvokeEvent, oldPath: string, newPath: string, data: string) {
        const result = await this.fileService.renameFile(oldPath, newPath, data).catch(err => console.log(err));
        if (result) {
            return {
                success: true,
                data: result
            };
        } else {
            return {
                success: false,
                data: ''
            };
        }
    }

    private async renameDir (event: Electron.IpcMainInvokeEvent, oldPath: string, newPath: string) {
        const result = await this.fileService.renameDir(oldPath, newPath).catch(err => console.log(err));
        if (result) {
            return {
                success: true,
                data: result
            };
        } else {
            return {
                success: false,
                data: ''
            };
        }
    }

    private async getDirFiles (event: Electron.IpcMainInvokeEvent, dirPath: string) {
        return this.fileService.getDirTree(dirPath);
    }

    private async dialog () {
        const result: Record<string, any> = await this.dialogService.openDialog();
        let treeData = null;
        if (!result.canceled && result.filePaths) {
            treeData = this.fileService.getDirTree(result.filePaths[0]);
        }
        return treeData;
    }

    private async revealFileInOs (event: Electron.IpcMainInvokeEvent, fullpath: string) {
        this.nativeService.revealFileInOs(fullpath);
    };

    private async moveFileToTrash (event: Electron.IpcMainInvokeEvent, fullpath: string) {
        this.nativeService.moveFileToTrash(fullpath);
    }

    private async fileSearch (event: Electron.IpcMainInvokeEvent, dir: string, query: Record<string, string>) {
        const res = await this.diskSearch.fileSearch({
            dir,
            query
        });
        return {
            status: res.data && res.data.length && 0,
            data: res.data
        };
    }
    private async storeImage (event: Electron.IpcMainInvokeEvent, data: any) {
        let res = {
            success: false,
            data: ''
        };
        if (data && data.name && data.base64) {
            const path = await this.fileService.storeImgFromBase64(data.name, data.base64);
            path && (res = {
                success: true,
                data: path
            });
        }
        return res;
    }
}

export default CodeApplication;
