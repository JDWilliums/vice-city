'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const AuthCard: React.FC<AuthCardProps> = ({
  title,
  subtitle,
  children,
  footer
}) => {
  return (
    <div className="w-full max-w-md px-6 py-8 bg-black/80 backdrop-blur-sm border border-gray-800 rounded-lg shadow-2xl">
      <div className="text-center mb-6">
        <Link href="/" className="inline-block mb-4">
          <Image
            src="/images/logo-tw.png"
            alt="GTA 6 Logo"
            width={150}
            height={75}
            className="h-auto"
          />
        </Link>
        
        <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
        
        {subtitle && (
          <p className="text-gray-400">{subtitle}</p>
        )}
      </div>
      
      <div className="space-y-6">
        {children}
      </div>
      
      {footer && (
        <div className="mt-8 pt-4 border-t border-gray-800 text-center text-gray-400">
          {footer}
        </div>
      )}
    </div>
  );
};

export default AuthCard; 