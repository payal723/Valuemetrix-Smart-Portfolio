// app/api/portfolio/[id]/share/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const portfolioId = params.id;

    // Verify ownership
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId: (session.user as any).id,
      }
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Check if token already exists
    let sharedAccess = await prisma.sharedPortfolioAccess.findFirst({
      where: { portfolioId, isActive: true }
    });

    if (!sharedAccess) {
      // Create new token
      sharedAccess = await prisma.sharedPortfolioAccess.create({
        data: {
          token: nanoid(16),
          portfolioId,
        }
      });
    }

    // Update portfolio visibility
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { visibility: 'smart_shared' }
    });

    const shareUrl = `${process.env.NEXTAUTH_URL}/shared/${sharedAccess.token}`;

    return NextResponse.json({ 
      token: sharedAccess.token,
      url: shareUrl,
    });
  } catch (error) {
    console.error('Error generating share token:', error);
    return NextResponse.json({ error: 'Failed to generate share link' }, { status: 500 });
  }
}

// Revoke access
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const portfolioId = params.id;

    await prisma.sharedPortfolioAccess.updateMany({
      where: { portfolioId },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Access revoked' });
  } catch (error) {
    console.error('Error revoking access:', error);
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}