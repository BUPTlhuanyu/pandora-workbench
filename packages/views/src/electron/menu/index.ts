import {popup} from 'workbench-electron/main/contextmenu/electron-sandbox/contextmenu';
import {CONTEXT_FILE, CONTEXT_DIR, getContextFileItems, CONTEXT_SIDER, getContextSider} from './file';

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
