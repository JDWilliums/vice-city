'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminBadge from '@/components/common/AdminBadge';

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAdmin: boolean;
  isOnline: boolean;
  lastUpdated: { seconds: number; nanoseconds: number };
}

export default function UsersPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [serverVerified, setServerVerified] = useState(false);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  
  // Verify admin status on the server-side
  useEffect(() => {
    async function verifyAdminServer() {
      if (!user) return;
      
      try {
        const response = await fetch('/api/admin/check');
        const data = await response.json();
        
        if (!data.isAdmin) {
          router.push('/');
          return;
        }
        
        setServerVerified(true);
        fetchUsers();
      } catch (error) {
        console.error('Error verifying admin status:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    }
    
    if (user && isAdmin) {
      verifyAdminServer();
    } else if (!loading) {
      router.push('/');
    }
  }, [user, isAdmin, router, loading]);
  
  // Fetch users from Firestore
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  // Toggle admin status
  const toggleAdminStatus = async (targetUid: string, currentStatus: boolean) => {
    if (isUpdating) return;
    
    setIsUpdating(targetUid);
    try {
      const response = await fetch('/api/admin/set-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetUid,
          isAdmin: !currentStatus,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setUsers(users.map(user => 
          user.uid === targetUid ? { ...user, isAdmin: !currentStatus } : user
        ));
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
    } finally {
      setIsUpdating(null);
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  // Show loading while checking auth
  if (loading || !user || !isAdmin || !serverVerified) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-white text-center">
            <div className="inline-block w-16 h-16 border-4 border-gta-pink border-t-transparent rounded-full animate-spin mb-4"></div>
            <p>Verifying admin access...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-white">User Management</h1>
          <AdminBadge className="w-6 h-6" />
        </div>
        
        <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">Users</h2>
            <button 
              onClick={fetchUsers}
              className="px-4 py-2 bg-gta-blue text-white rounded hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead className="bg-gray-800 text-left">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Updated</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-3 text-center text-gray-400">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(user => (
                    <tr key={user.uid} className="border-t border-gray-800">
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                            {user.photoURL ? (
                              <Image 
                                src={user.photoURL} 
                                alt={user.displayName || ''} 
                                width={40} 
                                height={40}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.displayName || 'Anonymous'}
                              {user.isAdmin && <AdminBadge className="ml-1 inline-block" />}
                            </div>
                            <div className="text-xs text-gray-400 truncate max-w-[150px]">{user.uid}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">{user.email || 'N/A'}</td>
                      <td className="p-3">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </td>
                      <td className="p-3">{formatDate(user.lastUpdated)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${user.isAdmin ? 'bg-gta-pink/20 text-gta-pink' : 'bg-gray-700 text-gray-300'}`}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleAdminStatus(user.uid, user.isAdmin)}
                          disabled={isUpdating === user.uid}
                          className={`px-3 py-1 rounded text-xs ${
                            user.isAdmin 
                              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                              : 'bg-gta-pink/80 hover:bg-gta-pink text-white'
                          } transition-colors ${isUpdating === user.uid ? 'opacity-50 cursor-wait' : ''}`}
                        >
                          {isUpdating === user.uid ? (
                            'Updating...'
                          ) : (
                            user.isAdmin ? 'Remove Admin' : 'Make Admin'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 