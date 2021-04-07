/**
 * @file 应用启动的时候需要启动的service
 */
import {ipcMain} from 'electron';
import {IFileService} from 'services/files/files';

export default class CodeApplication {
    constructor(
        @IFileService private readonly fileService: IFileService,
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
    }
}
