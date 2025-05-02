'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getCookieConsent, setCookieConsent, setGranularCookieConsent } from '@/utils/cookieConsent';

export default function PrivacySettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [cookiesEnabled, setCookiesEnabled] = useState(false);
  const [analyticsCookiesEnabled, setAnalyticsCookiesEnabled] = useState(false);
  const [functionalCookiesEnabled, setFunctionalCookiesEnabled] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Load saved cookie preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const consentStatus = getCookieConsent();
      setCookiesEnabled(consentStatus);
      
      // Analytics cookies follow the main cookie consent
      setAnalyticsCookiesEnabled(consentStatus);
      
      // Functional cookies are always enabled by default (necessary for the site to work)
      setFunctionalCookiesEnabled(true);
    }
  }, []);

  // Handle cookie toggle
  const handleCookieToggle = (enabled: boolean) => {
    setCookiesEnabled(enabled);
    // When main toggle is changed, analytics follows
    setAnalyticsCookiesEnabled(enabled);
  };

  // Save privacy settings
  const saveSettings = () => {
    // Update main consent setting
    setCookieConsent(cookiesEnabled);
    
    // If main consent is enabled but analytics is different, update granular settings
    if (cookiesEnabled && analyticsCookiesEnabled !== cookiesEnabled) {
      setGranularCookieConsent({ analytics: analyticsCookiesEnabled });
    }
    
    // Show saved message
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background Image */}
      <div className="fixed inset-0 z-0">
        <Image 
          src="/images/gta6-4.png"
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
      
      <Navbar />
      
      <main className="flex-grow relative z-20 container mx-auto px-4 py-12 mt-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-black/60 backdrop-blur-sm border border-gray-800 rounded-lg overflow-hidden">
            <div className="p-8">
              <h1 className="text-2xl font-bold text-white mb-6">Privacy Settings</h1>
              
              <div className="space-y-8">
                {/* Cookie Settings */}
                <div className="bg-gray-900/50 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold text-gta-blue mb-4">Cookie Preferences</h2>
                  
                  {/* Main Cookie Switch */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-white font-medium">Allow All Cookies</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Enable or disable all non-essential cookies.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={cookiesEnabled} 
                        onChange={e => handleCookieToggle(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6b00]"></div>
                    </label>
                  </div>
                  
                  {/* Analytics Cookies */}
                  <div className="flex items-center justify-between py-4 border-b border-gray-800">
                    <div>
                      <h3 className="text-white font-medium">Analytics Cookies</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Allow us to collect anonymous data about site usage to improve user experience.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={analyticsCookiesEnabled} 
                        onChange={e => setAnalyticsCookiesEnabled(e.target.checked)}
                        disabled={!cookiesEnabled}
                        className="sr-only peer" 
                      />
                      <div className={`w-11 h-6 ${!cookiesEnabled ? 'bg-gray-800 opacity-50' : 'bg-gray-700'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6b00]`}></div>
                    </label>
                  </div>
                  
                  {/* Functional Cookies - Always On */}
                  <div className="flex items-center justify-between py-4">
                    <div>
                      <h3 className="text-white font-medium">Functional Cookies (Required)</h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Essential cookies required for basic site functionality.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center">
                      <input 
                        type="checkbox" 
                        checked={functionalCookiesEnabled} 
                        disabled={true}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff6b00]"></div>
                    </label>
                  </div>
                  
                  {/* Success message */}
                  {settingsSaved && (
                    <div className="mt-4 p-3 bg-green-900/50 text-green-400 rounded-md">
                      Settings saved successfully!
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Home
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-6 py-2 bg-[#ff6b00] hover:bg-[#e05f00] text-white rounded transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Add required CSS animations */}
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