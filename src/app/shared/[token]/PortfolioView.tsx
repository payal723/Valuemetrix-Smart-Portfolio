'use client';

import { useState } from 'react';
import AIInsights from './AIInsights';
import ChatBot from './ChatBot';

interface Holding {
  id: string;
  ticker: string;
  quantity: number;
  currentPrice: number;
  previousClose: number;
  change: number;
  totalValue: number;
}

interface Portfolio {
  id: string;
  name: string;
  description?: string;
  cash: number;
  holdings: Holding[];
}

interface PortfolioViewProps {
  portfolio: Portfolio;
  totalPortfolioValue: number;
  totalHoldingsValue: number;
}

export default function PortfolioView({
  portfolio,
  totalPortfolioValue,
  totalHoldingsValue,
}: PortfolioViewProps) {
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto p-4 md:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {portfolio.name}
              </h1>
              <p className="text-gray-400 text-sm">ValueMetrix • Powered by AI</p>
            </div>
          </div>
          {portfolio.description && (
            <p className="text-gray-300 mt-2">{portfolio.description}</p>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <main className="lg:col-span-2 space-y-6">
            {/* Holdings Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                <span className="text-cyan-400">💼</span> Holdings
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-600">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Ticker</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Qty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Change</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {portfolio.holdings.map((holding) => (
                      <tr key={holding.id} className="hover:bg-slate-700/30 transition">
                        <td className="py-4 px-4 font-mono text-lg font-semibold text-cyan-400">
                          {holding.ticker}
                        </td>
                        <td className="py-4 px-4 text-gray-300">{holding.quantity}</td>
                        <td className="py-4 px-4 text-gray-200">
                          ${holding.currentPrice.toFixed(2)}
                        </td>
                        <td className={`py-4 px-4 font-semibold ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(2)}%
                        </td>
                        <td className="py-4 px-4 font-semibold text-white">
                          ${holding.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Insights */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl">
              <h2 className="text-2xl font-semibold mb-4 text-white flex items-center gap-2">
                <span className="text-purple-400">🤖</span> AI-Powered Insights
              </h2>
              <AIInsights portfolioId={portfolio.id} />
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/70 to-purple-900/30 backdrop-blur-sm border border-slate-700 rounded-xl p-6 shadow-2xl sticky top-6">
              <h3 className="text-xl font-semibold mb-4 border-b border-slate-600 pb-2 flex items-center gap-2">
                <span className="text-cyan-400">📊</span> Portfolio Snapshot
              </h3>
              <div className="space-y-5">
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Total Value</span>
                  <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Holdings Value</span>
                  <p className="text-2xl text-white">
                    ${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Cash Balance</span>
                  <p className="text-2xl text-white">
                    ${portfolio.cash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-400 text-sm block mb-1">Total Holdings</span>
                  <p className="text-2xl text-white">{portfolio.holdings.length}</p>
                </div>
              </div>

              <button
                onClick={() => setShowChat(!showChat)}
                className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-lg"
              >
                💬 Ask AI About This Portfolio
              </button>
            </div>
          </aside>
        </div>

        {/* Chatbot Modal */}
        {showChat && (
          <ChatBot
            portfolioId={portfolio.id}
            onClose={() => setShowChat(false)}
          />
        )}
      </div>
    </div>
  );
}