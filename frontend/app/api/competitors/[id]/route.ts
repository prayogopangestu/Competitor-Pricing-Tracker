import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateCompetitorSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  productName: z.string().optional(),
  priceSelector: z.string().min(1).optional(),
  nameSelector: z.string().optional(),
  imageSelector: z.string().optional(),
  isActive: z.boolean().optional(),
})

// GET /api/competitors/[id] - Get a specific competitor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        priceRecords: {
          orderBy: { scrapedAt: 'desc' },
          take: 100,
        },
      },
    })

    if (!competitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    return NextResponse.json({ competitor })
  } catch (error) {
    console.error('Error fetching competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/competitors/[id] - Update a competitor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateCompetitorSchema.parse(body)

    // Check if competitor exists and belongs to user
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingCompetitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    const competitor = await prisma.competitor.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json({ competitor })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/competitors/[id] - Delete a competitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if competitor exists and belongs to user
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingCompetitor) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 })
    }

    await prisma.competitor.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
