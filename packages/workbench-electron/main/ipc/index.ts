import {ipcMain} from 'electron';
interface APIResult {
    success: boolean;
    msg?: string; //错误信息
    [prop: string]: any;
}

// 获取历史数据
// 新建文件夹
// 新建文件

export default function initIPC() {
    ipcMain.handle(
        'getFolderFiles',
        (e, browserId): APIResult => {
            return {success: true};
        }
    );
    ipcMain.handle(
        'newFile',
        (e, browserId): APIResult => {
            return {success: true};
        }
    );
    ipcMain.handle(
        'newFolder',
        (e, browserId): APIResult => {
            return {success: true};
        }
    );
}
