import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/history/[id] - Get price history for a competitor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if competitor exists and belongs to user
    const competitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const priceRecords = await prisma.priceRecord.findMany({
      where: {
        competitorId: params.id,
      },
      orderBy: { scrapedAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.priceRecord.count({
      where: { competitorId: params.id },
    })

    return NextResponse.json({
      priceRecords,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Error fetching price history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
