'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function TermsPage() {
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
      <main className="flex-grow flex justify-center relative z-20 p-6">
        <div className="max-w-3xl w-full bg-black/80 backdrop-blur-sm p-8 rounded-xl border border-gray-800 shadow-2xl">
          <h1 className="text-3xl font-bold text-gta-pink mb-2">Terms & Conditions</h1>
          <p className="text-gray-400 mb-6">Effective Date: March 22nd, 2025</p>
          
          <div className="prose prose-invert max-w-none">
            <p>Welcome to vice.city, a fan-made resource dedicated to Grand Theft Auto VI (GTA 6). By accessing or using our website, you agree to be bound by the following Terms & Conditions.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Acceptance of Terms</h2>
            <p>By accessing or using vice.city, you agree to comply with and be bound by these Terms & Conditions. If you do not agree, please do not use the site.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Site Purpose</h2>
            <p>vice.city is a fan site and wiki dedicated to GTA 6. It includes both original content and content sourced from Rockstar Games for informational and fan engagement purposes.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">User Accounts</h2>
            <p>To contribute to the site, you may be required to create an account. We collect and store your email address and display name. You are responsible for maintaining the confidentiality of your account and any activity that occurs under your login.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">User Contributions</h2>
            <p>By submitting edits or content to the site, you:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Grant us permission to display, modify, and store your contributions.</li>
              <li>Confirm that your content does not infringe on the intellectual property or rights of others.</li>
            </ul>
            <p>We reserve the right to review and remove contributions at our discretion.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Intellectual Property</h2>
            <p>All Rockstar Games assets, including but not limited to images, logos, videos, and game-related content, are the property of Rockstar Games and Take-Two Interactive. vice.city is not affiliated with, endorsed by, or in any way officially connected to Rockstar Games.</p>
            <p className="mt-4">Original content created by vice.city (such as guides, writeups, and media not derived from Rockstar) is the property of vice.city and may not be copied or redistributed without permission.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Use of the Site</h2>
            <p>You agree to use the site only for lawful purposes. You may not use the site in a way that could damage, disable, overburden, or impair any vice.city services.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Privacy</h2>
            <p>Your use of vice.city is also governed by our <Link href="/privacy" className="text-gta-pink hover:underline">Privacy Policy</Link>. We are committed to protecting your information and do not share your personal data without consent, except where required by law.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the site if you violate these terms or engage in any behavior deemed harmful to the site or its users.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Disclaimers</h2>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>vice.city is an unofficial fan project and is not associated with Rockstar Games.</li>
              <li>We make no warranties about the accuracy, completeness, or reliability of any content on the site.</li>
              <li>All content is provided "as is" without warranties of any kind.</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Changes to Terms</h2>
            <p>We may update these Terms & Conditions from time to time. Continued use of the site after changes are made constitutes acceptance of the revised terms.</p>
            
            <div className="mt-8 pt-4 border-t border-gray-800">
              <p className="text-center text-gray-500">If you have questions about these terms, please <Link href="/contact" className="text-gta-blue hover:text-gta-pink">contact us</Link>.</p>
            </div>
          </div>
        </div>
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