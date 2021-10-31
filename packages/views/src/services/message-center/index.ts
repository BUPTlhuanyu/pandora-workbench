/**
 * @file
 */
// TODO: views中其他的消息转发都集中到这里
import {pandora} from 'views/src/services/pandora';

export function revealFileInOs(fullpath: string) {
    pandora.ipcRenderer.invoke('pandora:revealFileInOs', fullpath);
}

export function moveFileToTrash(fullpath: string) {
    pandora.ipcRenderer.invoke('pandora:moveFileToTrash', fullpath);
}
