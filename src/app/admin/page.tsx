'use client';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { useState, useEffect } from 'react';
import { protectedFetch } from '@/lib/csrfUtils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    wikiPages: 0,
    newsArticles: 0,
    users: 0,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // This would normally fetch real stats from an API endpoint
        // But we'll simulate it for now
        setStats({
          wikiPages: 27,
          newsArticles: 14,
          users: 158,
          lastUpdated: new Date().toLocaleString()
        });
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);
  
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Admin Dashboard" description="Overview of site content and statistics" />
      
      {loading ? (
        <div className="flex justify-center p-8">
          <div className="inline-block w-12 h-12 border-4 border-gta-pink border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 border border-red-500 p-4 rounded-lg text-white">
          {error}
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Wiki Pages" 
              value={stats.wikiPages} 
              icon={
                <svg className="w-8 h-8 text-gta-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              } 
            />
            
            <StatCard 
              title="News Articles" 
              value={stats.newsArticles} 
              icon={
                <svg className="w-8 h-8 text-gta-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              } 
            />
            
            <StatCard 
              title="Registered Users" 
              value={stats.users} 
              icon={
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              } 
            />
            
            <StatCard 
              title="Last Updated" 
              value={stats.lastUpdated} 
              icon={
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              } 
              isText
            />
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ActionButton 
                title="Create Wiki Page" 
                href="/admin/wiki/create" 
                bgColor="bg-gta-pink" 
                hoverColor="hover:bg-pink-700"
              />
              <ActionButton 
                title="Add News Article" 
                href="/admin/news/create" 
                bgColor="bg-gta-blue" 
                hoverColor="hover:bg-blue-700"
              />
              <ActionButton 
                title="Access Tools" 
                href="/tools" 
                bgColor="bg-gray-700" 
                hoverColor="hover:bg-gray-600"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon, 
  isText = false 
}: { 
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isText?: boolean;
}) {
  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 flex items-center">
      <div className="mr-4">
        {icon}
      </div>
      <div>
        <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
        <p className={`text-2xl font-bold ${isText ? 'text-white text-base' : 'text-white'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

// Action Button Component
function ActionButton({ 
  title, 
  href, 
  bgColor, 
  hoverColor 
}: { 
  title: string;
  href: string;
  bgColor: string;
  hoverColor: string;
}) {
  return (
    <a 
      href={href} 
      className={`${bgColor} ${hoverColor} transition-colors duration-200 rounded-lg px-6 py-4 text-white font-medium text-center block`}
    >
      {title}
    </a>
  );
} 