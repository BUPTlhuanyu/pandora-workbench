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
const {override, fixBabelImports, addWebpackPlugin} = require('customize-cra');
const compiledHook = require('build-tools/plugins/compilationFinished');

const isWeb = process.env['npm_lifecycle_event'].indexOf('web') > -1;
const building = process.env['npm_lifecycle_event'].indexOf('build') > -1;

// Let Babel compile outside of src/.
function craBabelBugFix(config) {
    const tsRule = config.module.rules[1].oneOf[2];
    tsRule.include = undefined;
    tsRule.exclude = /node_modules/;
    return config;
}

// 修改build路径
const publicPathPlugin = (config) => {
    if (process.env.NODE_ENV === 'production') {
        config.output.publicPath = './';
    }
    return config;
}

const electronConfig = (config) => {
    // 关闭自动打开浏览器：node_modules/react-dev-utils/openBrowser.js
    process.env.BROWSER = "none";
    config.entry = path.resolve(__dirname, './src/index.tsx');
    config.target = 'electron-renderer';
    config.externals = {
        electron : 'require("electron")'
    };
    return config;
}

const webConfig = (config) => {
    config.devServer = {
        open: true
    };
    config.entry = path.resolve(__dirname, './src/index.web.tsx');
    return config;
}

module.exports = override(
    building && addWebpackPlugin(compiledHook),
    isWeb ? webConfig : electronConfig,
    publicPathPlugin,
    fixBabelImports("import", {
        libraryName: "antd", libraryDirectory: "es", style: 'css' // change importing css to less
    }),
    craBabelBugFix
);
