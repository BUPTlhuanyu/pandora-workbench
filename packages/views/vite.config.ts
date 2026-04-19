import {defineConfig, Plugin} from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

const isWeb = process.env.BUILD_TARGET === 'web';

/**
 * Vite plugin to externalize Electron built-in modules so that
 * they are kept as require() calls at runtime.
 */
function electronRendererPlugin(): Plugin {
    return {
        name: 'electron-renderer',
        enforce: 'pre',
        config() {
            return {
                optimizeDeps: {
                    exclude: ['electron'],
                },
            };
        },
        resolveId(source) {
            if (source === 'electron') {
                return '\0electron';
            }
        },
        load(id) {
            if (id === '\0electron') {
                return 'const m = require("electron"); export default m; export const ipcRenderer = m.ipcRenderer; export const webFrame = m.webFrame; export const crashReporter = m.crashReporter; export const contextBridge = m.contextBridge; export const shell = m.shell; export const clipboard = m.clipboard;';
            }
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ...(!isWeb ? [electronRendererPlugin()] : []),
    ],
    resolve: {
        alias: {
            'views': path.resolve(__dirname, '.'),
            'workbench-electron': path.resolve(__dirname, '../workbench-electron'),
        },
    },
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    build: {
        outDir: isWeb ? 'dist-web' : 'dist',
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
                home: path.resolve(__dirname, 'home.html'),
            },
            ...(isWeb ? {} : {external: ['electron']}),
        },
    },
    base: './',
    server: {
        port: 3000,
        open: isWeb,
    },
});
