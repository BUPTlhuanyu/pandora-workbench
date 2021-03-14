import {IContextMenuItem} from 'workbench-electron/main/contextmenu/common/contextmenu';
import EventEmitter from 'events';

export const fileEvent = new EventEmitter();
// 域名设计
export const FS_REANEM = 'fs:rename';

export const CONTEXT_FILE = 'file';

interface IData{
    key?: string;
}
export function getContextFileItems(data: IData) {
    const items: IContextMenuItem[] = [];

    items.push({
        label: '打开',
        click: () => {
            console.log('123');
        }
    });

    items.push({
        label: '在新窗口打开',
        click: () => {
            console.log('123');
        }
    });

    items.push({type: 'separator'});

    items.push({
        label: '新建文件',
        click: () => {
            console.log('123');
        }
    });

    items.push({
        label: '新建文件夹',
        click: () => {
            console.log('123');
        }
    });


    items.push({type: 'separator'});

    items.push({
        label: '重命名',
        click: () => {
            fileEvent.emit(FS_REANEM, data.key);
        }
    });

    items.push({
        label: '创建副本',
        click: () => {
            console.log('123');
        }
    });

    items.push({type: 'separator'});

    items.push({
        label: '移至回收站',
        click: () => {
            console.log('123');
        }
    });

    items.push({type: 'separator'});

    items.push({
        label: '复制文件路径',
        click: () => {
            console.log('123');
        }
    });

    items.push({
        label: '在finder中显示',
        click: () => {
            console.log('123');
        }
    });
    return items;
}
export const CONTEXT_DIR = 'directory';