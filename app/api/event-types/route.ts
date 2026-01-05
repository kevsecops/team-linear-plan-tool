import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const eventTypes = await prisma.eventType.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(eventTypes);
  } catch (error) {
    console.error('Error fetching event types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event types' },
      { status: 500 }
    );
  }
}

