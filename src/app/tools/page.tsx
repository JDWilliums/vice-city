'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdminBadge from '@/components/common/AdminBadge';
import { withAdminProtection } from '@/components/hoc/withAdminProtection';

function ToolsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <h1 className="text-4xl font-bold text-white">Admin Tools</h1>
          <AdminBadge className="w-6 h-6" />
        </div>
        
        <div className="grid grid-rows-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Wiki Management */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-pink transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">Wiki Management</h2>
            <p className="text-gray-400 mb-4">Create, edit, and manage wiki content.</p>
            <Link href="/admin/wiki" className="px-4 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-block">
              Manage Wiki
            </Link>
          </div>
          
          {/* News Management */}
          <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 hover:border-gta-blue transition-colors">
            <h2 className="text-xl font-bold text-white mb-4">News Management</h2>
            <p className="text-gray-400 mb-4">Create, edit, and manage news content.</p>
            <Link href="/admin/news" className="px-4 py-2 bg-gta-pink text-white rounded hover:bg-pink-600 transition-colors inline-block">
              Manage News
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

// Wrap with admin protection
export default withAdminProtection(ToolsPage, {
  pageTitle: 'Admin Tools',
  requireVerification: true
}); 