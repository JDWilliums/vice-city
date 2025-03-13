'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // If no user, show loading state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/gta6-4.png"
          alt="GTA 6 Background"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        
        {/* Animated Gradients */}
        <div className="absolute inset-0 z-5 opacity-40">
          <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-30 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-30 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
      </div>
      
      <Navbar />
      
      <main className="flex-grow relative z-20 container mx-auto px-4 py-12 mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-white mb-6">Privacy Settings</h1>
              
              <div className="space-y-8">
                <div className="bg-gray-900/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gta-blue mb-4">Coming Soon</h2>
                  <p className="text-gray-400">
                    Privacy settings are currently under development. Check back soon for updates!
                  </p>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => router.push('/profile')}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Add required CSS animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        
        .animate-pulse {
          animation: pulse 8s infinite;
        }
      `}</style>
    </div>
  );
} 