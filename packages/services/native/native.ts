/**
 * @file 对话框服务
 */
import {createDecorator} from 'core/base/dependency-inject';
export const INativeService = createDecorator<INativeService>('native');

export interface INativeService {
    revealFileInOs: (fullPath: string) => void;
    moveFileToTrash: (fullPath: string) => void;
}

import {shell} from 'electron';

export class NativeService implements INativeService {
    revealFileInOs(fullPath: string) {
        return shell.showItemInFolder(fullPath);
    }
    moveFileToTrash(fullPath: string) {
        return shell.moveItemToTrash(fullPath);
    }
}
