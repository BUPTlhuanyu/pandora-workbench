const {spawn, exec} = require('child_process');
const chalk = require('chalk');
const Event = require('events');
const createPackage = require('./version');

const piplineEvent = new Event();

function buildViews() {
    // build views
    const viewsChild = spawn(
        'yarn workspace views build',
        {
            shell: true
        },
        err => {
            console.log(err);
        }
    );

    viewsChild.stdout.on('data', data => {
        if (data.toString().trim() == 'webpack:compiled') {
            console.log(chalk.green('[views]'), `${data}`);
            piplineEvent.emit('views-ready');
        }
    });
}

function buildWorkbench() {
    // build workbench-electron
    const workbenchChild = spawn(
        'yarn workspace workbench-electron build',
        {
            shell: true
        },
        err => {
            console.log(err);
        }
    );

    workbenchChild.stdout.on('data', data => {
        if (data.toString().trim() === 'webpack:compiled') {
            console.log(chalk.green('[electron-main]'), `${data}`);
            piplineEvent.emit('electron-main');
        }
    });
}

function copyViews() {
    exec(
        'yarn cp:dist',
        {
            cwd: '../../'
        },
        (err, stdout, stderr) => {
            if (!err) {
                piplineEvent.emit('cp-ready');
            }
            console.log(chalk.green('[copy-dist]'), `${stdout}`);
        }
    );
}

function buildMac() {
    // build workbench-electron
    const buildChild = spawn(
        'yarn workspace workbench-electron build:mac',
        {
            shell: true
        },
        err => {
            console.log(err);
        }
    );

    buildChild.stdout.on('data', data => {
        console.log(chalk.green('[build-mac]'), `${data}`)
    });
}

function start() {
    createPackage();
    buildViews();
    piplineEvent.on('views-ready', buildWorkbench);
    piplineEvent.on('electron-main', copyViews);
    piplineEvent.on('cp-ready', buildMac)
}

start();
