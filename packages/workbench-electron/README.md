{
    "name": "talosdevtools",
    "version": "1.0.0",
    "description": "talos devtools",
    "productName": "Talos Devtools",
    "main": "./dist/index.js",
    "repository": {
        "type": "git",
        "url": "http://icode.baidu.com/repos/baidu/talos/talos-devtools"
    },
    "homepage": "http://cp01-se-fe-4.epc.baidu.com:8921",
    "scripts": {
        "dev": "node ./scripts/dev.js",
        "dev:debug": "npm run dev:main-dev && npm run dev:renderers",
        "dev:renderers": "npm run dev:rmachieve && npm run dev:mvachieve && webpack-dev-server --env.development --config ./webpack.renderers.config.js",
        "dev:main": "npm run dev:main-dev && electron ./app",
        "dev:main-dev": "webpack --env.development --config ./webpack.main.config.js --watch",
        "dev:mvachieve": "cd ./achieves/sn-demo && zip -q -r ../../app/achieves/sn-demo.zip *",
        "dev:rmachieve": "rm -rf ./app/achieves/*",
        "compile": "npm run lint && npm run dev:rmachieve && npm run clean:dist && npm run compile:renderers && npm run compile:main && npm run move:extension",
        "compile:renderers": "cross-env NODE_ENV=production webpack --env.production --config ./webpack.renderers.config.js",
        "compile:main": "cross-env NODE_ENV=production webpack --env.production --config ./webpack.main.config.js",
        "build:mac": "npm run version && npm run compile && npm run release:mac",
        "build:win": "npm run fixpath && npm run version && npm run release:win",
        "release:mac": "export PATH=$(npm run fixpath) && cross-env CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --mac --x64",
        "release:win": "export PATH=$(npm run fixpath) && cross-env CSC_IDENTITY_AUTO_DISCOVERY=false electron-builder --win --x64",
        "publish:achieve": "echo 'todo'",
        "publish:asar": "node ./scripts/release.js",
        "doc": "vuepress dev doc",
        "doc:build": "vuepress build doc",
        "doc:deploy": "vuepress build doc && fis3 release doc",
        "lint": "eslint ./src/**/**/**/**/*.ts --fix",
        "clean:dist": "rm -rf ./app/dist",
        "move:extension": "cp -r ./app/devtools-helper ./app/dist",
        "logo": "node ./scripts/png2icns.js",
        "version": "node ./scripts/version.js",
        "fixpath": "node ./scripts/fixpath.js",
        "postinstall": "node ./scripts/postInstall.js"
    },
    "author": "",
    "license": "MIT",
    "dependencies": {
        "electron-context-menu": "^2.2.0",
        "electron-log": "^4.2.2",
        "electron-store": "^6.0.0"
    },
    "devDependencies": {
        "@types/node": "^14.0.23",
        "@typescript-eslint/eslint-plugin": "^3.7.0",
        "@typescript-eslint/parser": "^3.7.0",
        "copy-webpack-plugin": "^6.0.3",
        "cross-env": "^7.0.2",
        "css-loader": "^3.6.0",
        "electron": "^9.1.2",
        "electron-builder": "^22.8.0",
        "electron-devtools-installer": "^3.1.1",
        "eslint": "^7.5.0",
        "eslint-config-prettier": "^6.11.0",
        "eslint-plugin-prettier": "^3.1.4",
        "file-loader": "^6.0.0",
        "html-webpack-plugin": "^4.3.0",
        "less": "^3.12.2",
        "less-loader": "^6.2.0",
        "prettier": "^2.0.5",
        "style-loader": "^1.2.1",
        "ts-loader": "^8.0.1",
        "typescript": "^3.9.7",
        "url-loader": "^4.1.0",
        "webpack": "^4.43.0",
        "webpack-cli": "^3.3.12",
        "webpack-dev-server": "^3.11.0",
        "webpack-merge": "^5.0.9"
    },
    "build": {
        "appId": "org.talosdevtools",
        "mac": {
            "category": "",
            "icon": "./src/logo.icns",
            "asar": true
        },
        "win": {
            "target": "nsis",
            "icon": "./src/logo.ico"
        },
        "files": [
            "dist/*",
            "package.json",
            "index.js"
        ],
        "directories": {
            "output": "release"
        }
    }
}
