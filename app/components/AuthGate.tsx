'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPocketBase, isAuthenticated } from '@/lib/pocketbase';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const pb = getPocketBase();
    
    // Load auth from cookie
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('pb_auth='));
    if (authCookie) {
      const token = authCookie.split('=')[1];
      if (token && token !== 'null' && token !== 'undefined') {
        pb.authStore.save(token, null);
      }
    }

    // Check if authenticated
    const checkAuth = async () => {
      try {
        // If we have a token, try to verify it's valid
        if (pb.authStore.token && pb.authStore.isValid) {
          setIsChecking(false);
          return;
        }
        
        // If not valid, redirect to login
        router.push('/login');
      } catch (err) {
        console.error('Auth check error:', err);
        router.push('/login');
      }
    };

    checkAuth();

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange(() => {
      if (pb.authStore.isValid) {
        setIsChecking(false);
      } else {
        router.push('/login');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
