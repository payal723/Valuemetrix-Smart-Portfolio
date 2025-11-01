import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, cash, visibility, holdings } = body;

    const portfolio = await prisma.portfolio.create({
      data: {
        name,
        description: description || '',
        cash: parseFloat(cash) || 0,
        visibility: visibility || 'private',
        userId: (session.user as any).id,
        holdings: {
          create: holdings.map((h: any) => ({
            ticker: h.ticker.toUpperCase(),
            quantity: parseInt(h.quantity),
          }))
        }
      },
      include: {
        holdings: true,
      }
    });

    if (visibility === 'smart_shared') {
      await prisma.sharedPortfolioAccess.create({
        data: {
          token: nanoid(16),
          portfolioId: portfolio.id,
        }
      });
    }

    return NextResponse.json(portfolio, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId: (session.user as any).id,
      },
      include: {
        holdings: true,
        sharedAccess: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}