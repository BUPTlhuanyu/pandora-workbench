/**
 * @file
 */
import {Menubar, HomeMenubar} from '../menu/menubar';
import {registerContextMenuListener} from '../contextmenu/electron-main/contextmenu';

import path from 'path';
import {app, BrowserWindow, ipcMain, Menu} from 'electron';
import {DEVELOP_PORT} from 'shared/common/constant';

import CodeApplication, {IPC_CHANNEL} from './initService';
import {Injector} from 'core/base/dependency-inject';
import {IFileService} from 'services/files/files';
import {FileService} from 'services/files/fileService';
import {IDialogService, DialogService} from 'services/dialog/dialog';
import {INativeService, NativeService} from 'services/native/native';
import {ICommandService, CommandService} from 'services/command';
// single service
import 'services/search/electron-browser/searchServices';

const MODE = process.env.NODE_ENV === 'production';
// TODO：封装成类，提供 close 等事件注册
function createWindow(dispose: Function) {
    const html = MODE
        ? `file://${path.resolve(app.getAppPath(), './dist/index.html')}`
        : `http://localhost:${DEVELOP_PORT}/index.html`;
    const preload = MODE
        ? path.resolve(app.getAppPath(), './dist/preload.js')
        : path.resolve(app.getAppPath(), './preload.js');
    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        width: 1350,
        height: 900,
        title: '',
        backgroundColor: '#262626',
        // titleBarStyle: 'hidden',
        // trafficLightPosition: {
        //     x: 0,
        //     y: 0
        // },
        webPreferences: {
            preload,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    win.loadURL(html).catch(e => console.error(e));

    win.webContents.on('did-finish-load', () => {
        // splashWindow?.destroy();
    });

    win.on('close', () => {
        IPC_CHANNEL.forEach((item: string) => {
            ipcMain.removeHandler(item);
        });
        dispose();
    });
}

export class CodeMain {
    constructor() {
        this.initServices();
    }
    async startUp(): Promise<void> {
        createWindow(this.resetMenu.bind(this));
        registerContextMenuListener();
    }

    private resetMenu () {
        new HomeMenubar();
    }

    private initServices() {
        const injector = new Injector();

        injector.add(IFileService, {
            useClass: FileService
        });

        injector.add(IDialogService, {
            useClass: DialogService
        });

        injector.add(INativeService, {
            useClass: NativeService
        });

        injector.add(ICommandService, {
            useClass: CommandService
        });

        injector.createInstance(CodeApplication);
        injector.createInstance(Menubar);
    }
}
