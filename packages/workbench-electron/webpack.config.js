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
        app: './main/main.ts'
    },
    output: {
        publicPath: isProd ? './' : '/',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, 'main/index.html'),
            filename: 'index.html'
        })
        // new HtmlWebpackPlugin({
        //     template: path.join(__dirname, 'public/home.html'),
        //     filename: 'home.ejs',
        //     chunks: ['home']
        // })
    ]
});
