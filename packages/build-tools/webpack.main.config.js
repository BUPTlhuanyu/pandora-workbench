/**
 * @file webpack config for main process
 * @author stefan
 */

const webpack = require('webpack');
const {merge} = require('webpack-merge');
const baseConfig = require('./webpack.base.config');
const {version} = require('../../package.json');


module.exports = env => {

    return merge(baseConfig, {
        target: 'electron-main',
        entry: {
            index: './src/index.ts',
        },
        // optimization: {
        //     minimize: false
        // },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader'
                },
                {
                    test: /\.(png|jpg|gif)$/i,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 81920,
                            },
                        },
                    ],
                },
                {
                    test: /\.(le|c)ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'less-loader',
                    ],
                },
                {
                    test: /\.(svg|eot|woff|woff2|ttf)$/,
                    use: [
                        {
                            loader: 'url-loader',
                            options: {
                                limit: 1024000,
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new webpack.DefinePlugin({
                '__MODE__': JSON.stringify(process.env.NODE_ENV || 'development'),
                '__VERSION__': JSON.stringify(version)
            }),
        ],
    }, env.production ? {
        mode: 'production',
    } : {
            mode: 'development',
        });
}
