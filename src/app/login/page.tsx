'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FirebaseError } from 'firebase/app';
import { useAuth } from '@/lib/AuthContext';
import { trackCrumbless } from '@/utils/cookieConsent';
import AuthCard from '@/components/auth/AuthCard';
import AuthButton from '@/components/auth/AuthButton';
import InputField from '@/components/auth/InputField';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithGoogle, signInWithDiscord, signInWithEmail } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirected, setIsRedirected] = useState(false);

  // Check if we were redirected here by middleware due to auth issues
  // This helps us optimize behavior for redirected users
  useEffect(() => {
    const checkRedirectCookie = () => {
      if (typeof document === 'undefined') return;
      
      // Get all cookies
      const cookies = document.cookie.split('; ');
      const redirectCookie = cookies.find(cookie => cookie.startsWith('middleware_redirect='));
      
      if (redirectCookie) {
        setIsRedirected(true);
        
        // Optional: Show a specific message for redirected users
        setErrorMessage('Please sign in to access the admin area');
        
        // Clear the cookie (it's short-lived anyway, but good practice)
        document.cookie = 'middleware_redirect=; path=/; max-age=0';
      }
    };
    
    checkRedirectCookie();
  }, []);

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage('');
await signInWithGoogle();
      trackCrumbless('login');

      // If user was redirected from another page, try to go back there
      if (isRedirected) {
        router.back();
      } else {
        router.push('/');
      }
    } catch (error) {
      handleAuthError(error);
    } finally {
      setIsLoading(false);
    }
  };

  

  // Handle email/password sign in
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      setErrorMessage('');
await signInWithEmail(email, password);
      trackCrumbless('login');

      // If user was redirected from another page, try to go back there
      if (isRedirected) {
        router.back();
      } else {
        router.push('/');
      }
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
        case 'auth/invalid-email':
          setErrorMessage('Invalid email address');
          break;
        case 'auth/user-disabled':
          setErrorMessage('This account has been disabled');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setErrorMessage('Invalid email or password');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Too many failed login attempts. Please try again later');
          break;
        default:
          setErrorMessage('An error occurred during sign in. Please try again');
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
          src="/images/gta6-1.png"
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
          title="Welcome Back"
          subtitle="Sign in to your account"
          footer={
            <p>
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-gta-pink hover:underline font-medium">
                Register
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
          <form onSubmit={handleEmailSignIn}>
            <InputField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
            />
            
            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
            
            <div className="text-right mb-4">
              <Link href="/forgot-password" className="text-sm text-gta-blue hover:text-gta-pink transition-colors">
                Forgot password?
              </Link>
            </div>
            
            <AuthButton 
              provider="email" 
              onClick={() => {}} // Form submission handled by form onSubmit
              disabled={isLoading}
              isLoading={isLoading}
              label="Sign in"
              type="submit"
            />
          </form>
          
          <div className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to our 
            <Link href="/terms" className="text-gta-blue hover:underline mx-1">Terms of Service</Link>
            and
            <Link href="/privacy" className="text-gta-blue hover:underline mx-1">Privacy Policy</Link>
          </div>
        </AuthCard>
      </main>
      
      {/* CSS animations */}
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