'use client';

import React from 'react';
import Image from 'next/image';

type AuthButtonProps = {
  provider: 'google' | 'discord' | 'email';
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  isLoading?: boolean;
  type?: 'button' | 'submit';
};

const AuthButton: React.FC<AuthButtonProps> = ({
  provider,
  onClick,
  disabled = false,
  label,
  isLoading = false,
  type = 'button'
}) => {
  // Provider-specific configurations
  const providerConfig = {
    google: {
      bgColor: 'bg-white hover:bg-gray-100',
      textColor: 'text-gray-800',
      logo: '/images/google-logo.png',
      defaultLabel: 'Continue with Google'
    },
    discord: {
      bgColor: 'bg-discord-blue hover:bg-discord-blue-dark',
      textColor: 'text-white',
      logo: '/images/discord-symbol-white.png',
      defaultLabel: 'Continue with Discord'
    },
    email: {
      bgColor: 'bg-gradient-to-b from-gta-pink to-pink-500 hover:bg-gradient-to-b hover:from-gta-pink hover:to-pink-600',
      textColor: 'text-white',
      logo: '',
      defaultLabel: 'Continue with Email'
    }
  };

  const config = providerConfig[provider];
  const buttonLabel = label || config.defaultLabel;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`w-full ${config.bgColor} ${config.textColor} font-bold py-3 px-4 rounded-md flex items-center justify-center gap-3 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-lg'}`}
    >
      {provider !== 'email' && config.logo && (
        <div className="flex-shrink-0 w-5 h-5 relative">
          <Image src={config.logo} alt={`${provider} logo`} width={20} height={20} />
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Please wait...</span>
        </div>
      ) : (
        <span>{buttonLabel}</span>
      )}
    </button>
  );
};

export default AuthButton; 