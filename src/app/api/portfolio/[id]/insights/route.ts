import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getQuote, getCompanyProfile } from '@/lib/finnhub';
import { generatePortfolioInsights } from '@/lib/openai';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const portfolioId = params.id;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { holdings: true }
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const holdingsWithData = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const quote = await getQuote(holding.ticker);
        const profile = await getCompanyProfile(holding.ticker);
        
        return {
          ticker: holding.ticker,
          quantity: holding.quantity,
          currentPrice: quote?.c || 0,
          totalValue: (quote?.c || 0) * holding.quantity,
          companyName: profile?.name || holding.ticker,
          industry: profile?.finnhubIndustry || 'Unknown',
        };
      })
    );

    const insights = await generatePortfolioInsights(
      holdingsWithData,
      portfolio.cash,
      portfolio.name
    );

    if (!insights) {
      return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
    }

    const savedInsight = await prisma.aIInsight.create({
      data: {
        portfolioId,
        summary: insights.summary,
        diversification: insights.diversification,
        sectorExposure: insights.sectorExposure,
        investmentThesis: insights.investmentThesis,
        riskLevel: insights.riskLevel,
      }
    });

    return NextResponse.json({
      ...savedInsight,
      recommendations: insights.recommendations,
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const insight = await prisma.aIInsight.findFirst({
      where: { portfolioId: params.id },
      orderBy: { generatedAt: 'desc' }
    });

    if (!insight) {
      return NextResponse.json({ error: 'No insights found' }, { status: 404 });
    }

    return NextResponse.json(insight);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}