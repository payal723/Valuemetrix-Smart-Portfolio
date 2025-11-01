'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  cash: number;
  visibility: string;
  createdAt: string;
  holdings: Array<{ ticker: string; quantity: number }>;
  sharedAccess: Array<{ token: string; isActive: boolean; viewCount: number }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchPortfolios();
    }
  }, [status, router]);

  const fetchPortfolios = async () => {
    try {
      const response = await fetch('/api/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data);
      }
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = (token: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">ValueMetrix</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-gray-300">Hello, {session?.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Portfolios</h1>
            <p className="text-gray-400">Manage and share your investment portfolios</p>
          </div>
          <Link
            href="/portfolio/create"
            className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
          >
            + Create Portfolio
          </Link>
        </div>

        {/* Portfolios Grid */}
        {portfolios.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No portfolios yet</h2>
            <p className="text-gray-400 mb-6">Create your first portfolio to get started</p>
            <Link
              href="/portfolio/create"
              className="inline-block bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              Create Portfolio
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-cyan-500 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{portfolio.name}</h3>
                    <p className="text-sm text-gray-400">{portfolio.holdings.length} holdings</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    portfolio.visibility === 'smart_shared'
                      ? 'bg-cyan-500/20 text-cyan-300'
                      : 'bg-slate-700 text-gray-300'
                  }`}>
                    {portfolio.visibility}
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-sm text-gray-400">Cash Balance:</span>
                  <p className="text-2xl font-bold text-white">${portfolio.cash.toLocaleString()}</p>
                </div>

                {portfolio.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{portfolio.description}</p>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/portfolio/${portfolio.id}`}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-center py-2 rounded-lg transition"
                  >
                    View
                  </Link>
                  {portfolio.sharedAccess.length > 0 && portfolio.sharedAccess[0].isActive && (
                    <button
                      onClick={() => copyShareLink(portfolio.sharedAccess[0].token)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-2 rounded-lg transition"
                    >
                      Copy Link ({portfolio.sharedAccess[0].viewCount} views)
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}