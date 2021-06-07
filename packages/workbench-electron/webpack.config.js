/**
 * @file 配置文件
 */

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const {createConfig} = require('build-tools');
const compiledHook = require('build-tools/plugins/compilationFinished');

const isProd = process.env.NODE_ENV === 'production';
module.exports = createConfig({
    target: 'electron-main',
    entry: {
        index: './main/main.ts',
        search: '../services/search/node/searchApp.ts'
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
                                ['@babel/plugin-proposal-class-properties'],
                                'babel-plugin-parameter-decorator',
                                '@babel/plugin-proposal-export-default-from',
                                '@babel/plugin-transform-modules-commonjs',
                                '@babel/plugin-proposal-optional-chaining'
                            ],
                            presets: [
                                require.resolve('@babel/preset-env'),
                                [require.resolve('@babel/preset-typescript'), {allExtensions: true, onlyRemoveTypeImports: true}]
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
        }),
        compiledHook
    ]
});
