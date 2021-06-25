/**
 * @file 应用启动的时候需要启动的service
 */
import {ipcMain} from 'electron';
import {IFileService} from 'services/files/files';
import {IDialogService} from 'services/dialog/dialog';
import {INativeService} from 'services/native/native';
import {ISearchService} from 'services/search/common/searchService';

class CodeApplication {
    constructor(
        @IFileService private readonly fileService: IFileService,
        @IDialogService private readonly dialogService: IDialogService,
        @INativeService private readonly nativeService: INativeService,
        @ISearchService private readonly diskSearch: ISearchService
    ) {
        // TODO：返回数据格式
        ipcMain.handle('pandora:writeFile', async (event, path: string, data: string) => {
            if (typeof data !== 'string') {
                throw new Error('Invalid operation (vscode:writeNlsFile)');
            }

            return this.fileService.writeFile(path, data);
        });
        ipcMain.handle('pandora:readFile', async (event, path: string) => {
            return this.fileService.readFile(path);
        });
        ipcMain.handle('pandora:renameFile', async (event, oldPath: string, newPath: string, data: string) => {
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
        });

        ipcMain.handle('pandora:renameDir', async (event, oldPath: string, newPath: string) => {
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
        });

        ipcMain.handle('pandora:getDirFiles', async (event, dirPath) => {
            return this.fileService.getDirTree(dirPath);
        });

        ipcMain.handle('pandora:dialog', async () => {
            const result: Record<string, any> = await this.dialogService.openDialog();
            let treeData = null;
            if (!result.canceled && result.filePaths) {
                treeData = this.fileService.getDirTree(result.filePaths[0]);
            }
            return treeData;
        });

        ipcMain.handle('pandora:revealFileInOs', async (event, fullpath: string) => {
            this.nativeService.revealFileInOs(fullpath);
        });

        ipcMain.handle('pandora:moveFileToTrash', async (event, fullpath: string) => {
            this.nativeService.moveFileToTrash(fullpath);
        });

        ipcMain.handle('pandora:fileSearch', async (event: Electron.IpcMainInvokeEvent, dir: string, query: Record<string, string>) => {
            const res = await this.diskSearch.fileSearch({
                dir,
                query
            });
            return {
                status: res.data && res.data.length && 0,
                data: res.data
            };
        });
    }
}

export default CodeApplication;
