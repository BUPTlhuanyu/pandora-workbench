import {defineConfig} from 'tsup';
import {copyFileSync, mkdirSync, existsSync} from 'fs';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
    entry: {
        index: './main/main.ts',
        search: '../services/search/node/searchApp.ts',
    },
    outDir: './app/dist',
    format: ['cjs'],
    target: 'node18',
    platform: 'node',
    sourcemap: !isProd,
    minify: isProd,
    clean: true,
    external: ['electron'],
    // 将 workspace 内部包打包进 bundle，不作为外部依赖
    noExternal: ['core', 'shared', 'services'],
    define: {
        'IS_DEV': JSON.stringify(!isProd),
    },
    esbuildOptions(options) {
        options.resolveExtensions = ['.ts', '.js', '.json'];
        // 配置路径别名，让 esbuild 能解析 workspace 包的子路径引用
        options.alias = {
            'core': path.resolve(__dirname, '../core'),
            'shared': path.resolve(__dirname, '../shared'),
            'services': path.resolve(__dirname, '../services'),
        };
    },
    onSuccess: async () => {
        // 复制 preload.js 到输出目录
        const outDir = path.resolve('./app/dist');
        if (!existsSync(outDir)) {
            mkdirSync(outDir, {recursive: true});
        }
        copyFileSync(
            path.resolve('./common/preload.js'),
            path.resolve(outDir, 'preload.js')
        );
        console.log('webpack:compiled');
    },
});
