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

const isWeb = process.env['npm_lifecycle_event'].indexOf('web') > -1; // web 打包
const building = process.env['npm_lifecycle_event'].indexOf('build') > -1; // electron 打包/ web 打包
const buildingNotWeb = building && !isWeb; // electron 打包

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

//更改打包是图片加载模式，解决electron打包后图片无法加载问题
const customizeFileLoaderOptions  = config  => {
    for (let item of config.module.rules) {
        if ('oneOf' in item) {
            for (let index in item.oneOf) {
                let use = item.oneOf[index];
                if (use && Array.isArray(use.test) && use.test.find(item => item.source === /\.png$/.source) && use.loader.indexOf('/url-loader/') > -1) {
                    use.options = Object.assign({}, use.options, {
                        outputPath: 'static/media/',
                        publicPath: '../media/',
                        name: '[name].[hash:8].[ext]'
                    });
                    return config;
                }
            }
        }
    }
}

const webConfig = config => {
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
    craBabelBugFix,
    buildingNotWeb && customizeFileLoaderOptions
);
