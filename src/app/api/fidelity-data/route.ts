import { NextRequest, NextResponse } from 'next/server';
import { fidelityAPI, getFidelityQuotes, getFidelityNews, getFidelityMarketData } from '@/lib/fidelity-api';

// GET /api/fidelity-data/quotes?symbols=AAPL,MSFT,GOOGL
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'market';
    const symbols = searchParams.get('symbols')?.split(',') || ['^GSPC', '^IXIC', 'GC=F', 'CL=F', 'USDCNY=X'];
    const limit = parseInt(searchParams.get('limit') || '20');

    switch (type) {
      case 'quotes':
        const quotes = await getFidelityQuotes(symbols);
        return NextResponse.json({
          success: true,
          data: quotes,
          source: 'Fidelity API',
          timestamp: new Date().toISOString()
        });

      case 'news':
        const news = await getFidelityNews(limit);
        return NextResponse.json({
          success: true,
          data: news,
          source: 'Fidelity News',
          timestamp: new Date().toISOString()
        });

      case 'market':
      default:
        const marketData = await getFidelityMarketData();
        return NextResponse.json({
          success: true,
          data: marketData,
          source: 'Fidelity Market Data',
          timestamp: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Fidelity API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Fidelity data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/fidelity-data - Get custom data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, symbols, limit } = body;

    switch (type) {
      case 'quotes':
        const quotes = await getFidelityQuotes(symbols || ['^GSPC', '^IXIC']);
        return NextResponse.json({
          success: true,
          data: quotes,
          source: 'Fidelity API',
          timestamp: new Date().toISOString()
        });

      case 'news':
        const news = await getFidelityNews(limit || 20);
        return NextResponse.json({
          success: true,
          data: news,
          source: 'Fidelity News',
          timestamp: new Date().toISOString()
        });

      case 'market':
        const marketData = await getFidelityMarketData();
        return NextResponse.json({
          success: true,
          data: marketData,
          source: 'Fidelity Market Data',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid request type' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Fidelity API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Fidelity data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

