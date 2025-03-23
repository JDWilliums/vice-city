// Google Analytics utility functions

// Declare global gtag function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize GA - this is called once when the script is loaded
export const initGA = (id: string) => {
  if (typeof window === 'undefined') return;
  
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', id);
};

// Log a pageview
export const pageview = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('config', 'G-L0E1TVCKP7', {
    page_path: url,
  });
  
  console.log(`Logging pageview for: ${url}`);
};

// Log an event
export const event = ({ action, category, label, value }: { 
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
}; 