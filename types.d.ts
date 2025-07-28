// Vite Node Addon Loader TypeScript 类型定义

/**
 * Vite Node Addon Loader 插件配置选项
 */
export interface NodeAddonLoaderOptions {
  /**
   * 匹配.node文件的正则表达式
   * @default /\.node$/
   */
  include?: RegExp;

  /**
   * 输出目录（如果未提供，则使用Vite构建配置的outDir）
   * @default 'dist'
   */
  outputDir?: string;

  /**
   * 生成的hash长度
   * @default 8
   */
  hashLength?: number;
}

/**
 * Vite插件函数类型
 */
declare function nodeAddonLoader(options?: NodeAddonLoaderOptions): import('vite').Plugin;

export default nodeAddonLoader;

// 为.node文件导入提供类型支持
declare module '*.node' {
  /**
   * Node.js原生扩展模块
   * 由于原生扩展的结构各不相同，这里使用any类型
   * 建议在实际使用时为具体的.node文件创建更精确的类型定义
   */
  const addon: any;
  export default addon;
}

// 为Vite配置提供类型增强
declare module 'vite' {
  interface UserConfig {
    /**
     * Node Addon Loader 插件配置
     */
    nodeAddonLoader?: NodeAddonLoaderOptions;
  }
}

// 插件导出的额外类型
export type NodeAddonFileInfo = {
  originalPath: string;
  hashedFileName: string;
  hash: string;
};

/**
 * 插件内部使用的映射类型
 */
export type NodeFilesMap = Map<string, NodeAddonFileInfo>;

/**
 * 插件上下文类型（用于内部实现）
 */
export interface PluginContext {
  warn: (message: string) => void;
  error: (message: string, error?: Error) => void;
  emitFile: (file: {
    type: 'asset';
    fileName: string;
    source: Buffer;
  }) => void;
}