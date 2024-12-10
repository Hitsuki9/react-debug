# Build Steps

首先克隆 [React](https://github.com/facebook/react) 仓库到本地

```bash
git clone https://github.com/facebook/react.git
```

然后使用 yarn 安装依赖

> yarn 为 1.x 版本，Node.js 版本需为 18 及以上

由于我们只关注 React 本身，所以只需要构建以下几个指定的包

```bash
yarn build react/index,react/jsx,react-dom/index,react-dom/client,scheduler --releaseChannel=stable --ci=true --type=NODE
```

此时若本地没有安装 Java 环境，则在构建时会报错，因为 React 依赖 [Closure Compiler](https://google-developers.gonglchuangl.net/closure/compiler) 进行代码压缩，而 Closure Compiler 需要 Java 环境，具体可以查看这个 [issue](https://github.com/facebook/react/issues/19656#issuecomment-676850028)。另外，在旧版官方文档的[贡献指南](https://reactjs.org/docs/how-to-contribute.html#contribution-prerequisites)中其实也提到了构建所需的环境

若实在不想安装 Java 环境，可以通过修改构建脚本来跳过代码压缩的步骤：

```js
// scripts/rollup/build.js
function getPlugins(
  entry,
  externals,
  updateBabelOptions,
  filename,
  packageName,
  bundleType,
  globalName,
  moduleType,
  pureExternalModules,
  bundle
) {
  // ...

  // const needsMinifiedByClosure =
  //   bundleType !== ESM_PROD && bundleType !== ESM_DEV;
  const needsMinifiedByClosure = false;

  // ...
}
```

现在我们已经能够构建这几个包了，但是缺少了 sourcemap 文件来将构建后的代码映射到源码上，所以我们需要再次修改构建脚本：

```js {18}
// scripts/rollup/build.js
function getRollupOutputOptions(
  outputPath,
  format,
  globals,
  globalName,
  bundleType
) {
  const isProduction = isProductionBundleType(bundleType);

  return {
    file: outputPath,
    format,
    globals,
    freeze: !isProduction,
    interop: getRollupInteropValue,
    name: globalName,
    sourcemap: true,
    esModule: false,
    exports: 'auto'
  };
}
```

此时再执行构建命令又会报错，这是因为构建的过程中还使用了其他多个插件分别对代码进行了转换，但是这些插件并没有生成 sourcemap，因此也就没法将这些转换串联起来生成最终的 sourcemap 了

其中，我们需要手动开启 babel 插件的 sourcemap 选项：

```js {19}
// scripts/rollup/build.js
function getBabelConfig(
  updateBabelOptions,
  bundleType,
  packageName,
  externals,
  isDevelopment,
  bundle
) {
  const canAccessReactObject =
    packageName === 'react' || externals.indexOf('react') !== -1;
  let options = {
    exclude: '/**/node_modules/**',
    babelrc: false,
    configFile: false,
    presets: [],
    plugins: [...babelPlugins],
    babelHelpers: 'bundled',
    sourcemap: true
  };

  // ...
}
```

而其余插件，我们只需要根据 rollup 给出的报错信息中的插件名称来找到对应的插件并将其注释即可

至此，我们就能成功构建出带有 sourcemap 的 React 包了
