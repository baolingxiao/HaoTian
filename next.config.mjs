/** @type {import('next').NextConfig} */
const nextConfig = {
  // 对于 Tauri 桌面应用，我们需要静态导出
  output: process.env.TAURI_ENV ? 'export' : undefined,
  
  // 禁用图片优化（静态导出不支持）
  images: {
    unoptimized: true,
  },
  
  // 配置资源前缀（生产环境）
  assetPrefix: process.env.TAURI_ENV ? '' : undefined,
  
  // Webpack 配置优化
  webpack: (config, { isServer }) => {
    // 解决 pixi-live2d-display 的兼容性问题
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // 避免服务端打包 canvas 相关库
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }
    
    return config;
  },
  
  // 实验性功能（提升稳定性）
  experimental: {
    // 减少内存使用
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
