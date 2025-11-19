"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/signup');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="text-center text-amber-900">
        <h1 className="text-7xl font-semibold mb-4">404</h1>
        <p className="text-2xl mb-2 text-amber-700">Page not found</p>
        <p className="text-base text-amber-600">Redirecting to signup...</p>
      </div>
    </div>
  );
} 
