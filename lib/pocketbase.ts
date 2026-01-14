import PocketBase from 'pocketbase';

// Singleton pattern to prevent multiple instances
let pbInstance: PocketBase | null = null;

export function getPocketBase(): PocketBase {
  if (typeof window === 'undefined') {
    // Server-side: create a new instance (no authStore persistence needed)
    const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
    return new PocketBase(url);
  }

  // Client-side: use singleton
  if (!pbInstance) {
    const url = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://localhost:8090';
    pbInstance = new PocketBase(url);
    
    // Load authStore from cookies/localStorage if available
    pbInstance.authStore.loadFromCookie(document.cookie);
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
