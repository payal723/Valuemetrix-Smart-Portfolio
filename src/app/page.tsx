// app/page.tsx

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ValueMetrix
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Smart Shareable Portfolios with AI Insights
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            Create portfolios, share them securely, and get institutional-grade AI analysis.
            No login required for viewers.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition transform hover:scale-105"
            >
              Get Started Free
            </Link>
            <Link
              href="/auth/signin"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-8 rounded-xl border border-slate-600 transition"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Smart Sharing</h3>
              <p className="text-gray-400">Share portfolios via secure links. No login needed for viewers.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Insights</h3>
              <p className="text-gray-400">GPT-4 powered analysis with diversification and risk assessment.</p>
            </div>

            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-2xl">
              <div className="w-16 h-16 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-Time Data</h3>
              <p className="text-gray-400">Live stock prices from Finnhub API updated every 5 minutes.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-400">
          <p>© 2025 ValueMetrix. Built for institutional-grade portfolio management.</p>
        </div>
      </div>
    </div>
  );
}