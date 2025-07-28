import type { Plugin, ResolvedConfig } from 'vite';
import { createHash } from 'crypto';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, basename, extname } from 'path';

interface NodeAddonFileInfo {
  originalPath: string;
  fileName: string;
  hashedFileName: string;
  outputPath: string;
}

interface NodeFilesMap {
  [key: string]: NodeAddonFileInfo;
}

interface PluginContext {
  nodeFiles: NodeFilesMap;
  config: ResolvedConfig;
  options: NodeAddonLoaderOptions;
}

export interface NodeAddonLoaderOptions {
  outputDir?: string;
  hash?: boolean;
  include?: string[];
  exclude?: string[];
}

export function nodeAddonLoader(options: NodeAddonLoaderOptions = {}): Plugin {
  const ctx: PluginContext = {
    nodeFiles: {},
    config: {} as ResolvedConfig,
    options,
  };

  return {
    name: 'vite:node-addon-loader',
    configResolved(config) {
      ctx.config = config;
    },

    resolveId(id: string) {
      if (id.endsWith('.node')) {
        return id;
      }
      return null;
    },

    load(id: string) {
      if (!id.endsWith('.node')) {
        return null;
      }

      const fileName = basename(id);
      const hash = createHash('md5')
        .update(new Uint8Array(readFileSync(id)))
        .digest('hex')
        .slice(0, 8);
      const hashedFileName = options.hash !== false ? `${basename(fileName, extname(fileName))}.${hash}${extname(fileName)}` : fileName;

      const outputDir = options.outputDir || ctx.config?.build?.outDir || 'dist';
      const outputPath = join(outputDir, hashedFileName);

      ctx.nodeFiles[id] = {
        originalPath: id,
        fileName,
        hashedFileName,
        outputPath,
      };

      const relativePath = './' + hashedFileName;

      return `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const addon = require(${JSON.stringify(relativePath)});

// 示例输出
console.log('Node.js addon loaded:', ${JSON.stringify(hashedFileName)});
console.log('Available exports:', Object.keys(addon));

export default addon;
`;
    },

    generateBundle() {
      const outputDir = options.outputDir || ctx.config?.build?.outDir || 'dist';

      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      Object.values(ctx.nodeFiles).forEach(fileInfo => {
        try {
          const data = readFileSync(fileInfo.originalPath);
          writeFileSync(fileInfo.outputPath, new Uint8Array(data));
        } catch (error) {
          console.error(`Failed to copy node addon: ${fileInfo.originalPath}`, error);
        }
      });
    },
  };
}

export default nodeAddonLoader;
