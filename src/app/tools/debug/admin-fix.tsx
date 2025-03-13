'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminFix() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAdminStatus, setCurrentAdminStatus] = useState<boolean | null>(null);

  // Check current admin status on load
  useEffect(() => {
    if (!user) return;
    
    async function checkCurrentStatus() {
      try {
        if (!user) return;
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const isAdmin = userSnap.data().isAdmin === true;
          setCurrentAdminStatus(isAdmin);
          setStatus(`Current admin status in Firestore: ${isAdmin ? 'Yes' : 'No'}`);
        } else {
          setStatus('User document not found in Firestore!');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setStatus('Error checking current admin status');
      }
    }
    
    checkCurrentStatus();
  }, [user]);

  // Function to set admin status using client approach
  const setAdminStatusClient = async () => {
    if (!user) {
      setStatus('No user logged in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Setting admin status using client SDK...');
      
      // Get a reference to the user document
      const userRef = doc(db, 'users', user.uid);
      
      // Update the user document with isAdmin: true
      await updateDoc(userRef, {
        isAdmin: true,
        lastUpdated: new Date()
      });
      
      // Verify the change
      const updatedDoc = await getDoc(userRef);
      const isAdmin = updatedDoc.exists() && updatedDoc.data().isAdmin === true;
      
      setStatus(`Admin status set to TRUE. Verification: ${isAdmin ? 'SUCCESS' : 'FAILED'}`);
      setCurrentAdminStatus(isAdmin);
    } catch (error) {
      console.error('Error setting admin status:', error);
      setStatus(`Error setting admin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to set admin status using server approach
  const setAdminStatusServer = async () => {
    if (!user) {
      setStatus('No user logged in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Setting admin status using server API...');
      
      // Call the make-admin API
      const response = await fetch('/api/admin/make-admin');
      const result = await response.json();
      
      setStatus(`Server response: ${JSON.stringify(result)}`);
      
      // Verify the change
      const userRef = doc(db, 'users', user.uid);
      const updatedDoc = await getDoc(userRef);
      const isAdmin = updatedDoc.exists() && updatedDoc.data().isAdmin === true;
      
      setCurrentAdminStatus(isAdmin);
      setStatus(`Verification after server API: isAdmin = ${isAdmin ? 'TRUE' : 'FALSE'}`);
    } catch (error) {
      console.error('Error setting admin status via server:', error);
      setStatus(`Error using server API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to refresh token and verify admin status
  const refreshAndVerify = async () => {
    if (!user) {
      setStatus('No user logged in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Refreshing token and verifying admin status...');
      
      // Force token refresh
      const idToken = await user.getIdToken(true);
      setStatus(`Token refreshed, length: ${idToken.length}`);
      
      // Send to server to set session
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, uid: user.uid }),
      });
      
      const sessionResult = await sessionResponse.json();
      setStatus(`Session API response: ${JSON.stringify(sessionResult)}`);
      
      // Check admin status via API
      const adminCheckResponse = await fetch('/api/admin/check');
      const adminCheck = await adminCheckResponse.json();
      
      setStatus(`Admin check API result: ${JSON.stringify(adminCheck)}`);
    } catch (error) {
      console.error('Error in refresh and verify:', error);
      setStatus(`Error refreshing and verifying: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to force admin status using new special API
  const forceAdminServerDirect = async () => {
    if (!user) {
      setStatus('No user logged in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Using direct server-side force admin API...');
      
      // Call the force-admin API
      const response = await fetch('/api/admin/force-admin');
      const result = await response.json();
      
      setStatus(`Direct force admin result: ${JSON.stringify(result)}`);
      
      // Verify the change in Firestore
      const userRef = doc(db, 'users', user.uid);
      const updatedDoc = await getDoc(userRef);
      const isAdmin = updatedDoc.exists() && updatedDoc.data().isAdmin === true;
      
      setCurrentAdminStatus(isAdmin);
      
      // Also check admin API
      const adminCheckResponse = await fetch('/api/admin/check');
      const adminCheck = await adminCheckResponse.json();
      
      setStatus(`Force Admin API result: ${JSON.stringify(result)}\n\nClient verification: isAdmin = ${isAdmin ? 'TRUE' : 'FALSE'}\n\nServer verification: ${JSON.stringify(adminCheck)}`);
    } catch (error) {
      console.error('Error using force admin API:', error);
      setStatus(`Error using force admin API: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // New function to check admin status directly
  const checkAdminStatusDirect = async () => {
    if (!user) {
      setStatus('No user logged in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Checking admin status using direct Admin SDK check...');
      
      // Call the direct-check API
      const response = await fetch('/api/admin/direct-check');
      const result = await response.json();
      
      // Update status with the result
      setStatus(`Direct Admin Check Result: ${JSON.stringify(result, null, 2)}`);
      
      // Update current admin status based on the result
      if (result.verified) {
        setCurrentAdminStatus(result.isAdmin);
      }
    } catch (error) {
      console.error('Error checking admin status directly:', error);
      setStatus(`Error checking admin status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // New function to clean up user documents
  const cleanupUserDocuments = async () => {
    if (!user) {
      setStatus('No user logged in');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      setStatus('Checking and fixing any duplicate user documents...');
      
      // Call the clean-users API
      const response = await fetch('/api/admin/clean-users');
      const result = await response.json();
      
      // Format the result for display
      let statusText = `User Cleanup Results:\n\n`;
      
      if (result.success) {
        // Add info about the correct document
        const mainDoc = result.results.documentWithId;
        statusText += `Main document (users/${user.uid}):\n`;
        statusText += `- Exists: ${mainDoc.exists}\n`;
        statusText += `- Admin: ${mainDoc.isAdmin}\n\n`;
        
        // Add info about documents with uid field
        const docCount = result.results.documentsWithUidField.count;
        statusText += `Documents with uid field: ${docCount}\n`;
        
        if (docCount > 0) {
          result.results.documentsWithUidField.documents.forEach((doc: any, index: number) => {
            statusText += `\nDocument #${index + 1} (${doc.path}):\n`;
            statusText += `- Admin: ${doc.data.isAdmin === true}\n`;
            statusText += `- ID: ${doc.id}\n`;
          });
          statusText += '\n';
        }
        
        // Add info about fixes
        if (result.results.fixes.length > 0) {
          statusText += `\nFixes applied:\n`;
          result.results.fixes.forEach((fix: string) => {
            statusText += `- ${fix}\n`;
          });
          statusText += '\n';
        } else {
          statusText += `No fixes needed.\n\n`;
        }
        
        // Add final status if available
        if (result.results.finalStatus) {
          statusText += `\nFinal status after fixes:\n`;
          statusText += `- Admin: ${result.results.finalStatus.isAdmin}\n`;
        }
        
        // Update admin status based on final result
        if (result.results.finalStatus) {
          setCurrentAdminStatus(result.results.finalStatus.isAdmin);
        } else {
          setCurrentAdminStatus(mainDoc.isAdmin);
        }
      } else {
        statusText = `Error: ${result.error}\n${result.errorDetails || ''}`;
      }
      
      setStatus(statusText);
      
      // If we applied fixes, check the admin status with the API again
      if (result.results.fixes.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a second
        
        const adminCheckResponse = await fetch('/api/admin/check');
        const adminCheck = await adminCheckResponse.json();
        
        setStatus(prevStatus => prevStatus + `\n\nServer admin check after cleanup: ${JSON.stringify(adminCheck)}`);
      }
    } catch (error) {
      console.error('Error cleaning up user documents:', error);
      setStatus(`Error cleaning up user documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return <div className="text-white">Please login to use this tool</div>;
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-xl font-bold text-white mb-4">Admin Status Fix Tool</h2>
      
      <div className="space-y-6">
        <div>
          <p className="text-gray-400 text-sm">Current Admin Status:</p>
          <p className={`font-mono ${
            currentAdminStatus === null ? 'text-yellow-400' : 
            currentAdminStatus ? 'text-green-400' : 'text-red-400'
          }`}>
            {currentAdminStatus === null ? 'Checking...' : 
             currentAdminStatus ? 'TRUE' : 'FALSE'}
          </p>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={setAdminStatusClient}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-b from-green-500 to-green-700 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            1. Set Admin Using Client SDK
          </button>
          
          <button
            onClick={setAdminStatusServer}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-b from-blue-500 to-blue-700 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            2. Set Admin Using Server API
          </button>
          
          <button
            onClick={refreshAndVerify}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-b from-gta-pink to-pink-500 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            3. Refresh Token & Verify Admin Status
          </button>
          
          <button
            onClick={forceAdminServerDirect}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-b from-yellow-500 to-yellow-700 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            4. ULTIMATE FIX: Force Admin Direct
          </button>
          
          <button
            onClick={checkAdminStatusDirect}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-b from-purple-500 to-purple-700 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            5. Check Admin Status Directly
          </button>
          
          <button
            onClick={cleanupUserDocuments}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-gradient-to-b from-red-500 to-red-700 text-white font-bold rounded-md hover:shadow-lg transition-all hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            6. Fix Duplicate User Documents
          </button>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg">
          <p className="text-gray-400 text-sm mb-2">Status Log:</p>
          <p className="text-white font-mono break-all text-sm whitespace-pre-wrap">{status || 'No action taken yet'}</p>
        </div>
        
        <div className="text-gray-400 text-sm">
          <p>How to use this tool:</p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>First, click "Set Admin Using Client SDK" to directly update your Firestore document</li>
            <li>Then click "Set Admin Using Server API" as a backup approach</li>
            <li>Finally, click "Refresh Token & Verify Admin Status" to check if the server recognizes your admin status</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 