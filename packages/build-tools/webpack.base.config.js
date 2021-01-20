/**
 * @file webpack base config
 * @author stefan
 */

const path = require('path');

module.exports = {
	output: {
		path: path.resolve(__dirname, './app/dist'),
		filename: '[name].js',
    },
    externals: {
        electron: 'require("electron")'
    },
	resolve: {
        extensions: ['.ts', '.js', '.san', '.json']
    },
	devtool: 'source-map',
	plugins: [],
};
