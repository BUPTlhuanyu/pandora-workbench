/**
 * @file 对话框服务
 */
import {createDecorator} from 'core/base/dependency-inject';
import {dialog} from 'electron';

export const IDialogService = createDecorator<IDialogService>('dialog');

export interface IDialogService {
    openDialog: () => Promise<Electron.OpenDialogReturnValue>;
}

export class DialogService implements IDialogService {
    openDialog () {
        return dialog.showOpenDialog({
            properties: [
                'openFile',
                'openDirectory',
                'createDirectory' // macOS only
            ],
        });
    }
}
