'use client';

import { AuthProvider } from '@/lib/AuthContext';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 