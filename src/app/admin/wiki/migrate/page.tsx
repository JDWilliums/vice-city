'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { migrateWikiDetails } from '@/lib/migrateWikiDetails';

export default function MigrateWikiDetails() {
  const { user, isAdmin } = useAuth();
  const [isMigrating, setIsMigrating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleMigration = async () => {
    if (!isAdmin) {
      setError('You do not have permission to run migrations');
      return;
    }

    setIsMigrating(true);
    setMessage('');
    setError('');

    try {
      await migrateWikiDetails();
      setMessage('Migration completed successfully!');
    } catch (err) {
      console.error('Migration error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during migration');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 mt-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Migrate Wiki Details</h1>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <p className="text-gray-300 mb-6">
              This tool will add default details to all existing wiki pages based on their category.
              This is a one-time operation that should be run after implementing the new details table feature.
            </p>

            {message && (
              <div className="mb-4 p-4 bg-green-900/50 border border-green-600 rounded-lg">
                <p className="text-green-300">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-900/50 border border-red-600 rounded-lg">
                <p className="text-red-300">{error}</p>
              </div>
            )}

            <button
              onClick={handleMigration}
              disabled={isMigrating || !isAdmin}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                isAdmin
                  ? 'bg-gta-blue hover:bg-blue-600'
                  : 'bg-gray-700 cursor-not-allowed'
              } transition-colors`}
            >
              {isMigrating ? 'Migrating...' : 'Run Migration'}
            </button>

            {!isAdmin && (
              <p className="mt-4 text-sm text-red-400">
                You need admin privileges to run this migration.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 