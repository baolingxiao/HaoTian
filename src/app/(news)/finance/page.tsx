import { Suspense } from 'react';
import FinanceTicker from '@/components/FinanceTicker';
import FinanceSpeaker from '@/components/FinanceSpeaker';

// RSS feed item type
interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  source: string;
}

// Fetch Fidelity news data
async function fetchFinanceNews(): Promise<RSSItem[]> {
  try {
    // Try to fetch from Fidelity API first
    const response = await fetch('/api/fidelity-data?type=news&limit=12', {
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        // Convert Fidelity news format to RSSItem format
        return data.data.map((item: any) => ({
          title: item.title,
          link: item.url,
          pubDate: item.publishedAt,
          description: item.summary,
          source: item.source || 'Fidelity'
        }));
      }
    }
  } catch (error) {
    console.error('Error fetching Fidelity news:', error);
  }

  // Fallback to mock data
  const mockNews: RSSItem[] = [
    {
      title: "美联储暗示可能降息，经济面临不确定性",
      link: "https://finance.yahoo.com/news/fed-signals-rate-cuts",
      pubDate: new Date().toISOString(),
      description: "随着通胀显示出降温迹象和经济增长放缓，美联储暗示可能降息。",
      source: "雅虎财经"
    },
    {
      title: "科技股上涨，人工智能投资推动市场乐观情绪",
      link: "https://finance.yahoo.com/news/tech-stocks-rally-ai",
      pubDate: new Date(Date.now() - 3600000).toISOString(),
      description: "随着人工智能投资持续吸引投资者关注，主要科技公司股价大幅上涨。",
      source: "雅虎财经"
    },
    {
      title: "中东紧张局势后油价飙升",
      link: "https://finance.yahoo.com/news/oil-prices-surge",
      pubDate: new Date(Date.now() - 7200000).toISOString(),
      description: "由于中东地缘政治紧张局势引发对供应中断的担忧，原油期货上涨3%。",
      source: "雅虎财经"
    },
    {
      title: "避险需求增加，黄金创下新高",
      link: "https://finance.yahoo.com/news/gold-new-highs",
      pubDate: new Date(Date.now() - 10800000).toISOString(),
      description: "在全球经济不确定性中，投资者寻求避险资产，黄金价格创下历史新高。",
      source: "雅虎财经"
    },
    {
      title: "加密货币市场信号混杂",
      link: "https://finance.yahoo.com/news/crypto-mixed-signals",
      pubDate: new Date(Date.now() - 14400000).toISOString(),
      description: "随着监管发展持续影响市场，比特币和其他主要加密货币出现波动。",
      source: "雅虎财经"
    },
    {
      title: "欧洲市场因积极经济数据收高",
      link: "https://finance.yahoo.com/news/european-markets-higher",
      pubDate: new Date(Date.now() - 18000000).toISOString(),
      description: "欧洲股市在好于预期的经济指标推动下，以积极态势结束交易。",
      source: "雅虎财经"
    },
    {
      title: "中国制造业PMI显示意外增长",
      link: "https://finance.yahoo.com/news/china-manufacturing-pmi",
      pubDate: new Date(Date.now() - 21600000).toISOString(),
      description: "中国制造业采购经理人指数超出预期，显示潜在的经济复苏信号。",
      source: "雅虎财经"
    },
    {
      title: "银行业面临利率上升压力",
      link: "https://finance.yahoo.com/news/banking-sector-pressure",
      pubDate: new Date(Date.now() - 25200000).toISOString(),
      description: "主要银行报告面临挑战，因为利率上升影响了贷款需求和存款成本。",
      source: "雅虎财经"
    },
    {
      title: "可再生能源股因政策支持上涨",
      link: "https://finance.yahoo.com/news/renewable-energy-gains",
      pubDate: new Date(Date.now() - 28800000).toISOString(),
      description: "随着政府政策继续支持可再生能源发展，清洁能源公司股价大幅上涨。",
      source: "雅虎财经"
    },
    {
      title: "零售销售数据超出预期",
      link: "https://finance.yahoo.com/news/retail-sales-exceed",
      pubDate: new Date(Date.now() - 32400000).toISOString(),
      description: "消费者支出显示出韧性，零售销售数据比预期更强劲。",
      source: "雅虎财经"
    },
    {
      title: "房地产市场显示稳定迹象",
      link: "https://finance.yahoo.com/news/housing-market-stabilization",
      pubDate: new Date(Date.now() - 36000000).toISOString(),
      description: "房价和销售活动表明房地产市场可能正在找到新的平衡点。",
      source: "雅虎财经"
    },
    {
      title: "全球供应链中断缓解",
      link: "https://finance.yahoo.com/news/supply-chain-disruptions-ease",
      pubDate: new Date(Date.now() - 39600000).toISOString(),
      description: "随着供应链瓶颈继续得到解决，国际贸易流动显示改善。",
      source: "雅虎财经"
    }
  ];
  
  return mockNews;
}

