'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gta-pink mb-2">Privacy Policy</h1>
          <p className="text-gray-400 mb-6">Effective Date: March 22nd, 2025</p>
          
          <div className="prose prose-invert max-w-none">
            <p>This Privacy Policy describes how vice.city collects, uses, and protects your information when you use our website. By accessing the site, you agree to this policy.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Information We Collect</h2>
            <p>We collect the following information:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Email address – collected via Google Authentication for account creation and identification</li>
              <li>Display name – shown publicly on your contributions</li>
              <li>Anonymized usage data – through Google Analytics, such as page views and time spent on pages</li>
            </ul>
            <p>We do not collect sensitive personal information such as payment data, home addresses, or government IDs.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Create and manage your account</li>
              <li>Attribute edits and contributions to your display name</li>
              <li>Analyze site traffic and improve functionality (via Google Analytics)</li>
              <li>Communicate with you about site-related matters, if needed</li>
            </ul>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Use of Google Services</h2>
            <p>We use:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li><a href="https://developers.google.com/identity/authentication" className="text-gta-pink hover:underline">Google Authentication</a> to simplify account sign-in and protect user identity</li>
              <li><a href="https://google.com/analytics" className="text-gta-pink hover:underline">Google Analytics</a> to collect anonymized data about user behavior on our site (e.g., which pages are most viewed, where traffic comes from)</li>
            </ul>
            <p>Google may use cookies or other tracking technologies to deliver these services. Learn more in Google's Privacy Policy.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Cookies</h2>
            <p>Cookies help store user preferences and session data. You can disable cookies in your browser settings, but some features of the site may not function properly.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">CCPA – California Consumer Privacy Act</h2>
            <p>If you are a California resident, you have the right to:</p>
            <ul className="list-disc pl-6 mt-2 mb-4">
              <li>Know what personal data we collect</li>
              <li>Request access to your data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of the sale of your personal data (we do not sell data)</li>
            </ul>
            <p>To exercise these rights, email us at contact@vice.city. We will respond within 45 days of receipt.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Data Security</h2>
            <p>We use industry-standard security practices and tools to protect your information. Account logins are handled through Google Authentication for added security.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Data Retention</h2>
            <p>We retain user data as long as your account remains active. You may request deletion at any time by contacting us at contact@vice.city.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Children's Privacy</h2>
            <p>Our site does not target children under the age of 13. We do not knowingly collect personal information from anyone under that age. If we discover we have done so, we will promptly delete it.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Third-Party Links</h2>
            <p>The site may link to external websites such as Rockstar Games or YouTube. We are not responsible for their privacy policies or practices.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Changes to This Policy</h2>
            <p>We may update this Privacy Policy over time. Any changes will be posted here with the updated effective date. Continued use of the site after changes are posted implies acceptance.</p>
            
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gta-blue">Contact Us</h2>
            <p>If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at: <a href="mailto:contact@vice.city" className="text-gta-pink hover:underline">contact@vice.city</a></p>
            
            <div className="mt-8 pt-4 border-t border-gray-800">
              <p className="text-center text-gray-500">Read our <Link href="/terms" className="text-gta-blue hover:text-gta-pink">Terms & Conditions</Link> for more information about using our site.</p>
            </div>
            <li>
                <Link href="/privacy-settings" className="text-gray-300 hover:text-gta-blue">
                  <span className="w-1 h-0 bg-gta-blue mr-2 transition-all duration-200"></span>
                  Change your privacy settings here
                </Link>
            </li>
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