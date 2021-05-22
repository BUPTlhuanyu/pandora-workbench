import {popup} from 'workbench-electron/main/contextmenu/electron-sandbox/contextmenu';
import {CONTEXT_FILE, CONTEXT_DIR, getContextFileItems, CONTEXT_SIDER, getContextSider} from './file';
import {pandora} from 'views/src/services/pandora';
import {fileEvent, FS_EDIT, FS_CREATE_FILE, FS_CREATE_DIR, FS_DELETE, FS_REVEAL} from 'views/src/utils/event';

const CREATE_FILE = 'createFile';
const CREATE_DIR = 'createDir';
const RENAME = 'rename';
const MOVE_TO_TRASH = 'moveToTrash';
const REVEAL_IN_FINDER = 'revealInFinder';

export function registerContextMenu() {
    window.addEventListener('contextmenu', (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        switch (e.target.dataset.context) {
            case CONTEXT_DIR:
            case CONTEXT_FILE: {
                popup(getContextFileItems({
                    key: e.target.dataset.key
                }));
                break;
            }
            case CONTEXT_SIDER: {
                popup(getContextSider());
                break;
            }
            default: break;
        }
    }, false);
}

export function registerTopMenuListener() {
    pandora.ipcRenderer.on(`pandora:${CREATE_FILE}`, () => {
        console.log('pandora:pandora:');
        fileEvent.emit(FS_CREATE_FILE);
    });
    pandora.ipcRenderer.on(`pandora:${CREATE_DIR}`, () => {
        fileEvent.emit(FS_CREATE_DIR);
    });
    pandora.ipcRenderer.on(`pandora:${RENAME}`, () => {
        fileEvent.emit(FS_EDIT);
    });
    pandora.ipcRenderer.on(`pandora:${MOVE_TO_TRASH}`, () => {
        fileEvent.emit(FS_DELETE);
    });
    pandora.ipcRenderer.on(`pandora:${REVEAL_IN_FINDER}`, () => {
        fileEvent.emit(FS_REVEAL);
    });
}
