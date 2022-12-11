# Build Steps

首先克隆 [React](https://github.com/facebook/react) 仓库到本地

```bash
git clone https://github.com/facebook/react.git
```

然后使用 `yarn` 安装依赖

> 若安装失败，将 node.js 切换为 14.x 版本再进行尝试

由于我们只关注 React 本身，所以只需要构建以下几个指定的包

```bash
yarn build react/index,react/jsx,react-dom/index,scheduler --type=NODE
```

此时若本地没有安装 Java 环境，则在构建生产环境包时会报错，因为 React 依赖于 `Google Closure Compiler` 进行代码压缩，而 `Google Closure Compiler` 需要 Java 环境，具体可以查看这个 [issue](https://github.com/facebook/react/issues/19656#issuecomment-676850028)。另外，在官方提供的[贡献指南](https://reactjs.org/docs/how-to-contribute.html#contribution-prerequisites)中其实也提到了如何去构建

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
  return [
    // ...
    // Apply dead code elimination and/or minification.
    isProduction &&
      closure({
        compilation_level: 'SIMPLE',
        language_in: 'ECMASCRIPT_2015',
        language_out:
          bundleType === BROWSER_SCRIPT ? 'ECMASCRIPT5' : 'ECMASCRIPT5_STRICT',
        env: 'CUSTOM',
        warning_level: 'QUIET',
        apply_input_source_maps: false,
        use_types_for_optimization: false,
        process_common_js_modules: false,
        rewrite_polyfills: false,
        inject_libraries: false,

        // Don't let it create global variables in the browser.
        // https://github.com/facebook/react/issues/10909
        assume_function_wrapper: !isUMDBundle,
        renaming: !shouldStayReadable
      })
    // ...
  ];
}
```

将上面代码中使用的 `closure` 插件注释掉即可

现在我们已经能够构建这几个包了，但是缺少了 sourcemap 文件来将构建后的代码映射到源码上，所以我们需要再次修改构建脚本：

```js
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
    interop: false,
    name: globalName,
-   sourcemap: false,
+   sourcemap: true,
    esModule: false
  };
}
```

此时再执行构建命令又会报 Sourcemap is likely to be incorrect: a plugin (at position 6) was used to transform files, but didn't generate a sourcemap for the transformation. Consult the plugin documentation for help 这个错误，这是因为构建的过程中还使用了多个插件对代码进行了多次转换，但是这些插件并没有生成 sourcemap，因此也就没法将这些转换串联起来生成最终的 sourcemap 了，所以我们还需要注释掉那些没有生成 sourcemap 的插件：

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
  return [
    // ...
    // Remove 'use strict' from individual source files.
    {
      transform(source) {
        return source.replace(/['"]use strict["']/g, '');
      }
    },

    // ...

    // HACK to work around the fact that Rollup isn't removing unused, pure-module imports.
    // Note that this plugin must be called after closure applies DCE.
    isProduction && stripUnusedImports(pureExternalModules)

    // ...

    // License and haste headers, top-level `if` blocks.
    {
      renderChunk(source) {
        return Wrappers.wrapBundle(
          source,
          bundleType,
          globalName,
          filename,
          moduleType,
          bundle.wrapWithModuleBoundaries
        );
      },
    },
    // ...
  ];
}
```

现在就能成功构建出带有 sourcemap 的 React 包了
