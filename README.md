# Vite Node Addon Loader

一个Vite插件，用于处理和打包Node.js原生扩展（.node）文件。

## 功能特性

- ✅ 自动识别和处理 `.node` 文件
- ✅ 为每个.node文件生成带hash的文件名
- ✅ 自动生成使用 `createRequire` 的加载代码
- ✅ 将.node文件复制到构建输出目录
- ✅ 支持自定义配置

## 安装

```bash
npm install --save-dev vite-node-addon-loader
```

## 使用方法

### 1. 在vite.config.js中配置插件

```javascript
import { defineConfig } from 'vite';
import nodeAddonLoader from 'vite-node-addon-loader';

export default defineConfig({
  plugins: [
    nodeAddonLoader({
      include: /\.node$/,      // 匹配.node文件的正则表达式
      hashLength: 8           // hash长度
    })
  ]
});
```

### 2. 在代码中导入.node文件

```javascript
// 直接导入.node文件
import myAddon from './path/to/your/addon.node';

// 使用导入的addon
console.log(myAddon);
```

### 3. 构建项目

```bash
npm run build
```

构建后，插件会：
- 将 `your/addon.node` 复制到 `dist/your/addon.[hash].node`
- 自动生成使用 `createRequire` 加载的代码

## 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| include | RegExp | `/\.node$/` | 匹配.node文件的正则表达式 |
| outputDir | string | `'dist'` | 输出目录 |
| hashLength | number | `8` | 生成的hash长度 |

## 示例

项目目录结构：
```
project/
├── src/
│   └── index.js
├── native/
│   └── addon.node
├── vite.config.js
└── package.json
```

src/index.js:
```javascript
import addon from '../native/addon.node';

console.log('Addon loaded:', addon);
```

构建后：
```
dist/
├── index.js
├── native/
│   └── addon.a1b2c3d4.node  // 带hash的文件名
└── ...
```

## 注意事项

- 确保.node文件存在且可访问
- 插件会在构建时复制.node文件，开发模式下不会复制
- 生成的hash基于文件内容，确保文件内容变化时hash也会变化