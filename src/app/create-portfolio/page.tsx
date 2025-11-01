'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HoldingState {
  ticker: string;
  quantity: string;
}

export default function CreatePortfolioPage() {
  const [portfolioName, setPortfolioName] = useState('');
  const [cash, setCash] = useState('');
  const [holdings, setHoldings] = useState<HoldingState[]>([
    { ticker: '', quantity: '' },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleHoldingChange = (index: number, field: keyof HoldingState, value: string) => {
    const newHoldings = [...holdings];
    newHoldings[index][field] = value;
    setHoldings(newHoldings);
  };

  const addHolding = () => {
    setHoldings([...holdings, { ticker: '', quantity: '' }]);
  };

  const removeHolding = (index: number) => {
    const newHoldings = holdings.filter((_, i) => i !== index);
    setHoldings(newHoldings);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formattedHoldings = holdings.map(h => ({
      ticker: h.ticker.toUpperCase(),
      quantity: parseInt(h.quantity, 10),
    })).filter(h => h.ticker && !isNaN(h.quantity) && h.quantity > 0);

    if (formattedHoldings.length === 0) {
      setError('Please add at least one valid holding.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: portfolioName,
          cash: parseFloat(cash) || 0,
          holdings: formattedHoldings,
          visibility: 'SMART_SHARED', // Defaulting for now
          userId: 'clxza12340000abcd1234efgh', // HARDCODED - !! REPLACE LATER WITH AUTH !!
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create portfolio');
      }

      const newPortfolio = await response.json();
      router.push(`/portfolio/${newPortfolio.id}`); // Redirect to the new portfolio page (we will create this later)

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-cyan-400">Create New Portfolio</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="portfolioName" className="block text-sm font-medium text-gray-300 mb-2">Portfolio Name</label>
            <input
              type="text"
              id="portfolioName"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="e.g., My Tech Stocks"
            />
          </div>

          <div>
            <label htmlFor="cash" className="block text-sm font-medium text-gray-300 mb-2">Cash Balance (USD)</label>
            <input
              type="number"
              id="cash"
              value={cash}
              onChange={(e) => setCash(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              placeholder="e.g., 10000"
            />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2 text-gray-200">Holdings</h2>
            <div className="space-y-4">
              {holdings.map((holding, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={holding.ticker}
                    onChange={(e) => handleHoldingChange(index, 'ticker', e.target.value)}
                    placeholder="Ticker (e.g., AAPL)"
                    required
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none uppercase"
                  />
                  <input
                    type="number"
                    value={holding.quantity}
                    onChange={(e) => handleHoldingChange(index, 'quantity', e.target.value)}
                    placeholder="Quantity"
                    required
                    className="w-32 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeHolding(index)}
                    disabled={holdings.length === 1}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-red-900 disabled:cursor-not-allowed"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addHolding}
              className="mt-4 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md"
            >
              Add Another Holding
            </button>
          </div>

          {error && <p className="text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-md transition-all duration-200 disabled:bg-cyan-900"
          >
            {isLoading ? 'Creating...' : 'Create Portfolio'}
          </button>
        </form>
      </div>
    </div>
  );
}