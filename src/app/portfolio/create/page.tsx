'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function CreatePortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cash, setCash] = useState('10000');
  const [visibility, setVisibility] = useState('private');
  const [holdings, setHoldings] = useState([{ ticker: '', quantity: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', quantity: '' }]);
  };

  const removeHolding = (index: number) => {
    setHoldings(holdings.filter((_, i) => i !== index));
  };

  const updateHolding = (index: number, field: 'ticker' | 'quantity', value: string) => {
    const updated = [...holdings];
    updated[index][field] = value;
    setHoldings(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validHoldings = holdings.filter(h => h.ticker && h.quantity);
    if (validHoldings.length === 0) {
      setError('Add at least one holding');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          cash: parseFloat(cash),
          visibility,
          holdings: validHoldings.map(h => ({
            ticker: h.ticker.toUpperCase(),
            quantity: parseInt(h.quantity),
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create portfolio');
      }

      const portfolio = await response.json();

      if (visibility === 'smart_shared') {
        await fetch(`/api/portfolio/${portfolio.id}/share`, {
          method: 'POST',
        });
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navbar */}
      <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <Link href="/dashboard" className="text-cyan-400 hover:text-cyan-300 text-sm md:text-base inline-flex items-center gap-2">
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 md:py-12 max-w-3xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Create Portfolio</h1>
          <p className="text-gray-400 text-sm md:text-base">Build your investment portfolio with AI insights</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl md:rounded-2xl p-5 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Portfolio Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Portfolio Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-cyan-500 transition"
                placeholder="My Tech Portfolio"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-cyan-500 transition resize-none"
                placeholder="Growth-focused tech stocks portfolio"
              />
            </div>

            {/* Cash Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cash Balance ($) *
              </label>
              <input
                type="number"
                value={cash}
                onChange={(e) => setCash(e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-cyan-500 transition"
              />
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Visibility *
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-cyan-500 transition"
              >
                <option value="private">Private (Only me)</option>
                <option value="public">Public (Listed)</option>
                <option value="smart_shared">Smart Shared (Anyone with link)</option>
              </select>
            </div>

            {/* Holdings */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <label className="block text-sm font-medium text-gray-300">
                  Holdings *
                </label>
                <button
                  type="button"
                  onClick={addHolding}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white text-sm px-4 py-2 rounded-lg transition w-full sm:w-auto"
                >
                  + Add Holding
                </button>
              </div>

              <div className="space-y-3">
                {holdings.map((holding, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="text"
                      value={holding.ticker}
                      onChange={(e) => updateHolding(index, 'ticker', e.target.value)}
                      placeholder="AAPL"
                      className="flex-1 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-cyan-500 uppercase"
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <input
                        type="number"
                        value={holding.quantity}
                        onChange={(e) => updateHolding(index, 'quantity', e.target.value)}
                        placeholder="Quantity"
                        min="1"
                        className="flex-1 sm:w-28 bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:border-cyan-500"
                      />
                      {holdings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHolding(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 md:px-4 rounded-lg transition flex-shrink-0"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Popular: AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA, META
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-bold py-3 md:py-3.5 px-4 rounded-lg transition shadow-lg text-sm md:text-base"
            >
              {loading ? 'Creating Portfolio...' : 'Create Portfolio'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}