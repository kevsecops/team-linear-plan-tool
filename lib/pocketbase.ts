import PocketBase from 'pocketbase';

// Singleton pattern to prevent multiple instances
let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (typeof window === 'undefined') {
    // Server-side: create a new instance (no authStore persistence needed)
    const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
    const pb = new PocketBase(url);
    // Enable auto cancellation for server-side requests
    pb.autoCancellation(false);
    return pb;
  }

  // Client-side: use singleton
  if (!pbInstance) {
    // In browser, always use localhost (not the Docker service name)
    // The NEXT_PUBLIC_ env var should be set to localhost for client-side
    let url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
    // If it's the Docker service name, replace with localhost for browser
    if (url.includes('pocketbase:8090')) {
      url = url.replace('pocketbase:8090', 'localhost:8090');
    }
    pbInstance = new PocketBase(url);
    
    // Load authStore from cookies if available
    try {
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(c => c.trim().startsWith('pb_auth='));
      if (authCookie) {
        const token = authCookie.split('=')[1];
        if (token && token !== 'null' && token !== 'undefined') {
          // Try to load the token - we'll validate it on first request
          pbInstance.authStore.save(token, null);
        }
      }
    } catch (e) {
      // Ignore cookie parsing errors
    }
  }

  return pbInstance;
}

// Helper to get the current user
export function getCurrentUser() {
  const pb = getPocketBase();
  return pb.authStore.model;
}

// Helper to check if user is authenticated
export function isAuthenticated(): boolean {
  const pb = getPocketBase();
  return pb.authStore.isValid;
}
