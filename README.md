## 启动
- 通过 `npm install` 安装依赖
- 在 `src/environment` 中设置环境信息
- 在 `webpack/start.ts` 中指定构建环境及构建模式
- 执行 `npm run start` 进行构建

---
## 目录
```
|-- build（编译的文件）
|-- src（源代码）
    |-- config（各类业务配置，带自动化导入）
    |-- environment（开发/测试/生产环境配置，该配置同时用于 webpack 及项目本身）
    |-- pages（页面，带自动化导出；同时带简单的自动路由生成（如果有复杂路由的需求则需要手动去掉这个设定））
    |-- polyfill（项目 polyfill 项，带自动化导入）
    |-- service（接口配置）
    |-- utils（常用工具）
|-- static（静态文件）
    |-- assets（各类资源）
        |-- fonts（字体文件）
        |-- images（图片）
    |-- index.html（html文件）
    |-- logo.ico（网页图标）
|-- webpack（webpack配置）
    |-- start.ts（ webpack执行脚本，控制 webpack 的构建方式）
    |-- webpack.config.ts（ webpack 主配置）
    |-- webpack.module.ts（ webpack module 配置）
    |-- tsconfig.json（ webpack typescript 编译环境配置）
|-- app.tsx（最外层组件, 渲染路由，同时负责引用各类全局资源如 polyfill 、公共配置等）
|-- index.tsx（总入口）
|-- package.json（项目配置文件）
|-- tsconfig.json（项目 typescript 编译环境配置）
```