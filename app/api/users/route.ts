import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';

export async function GET(request: NextRequest) {
  try {
    const pb = getPocketBase();
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      pb.authStore.save(token, pb.authStore.model);
    }

    // Fetch users from PocketBase
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
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

