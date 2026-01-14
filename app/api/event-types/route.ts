import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';

export async function GET(request: NextRequest) {
  try {
    const pb = getPocketBase();
    
    // Load auth from cookies (critical for server-side authentication)
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      pb.authStore.loadFromCookie(cookieHeader);
    }

    // Fetch event types sorted by name
    const eventTypes = await pb.collection('eventTypes').getFullList({
      sort: 'name',
    });

    return NextResponse.json(eventTypes);
  } catch (error: any) {
    console.error('Error fetching event types:', error);
    
    // If collection doesn't exist yet, return empty array instead of error
    if (error.status === 404 && error.message?.includes('Missing collection context')) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch event types', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const pb = getPocketBase();
    
    // Load auth from cookies (critical for server-side authentication)
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      pb.authStore.loadFromCookie(cookieHeader);
    }

    // Check authentication
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

    // Create event type
    const eventType = await pb.collection('eventTypes').create({
      name,
      colorHexCode,
    });

    return NextResponse.json(eventType, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event type:', error);
    
    // Handle unique constraint errors (PocketBase equivalent of Prisma P2002)
    if (error.status === 400 && error.data?.name) {
      return NextResponse.json(
        { error: 'Event type with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create event type', details: error.message },
      { status: 500 }
    );
  }
}
