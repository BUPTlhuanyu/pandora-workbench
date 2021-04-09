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
        ipcMain.handle('taotie:writeFile', async (event, path: string, data: unknown) => {
			if (typeof data !== 'string') {
				throw new Error('Invalid operation (vscode:writeNlsFile)');
			}

			return this.fileService.writeFile(path, data);
		});
        ipcMain.handle('taotie:readFile', async (event, path: string) => {
			return this.fileService.readFile(path);
		});
        ipcMain.handle('taotie:renameFile', async (event, oldPath: string, newPath: string) => {
			return this.fileService.renameFile(oldPath, newPath);
		});

		ipcMain.on('taotie:dialog', async (event) => {
			console.log('taotie:dialog', this.dialogService, this.fileService);
			const result: Record<string, any> = await this.dialogService.openDialog();
			let treeData = null;
			console.log('result', result, this.fileService);
			if (!result.canceled && result.filePaths) {
				treeData = this.fileService.getDirTree(result.filePaths[0]);
			}
			console.log('treeData', treeData);
			return treeData;
		});
    }
}

export default CodeApplication;
