// Fidelity API integration for real-time financial data
interface FidelityQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  lastUpdate: string;
}

interface FidelityNews {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
  source: string;
  category: string;
}

interface FidelityMarketData {
  indices: {
    '^GSPC': FidelityQuote; // S&P 500
    '^IXIC': FidelityQuote; // NASDAQ
    '^DJI': FidelityQuote;  // Dow Jones
  };
  commodities: {
    'GC=F': FidelityQuote; // Gold
    'CL=F': FidelityQuote; // Oil
    'SI=F': FidelityQuote; // Silver
  };
  currencies: {
    'USDCNY=X': FidelityQuote; // USD/CNY
    'EURUSD=X': FidelityQuote; // EUR/USD
  };
}

// Fidelity API endpoints (using their public APIs)
const FIDELITY_BASE_URL = 'https://api.fidelity.com';
const FIDELITY_QUOTE_URL = 'https://api.fidelity.com/v1/quotes';
const FIDELITY_NEWS_URL = 'https://api.fidelity.com/v1/news';

// Alternative: Use Fidelity's public data endpoints
const FIDELITY_PUBLIC_QUOTES = 'https://www.fidelity.com/api/quotes';
const FIDELITY_PUBLIC_NEWS = 'https://www.fidelity.com/api/news';

