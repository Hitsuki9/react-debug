# Build Steps

1. `git clone` React 官方仓库
2. `yarn` 安装依赖

若安装失败将 node.js 切换为 14.x 版本尝试

3. `yarn build react/index,react/jsx,react-dom/index,scheduler --type=NODE` 构建

此时若没有安装 Java 环境在构建生产环境的包时会报错
