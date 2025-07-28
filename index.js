import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * @typedef {import('./types').NodeAddonLoaderOptions} NodeAddonLoaderOptions
 * @typedef {import('./types').NodeAddonFileInfo} NodeAddonFileInfo
 * @typedef {import('./types').NodeFilesMap} NodeFilesMap
 * @typedef {import('vite').Plugin} Plugin
 * @typedef {import('vite').PluginContext} PluginContext
 */

/**
 * Vite plugin for handling Node.js native addon (.node) files
 * Copies .node files to dist directory with hash and generates createRequire loader
 * @param {NodeAddonLoaderOptions} options - 插件配置选项
 * @returns {Plugin} Vite插件实例
 */
export default function nodeAddonLoader(options = {}) {
  const {
    include = /\.node$/,
    outputDir,
    hashLength = 8
  } = options;

  const nodeFiles = new Map();

  return {
    name: 'vite:node-addon-loader',
    
    buildStart() {
      nodeFiles.clear();
    },

    resolveId(id) {
      if (include.test(id)) {
        return id;
      }
      return null;
    },

    load(id) {
      if (!include.test(id)) return null;

      try {
        // 检查文件是否存在
        if (!fs.existsSync(id)) {
          this.warn(`Node addon file not found: ${id}`);
          return null;
        }

        // 读取文件内容计算hash
        const fileContent = fs.readFileSync(id);
        const hash = crypto.createHash('md5').update(fileContent).digest('hex').slice(0, hashLength);
        
        // 获取文件名和扩展名
        const parsed = path.parse(id);
        const hashedFileName = `${parsed.name}.${hash}${parsed.ext}`;
        
        // 存储映射关系
        nodeFiles.set(id, {
          originalPath: id,
          hashedFileName,
          hash
        });

        // 生成动态加载代码
        const code = `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nodePath = join(__dirname, '${hashedFileName}');
const addon = require(nodePath);

export default addon;
`;

        return {
          code,
          map: null
        };
      } catch (error) {
        this.error(`Failed to load node addon: ${id}`, error);
        return null;
      }
    },

    generateBundle(options, bundle) {
      // 使用Vite构建配置的outDir
      const outDir = options.dir || outputDir || 'dist';
      
      // 复制所有.node文件到输出目录
      for (const [originalPath, fileInfo] of nodeFiles) {
        try {
          const outputPath = path.join(outDir, fileInfo.hashedFileName);
          
          // 确保输出目录存在
          const outputDirPath = path.dirname(outputPath);
          if (!fs.existsSync(outputDirPath)) {
            fs.mkdirSync(outputDirPath, { recursive: true });
          }

          // 复制文件
          fs.copyFileSync(originalPath, outputPath);
          
          // 添加文件到bundle中
          this.emitFile({
            type: 'asset',
            fileName: fileInfo.hashedFileName,
            source: fs.readFileSync(originalPath)
          });

          console.log(`Copied node addon: ${originalPath} -> ${outputPath}`);
        } catch (error) {
          this.error(`Failed to copy node addon: ${originalPath}`, error);
        }
      }
    }
  };
}