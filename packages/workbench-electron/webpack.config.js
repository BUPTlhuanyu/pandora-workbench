/**
 * @file 配置文件
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {createConfig} = require('build-tools');

const isProd = process.env.NODE_ENV === 'production';
module.exports = createConfig({
    node: {
        fs: 'empty'
    },
    entry: {
        index: './main/main.ts'
    },
    output: {
        publicPath: isProd ? './' : '/',
        path: path.resolve(__dirname, 'app'),
        filename: '[name].js'
    }
});
