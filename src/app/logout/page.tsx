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
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900 via-green-950 to-black p-4">
      <div className="text-center p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
          <Loader2 className="w-8 h-8 text-green-400 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Logging Out</h2>
        <p className="text-gray-400">Please wait while we sign you out...</p>
      </div>
    </div>
  );
}
