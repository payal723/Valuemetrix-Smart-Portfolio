'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  change: number;
}

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  cash: number;
  visibility: string;
  holdings: Holding[];
  sharedAccess: Array<{ token: string; isActive: boolean; viewCount: number }>;
}

export default function PortfolioDetailPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPortfolio();
    }
  }, [status, params.id]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`/api/portfolio/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        
        // Fetch prices for holdings
        const holdingsWithPrices = await Promise.all(
          data.holdings.map(async (h: any) => {
            try {
              const priceRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=${h.ticker}&token=${process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'd424cnpr01qreojom2pgd424cnpr01qreojom2q0'}`);
              const quote = await priceRes.json();
              return {
                ...h,
                currentPrice: quote.c || 0,
                totalValue: (quote.c || 0) * h.quantity,
                change: quote.c && quote.pc ? ((quote.c - quote.pc) / quote.pc) * 100 : 0,
              };
            } catch {
              return { ...h, currentPrice: 0, totalValue: 0, change: 0 };
            }
          })
        );

        setPortfolio({ ...data, holdings: holdingsWithPrices });
      }
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/portfolio/${params.id}/share`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        alert('Share link created! URL copied to clipboard.');
        navigator.clipboard.writeText(data.url);
        fetchPortfolio(); // Refresh to show share button
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      alert('Failed to generate share link');
    } finally {
      setGenerating(false);
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  const generateInsights = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/portfolio/${params.id}/insights`, {
        method: 'POST',
      });
      
      if (response.ok) {
        alert('AI Insights generated successfully!');
      } else {
        alert('Failed to generate insights');
      }
    } catch (error) {
      console.error('Failed to generate insights:', error);
      alert('Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  if (loading || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const totalHoldingsValue = portfolio.holdings.reduce((sum, h) => sum + h.totalValue, 0);
  const totalValue = totalHoldingsValue + portfolio.cash;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300">
            ← Back to Dashboard
          </Link>
          <span className="text-gray-300">Hello, {session?.user?.name}</span>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{portfolio.name}</h1>
              {portfolio.description && (
                <p className="text-gray-400">{portfolio.description}</p>
              )}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              portfolio.visibility === 'smart_shared'
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-700 text-gray-300'
            }`}>
              {portfolio.visibility}
            </span>
          </div>

          <div className="flex gap-4">
            {portfolio.visibility === 'smart_shared' && portfolio.sharedAccess[0]?.isActive ? (
              <button
                onClick={() => copyShareLink(portfolio.sharedAccess[0].token)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                📋 Copy Share Link ({portfolio.sharedAccess[0].viewCount} views)
              </button>
            ) : portfolio.visibility !== 'smart_shared' ? (
              <button
                onClick={generateShareLink}
                disabled={generating}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                {generating ? 'Generating...' : '🔗 Generate Share Link'}
              </button>
            ) : null}
            
            <button
              onClick={generateInsights}
              disabled={generating}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {generating ? 'Generating...' : '🤖 Generate AI Insights'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Holdings</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Ticker</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Quantity</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Change</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {portfolio.holdings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-slate-700/30">
                        <td className="py-4 px-4 font-mono text-lg font-bold text-cyan-400">
                          {holding.ticker}
                        </td>
                        <td className="py-4 px-4 text-gray-300">{holding.quantity}</td>
                        <td className="py-4 px-4 text-gray-200">
                          ${holding.currentPrice.toFixed(2)}
                        </td>
                        <td className={`py-4 px-4 font-semibold ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                        </td>
                        <td className="py-4 px-4 font-bold text-white">
                          ${holding.totalValue.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gradient-to-br from-slate-800/70 to-purple-900/30 backdrop-blur border border-slate-700 rounded-xl p-6 sticky top-6">
              <h3 className="text-xl font-semibold text-white mb-4 border-b border-slate-600 pb-2">
                Portfolio Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Total Value</span>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ${totalValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Holdings Value</span>
                  <p className="text-2xl text-white">${totalHoldingsValue.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Cash Balance</span>
                  <p className="text-2xl text-white">${portfolio.cash.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Total Holdings</span>
                  <p className="text-2xl text-white">{portfolio.holdings.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}