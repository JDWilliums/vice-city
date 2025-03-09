'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 fixed w-full z-50 shadow-lg border-b border-gta-blue/30">
      <div className="container-custom py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="font-heading font-bold relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-gta-pink/20 to-gta-blue/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Image 
              src="/logo-wp.png" 
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
              className="text-white hover:text-gta-blue transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-blue after:transition-all"
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
              className="text-white hover:text-gta-green transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-green after:transition-all"
            >
              NEWS
            </Link>
            <Link 
              href="/about" 
              className="text-white hover:text-gta-yellow transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-gta-yellow after:transition-all"
            >
              ABOUT
            </Link>
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
                href="/about" 
                className="text-white hover:text-gta-yellow transition-colors px-4 py-2 border-l-2 border-transparent hover:border-gta-yellow"
                onClick={() => setIsMenuOpen(false)}
              >
                ABOUT
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 