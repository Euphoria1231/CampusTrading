# 项目启动说明

本项目使用 React 框架，typescript 作为主要开发语言，less 作为 css 框架，pnpm 作为包管理工具。以下是启动项目的步骤，具体的步骤可以去网上搜索（pnpm 安装），也可以问 AI：

1. 安装 node.js，配置环境变量等一系列操作后，输入 `node -v` 和 `npm -v` 检查安装情况

2. 输入 `npm install -g pnpm` 安装 pnpm 包管理工具，终端输入 `pnpm -v` 检查安装情况

3. 项目根目录下输入 `pnpm install` 一键安装项目依赖

4. 最后输入 `pnpm run dev` 启动开发服务器

# 项目结构说明
项目根目录结构为：

\ assets: 存放静态资源（矢量图标和图片等）

\ components: 存放大型业务组件或项目通用组件

\ hooks: 存放逻辑处理规则

\ service: 接口层

\ utils: 存放项目通用工具函数

\ views: 存放页面级组件，主要在此编写代码