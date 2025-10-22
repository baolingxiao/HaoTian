"use client";

import { useEffect, useState } from 'react';

export default function TestCDNPage() {
  const [status, setStatus] = useState({
    cubismCore: 'checking...',
    pixi: 'checking...',
    pixiLive2d: 'checking...',
    live2dModel: 'checking...',
  });
  
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const check = () => {
      const newStatus = {
        cubismCore: typeof (window as any).Live2DCubismCore !== 'undefined' ? '✅ loaded' : '❌ not loaded',
        pixi: typeof (window as any).PIXI !== 'undefined' ? '✅ loaded' : '❌ not loaded',
        pixiLive2d: typeof (window as any).PIXI?.live2d !== 'undefined' ? '✅ loaded' : '❌ not loaded',
        live2dModel: typeof (window as any).PIXI?.live2d?.Live2DModel !== 'undefined' ? '✅ loaded' : '❌ not loaded',
      };
      
      setStatus(newStatus);
      
      // 收集详细调试信息
      const debug: any = {
        cubismCore: {
          type: typeof (window as any).Live2DCubismCore,
          exists: typeof (window as any).Live2DCubismCore !== 'undefined',
        },
        pixi: {
          type: typeof (window as any).PIXI,
          exists: typeof (window as any).PIXI !== 'undefined',
          keys: (window as any).PIXI ? Object.keys((window as any).PIXI).slice(0, 20).join(', ') : 'N/A',
        },
        pixiLive2d: {
          type: typeof (window as any).PIXI?.live2d,
          exists: typeof (window as any).PIXI?.live2d !== 'undefined',
          keys: (window as any).PIXI?.live2d ? Object.keys((window as any).PIXI.live2d).join(', ') : 'N/A',
        },
        scripts: [] as any[],
      };
      
      // 检查页面上的所有 script 标签
      document.querySelectorAll('script').forEach((script, index) => {
        if (script.src && script.src.includes('live2d') || script.src.includes('pixi')) {
          debug.scripts.push({
            index,
            src: script.src,
            loaded: script.getAttribute('data-loaded') || 'unknown',
          });
        }
      });
      
      setDebugInfo(debug);
      
      console.log('=== CDN Libraries Status (Cubism 4) ===');
      console.log('window.Live2DCubismCore:', typeof (window as any).Live2DCubismCore);
      console.log('window.PIXI:', typeof (window as any).PIXI);
      console.log('window.PIXI.live2d:', typeof (window as any).PIXI?.live2d);
      console.log('window.PIXI.live2d.Live2DModel:', typeof (window as any).PIXI?.live2d?.Live2DModel);
      console.log('Debug Info:', debug);
      
      // 尝试手动查看 pixi-live2d-display 的内容
      if ((window as any).PIXI?.live2d && !(window as any).PIXI?.live2d?.Live2DModel) {
        console.warn('⚠️ PIXI.live2d exists but Live2DModel is missing!');
        console.log('PIXI.live2d contents:', Object.keys((window as any).PIXI.live2d));
        console.log('PIXI.live2d:', (window as any).PIXI.live2d);
      }
    };

    // 立即检查
    check();
    
    // 每秒检查一次，持续 10 秒
    const interval = setInterval(check, 1000);
    setTimeout(() => clearInterval(interval), 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">CDN Libraries Test (Cubism 4)</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">window.Live2DCubismCore</h3>
            <p className="text-lg">{status.cubismCore}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">window.PIXI</h3>
            <p className="text-lg">{status.pixi}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">window.PIXI.live2d</h3>
            <p className="text-lg">{status.pixiLive2d}</p>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">window.PIXI.live2d.Live2DModel</h3>
            <p className="text-lg font-bold">{status.live2dModel}</p>
          </div>
        </div>

        {debugInfo && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold mb-3 text-yellow-900">🔍 详细调试信息</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <strong>PIXI Keys:</strong>
                <p className="text-gray-700 font-mono text-xs mt-1">{debugInfo.pixi.keys}</p>
              </div>
              
              {debugInfo.pixiLive2d.exists && (
                <div>
                  <strong>PIXI.live2d Keys:</strong>
                  <p className="text-gray-700 font-mono text-xs mt-1">{debugInfo.pixiLive2d.keys}</p>
                </div>
              )}
              
              <div>
                <strong>Loaded Scripts:</strong>
                <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                  {debugInfo.scripts.map((script: any, i: number) => (
                    <li key={i} className="font-mono text-xs break-all">
                      {script.src.split('/').pop()}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>提示:</strong> 打开浏览器控制台 (F12) 查看详细日志
          </p>
        </div>

        <div className="mt-4 text-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
          >
            刷新页面
          </button>
          
          <button
            onClick={() => {
              console.clear();
              console.log('=== Manual Check ===');
              console.log('window.Live2DCubismCore:', (window as any).Live2DCubismCore);
              console.log('window.PIXI:', (window as any).PIXI);
              console.log('window.PIXI?.live2d:', (window as any).PIXI?.live2d);
              if ((window as any).PIXI?.live2d) {
                console.log('PIXI.live2d keys:', Object.keys((window as any).PIXI.live2d));
                for (let key of Object.keys((window as any).PIXI.live2d)) {
                  console.log(`PIXI.live2d.${key}:`, typeof (window as any).PIXI.live2d[key]);
                }
              }
              alert('已在控制台打印详细信息，请查看 F12');
            }}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >
            打印详细信息到控制台
          </button>
        </div>
      </div>
    </div>
  );
}
