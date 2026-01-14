import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';

export async function GET(request: NextRequest) {
  try {
    const pb = getPocketBase();
    
    // Get auth token from request headers or cookies
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      if (token && token !== 'null' && token !== 'undefined') {
        pb.authStore.save(token, null);
      }
    } else if (cookieHeader) {
      const cookies = cookieHeader.split(';');
      const authCookie = cookies.find(c => c.trim().startsWith('pb_auth='));
      if (authCookie) {
        const token = authCookie.split('=')[1];
        if (token && token !== 'null' && token !== 'undefined') {
          pb.authStore.save(token, null);
        }
      }
    }

    // Fetch users from PocketBase
    // Note: This requires PocketBase to be initialized with at least one user
    try {
      const users = await pb.collection('users').getFullList({
        sort: 'email',
      });

      // Map PocketBase user format to our User interface
      const mappedUsers = users.map((user: any) => ({
        id: user.id,
        email: user.email,
        name: user.name || user.username || user.email.split('@')[0],
        username: user.username,
        avatar: user.avatar,
        created: user.created,
        updated: user.updated,
      }));

      return NextResponse.json(mappedUsers);
    } catch (pbError: any) {
      // If PocketBase returns 404 or collection doesn't exist, return empty array
      if (pbError.status === 404 || pbError.message?.includes('not found')) {
        console.warn('PocketBase users collection not found or not initialized yet');
        return NextResponse.json([]);
      }
      throw pbError;
    }
  } catch (error: any) {
    console.error('Error fetching users:', error);
    // Return empty array instead of error to prevent UI breakage
    return NextResponse.json([]);
  }
}

