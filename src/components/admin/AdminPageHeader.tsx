'use client';

import { useAuth } from '@/lib/AuthContext';

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function AdminPageHeader({ title, description, actions }: AdminPageHeaderProps) {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 pb-4 border-b border-gray-800">
      <div>
        <h1 className="text-3xl font-bold text-white">{title}</h1>
        {description && <p className="text-gray-400 mt-1">{description}</p>}
      </div>
      
      <div className="flex items-center mt-4 md:mt-0 space-x-4">
        {actions && <div className="flex space-x-2">{actions}</div>}
        
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gta-pink">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt={user.displayName || 'Admin user'} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gta-pink flex items-center justify-center text-white font-bold">
                {user?.displayName?.charAt(0) || 'A'}
              </div>
            )}
          </div>
          <div className="ml-3">
            <p className="text-white font-medium">
              {user?.displayName || 'Admin User'}
            </p>
            <p className="text-xs text-gray-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
} 