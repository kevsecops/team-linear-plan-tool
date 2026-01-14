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

    console.log('Creating event with data:', { title, startDate, endDate, userId, eventTypeId });
    console.log('Auth valid:', pb.authStore.isValid, 'User:', pb.authStore.model?.id);

    // Convert dates to date-only format if they're full ISO strings
    // PocketBase "Date (Date only)" fields need YYYY-MM-DD format
    const startDateOnly = startDate.includes('T') ? startDate.split('T')[0] : startDate;
    const endDateOnly = endDate.includes('T') ? endDate.split('T')[0] : endDate;

    console.log('Converted dates:', { startDateOnly, endDateOnly });

    // Create event with expanded relations
    const event = await pb.collection('events').create({
      title,
      startDate: startDateOnly,
      endDate: endDateOnly,
      userId,
      eventTypeId,
    }, {
      expand: 'userId,eventTypeId',
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    console.error('Error details:', {
      status: error.status,
      message: error.message,
      data: error.data,
      response: error.response,
    });
    
    // Handle missing collection
    if (error.status === 404 && error.message?.includes('Missing collection context')) {
      return NextResponse.json(
        { error: 'The events collection does not exist yet. Please create it in the PocketBase admin panel first.' },
        { status: 404 }
      );
    }
    
    // Handle validation errors (400)
    if (error.status === 400) {
      // PocketBase validation errors can be nested in error.data.data or error.data
      const validationData = error.data?.data || error.data || {};
      const validationErrors = Object.entries(validationData)
        .map(([field, message]: [string, any]) => {
          // Handle nested objects (e.g., { code: 'validation_required', message: '...' })
          if (typeof message === 'object' && message !== null) {
            return `${field}: ${message.message || JSON.stringify(message)}`;
          }
          return `${field}: ${message}`;
        })
        .join(', ');
      
      console.error('Validation errors:', validationErrors);
      console.error('Full error.data:', JSON.stringify(error.data, null, 2));
      
      return NextResponse.json(
        { 
          error: validationErrors || 'Validation error occurred',
          details: validationData,
          fullError: error.data 
        },
        { status: 400 }
      );
    }
    
    // Handle unauthorized (403)
    if (error.status === 403) {
      return NextResponse.json(
        { error: 'You do not have permission to create events. Check PocketBase security rules.' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message || 'Unknown error', data: error.data },
      { status: error.status || 500 }
    );
  }
}
