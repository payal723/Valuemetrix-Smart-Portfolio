// lib/finnhub.ts

interface Quote {
  c: number;  // Current price
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

export async function getQuote(ticker: string): Promise<Quote | null> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!response.ok) {
      console.error(`Failed to fetch quote for ${ticker}`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

export async function getCompanyProfile(ticker: string) {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    );
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}