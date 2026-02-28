'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/lib/AuthContext';
import { trackCrumbless } from '@/utils/cookieConsent';
import AuthCard from '@/components/auth/AuthCard';
import AuthButton from '@/components/auth/AuthButton';
import InputField from '@/components/auth/InputField';

export default function RegisterPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithDiscord, signUpWithEmail } = useAuth();
  
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
      await signInWithGoogle();
      trackCrumbless('signup');
      router.push('/'); // Redirect to home page after successful registration
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  

  // Handle email/password registration
  const handleEmailRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!displayName || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
      await signUpWithEmail(email, password, displayName);
      trackCrumbless('signup');
      router.push('/'); // Redirect to home page after successful registration
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle authentication errors
  const handleAuthError = (error: unknown) => {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrorMessage('Email address is already in use');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Invalid email address');
          break;
        case 'auth/weak-password':
          setErrorMessage('Password is too weak. Use at least 6 characters');
          break;
        case 'auth/operation-not-allowed':
          setErrorMessage('Account creation is disabled');
          break;
        default:
          setErrorMessage('An error occurred during registration. Please try again');
          console.error('Firebase auth error:', error);
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
          src="/images/gta6-2.png"
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
          title="Create Account"
          subtitle="Join the vice.city community"
          footer={
            <p>
              Already have an account?{' '}
              <Link href="/login" className="text-gta-pink hover:underline font-medium">
                Sign in
              </Link>
            </p>
          }
        >
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-900/40 border border-red-500 text-red-200 px-4 py-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <AuthButton 
              provider="google" 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              isLoading={isLoading}
            />
            
          </div>
          
          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-grow h-px bg-gray-800"></div>
            <div className="text-gray-500 text-sm">OR</div>
            <div className="flex-grow h-px bg-gray-800"></div>
          </div>
          
          {/* Email/Password Form */}
          <form onSubmit={handleEmailRegistration}>
            <InputField
              id="displayName"
              label="Display Name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              placeholder="Your username"
              autoComplete="username"
              autoFocus
            />
            
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
            
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
            
            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="new-password"
            />
            
            <div className="mt-6">
              <AuthButton 
                provider="email" 
                onClick={() => {}} // Form submission handled by form onSubmit
                disabled={isLoading}
                isLoading={isLoading}
                label="Create Account"
                type="submit"
              />
            </div>
          </form>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            By creating an account, you agree to our 
            <Link href="/terms" className="text-gta-blue hover:underline mx-1">Terms of Service</Link>
            and
            <Link href="/privacy" className="text-gta-blue hover:underline mx-1">Privacy Policy</Link>
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