// Format date for display
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  } catch {
    return '最近';
  }
}

// News card component
function NewsCard({ item, index }: { item: RSSItem; index: number }) {
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-300 hover:shadow-md cursor-pointer group shadow-sm"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-600 bg-blue-100 px-2 py-1 rounded">
          {item.source}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(item.pubDate)}
        </span>
      </div>
      
      <h3 className="text-gray-900 font-medium text-sm leading-tight mb-2 group-hover:text-blue-600 transition-colors">
        {item.title}
      </h3>
      
      {item.description && (
        <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
          {item.description}
        </p>
      )}
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          #{index + 1}
        </span>
        <a 
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-500 text-xs transition-colors"
        >
          阅读更多 →
        </a>
      </div>
    </div>
  );
}

// Loading skeleton
function NewsCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 w-16 bg-gray-300 rounded"></div>
        <div className="h-4 w-12 bg-gray-300 rounded"></div>
      </div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 rounded mb-1"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}

export default async function FinancePage() {
  const newsItems = await fetchFinanceNews();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 relative">
      {/* Finance Content - Top 3/4 of screen */}
      <div className="h-[75vh] overflow-y-auto bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">财经市场</h1>
                <p className="text-blue-100 text-sm mt-1">实时市场数据和突发新闻</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">最后更新</div>
                <div className="text-white font-mono">{new Date().toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker Bar */}
        <div className="bg-gray-800 text-white border-b border-gray-300">
          <Suspense fallback={
            <div className="py-3 px-4">
              <div className="h-6 bg-gray-600 rounded animate-pulse"></div>
            </div>
          }>
            <FinanceTicker />
          </Suspense>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Suspense fallback={
              <>
                {Array.from({ length: 12 }).map((_, i) => (
                  <NewsCardSkeleton key={i} />
                ))}
              </>
            }>
              {newsItems.map((item, index) => (
                <NewsCard key={`${item.link}-${index}`} item={item} index={index} />
              ))}
            </Suspense>
          </div>
        </div>
      </div>

      {/* AI Chat Area - Bottom 1/4 */}
      <div className="h-[25vh] bg-white/90 backdrop-blur-sm border-t border-gray-200 relative">
        {/* Finance Speaker - Fixed position in bottom area */}
        <div className="absolute bottom-4 left-4 z-20">
          <Suspense fallback={
            <div className="bg-blue-600 rounded-lg p-3 animate-pulse">
              <div className="h-4 w-24 bg-blue-400 rounded"></div>
            </div>
          }>
            <FinanceSpeaker newsItems={newsItems.slice(0, 3)} />
          </Suspense>
        </div>
        
        {/* AI Chat Interface */}
        <div className="h-full flex flex-col justify-center items-center px-4">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">AI 财经助手</h3>
              <p className="text-sm text-gray-600">询问任何财经问题，获取专业分析</p>
            </div>
            
            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="请输入您的财经问题..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                发送
              </button>
            </div>
            
            {/* Quick Questions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors">
                今日股市如何？
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors">
                美联储政策解读
              </button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors">
                投资建议
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}