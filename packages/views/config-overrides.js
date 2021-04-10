/**
 * @file 为了解决 cra 的 bug，cra 真心不好使，只能自己fork，还是vue cli 舒服
 */
// function resolve (dir) {
//   return path.join(__dirname, '.', dir)
// }

// function alias(config) {
//     config.resolve.alias = {
//         ...config.resolve.alias,
//         '@components': resolve('src/components'),
//         '@pages': resolve('src/pages'),
//         '@utils': resolve('src/utils'),
//     };
// }
const path = require('path');
const {override, fixBabelImports, addWebpackExternals} = require('customize-cra');

const isWeb = process.env['npm_lifecycle_event'] === 'start:web';

// Let Babel compile outside of src/.
function craBabelBugFix(config) {
    const tsRule = config.module.rules[1].oneOf[2];
    tsRule.include = undefined;
    tsRule.exclude = /node_modules/;
    return config;
}

// 解决webpack打包无法使用fs模块的问题
function electronRendererTartget(config) {
    config.target = 'electron-renderer';
    return config;
}

// 修改build路径
const publicPathPlugin = (config) => {
    if (process.env.NODE_ENV === 'production') {
        config.output.publicPath = './';
    }
    return config;
}

// 修改build路径
const webEntry = (config) => {
    if (isWeb) {
        config.entry = path.resolve(__dirname, './src/index.web.tsx');
    } else {
        config.entry = path.resolve(__dirname, './src/index.tsx');
    }
    return config;
}

module.exports = override(
    webEntry,
    publicPathPlugin,
    fixBabelImports("import", {
        libraryName: "antd", libraryDirectory: "es", style: 'css' // change importing css to less
    }),
    craBabelBugFix,
    !isWeb && addWebpackExternals({
        electron: 'require("electron")'
    }),
    !isWeb && electronRendererTartget
);
