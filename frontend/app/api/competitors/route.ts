import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const competitorSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  productName: z.string().optional(),
  priceSelector: z.string().min(1),
  nameSelector: z.string().optional(),
  imageSelector: z.string().optional(),
})

// GET /api/competitors - List all competitors for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const competitors = await prisma.competitor.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        priceRecords: {
          orderBy: { scrapedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { priceRecords: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ competitors })
  } catch (error) {
    console.error('Error fetching competitors:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/competitors - Create a new competitor
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = competitorSchema.parse(body)

    const competitor = await prisma.competitor.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        url: validatedData.url,
        productName: validatedData.productName,
        priceSelector: validatedData.priceSelector,
        nameSelector: validatedData.nameSelector,
        imageSelector: validatedData.imageSelector,
      },
    })

    return NextResponse.json({ competitor }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating competitor:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
