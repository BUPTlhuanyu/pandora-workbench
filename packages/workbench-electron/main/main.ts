import path from 'path';
import {app, BrowserWindow} from 'electron';
import logoIcon from '../assets/png/logo.svg';
import pkg from '../package.json';
import {DEVELOP_PORT} from '../../shared/common/constant';

let splashWindow: BrowserWindow | null = null;

const MODE = process.env.NODE_ENV === 'production';

function createSplashWindow() {
    return new Promise(resolve => {
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body,
                        html {
                            width: 100%;
                            height: 100%;
                            margin: 0;
                            overflow: hidden;
                            position: relative;
                            background: #3e7bd2;
                            background-repeat: no-repeat;
                            -webkit-user-select: none;
                        }
                        .logo {
                            width: 90px;
                            height: 90px;
                            margin-right: 20px;
                        }
                        h1 {
                            margin: 0;
                            padding: 0;
                            line-height: 48px;
                            font-size: 48px;
                            text-align: center;
                            color: #f1f1f1;
                        }
                        .top {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin-top: 150px;
                        }
                        .version {
                            margin-top: 50px;
                            text-align: center;
                            font-weight: bold;
                            color: #ddd;
                        }
                        .tip {
                            position: absolute;
                            right: 20px;
                            bottom: 20px;
                            margin: 0;
                            color: #999;
                        }
                        .animate__rubberBand {
                            -webkit-animation-name: rubberBand;
                            animation-name: rubberBand;
                        }
                        .animate__animated {
                            -webkit-animation-duration: 1s;
                            animation-duration: 1s;
                            -webkit-animation-duration: var(--animate-duration);
                            animation-duration: var(--animate-duration);
                            -webkit-animation-fill-mode: both;
                            animation-fill-mode: both;
                            animation-delay: 150ms;
                        }
                        :root {
                            --animate-duration: 1s;
                            --animate-delay: 1s;
                            --animate-repeat: 1;
                        }
                        @keyframes rubberBand {
                            from {
                              -webkit-transform: scale3d(1, 1, 1);
                              transform: scale3d(1, 1, 1);
                            }
                          
                            30% {
                              -webkit-transform: scale3d(1.25, 0.75, 1);
                              transform: scale3d(1.25, 0.75, 1);
                            }
                          
                            40% {
                              -webkit-transform: scale3d(0.75, 1.25, 1);
                              transform: scale3d(0.75, 1.25, 1);
                            }
                          
                            50% {
                              -webkit-transform: scale3d(1.15, 0.85, 1);
                              transform: scale3d(1.15, 0.85, 1);
                            }
                          
                            65% {
                              -webkit-transform: scale3d(0.95, 1.05, 1);
                              transform: scale3d(0.95, 1.05, 1);
                            }
                          
                            75% {
                              -webkit-transform: scale3d(1.05, 0.95, 1);
                              transform: scale3d(1.05, 0.95, 1);
                            }
                          
                            to {
                              -webkit-transform: scale3d(1, 1, 1);
                              transform: scale3d(1, 1, 1);
                            }
                          }
                    </style>
                </head>
                <body>
                    <div class="top">
                        <img class="logo" src="${logoIcon}"/>
                        <h1 id="name" class="animate__rubberBand animate__animated">${pkg.productName}</h1>
                    </div>
                    <p class="version">Version ${pkg.version}</p>
                </body>
            </html>
        `;
        splashWindow = new BrowserWindow({
            width: 600,
            height: 400,
            show: false,
            frame: false,
            movable: true,
            resizable: false,
            autoHideMenuBar: true
        });
        splashWindow
            .loadURL('data:text/html;charset=UTF-8,' + encodeURIComponent(html))
            .then(() => splashWindow?.show());
        splashWindow.webContents.on('did-finish-load', () => {
            setTimeout(() => {
                resolve('');
            }, 1500);
        });
        console.log(splashWindow);
    });
}

function createWindow() {
    const html = MODE
        ? `file://${path.resolve(app.getAppPath(), './dist/index.html')}`
        : `http://localhost:${DEVELOP_PORT}/index.html`;
    const win = new BrowserWindow({
        fullscreen: true,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadURL(html).catch(e => console.error(e));

    win.webContents.on('did-finish-load', () => {
        splashWindow?.destroy();
        win.webContents.openDevTools();
    });
}

app.whenReady().then(async () => {
    await createSplashWindow();
    await createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
