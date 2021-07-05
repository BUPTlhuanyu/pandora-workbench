/**
 * @file app
 */
import path from 'path';
import {app, BrowserWindow, ipcMain} from 'electron';
import {HomeMenubar} from './menu/menubar';
import {DEVELOP_PORT} from 'shared/common/constant';

import {registerContextMenuListener} from './contextmenu/electron-main/contextmenu';
import {CodeMain} from './editor/editorMain';

/// #if IS_DEV
import installExtension, {REACT_DEVELOPER_TOOLS} from 'electron-devtools-installer';
/// #endif

let splashWindow: BrowserWindow | null = null;

const MODE = process.env.NODE_ENV === 'production';

function createHome() {
    const html = MODE
        ? `file://${path.resolve(app.getAppPath(), './dist/home.html')}`
        : `http://localhost:${DEVELOP_PORT}/home.html`;
    const preload = MODE
        ? path.resolve(app.getAppPath(), './dist/preload.js')
        : path.resolve(app.getAppPath(), './preload.js');
    const win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        width: 800,
        height: 600,
        title: '',
        backgroundColor: '#131419',
        titleBarStyle: 'hidden',
        trafficLightPosition: {
            x: 0,
            y: 0
        },
        webPreferences: {
            preload,
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });

    win.loadURL(html).catch(e => console.error(e));

    win.webContents.on('did-finish-load', () => {
        splashWindow?.destroy();
    });
}

class Home {
    constructor () {
        new HomeMenubar();
        this.registerListeners();
    }
    private registerListeners () {
        process.on('uncaughtException', err => this.onUnexpectedError(err));
        app.whenReady().then(async () => {
            /// #if IS_DEV
            installExtension(REACT_DEVELOPER_TOOLS)
                .then(name => console.log(`Added Extension:  ${name}`))
                .catch(err => console.log('An error occurred: ', err));
            /// #endif

            // await createSplashWindow();
            await createHome();
            registerContextMenuListener();
        });

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit();
            }
        });

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createHome();
            }
        });
    }

    private onUnexpectedError(err: Error): void {
        if (err) {
            // take only the message and stack property
            // const friendlyError = {
            //     message: `[uncaught exception in main]: ${err.message}`,
            //     stack: err.stack
            // };

            // TODO: handle on client side
            // this.windowsMainService?.sendToFocused('vscode:reportError', JSON.stringify(friendlyError));
        }

        // TODO: logService
    }

    startUp() {
        ipcMain.handle('pandora:mdEditor', async (event, dirPath) => {
            const codeMain = new CodeMain();
            codeMain.startUp();
            return;
        });
    }
}

const home = new Home();
home.startUp();
