/**
 * @file webpack config for renderers process
 * @author stefan
 */

const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {version} = require('../../package.json');
const baseConfig = require('./webpack.base.config');
const SanLoaderPlugin = require('san-loader/lib/plugin');

module.exports = env => {

    return [
        merge(baseConfig, {
            target: 'electron-renderer',
            entry: {
                projects: './src/renderers/index.ts',
                project: './src/renderers/dev.ts',
                remote: './src/renderers/remote.ts'
            },
            externals: {
                // '@fortawesome/fontawesome-free/css/all.css': true
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
                        test: /\.(le|c)ss$/,
                        use: [
                            'style-loader',
                            'css-loader',
                            {
                                loader: 'less-loader',
                                options: {
                                    lessOptions: {
                                        // strictMath: true,
                                        javascriptEnabled: true
                                    }
                                }
                            },
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
                    {
                        test: /\.(png|jpg|gif)$/,
                        use: [
                            'file-loader',
                        ],
                    },
                    {
                        test: /\.san$/,
                        use: 'san-loader'
                    },
                    {
                        test: /\.html$/,
                        use: [
                            {
                                loader: 'html-loader',
                                options: {
                                    esModule: false,
                                    minimize: false,
                                    attributes: {
                                        list: [
                                            {
                                                tag: 'img',
                                                attribute: 'src',
                                                type: 'src'
                                            },
                                            {
                                                tag: 'san-avatar',
                                                attribute: 'src',
                                                type: 'src'
                                            }
                                        ]
                                    }
                                }
                            }
                        ]
                    }
                ],
            },
            plugins: [
                new HtmlWebpackPlugin({
                    template: path.resolve(__dirname, './src/index.ejs'),
                    filename: 'index.html',
                    chunks: ['projects']
                }),
                new HtmlWebpackPlugin({
                    template: path.resolve(__dirname, './src/project.ejs'),
                    filename: 'project.html',
                    chunks: ['project']
                }),
                new HtmlWebpackPlugin({
                    template: path.resolve(__dirname, './src/remote.ejs'),
                    filename: 'remote.html',
                    chunks: ['remote']
                }),
                // new CopyPlugin({
                //     patterns: [
                //         // { from: './node_modules/@fortawesome/fontawesome-free/css/all.css', to: './fontawesome.css' },
                //     ],
                // }),
                new SanLoaderPlugin(),
                new webpack.NamedModulesPlugin(),
                new webpack.DefinePlugin({
                    '__MODE__': JSON.stringify(process.env.NODE_ENV || 'development'),
                    '__VERSION__': JSON.stringify(version),
                }),
            ],
        }, env.production ? {
            mode: 'production',
        } : {
                mode: 'development',
                devtool: 'inline-source-map',
                devServer: {
                    port: 8222,
                    compress: true,
                    noInfo: true,
                    stats: 'errors-only',
                    inline: true,
                    hot: true,
                    disableHostCheck: true,
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                },
            }),
        merge(baseConfig, {
            mode: env.production ? 'production' : 'development',
            target: 'webworker',
            entry: {
                SanDebuggerWorker: './src/worker/index.ts',
                SanDevToolsBackend: './san-native-devtool/backend.ts'
            },
            module: {
                rules: [
                    {
                        test: /\.ts$/,
                        loader: 'ts-loader'
                    },
                ]
            },
        }),
    ];
};
