'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Sample location data (in a real app, this would come from an API or database)
const SAMPLE_LOCATIONS = [
  {
    id: '1',
    title: 'Vice City Beach',
    description: 'The iconic beach area of Vice City, featuring beautiful sandy shores, bustling boardwalks, and vibrant nightlife.',
    content: `
# Vice City Beach

Vice City Beach is one of the most iconic locations in Grand Theft Auto VI, situated on the eastern shore of Vice City. Drawing inspiration from Miami's South Beach, this vibrant area features pristine sandy shores, crystal-blue waters, and a bustling boardwalk lined with palm trees.

## Geography

The beach stretches for approximately 3 miles along the eastern edge of Vice City, bordered by the Atlantic Ocean to the east and Ocean Drive to the west. The northern end connects to North Beach, while the southern portion leads to South Point.

## Points of Interest

- **Ocean Drive**: A strip lined with Art Deco hotels, restaurants, and clubs
- **Boardwalk**: A pedestrian walkway perfect for joggers, skaters, and tourists
- **Beach Pavilion**: Central hub with changing rooms, food vendors, and equipment rentals
- **Lifeguard Towers**: Distinctive red and white towers spaced along the beach
- **Muscle Beach**: Outdoor gym area where bodybuilders work out

## Activities

Visitors to Vice City Beach can participate in numerous activities:
- Swimming
- Volleyball (with dynamic NPC games you can join)
- Jet skiing (rental shops available)
- Parasailing
- Sunbathing (with an actual tan mechanic in the game)

## Nightlife

As the sun sets, Vice City Beach transforms into a nightlife hotspot with:
- Beachfront clubs with different music genres
- Open-air bars serving tropical cocktails
- Street performers and musicians
- Special beach parties on weekends (in-game time)

## Missions and Events

Several story missions take place at Vice City Beach:
1. "Beach Party Gone Wrong" - An introductory mission with Jason
2. "Waterfront Deal" - Drug deal with coastal cartel members
3. "Jet Ski Chase" - High-speed pursuit across the waters

## Collectibles

Explorers can find several collectibles in this area:
- 5 Hidden Packages
- 2 Stunt Jumps (on the pier and boardwalk)
- 3 pieces of Street Art
- 1 Unique Vehicle spawn (classic convertible)

## Tips for Players

- The beach is an excellent place to find NPCs with valuable items
- Beach lockers sometimes contain useful items
- Swimming too far out may attract sharks
- Lifeguard vehicles can be stolen but will trigger a 2-star wanted level
    `,
    image: '/images/locations/vice-city-beach.jpg',
    coordinates: { x: 10, y: 15 },
    category: 'landmarks',
    related: ['Downtown Vice', 'Ocean Drive', 'Marina'],
  },
  // Additional locations would be added here
];

export default function LocationPage() {
  const params = useParams();
  const locationId = params.id as string;
  
  const [location, setLocation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API fetch with a delay
    const timer = setTimeout(() => {
      const foundLocation = SAMPLE_LOCATIONS.find(loc => loc.id === locationId);
      setLocation(foundLocation || null);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [locationId]);
  
  // Convert markdown content to HTML (very basic implementation)
  const formatContent = (content: string) => {
    if (!content) return '';
    
    // Parse headings
    content = content.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>');
    content = content.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>');
    content = content.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
    
    // Parse lists
    content = content.replace(/^- (.+)$/gm, '<li class="ml-6 list-disc">$1</li>');
    content = content.replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 list-decimal">$2</li>');
    
    // Group list items
    content = content.replace(/<\/li>\n<li/g, '</li><li');
    content = content.replace(/<li class="ml-6 list-disc">(.+?)<\/li>/gs, '<ul class="my-3">$&</ul>');
    content = content.replace(/<li class="ml-6 list-decimal">(.+?)<\/li>/gs, '<ol class="my-3">$&</ol>');
    
    // Parse paragraphs (simple version)
    content = content.replace(/^([^<\n].+)$/gm, '<p class="my-3">$1</p>');
    
    // Remove empty paragraphs
    content = content.replace(/<p class="my-3"><\/p>/g, '');
    
    return content;
  };
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-dark-bg">
          <div className="container-custom py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-full mb-6"></div>
              <div className="h-64 bg-gray-700 rounded w-full mb-8"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (!location) {
    return (
      <>
        <Navbar />
        <main className="pt-16 min-h-screen bg-dark-bg">
          <div className="container-custom py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Location Not Found</h1>
            <p className="text-xl mb-8">The location you're looking for doesn't exist or has been moved.</p>
            <Link href="/wiki/locations" className="btn btn-primary">
              View All Locations
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <main className="pt-16 min-h-screen bg-dark-bg">
        <div className="container-custom py-12">
          {/* Breadcrumbs */}
          <nav className="flex mb-6 text-sm">
            <ol className="flex space-x-2">
              <li>
                <Link href="/wiki" className="text-gray-400 hover:text-white">
                  Wiki
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li>
                <Link href="/wiki/locations" className="text-gray-400 hover:text-white">
                  Locations
                </Link>
              </li>
              <li className="text-gray-600">/</li>
              <li className="text-white">{location.title}</li>
            </ol>
          </nav>
          
          {/* Article header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-3">
              {location.title}
            </h1>
            <p className="text-xl text-gray-300 mb-6">
              {location.description}
            </p>
            
            {/* Location metadata */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 text-sm text-gray-300">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1 text-gta-green" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Coordinates: X: {location.coordinates.x}, Y: {location.coordinates.y}
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-1 text-gta-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Category: {location.category.charAt(0).toUpperCase() + location.category.slice(1)}
              </span>
              
              {/* View on map button */}
              <Link 
                href={`/map?location=${location.id}`}
                className="btn btn-primary sm:ml-auto inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                View on Map
              </Link>
            </div>
          </header>
          
          {/* Placeholder for image */}
          <div className="w-full h-64 bg-gray-700 rounded-lg mb-8 flex items-center justify-center text-gray-500">
            Location Image (Would be a real image in production)
          </div>
          
          {/* Article content */}
          <div 
            className="wiki-content prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(location.content) }}
          />
          
          {/* Related locations */}
          <div className="mt-12 pt-8 border-t border-gray-700">
            <h2 className="text-2xl font-bold mb-4">Related Locations</h2>
            <div className="flex flex-wrap gap-2">
              {location.related.map((relatedLocation: string) => (
                <Link 
                  key={relatedLocation}
                  href={`/wiki/locations/${relatedLocation.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
                >
                  {relatedLocation}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Edit history & contribution */}
          <div className="mt-12 pt-6 border-t border-gray-700 text-sm text-gray-400 flex flex-col sm:flex-row justify-between items-center">
            <div>
              Last updated: March 9, 2023 &bull; <Link href="#" className="text-gta-blue hover:underline">View Edit History</Link>
            </div>
            <Link href="/contribute" className="mt-3 sm:mt-0 text-gta-pink hover:underline">
              Improve this article
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
} 