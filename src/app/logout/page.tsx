'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any authentication tokens or user data
    localStorage.removeItem('auth-token');
    
    // Redirect to login page after a short delay
    const timer = setTimeout(() => {
      router.push('/login');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-red-50">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg max-w-md w-full mx-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Logging Out</h2>
        <p className="text-gray-600">Please wait while we sign you out...</p>
      </div>
    </div>
  );
}
