'use client';

import { useEffect, useState } from 'react';

interface MarketData {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  currency: string;
}

interface TickerData {
  [key: string]: MarketData;
}

export default function FinanceTicker() {
  const [tickerData, setTickerData] = useState<TickerData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to fetch from Fidelity API first
        const response = await fetch('/api/fidelity-data?type=quotes&symbols=VOO,^GSPC,^IXIC,GC=F,CL=F,USDCNY=X');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            // Convert Fidelity format to TickerData format
            const result: TickerData = {};
            data.data.forEach((item: any) => {
              result[item.symbol] = {
                symbol: item.symbol,
                shortName: item.symbol,
                regularMarketPrice: item.price,
                regularMarketChange: item.change,
                regularMarketChangePercent: item.changePercent,
                currency: item.symbol.includes('=') ? 'USD' : 'USD'
              };
            });
            setTickerData(result);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching Fidelity data:', error);
      }
        
      // Fallback to mock data
      const mockData: TickerData = {
        'VOO': {
          symbol: 'VOO',
          shortName: 'S&P 500 ETF',
          regularMarketPrice: 485.67,
          regularMarketChange: 2.34,
          regularMarketChangePercent: 0.48,
          currency: 'USD'
        },
        '^GSPC': {
          symbol: '^GSPC',
          shortName: 'S&P 500',
          regularMarketPrice: 4850.23,
          regularMarketChange: -12.45,
          regularMarketChangePercent: -0.26,
          currency: 'USD'
        },
        '^IXIC': {
          symbol: '^IXIC',
          shortName: 'NASDAQ',
          regularMarketPrice: 15234.56,
          regularMarketChange: 45.78,
          regularMarketChangePercent: 0.30,
          currency: 'USD'
        },
        'GC=F': {
          symbol: 'GC=F',
          shortName: 'GOLD',
          regularMarketPrice: 2034.50,
          regularMarketChange: 8.25,
          regularMarketChangePercent: 0.41,
          currency: 'USD'
        },
        'CL=F': {
          symbol: 'CL=F',
          shortName: 'OIL',
          regularMarketPrice: 78.45,
          regularMarketChange: -1.23,
          regularMarketChangePercent: -1.54,
          currency: 'USD'
        },
        'USDCNY=X': {
          symbol: 'USDCNY=X',
          shortName: 'USD/CNY',
          regularMarketPrice: 7.2345,
          regularMarketChange: 0.0123,
          regularMarketChangePercent: 0.17,
          currency: 'CNY'
        }
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTickerData(mockData);
    };

    // Initial fetch
    fetchMarketData();
    
    // Update every 30 seconds with slight variations
    const interval = setInterval(() => {
      setTickerData(prev => {
        const updated: TickerData = {};
        Object.entries(prev).forEach(([key, data]) => {
          const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
          const newPrice = data.regularMarketPrice * (1 + variation);
          const change = newPrice - data.regularMarketPrice;
          const changePercent = (change / data.regularMarketPrice) * 100;
          
          updated[key] = {
            ...data,
            regularMarketPrice: Number(newPrice.toFixed(2)),
            regularMarketChange: Number(change.toFixed(2)),
            regularMarketChangePercent: Number(changePercent.toFixed(2))
          };
        });
        return updated;
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, currency: string) => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `${price.toFixed(2)} ${currency}`;
  };

  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="py-3 px-4 overflow-hidden">
        <div className="flex space-x-8 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <div className="h-4 w-12 bg-gray-700 rounded"></div>
              <div className="h-4 w-16 bg-gray-700 rounded"></div>
              <div className="h-4 w-20 bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3 px-4 text-center">
        <span className="text-red-400 text-sm">{error}</span>
      </div>
    );
  }

  const tickerItems = [
    { key: 'VOO', label: 'S&P 500 ETF' },
    { key: '^GSPC', label: 'S&P 500' },
    { key: '^IXIC', label: 'NASDAQ' },
    { key: 'GC=F', label: 'GOLD' },
    { key: 'CL=F', label: 'OIL' },
    { key: 'USDCNY=X', label: 'USD/CNY' }
  ];

  return (
    <div className="py-3 px-4 overflow-hidden">
      <div className="flex space-x-8 animate-scroll">
        {tickerItems.map((item) => {
          const data = tickerData[item.key];
          if (!data) return null;
          
          return (
            <div key={item.key} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-300 font-medium text-sm">
                {item.label}
              </span>
              <span className="text-white font-mono text-sm">
                {formatPrice(data.regularMarketPrice, data.currency)}
              </span>
              <span className={`font-mono text-sm ${getChangeColor(data.regularMarketChange)}`}>
                {formatChange(data.regularMarketChange, data.regularMarketChangePercent)}
              </span>
            </div>
          );
        })}
        
        {/* Duplicate for seamless scrolling */}
        {tickerItems.map((item) => {
          const data = tickerData[item.key];
          if (!data) return null;
          
          return (
            <div key={`${item.key}-dup`} className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-300 font-medium text-sm">
                {item.label}
              </span>
              <span className="text-white font-mono text-sm">
                {formatPrice(data.regularMarketPrice, data.currency)}
              </span>
              <span className={`font-mono text-sm ${getChangeColor(data.regularMarketChange)}`}>
                {formatChange(data.regularMarketChange, data.regularMarketChangePercent)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}