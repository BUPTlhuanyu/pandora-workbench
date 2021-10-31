import {IContextMenuItem} from 'workbench-electron/main/contextmenu/common/contextmenu';
import {fileEvent, FS_EDIT, FS_CREATE_FILE, FS_CREATE_DIR, FS_DELETE, FS_REVEAL} from '../../../utils/event';

export const CONTEXT_FILE = 'file';
export const CONTEXT_DIR = 'directory';
export const CONTEXT_SIDER = 'sider';

interface IData{
    key?: string;
}
export function getContextFileItems(data: IData) {
    const items: IContextMenuItem[] = [];

    // items.push({
    //     label: '打开',
    //     click: () => {
    //         console.log('123');
    //     }
    // });

    // items.push({
    //     label: '在新窗口打开',
    //     click: () => {
    //         console.log('123');
    //     }
    // });

    items.push({type: 'separator'});

    items.push({
        label: '新建文件',
        click: () => {
            fileEvent.emit(FS_CREATE_FILE);
        }
    });

    items.push({
        label: '新建文件夹',
        click: () => {
            fileEvent.emit(FS_CREATE_DIR);
        }
    });

    items.push({type: 'separator'});

    items.push({
        label: '重命名',
        click: () => {
            fileEvent.emit(FS_EDIT, data.key);
        }
    });

    // items.push({
    //     label: '创建副本',
    //     click: () => {
    //         console.log('123');
    //     }
    // });

    items.push({type: 'separator'});

    items.push({
        label: '移至回收站',
        click: () => {
            data.key && fileEvent.emit(FS_DELETE, data.key);
        }
    });

    items.push({type: 'separator'});

    items.push({
        label: '在finder中显示',
        click: () => {
            data.key && fileEvent.emit(FS_REVEAL, data.key);
        }
    });
    return items;
}

export function getContextSider() {
    const items: IContextMenuItem[] = [];

    items.push({
        label: '新建文件',
        click: () => {
            fileEvent.emit(FS_CREATE_FILE);
        }
    });

    items.push({
        label: '新建文件夹',
        click: () => {
            fileEvent.emit(FS_CREATE_DIR);
        }
    });
    return items;
}
