"use client";

import { useEffect, useState } from "react";

export default function TestLive2DPage() {
  const [sdkStatus, setSdkStatus] = useState<any>({});

  useEffect(() => {
    const checkSDK = () => {
      const status = {
        windowLive2D: typeof (window as any).Live2D,
        windowLive2DCubismCore: typeof (window as any).Live2DCubismCore,
        windowPIXI: typeof (window as any).PIXI,
        live2DProperties: (window as any).Live2D ? Object.keys((window as any).Live2D).slice(0, 10) : [],
        timestamp: new Date().toLocaleTimeString(),
      };
      setSdkStatus(status);
    };

    // 立即检查
    checkSDK();

    // 每秒检查一次，持续 10 秒
    const interval = setInterval(checkSDK, 1000);
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Live2D SDK 诊断</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">SDK 加载状态</h2>
          
          <div className="space-y-4">
            <div>
              <span className="font-semibold">window.Live2D (Cubism 2.x): </span>
              <span className={sdkStatus.windowLive2D === "undefined" ? "text-red-600" : "text-green-600"}>
                {sdkStatus.windowLive2D}
              </span>
              {sdkStatus.windowLive2D !== "undefined" && (
                <span className="ml-2 text-green-600">✓ 已加载</span>
              )}
              {sdkStatus.windowLive2D === "undefined" && (
                <span className="ml-2 text-red-600">✗ 未加载</span>
              )}
            </div>

            <div>
              <span className="font-semibold">window.Live2DCubismCore (Cubism 4.x): </span>
              <span className={sdkStatus.windowLive2DCubismCore === "undefined" ? "text-gray-600" : "text-yellow-600"}>
                {sdkStatus.windowLive2DCubismCore}
              </span>
              {sdkStatus.windowLive2DCubismCore === "undefined" && (
                <span className="ml-2 text-gray-600">✓ 正确（不应该加载）</span>
              )}
              {sdkStatus.windowLive2DCubismCore !== "undefined" && (
                <span className="ml-2 text-yellow-600">⚠️ 意外加载了 Cubism 4</span>
              )}
            </div>

            <div>
              <span className="font-semibold">window.PIXI: </span>
              <span className={sdkStatus.windowPIXI === "undefined" ? "text-gray-600" : "text-blue-600"}>
                {sdkStatus.windowPIXI}
              </span>
            </div>

            <div>
              <span className="font-semibold">检查时间: </span>
              <span className="text-gray-600">{sdkStatus.timestamp}</span>
            </div>
          </div>
        </div>

        {sdkStatus.live2DProperties && sdkStatus.live2DProperties.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Live2D 对象属性</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(sdkStatus.live2DProperties, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">预期结果</h2>
          <ul className="space-y-2 text-blue-900">
            <li>✓ window.Live2D 应该为 <code className="bg-blue-100 px-2 py-1 rounded">object</code> 或 <code className="bg-blue-100 px-2 py-1 rounded">function</code></li>
            <li>✓ window.Live2DCubismCore 应该为 <code className="bg-blue-100 px-2 py-1 rounded">undefined</code></li>
            <li>ℹ️ window.PIXI 可以是 undefined（会在需要时加载）</li>
          </ul>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/avatar-chat"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            返回 Avatar 页面
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}



