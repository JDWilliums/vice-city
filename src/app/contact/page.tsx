'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-900 text-white">
        <div className="container-custom py-16 px-4 md:px-6">
          {/* Page Header with stylized background */}
          <div className="relative rounded-xl overflow-hidden mb-12">
            <div className="absolute inset-0 bg-gradient-to-r from-gta-blue via-gta-pink to-gta-blue opacity-20"></div>
            <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm border border-gray-700 rounded-xl p-8 md:p-12 relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gta-blue to-gta-pink">
                Contact Us
              </h1>
              <p className="text-xl text-gray-300">
                Have questions or feedback? We're here to help.
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Email Contact */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-transform hover:scale-[1.01] hover:shadow-lg hover:shadow-gta-blue/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gta-blue/20 rounded-full flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gta-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold">Email Us</h2>
              </div>
              <p className="text-gray-300 mb-4">
                For general inquiries, content submissions, or technical support, drop us an email.
              </p>
              <a 
                href="mailto:contact@vice.city" 
                className="block text-xl font-semibold text-gta-blue hover:text-gta-pink transition-colors duration-200"
              >
                contact@vice.city
              </a>
            </div>

            {/* Discord Contact */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 transition-transform hover:scale-[1.01] hover:shadow-lg hover:shadow-gta-pink/20">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gta-pink/20 rounded-full flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16">
                    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                </svg>
                </div>
                <h2 className="text-2xl font-bold">Join Our Discord</h2>
              </div>
              <p className="text-gray-300 mb-4">
                Connect with our community, get instant help, and participate in discussions about all things GTA VI.
              </p>
              <a 
                href="https://discord.gg/rGqyNP4AC6" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-5 py-3 rounded-lg bg-gta-pink text-white font-medium hover:bg-gta-pink/90 transition-colors duration-200"
              >
                

                    Join Our Discord Server
              </a>
            </div>
          </div>

          {/* FAQ section */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-12">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
                <div>
                <h3 className="text-xl font-semibold text-gta-pink mb-2">🚧 Under Construction 🚧</h3>
                <p className="text-gray-300">
                  Please be in mind that this site is still under construction. Some features may not work as expected, and some content may be missing. Please contact us if you have any questions or feedback.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gta-blue mb-2">What is vice.city?</h3>
                <p className="text-gray-300">
                  vice.city is an independent fan site dedicated to providing comprehensive information, interactive maps, and community resources for GTA VI and Vice City.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gta-blue mb-2">Are you affiliated with Rockstar Games?</h3>
                <p className="text-gray-300">
                  No, we are not affiliated with Rockstar Games, Take-Two Interactive, or their subsidiaries. This is a fan-created and maintained resource.
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gta-blue mb-2">How can I contribute to the site?</h3>
                <p className="text-gray-300">
                  We welcome community contributions! Please contact us via email with your content submissions, bug reports, or suggestions for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 