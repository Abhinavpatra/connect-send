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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <div className="text-center text-white">
        <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">404</h1>
        <p className="text-2xl mb-2 text-gray-400">Page not found</p>
        <p className="text-base text-blue-500">Redirecting to signup...</p>
      </div>
    </div>
  );
} 
