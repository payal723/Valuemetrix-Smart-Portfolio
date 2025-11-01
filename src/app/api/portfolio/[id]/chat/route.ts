// app/api/portfolio/[id]/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chatWithPortfolio } from '@/lib/openai';
import { getQuote } from '@/lib/finnhub';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { question } = await req.json();
    const portfolioId = params.id;

    // Fetch portfolio data
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { holdings: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Get current prices
    const holdingsWithPrices = await Promise.all(
      portfolio.holdings.map(async (holding) => {
        const quote = await getQuote(holding.ticker);
        return {
          ticker: holding.ticker,
          quantity: holding.quantity,
          currentPrice: quote?.c || 0,
          totalValue: (quote?.c || 0) * holding.quantity,
        };
      })
    );

    const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.totalValue, 0) + portfolio.cash;

    // Create context
    const context = `
Portfolio: ${portfolio.name}
Total Value: $${totalValue.toLocaleString()}
Cash: $${portfolio.cash.toLocaleString()}

Holdings:
${holdingsWithPrices.map(h => `- ${h.ticker}: ${h.quantity} shares @ $${h.currentPrice.toFixed(2)} = $${h.totalValue.toLocaleString()}`).join('\n')}
`;

    const answer = await chatWithPortfolio(question, context);

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}