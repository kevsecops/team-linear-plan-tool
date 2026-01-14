import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPocketBase } from '@/lib/pocketbase';

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

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const pb = getPocketBase();
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      pb.authStore.save(token, pb.authStore.model);
    }

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, colorHexCode } = body;

    if (!name || !colorHexCode) {
      return NextResponse.json(
        { error: 'Missing required fields: name and colorHexCode' },
        { status: 400 }
      );
    }

    const eventType = await prisma.eventType.create({
      data: {
        name,
        colorHexCode,
      },
    });

    return NextResponse.json(eventType, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Event type with this name already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create event type' },
      { status: 500 }
    );
  }
}