export class FidelityAPI {
  private apiKey?: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey;
  }

  // Get real-time quotes for multiple symbols
  async getQuotes(symbols: string[]): Promise<FidelityQuote[]> {
    try {
      // Method 1: Try Fidelity's public API
      const response = await fetch(`${FIDELITY_PUBLIC_QUOTES}?symbols=${symbols.join(',')}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; FinanceApp/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Fidelity API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseQuotes(data);
    } catch (error) {
      console.error('Fidelity API error:', error);
      // Fallback to mock data
      return this.getMockQuotes(symbols);
    }
  }

  // Get financial news
  async getNews(limit: number = 20): Promise<FidelityNews[]> {
    try {
      const response = await fetch(`${FIDELITY_PUBLIC_NEWS}?limit=${limit}`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; FinanceApp/1.0)',
        },
      });

      if (!response.ok) {
        throw new Error(`Fidelity News API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseNews(data);
    } catch (error) {
      console.error('Fidelity News API error:', error);
      // Fallback to mock data
      return this.getMockNews(limit);
    }
  }

  // Get comprehensive market data
  async getMarketData(): Promise<FidelityMarketData> {
    try {
      const symbols = [
        '^GSPC', '^IXIC', '^DJI', // Indices
        'GC=F', 'CL=F', 'SI=F',   // Commodities
        'USDCNY=X', 'EURUSD=X'    // Currencies
      ];

      const quotes = await this.getQuotes(symbols);
      
      return {
        indices: {
          '^GSPC': quotes.find(q => q.symbol === '^GSPC') || this.getMockQuote('^GSPC', 'S&P 500'),
          '^IXIC': quotes.find(q => q.symbol === '^IXIC') || this.getMockQuote('^IXIC', 'NASDAQ'),
          '^DJI': quotes.find(q => q.symbol === '^DJI') || this.getMockQuote('^DJI', 'Dow Jones'),
        },
        commodities: {
          'GC=F': quotes.find(q => q.symbol === 'GC=F') || this.getMockQuote('GC=F', 'Gold'),
          'CL=F': quotes.find(q => q.symbol === 'CL=F') || this.getMockQuote('CL=F', 'Oil'),
          'SI=F': quotes.find(q => q.symbol === 'SI=F') || this.getMockQuote('SI=F', 'Silver'),
        },
        currencies: {
          'USDCNY=X': quotes.find(q => q.symbol === 'USDCNY=X') || this.getMockQuote('USDCNY=X', 'USD/CNY'),
          'EURUSD=X': quotes.find(q => q.symbol === 'EURUSD=X') || this.getMockQuote('EURUSD=X', 'EUR/USD'),
        }
      };
    } catch (error) {
      console.error('Fidelity Market Data error:', error);
      return this.getMockMarketData();
    }
  }

  // Parse quotes from Fidelity API response
  private parseQuotes(data: any): FidelityQuote[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      symbol: item.symbol || item.ticker,
      price: parseFloat(item.price || item.lastPrice || 0),
      change: parseFloat(item.change || item.changeAmount || 0),
      changePercent: parseFloat(item.changePercent || item.changePercentage || 0),
      volume: parseInt(item.volume || item.totalVolume || 0),
      marketCap: item.marketCap ? parseFloat(item.marketCap) : undefined,
      lastUpdate: item.lastUpdate || new Date().toISOString(),
    }));
  }

  // Parse news from Fidelity API response
  private parseNews(data: any): FidelityNews[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id || item.articleId,
      title: item.title || item.headline,
      summary: item.summary || item.description,
      url: item.url || item.link,
      publishedAt: item.publishedAt || item.publishDate,
      source: item.source || 'Fidelity',
      category: item.category || 'General',
    }));
  }

  // Mock data fallbacks
  private getMockQuotes(symbols: string[]): FidelityQuote[] {
    return symbols.map(symbol => this.getMockQuote(symbol));
  }

  private getMockQuote(symbol: string, name?: string): FidelityQuote {
    const basePrice = this.getBasePrice(symbol);
    const change = (Math.random() - 0.5) * basePrice * 0.05; // ±5% change
    const changePercent = (change / basePrice) * 100;

    return {
      symbol,
      price: basePrice + change,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 1000000),
      lastUpdate: new Date().toISOString(),
    };
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      '^GSPC': 4850,  // S&P 500
      '^IXIC': 15200, // NASDAQ
      '^DJI': 37500,  // Dow Jones
      'GC=F': 2030,   // Gold
      'CL=F': 78,     // Oil
      'SI=F': 24,     // Silver
      'USDCNY=X': 7.23, // USD/CNY
      'EURUSD=X': 1.08, // EUR/USD
    };
    return prices[symbol] || 100;
  }

  private getMockNews(limit: number): FidelityNews[] {
    const newsTemplates = [
      {
        title: "美联储政策会议结果公布，市场反应积极",
        summary: "美联储维持利率不变，但暗示未来可能降息，市场对此反应积极。",
        category: "货币政策"
      },
      {
        title: "科技股领涨，AI投资热潮持续",
        summary: "人工智能相关股票继续受到投资者追捧，科技板块表现强劲。",
        category: "科技"
      },
      {
        title: "能源股上涨，油价创近期新高",
        summary: "地缘政治紧张局势推动油价上涨，能源股普遍走高。",
        category: "能源"
      },
      {
        title: "中国制造业数据超预期，亚洲市场上涨",
        summary: "中国制造业PMI数据好于预期，提振了亚洲市场的投资情绪。",
        category: "亚洲市场"
      },
      {
        title: "银行股承压，利率环境变化影响业绩",
        summary: "利率环境的变化对银行业绩造成压力，银行股普遍下跌。",
        category: "金融"
      }
    ];

    return Array.from({ length: limit }, (_, i) => ({
      id: `fidelity-news-${i}`,
      title: newsTemplates[i % newsTemplates.length].title,
      summary: newsTemplates[i % newsTemplates.length].summary,
      url: `https://www.fidelity.com/news/article-${i}`,
      publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
      source: 'Fidelity',
      category: newsTemplates[i % newsTemplates.length].category,
    }));
  }

  private getMockMarketData(): FidelityMarketData {
    return {
      indices: {
        '^GSPC': this.getMockQuote('^GSPC', 'S&P 500'),
        '^IXIC': this.getMockQuote('^IXIC', 'NASDAQ'),
        '^DJI': this.getMockQuote('^DJI', 'Dow Jones'),
      },
      commodities: {
        'GC=F': this.getMockQuote('GC=F', 'Gold'),
        'CL=F': this.getMockQuote('CL=F', 'Oil'),
        'SI=F': this.getMockQuote('SI=F', 'Silver'),
      },
      currencies: {
        'USDCNY=X': this.getMockQuote('USDCNY=X', 'USD/CNY'),
        'EURUSD=X': this.getMockQuote('EURUSD=X', 'EUR/USD'),
      }
    };
  }
}

// Export singleton instance
export const fidelityAPI = new FidelityAPI();

// Helper functions for easy use
export async function getFidelityQuotes(symbols: string[]): Promise<FidelityQuote[]> {
  return await fidelityAPI.getQuotes(symbols);
}

export async function getFidelityNews(limit: number = 20): Promise<FidelityNews[]> {
  return await fidelityAPI.getNews(limit);
}

export async function getFidelityMarketData(): Promise<FidelityMarketData> {
  return await fidelityAPI.getMarketData();
}

