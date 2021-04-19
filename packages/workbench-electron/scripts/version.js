/**
 * @file
 */
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));

const appJSON = {
    name: packageJSON.name,
    productName: packageJSON.productName,
    version: packageJSON.version,
    main: packageJSON.main,
    description: packageJSON.description
};

function createPackage() {
    const appDir = path.resolve(__dirname, '../app');
    if (!fs.existsSync(appDir)) {
        fs.mkdirSync(appDir);
    }
    fs.writeFileSync(path.resolve(__dirname, '../app/package.json'), JSON.stringify(appJSON), 'utf-8');
    console.log(chalk.green('[package.json]'), 'ready');
}

module.exports = createPackage;
