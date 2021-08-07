https://zhuanlan.zhihu.com/p/96041706

每层按环境隔离
1. common: 公共的 js 方法，在哪里都可以运行的
2. browser: 只使用浏览器 API 的代码，可以调用 common
3. node: 只使用 NodeJS API 的代码，可以调用 common
4. electron-browser: 使用 electron 渲染线程和浏览器 API 的代码，可以调用 common，browser，node
5. electron-main: 使用 electron 主线程和 NodeJS API 的代码，可以调用 common， node
6. test: 测试代码
