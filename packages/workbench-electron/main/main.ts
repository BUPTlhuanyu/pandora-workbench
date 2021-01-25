import {app, BrowserWindow} from 'electron';
let splashWindow: BrowserWindow | null = null;

function createSplashWindow() {
    return new Promise(() => {
        splashWindow = new BrowserWindow({
            width: 600,
            height: 400
        });
        console.log(splashWindow);
    });
}

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(async () => {
    await createSplashWindow();
    // createWindow();
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
