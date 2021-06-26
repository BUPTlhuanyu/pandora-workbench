/**
 * @file 对话框服务
 */
import {createDecorator} from 'core/base/dependency-inject';
export const ICommandService = createDecorator<ICommandService>('command');

export interface ICommandService {
    createFile: () => void;
    createDir: () => void;
    rename: () => void;
    moveToTrash: () => void;
    revealInFinder: () => void;
}

import {BrowserWindow} from 'electron';

const CREATE_FILE = 'createFile';
const CREATE_DIR = 'createDir';
const RENAME = 'rename';
const MOVE_TO_TRASH = 'moveToTrash';
const REVEAL_IN_FINDER = 'revealInFinder';

export class CommandService implements ICommandService {
    createFile() {
        this.sendToRender(CREATE_FILE);
    }
    createDir() {
        this.sendToRender(CREATE_DIR);
    }
    rename() {
        this.sendToRender(RENAME);
    }
    moveToTrash() {
        this.sendToRender(MOVE_TO_TRASH);
    }
    revealInFinder() {
        this.sendToRender(REVEAL_IN_FINDER);
    }
    private sendToRender(channel: string) {
        console.log(`pandora:${channel}`);
        const window = BrowserWindow.getFocusedWindow();
        window && window.webContents.send(`pandora:${channel}`);
    }
}
