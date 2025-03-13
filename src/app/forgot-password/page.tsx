'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/lib/AuthContext';
import AuthCard from '@/components/auth/AuthCard';
import AuthButton from '@/components/auth/AuthButton';
import InputField from '@/components/auth/InputField';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle password reset request
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter your email address');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');
      await resetPassword(email);
      setSuccessMessage('Password reset email sent. Check your inbox for further instructions.');
      setEmail(''); // Clear the input after successful submission
    } catch (error) {
      handleResetError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle reset errors
  const handleResetError = (error: unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/invalid-email':
          setErrorMessage('Invalid email address');
          break;
        case 'auth/user-not-found':
          // For security reasons, we don't want to reveal if a user exists or not
          setSuccessMessage('If an account with this email exists, a password reset link has been sent.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many requests. Please try again later');
          break;
        default:
          setErrorMessage('An error occurred. Please try again');
          console.error('Firebase reset error:', error);
      }
    } else {
      setErrorMessage('An unexpected error occurred');
      console.error('Non-firebase error:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/gta6-3.png"
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
      
      {/* Content */}
      <main className="flex-grow flex items-center justify-center relative z-20 p-4">
        <AuthCard 
          title="Forgot Password"
          subtitle="Enter your email to reset your password"
          footer={
            <div className="flex justify-center space-x-4">
              <Link href="/login" className="text-gta-pink hover:underline font-medium">
                Back to Login
              </Link>
              <span className="text-gray-600">|</span>
              <Link href="/register" className="text-gta-blue hover:underline font-medium">
                Create Account
              </Link>
            </div>
          }
        >
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-900/40 border border-red-500 text-red-200 px-4 py-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          
          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-900/40 border border-green-500 text-green-200 px-4 py-3 rounded-md mb-4">
              {successMessage}
            </div>
          )}
          
          {/* Reset Password Form */}
          <form onSubmit={handleResetPassword}>
            <InputField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            
            <div className="mt-6">
              <AuthButton 
                provider="email" 
                onClick={() => {}} // Form submission handled by form onSubmit
                disabled={isLoading}
                isLoading={isLoading}
                label="Reset Password"
                type="submit"
              />
            </div>
          </form>
          
          <div className="mt-8 bg-gray-900/50 rounded-md p-4 text-gray-400 text-sm">
            <p className="font-medium text-gta-blue mb-2">Need help?</p>
            <p>If you don&apos;t receive an email within a few minutes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Check your spam or junk folder</li>
              <li>Verify that you entered the correct email address</li>
              <li>Make sure you have previously created an account</li>
            </ul>
          </div>
        </AuthCard>
      </main>
      
      {/* Add the required CSS animations */}
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