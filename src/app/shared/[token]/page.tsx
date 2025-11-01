// app/shared/[token]/page.tsx

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { getQuote } from '@/lib/finnhub';
import PortfolioView from './PortfolioView';
import { headers } from 'next/headers';

interface PageProps {
  params: {
    token: string;
  };
}

async function getSharedPortfolio(token: string) {
  const shareAccess = await prisma.sharedPortfolioAccess.findUnique({
    where: { token, isActive: true },
    include: {
      portfolio: {
        include: {
          holdings: true,
        },
      },
    },
  });

  if (!shareAccess) {
    return null;
  }

  // Log access
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  await prisma.tokenAccessLog.create({
    data: {
      accessId: shareAccess.id,
      viewerIP: ip,
      viewerAgent: userAgent,
    },
  });

  // Increment view count
  await prisma.sharedPortfolioAccess.update({
    where: { id: shareAccess.id },
    data: { viewCount: { increment: 1 } },
  });

  return shareAccess.portfolio;
}

export default async function SharedPortfolioPage({ params }: PageProps) {
  const portfolio = await getSharedPortfolio(params.token);

  if (!portfolio) {
    notFound();
  }

  // Fetch live prices
  const holdingsWithPrices = await Promise.all(
    portfolio.holdings.map(async (holding) => {
      const quote = await getQuote(holding.ticker);
      return {
        id: holding.id,
        ticker: holding.ticker,
        quantity: holding.quantity,
        currentPrice: quote?.c ?? 0,
        previousClose: quote?.pc ?? 0,
        change: quote ? ((quote.c - quote.pc) / quote.pc) * 100 : 0,
        totalValue: (quote?.c ?? 0) * holding.quantity,
      };
    })
  );

  const totalHoldingsValue = holdingsWithPrices.reduce(
    (acc, h) => acc + h.totalValue,
    0
  );
  const totalPortfolioValue = totalHoldingsValue + portfolio.cash;

  const portfolioData = {
    id: portfolio.id,
    name: portfolio.name,
    description: portfolio.description || undefined,
    cash: portfolio.cash,
    holdings: holdingsWithPrices,
  };

  return (
    <PortfolioView
      portfolio={portfolioData}
      totalPortfolioValue={totalPortfolioValue}
      totalHoldingsValue={totalHoldingsValue}
    />
  );
}