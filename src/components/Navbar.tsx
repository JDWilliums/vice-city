'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AdminBadge from '@/components/common/AdminBadge';

interface NavbarProps {
  transparent?: boolean;
}

const Navbar = ({ transparent = false }: NavbarProps) => {
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    if (transparent) {
      window.addEventListener('scroll', handleScroll);
      
      // Initial check
      handleScroll();
    }

    return () => {
      if (transparent) {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [transparent, scrolled]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (isProfileOpen && !target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const navbarClasses = transparent && !isMenuOpen && !scrolled
    ? "navbar-fixed fixed w-full z-50 bg-gradient-to-b from-black/50 to-transparent backdrop-blur-sm transition-all duration-300"
    : "navbar-fixed bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 fixed w-full z-50 shadow-lg border-gta-blue/30 transition-all duration-300";

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={navbarClasses}>
      <div className="container-custom py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gta-pink/20 to-gta-blue/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Image 
              src="/images/logo-tw.png" 
              alt="GTA 6 Wiki" 
              width={150} 
              height={50} 
              className="h-12 w-auto relative" 
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            
            <Link 
              href="/map" 
              className="text-white hover:text-gta-pink transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-pink after:transition-all"
            >
              MAP
            </Link>
            <Link 
              href="/wiki" 
              className="text-white hover:text-gta-pink transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-pink after:transition-all"
            >
              WIKI
            </Link>
            <Link 
              href="/news" 
              className="text-white hover:text-gta-pink transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-pink after:transition-all"
            >
              NEWS
            </Link>
            <Link 
              href="/gallery" 
              className="text-white hover:text-gta-pink transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-pink after:transition-all"
            >
              GALLERY
            </Link>
            {isAdmin && (
              <Link 
                href="/tools" 
                className="text-gta-pink hover:text-pink-400 transition-colors flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-pink after:transition-all"
              >
                TOOLS
                <AdminBadge className="ml-1" />
              </Link>
            )}
            
            
            {/* Authentication */}
            {user ? (
              <div className="relative profile-dropdown">
                <button 
                  onClick={toggleProfile}
                  className="flex items-center space-x-2 bg-black/30 hover:bg-black/50 px-3 py-2 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-gta-blue rounded-full flex items-center justify-center overflow-hidden">
                    {user.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        width={32} 
                        height={32}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-sm">
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-white flex items-center">
                    {user.displayName?.split(' ')[0] || 'User'}
                    {isAdmin && <AdminBadge className="ml-1" />}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-700 profile-dropdown">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-white font-medium">{user.displayName || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/tools" 
                        className="block w-full text-left px-4 py-2 text-sm text-gta-pink hover:bg-gray-700 hover:text-pink-400 transition-colors"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Tools
                        <AdminBadge className="ml-1" />
                      </Link>
                    )}
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/login" 
                  className="text-white hover:text-gta-pink transition-colors"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="bg-gradient-to-b from-gta-pink to-pink-500 text-white px-4 py-2 rounded-md hover:shadow-lg hover:shadow-gta-pink/20 transition-all hover:-translate-y-1"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-4 bg-gradient-to-b from-gray-800 to-gray-900 mt-2 rounded-lg border border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/map" 
                className="text-white hover:text-gta-blue transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-blue"
                onClick={() => setIsMenuOpen(false)}
              >
                MAP
              </Link>
              <Link 
                href="/wiki" 
                className="text-white hover:text-gta-pink transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-pink"
                onClick={() => setIsMenuOpen(false)}
              >
                WIKI
              </Link>
              <Link 
                href="/news" 
                className="text-white hover:text-gta-green transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-green"
                onClick={() => setIsMenuOpen(false)}
              >
                NEWS
              </Link>
              <Link 
                href="/gallery" 
                className="text-white hover:text-gta-pink transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-pink"
                onClick={() => setIsMenuOpen(false)}
              >
                GALLERY
              </Link>
              
              
              {/* Mobile Auth Links */}
              <div className="border-t border-gray-700 pt-4 mt-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gta-blue rounded-full flex items-center justify-center overflow-hidden">
                        {user.photoURL ? (
                          <Image 
                            src={user.photoURL} 
                            alt={user.displayName || 'User'} 
                            width={32} 
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-bold text-sm">
                            {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-white font-medium">{user.displayName || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{user.email}</p>
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="text-white hover:text-gta-blue transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-blue block mt-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link 
                        href="/tools" 
                        className="text-white hover:text-pink-400 transition-colors px-4 py-2 border-l-2 border-transparent hover:border-pink-400 block w-full text-left mt-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Tools
                        <AdminBadge className="ml-1" />
                      </Link>
                    )}
                    <button 
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="text-white hover:text-red-500 transition-colors px-4 py-2 border-l-2 border-transparent hover:border-red-500 block w-full text-left mt-2"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-white hover:text-gta-pink transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-pink block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      LOGIN
                    </Link>
                    <Link 
                      href="/register" 
                      className="text-white hover:text-gta-blue transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-blue block"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      REGISTER
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 