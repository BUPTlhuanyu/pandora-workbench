1. 导入
2. 导出 pdf,md,html
3. doc -> md -> html

- 安装依赖
1. 设置electron镜像
    ```
    yarn config set electron_mirror https://npm.taobao.org/mirrors/electron/
    ```
2. 安装依赖
    ```
    yarn
    ```

- 打包:
1. yarn build:views
2. yarn build:workbench-electron
3. yarn build:mac
