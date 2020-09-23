# Usage

1. 安装依赖
2. `npm start`
3. 源码在 `src/packages` 下，直接打断点即可

# Build Steps

以 `create-react-app` 创建的项目为基础搭建的步骤：

0. 引入源码至 `src/packages` 目录下
1. `npm run eject` 暴露配置
2. 安装 `@babel/preset-flow` 并添加到 `babel-loader` 配置中

```js
// config/webpack.config.js
{
  test: /\.(js|mjs|jsx|ts|tsx)$/,
  include: paths.appSrc,
  loader: require.resolve('babel-loader'),
  options: {
    customize: require.resolve(
      'babel-preset-react-app/webpack-overrides'
    ),

    plugins: [
      [
        require.resolve('babel-plugin-named-asset-import'),
        {
          loaderMap: {
            svg: {
              ReactComponent:
                '@svgr/webpack?-svgo,+titleProp,+ref![path]',
            },
          },
        },
      ],
    ],
+   presets: ['@babel/preset-flow'],
    // This is a feature of `babel-loader` for webpack (not Babel itself).
    // It enables caching results in ./node_modules/.cache/babel-loader/
    // directory for faster rebuilds.
    cacheDirectory: true,
    // See #6846 for context on why cacheCompression is disabled
    cacheCompression: false,
    compact: isEnvProduction,
  },
}
```

3. 添加环境变量

```js{3,4,5}
// config/webpack.config.js
new webpack.DefinePlugin({
+ __DEV__: false,
+ __PROFILE__: false,
+ __EXPERIMENTAL__: true,
  ...env.stringified
})
```

4. 添加路径别名

```js
// config/webpack.config.js
// resolve
{
  // ...
  alias: {
+   'react-dom': path.resolve(__dirname, '../src/packages/react-dom'),
+   'react-reconciler': path.resolve(__dirname, '../src/packages/react-reconciler'),
+   'react': path.resolve(__dirname, '../src/packages/react'),
+   './ReactFiberHostConfig': path.resolve(__dirname, '../src/packages/react-reconciler/src/forks/ReactFiberHostConfig.dom'),

+   'shared/ReactSharedInternals': path.resolve(__dirname, '../src/packages/react/src/ReactSharedInternals'),
+   'shared': path.resolve(__dirname, '../src/packages/shared'),

+   'scheduler/tracing': path.resolve(__dirname, '../src/packages/scheduler/tracing'),
+   'scheduler': path.resolve(__dirname, '../src/packages/scheduler/unstable_mock'),
+   './SchedulerHostConfig': path.resolve(__dirname, '../src/packages/scheduler/src/forks/SchedulerHostConfig.default'),
+   './src/SchedulerHostConfig.js': path.resolve(__dirname, '../src/packages/scheduler/src/forks/SchedulerHostConfig.mock'),
    // Support React Native Web
    // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
    'react-native': 'react-native-web',
    // Allows for better profiling with ReactDevTools
    ...(isEnvProductionProfile && {
      'react-dom$': 'react-dom/profiling',
      'scheduler/tracing': 'scheduler/tracing-profiling',
    }),
    ...(modules.webpackAliases || {}),
  }
}
```

5. 注释 `invariant` 方法

```js
// packages/shared/invariant.js
export default function invariant(condition, format, a, b, c, d, e, f) {
  // throw new Error(
  //   'Internal React error: invariant() is meant to be replaced at compile ' +
  //     'time. There is no runtime version.',
  // );
}
```
