// lib/openai.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface HoldingData {
  ticker: string;
  quantity: number;
  currentPrice: number;
  totalValue: number;
  companyName?: string;
  industry?: string;
}

export async function generatePortfolioInsights(
  holdings: HoldingData[],
  cash: number,
  portfolioName: string
) {
  const totalValue = holdings.reduce((sum, h) => sum + h.totalValue, 0) + cash;
  
  const holdingsText = holdings.map(h => 
    `${h.ticker} (${h.companyName || h.ticker}): ${h.quantity} shares @ $${h.currentPrice.toFixed(2)} = $${h.totalValue.toLocaleString()} (${((h.totalValue/totalValue)*100).toFixed(1)}%) - Industry: ${h.industry}`
  ).join('\n');

  const prompt = `You are a senior financial analyst at ValueMetrix, providing institutional-grade portfolio analysis.

Portfolio: ${portfolioName}
Total Value: $${totalValue.toLocaleString()}
Cash: $${cash.toLocaleString()} (${((cash/totalValue)*100).toFixed(1)}%)
Number of Holdings: ${holdings.length}

Holdings Breakdown:
${holdingsText}

Provide a comprehensive investment analysis in JSON format with these fields:

{
  "summary": "2-3 sentence portfolio overview with key metrics and composition",
  "diversification": "Detailed analysis of diversification quality (good/moderate/poor), concentration risks, and specific recommendations",
  "sectorExposure": "Breakdown of sector allocation with percentages, concentration risks, and gaps in exposure",
  "investmentThesis": "One compelling sentence capturing the portfolio's core investment strategy and positioning",
  "riskLevel": "Risk assessment (Low/Medium/High) with specific justification based on concentration, volatility, and market conditions",
  "recommendations": ["4-5 specific, actionable recommendations for improving portfolio performance and risk management"]
}

Be data-driven, professional, and provide actionable insights. Consider:
- Sector concentration and correlation
- Individual position sizing
- Cash allocation efficiency
- Market conditions and valuations
- Risk-adjusted returns potential`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano", 
      messages: [
        {
          role: "system",
          content: "You are a senior financial analyst providing institutional-grade portfolio analysis. Always respond with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const insights = JSON.parse(content);
    return insights;
  } catch (error: any) {
    console.error('OpenAI Error:', error.message);
    
    return {
      summary: `Your ${portfolioName} contains ${holdings.length} holdings with a total value of $${totalValue.toLocaleString()}. Portfolio composition includes ${holdings.map(h => h.ticker).join(', ')}.`,
      diversification: holdings.length < 3 
        ? "Portfolio shows high concentration risk. Consider diversifying across 5-10 stocks from different sectors."
        : "Portfolio demonstrates good diversification across multiple holdings.",
      sectorExposure: `Holdings include: ${holdings.map(h => `${h.ticker} (${h.industry})`).join(', ')}. Monitor sector concentration.`,
      investmentThesis: "Growth-oriented portfolio with focus on established companies.",
      riskLevel: holdings.length < 3 ? "High - Concentrated positions" : "Medium - Diversified holdings",
      recommendations: [
        "Review position sizing - ensure no single holding exceeds 20% of portfolio",
        `Current cash allocation is ${((cash/totalValue)*100).toFixed(1)}% - consider optimal deployment`,
        "Monitor correlation between holdings to ensure true diversification",
        "Set up quarterly rebalancing schedule"
      ]
    };
  }
}

export async function chatWithPortfolio(
  question: string,
  portfolioContext: string
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: `You are a helpful financial assistant for ValueMetrix. Answer questions about this portfolio concisely and professionally:\n\n${portfolioContext}`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content || "I couldn't process your question. Please try again.";
  } catch (error) {
    console.error('Chat error:', error);
    return "Sorry, I'm having trouble connecting to the AI service. Please try again in a moment.";
  }
}