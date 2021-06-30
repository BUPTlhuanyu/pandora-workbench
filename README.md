<div align=center>
    <img src="./doc/logo.png" width="XXX" height="XXX" />
</div>

> 基于 vscode 架构，利用 【依赖注入】【多进程】等思想实现，用于编辑 `markdown` 文件，并输出为 【微信公众号文章】

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
