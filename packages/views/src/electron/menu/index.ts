import {popup} from 'workbench-electron/main/contextmenu/electron-sandbox/contextmenu';
import {CONTEXT_FILE, getContextFileItems} from './file';

export function registerContextMenu() {
    window.addEventListener('contextmenu', (e: MouseEvent) => {
        if (!(e.target instanceof HTMLElement)) {
            return;
        }
        switch (e.target.dataset.context) {
            case CONTEXT_FILE: {
                popup(getContextFileItems({
                    key: e.target.dataset.key
                }));
                break;
            }
            default: break;
        }
    }, false);
}
