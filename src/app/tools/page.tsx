'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TOOLS = [
  {
    id: 'wiki-generator',
    title: 'Wiki Page Generator',
    description: 'Create and format wiki pages with standardized templates for different categories',
    icon: '📝',
    color: 'bg-gta-blue',
    route: '/tools/wiki-generator',
  },
  {
    id: 'wiki-browser',
    title: 'Wiki Page Browser',
    description: 'View, search, and manage all wiki pages you have created',
    icon: '🔍',
    color: 'bg-gta-purple',
    route: '/tools/wiki-browser',
  },
  // Future tools can be added here
  {
    id: 'map-marker',
    title: 'Map Marker Creator',
    description: 'Add custom markers to the interactive map with location details',
    icon: '📍',
    color: 'bg-gta-green',
    route: '#', // Not implemented yet
    disabled: true,
  },
  
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-black text-white bg-opacity-90 flex flex-col">
      <Navbar />
      <div className="h-24 w-full"></div>
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gta-blue">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gta-blue">Development Tools</h1>
          
          <p className="text-center mb-8 text-lg text-gray-300">
            These tools help you create and manage content for the GTA VI Map & Wiki project.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TOOLS.map(tool => (
              <Link 
                href={tool.route} 
                key={tool.id}
                className={`block p-6 rounded-lg border border-gray-800 transition-all hover:shadow-lg hover:border-opacity-80 ${
                  tool.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500 hover:-translate-y-1'
                }`}
                onClick={e => tool.disabled && e.preventDefault()}
              >
                <div className={`${tool.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{tool.title}</h3>
                <p className="text-gray-400">
                  {tool.description}
                </p>
                
                {tool.disabled && (
                  <span className="inline-block mt-4 text-sm bg-yellow-800 text-yellow-200 px-2 py-1 rounded">
                    Coming Soon
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 