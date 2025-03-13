'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import AuthButton from '@/components/auth/AuthButton';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Modal from '@/components/common/Modal';
import EditProfileForm from '@/components/profile/EditProfileForm';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [updateKey, setUpdateKey] = useState(0); // Used to force re-render after profile update

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/login');
    }
  }, [user, router, isLoading]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdate = () => {
    setUpdateKey(prev => prev + 1); // Force re-render to show updated profile info
  };

  // If still loading or no user, show loading state
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Loading profile...</p>
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">
            User Profile
          </h1>
          
          <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
            {/* Profile Header */}
            <div className="relative h-40 bg-gradient-to-r from-gta-blue/50 to-gta-pink/50">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 bg-gray-900 rounded-full border-4 border-gray-900 overflow-hidden">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || 'Profile'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gta-blue flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Profile Content */}
            <div className="pt-20 px-8 pb-8">
              <h2 className="text-2xl font-bold text-white">
                {user.displayName || 'User'}
              </h2>
              <p className="text-gray-400">{user.email}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                <div>
                  <h3 className="text-lg font-semibold text-gta-blue mb-4">Account Information</h3>
                  <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Display Name</p>
                      <p className="text-white">{user.displayName || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Account Created</p>
                      <p className="text-white">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Last Sign In</p>
                      <p className="text-white">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Auth Provider</p>
                      <p className="text-white capitalize">{user.providerData[0]?.providerId.replace('.com', '') || 'Email/Password'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gta-pink mb-4">Account Settings</h3>
                  <div className="space-y-4 bg-gray-900/50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <button 
                        onClick={() => setIsEditModalOpen(true)}
                        className="block text-gta-blue hover:text-gta-pink transition-colors"
                      >
                        Edit Profile Information
                      </button>
                      {/* Only show change password for email/password users */}
                      {user.providerData[0]?.providerId === 'password' && (
                        <Link 
                          href="/change-password" 
                          className="block text-gta-blue hover:text-gta-pink transition-colors"
                        >
                          Change Password
                        </Link>
                      )}
                      <Link 
                        href="/privacy-settings" 
                        className="block text-gta-blue hover:text-gta-pink transition-colors"
                      >
                        Privacy Settings
                      </Link>
                      <Link 
                        href="/notification-preferences" 
                        className="block text-gta-blue hover:text-gta-pink transition-colors"
                      >
                        Notification Preferences
                      </Link>
                    </div>
                    
                    <div className="pt-4 mt-4 border-t border-gray-800">
                      <AuthButton 
                        provider="email"
                        onClick={handleSignOut}
                        isLoading={isLoading}
                        label="Sign Out"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-800">
                <h3 className="text-lg font-semibold text-gta-green mb-4">Activity</h3>
                <div className="bg-gray-900/50 p-6 rounded-lg text-center">
                  <p className="text-gray-400 mb-4">Your activity and contributions will appear here.</p>
                  <Link 
                    href="/wiki" 
                    className="px-6 py-2 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 inline-block"
                  >
                    Explore Wiki
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Profile"
      >
        <EditProfileForm
          userData={user}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      </Modal>
      
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