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
  
  const prompt = `You are a financial analyst at ValueMetrix, an institutional-grade research platform.

Analyze the following portfolio:

Portfolio Name: ${portfolioName}
Total Value: $${totalValue.toLocaleString()}
Cash: $${cash.toLocaleString()} (${((cash/totalValue)*100).toFixed(1)}%)

Holdings:
${holdings.map(h => `- ${h.ticker}: ${h.quantity} shares @ $${h.currentPrice.toFixed(2)} = $${h.totalValue.toLocaleString()} (${((h.totalValue/totalValue)*100).toFixed(1)}%)`).join('\n')}

Provide a comprehensive analysis in JSON format with the following structure:
{
  "summary": "2-3 sentence overview of the portfolio",
  "diversification": "Analysis of diversification quality (good/moderate/poor) and why",
  "sectorExposure": "Breakdown of sector allocation and concentration risks",
  "investmentThesis": "One compelling sentence about the portfolio's strategy",
  "riskLevel": "Low/Medium/High with brief justification",
  "recommendations": ["3-4 actionable recommendations"]
}

Be professional, data-driven, and insightful.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior financial analyst providing institutional-grade portfolio analysis."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    return content ? JSON.parse(content) : null;
  } catch (error) {
    console.error('Error generating insights:', error);
    return null;
  }
}

export async function chatWithPortfolio(
  question: string,
  portfolioContext: string
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful financial assistant. Answer questions about this portfolio:\n\n${portfolioContext}`
        },
        {
          role: "user",
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error in chat:', error);
    return "Sorry, I couldn't process your question.";
  }
}