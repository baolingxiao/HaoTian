import "./globals.css";
import Navigation from "@/components/Navigation";
import Script from "next/script";

export const metadata = { title: "AI Chatpot - 智能虚拟伴侣" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Live2D 库加载顺序很重要！ */}
        {/* 1. Cubism 4.x SDK (Core) */}
        <script src="/live2d/live2dcubismcore.min.js"></script>
        {/* 2. PixiJS */}
        <script src="/live2d/pixi.min.js"></script>
        {/* 3. pixi-live2d-display */}
        <script src="/live2d/pixi-live2d-display.js"></script>
      </head>
      <body className="bg-gray-50 text-gray-900" suppressHydrationWarning>
        <Navigation />
        {children}
      </body>
    </html>
  );
}

