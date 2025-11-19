"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);

    try {
      const userId = uuidv4();
      const token = btoa(JSON.stringify({
        userId,
        username: username.trim(),
        createdAt: new Date().toISOString()
      }));

      localStorage.setItem('token', token);
      router.push('/');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 to-amber-100 px-4">
      <form onSubmit={handleSignup} className="bg-white/90 backdrop-blur p-8 rounded-xl shadow-lg w-full max-w-md text-center border border-amber-100">
        <h1 className="text-3xl font-semibold text-amber-900 mb-2">Welcome to Connect Send</h1>
        <p className="text-amber-700 mb-6">Please sign up to continue</p>
        
        <input
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 mb-4 bg-amber-50 border-2 border-amber-200 rounded text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500"
          required
        />
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-amber-500 text-amber-950 rounded font-medium hover:bg-amber-400 disabled:bg-amber-200 disabled:text-amber-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

