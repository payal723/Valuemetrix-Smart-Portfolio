# ValueMetrix - Smart Shareable Portfolio

A full-stack portfolio management platform with AI-powered insights and secure sharing capabilities.

## 🚀 Features

- **Portfolio Management**: Create and manage investment portfolios with tickers, quantities, and cash
- **Smart Sharing**: Generate secure, persistent shareable links (no login required for viewers)
- **AI Insights**: GPT-4 powered portfolio analysis including:
  - Investment thesis
  - Diversification analysis
  - Sector exposure breakdown
  - Risk assessment
- **Real-time Data**: Live stock prices from Finnhub API
- **Interactive Chat**: Ask questions about your portfolio to an AI assistant
- **Access Analytics**: Track view counts and access logs
- **Revocable Access**: Portfolio owners can revoke shared links anytime

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4 & GPT-3.5
- **Stock Data**: Finnhub API
- **Hosting**: Vercel (recommended)

## 📦 Installation

### Prerequisites

- Node.js 18+ installed
- MongoDB database (MongoDB Atlas recommended)
- OpenAI API key
- Finnhub API key (free tier available)

### Setup Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd valuemetrix-portfolio
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# MongoDB
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/valuemetrix?retryWrites=true&w=majority"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# APIs
OPENAI_API_KEY="sk-your-openai-api-key"
FINNHUB_API_KEY="your-finnhub-api-key"
```

4. **Generate Prisma client**
```bash
npx prisma generate
```

5. **Push database schema**
```bash
npx prisma db push
```

6. **Run development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 🔑 API Keys Setup

### MongoDB Atlas (Free)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key
3. Add credits (paid service)

### Finnhub API (Free)
1. Go to [Finnhub](https://finnhub.io)
2. Sign up for free tier
3. Get API key (60 API calls/minute free)

## 📂 Project Structure

```
valuemetrix-portfolio/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts
│   │   │   └── signup/route.ts
│   │   └── portfolio/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── chat/route.ts
│   │           ├── insights/route.ts
│   │           └── share/route.ts
│   ├── shared/
│   │   └── [token]/
│   │       ├── page.tsx
│   │       ├── PortfolioView.tsx
│   │       ├── AIInsights.tsx
│   │       └── ChatBot.tsx
│   └── dashboard/
├── lib/
│   ├── prisma.ts
│   ├── openai.ts
│   └── finnhub.ts
├── prisma/
│   └── schema.prisma
└── .env
```

## 🤖 AI Prompt Design

### Portfolio Analysis Prompt Structure

The system uses a structured prompt to generate comprehensive portfolio insights:

**System Role**: "Senior Financial Analyst providing institutional-grade analysis"

**User Prompt Components**:
1. Portfolio metadata (name, total value, cash balance)
2. Detailed holdings breakdown with percentages
3. Structured JSON output request with specific fields:
   - Summary (2-3 sentences)
   - Diversification analysis
   - Sector exposure breakdown
   - Investment thesis (one-liner)
   - Risk level assessment
   - Actionable recommendations

**Temperature**: 0.7 (balanced creativity and consistency)

### Chat Assistant Design

**Context Provided**:
- Current portfolio composition
- Real-time prices and valuations
- Holdings breakdown

**Capabilities**:
- Answer specific questions about holdings
- Explain portfolio metrics
- Provide investment insights
- Calculate percentages and ratios

## 🔐 Security Features

1. **Secure Token Generation**: Uses nanoid (16 characters) for unguessable URLs
2. **Access Logging**: Tracks IP addresses and user agents
3. **Revocable Links**: Owners can deactivate shared access
4. **Session Management**: JWT-based authentication
5. **Password Hashing**: bcrypt with salt rounds

## 📊 Database Schema

### Key Models

**Portfolio**: User's investment portfolio
- Holdings (one-to-many)
- AI Insights (one-to-many)
- Shared Access tokens (one-to-many)

**SharedPortfolioAccess**: Shareable link management
- Unique token
- View count tracking
- Active/inactive status
- Access logs

**TokenAccessLog**: Analytics for shared portfolios
- Viewer IP and user agent
- Timestamp tracking

## 🚀 Deployment (Vercel)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```


## 🎯 Usage Flow

1. **Sign up** → Create account
2. **Create Portfolio** → Add tickers, quantities, cash
3. **Mark as Smart Shared** → Generate shareable link
4. **Share Link** → Anyone can view without login
5. **View AI Insights** → Auto-generated portfolio analysis
6. **Ask Questions** → Interactive AI chatbot
7. **Track Analytics** → See view counts and access logs



## 🐛 Known Limitations

1. **Stock Data**: Limited to Finnhub's free tier (60 calls/min)
2. **AI Costs**: OpenAI API calls are paid (GPT-4 is expensive)
3. **Real-time Updates**: Prices cached for 5 minutes
4. **Sector Classification**: Depends on Finnhub data accuracy
5. **Chat History**: Not persisted (resets on page refresh)


**Key Highlights**:
- Production-ready codebase
- Comprehensive error handling
- Mobile-responsive design
- SEO-friendly architecture
- Type-safe with TypeScript
- Scalable database design