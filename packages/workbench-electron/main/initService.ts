/**
 * @file 应用启动的时候需要启动的service
 */
import {ipcMain} from 'electron';
import {IFileService} from 'services/files/files';
import {IDialogService} from 'services/dialog/dialog';

class CodeApplication {
    constructor(
        @IFileService private readonly fileService: IFileService,
        @IDialogService private readonly dialogService: IDialogService
    ) {
        ipcMain.handle('taotie:writeFile', async (event, path: string, data: string) => {
            if (typeof data !== 'string') {
                throw new Error('Invalid operation (vscode:writeNlsFile)');
            }

            return this.fileService.writeFile(path, data);
        });
        ipcMain.handle('taotie:readFile', async (event, path: string) => {
            return this.fileService.readFile(path);
        });
        ipcMain.handle('taotie:renameFile', async (event, oldPath: string, newPath: string, data: string) => {
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

        ipcMain.handle('taotie:renameDir', async (event, oldPath: string, newPath: string, data: string) => {
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

        ipcMain.handle('taotie:getDirFiles', async (event, dirPath) => {
            return this.fileService.getDirTree(dirPath);
        });

        ipcMain.handle('taotie:dialog', async event => {
            const result: Record<string, any> = await this.dialogService.openDialog();
            let treeData = null;
            if (!result.canceled && result.filePaths) {
                treeData = this.fileService.getDirTree(result.filePaths[0]);
            }
            return treeData;
        });
    }
}

export default CodeApplication;
