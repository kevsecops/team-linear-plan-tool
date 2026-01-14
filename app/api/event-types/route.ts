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
    
    // Also check Authorization header as fallback
    const authHeader = request.headers.get('authorization');
    if (authHeader && !pb.authStore.isValid) {
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        try {
          pb.authStore.save(token, null);
        } catch (e) {
          // If token is invalid, continue
        }
      }
    }

    console.log('GET /api/event-types - Auth valid:', pb.authStore.isValid, 'Token:', pb.authStore.token ? 'present' : 'missing');

    // Fetch event types sorted by name
    const eventTypes = await pb.collection('eventTypes').getFullList({
      sort: 'name',
    });

    console.log('GET /api/event-types - Fetched', eventTypes.length, 'event types');

    // Map PocketBase format to our EventType interface
    const mappedEventTypes = eventTypes.map((et: any) => ({
      id: et.id,
      name: et.name,
      colorHexCode: et.colorHexCode,
      created: et.created,
      updated: et.updated,
    }));

    return NextResponse.json(mappedEventTypes);
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
    
    // Handle missing collection
    if (error.status === 404 && error.message?.includes('Missing collection context')) {
      return NextResponse.json(
        { error: 'The eventTypes collection does not exist yet. Please create it in the PocketBase admin panel first.' },
        { status: 404 }
      );
    }
    
    // Handle unique constraint errors (PocketBase equivalent of Prisma P2002)
    if (error.status === 400 && error.data?.name) {
      return NextResponse.json(
        { error: 'Event type with this name already exists' },
        { status: 409 }
      );
    }
    
    // Handle validation errors
    if (error.status === 400 && error.data) {
      const validationErrors = Object.entries(error.data)
        .map(([field, message]) => `${field}: ${message}`)
        .join(', ');
      return NextResponse.json(
        { error: `Validation error: ${validationErrors}` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create event type', details: error.message || 'Unknown error' },
      { status: error.status || 500 }
    );
  }
}
