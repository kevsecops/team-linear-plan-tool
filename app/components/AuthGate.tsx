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
      if (token) {
        pb.authStore.save(token, pb.authStore.model);
      }
    }

    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setIsChecking(false);
    }

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange(() => {
      if (!pb.authStore.isValid) {
        router.push('/login');
      } else {
        setIsChecking(false);
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
