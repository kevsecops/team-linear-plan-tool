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

    // Fetch events with expanded relations (userId and eventTypeId)
    const events = await pb.collection('events').getFullList({
      expand: 'userId,eventTypeId',
      sort: 'startDate',
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    
    // If collection doesn't exist yet, return empty array instead of error
    if (error.status === 404 && error.message?.includes('Missing collection context')) {
      return NextResponse.json([]);
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error.message },
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
    
    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization');
    if (authHeader && !pb.authStore.isValid) {
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        // Try to load the token directly
        try {
          pb.authStore.save(token, null);
        } catch (e) {
          // If token is invalid, continue to check below
        }
      }
    }

    // Check authentication
    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, startDate, endDate, userId, eventTypeId } = body;

    if (!title || !startDate || !endDate || !userId || !eventTypeId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create event with expanded relations
    const event = await pb.collection('events').create({
      title,
      startDate,
      endDate,
      userId,
      eventTypeId,
    }, {
      expand: 'userId,eventTypeId',
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message },
      { status: 500 }
    );
  }
}
