/**
 * @file 配置文件
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
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
        path: path.resolve(__dirname, 'app/dist/'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                ["@babel/plugin-proposal-decorators", { "legacy": true }],
                                '@babel/plugin-proposal-export-default-from',
                                '@babel/plugin-transform-modules-commonjs',
                                '@babel/plugin-proposal-optional-chaining',
                                require.resolve('@babel/plugin-proposal-class-properties')
                            ],
                            presets: [
                                require.resolve('@babel/preset-env'),
                                [require.resolve('@babel/preset-typescript'), {allExtensions: true}]
                            ]
                        }
                    }
                ].filter(Boolean)
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: 'common/preload.js', to: 'preload.js'}
            ]
        })
    ]
});
