'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ImageOverlay, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import MapSidebar from './MapSidebar';

// Add custom CSS to move Leaflet controls away from the sidebar
const mapStyles = `
  .leaflet-control-container .leaflet-top.leaflet-left {
    right: 20px;
    left: auto;
  }
  .leaflet-control-container .leaflet-bottom.leaflet-left {
    right: 20px;
    left: auto;
  }
`;

// Define map bounds for GTA 5 map (coordinates are now for the custom map)
const MAP_BOUNDS: L.LatLngBoundsLiteral = [
  [0, 0],    // Southwest coordinates
  [3000, 3000]  // Northeast coordinates - increased for larger map
];

// Define map categories with their icons and info
const MAP_CATEGORIES = [
  { id: 'missions', name: 'Missions', icon: '/images/icons/bullseye.svg', color: '#FF00B7' },
  { id: 'collectibles', name: 'Collectibles', icon: '/images/icons/trophy.svg', color: '#0051FF' },
  { id: 'stores', name: 'Stores', icon: '/images/icons/cart.svg', color: '#00B930' },
  { id: 'properties', name: 'Properties', icon: '/images/icons/house.svg', color: '#FF0000' },
  { id: 'activities', name: 'Activities', icon: '/images/icons/gamepad.svg', color: '#8C00FF' },
  { id: 'landmarks', name: 'Landmarks', icon: '/images/icons/pin.svg', color: '#FF5100' },
];

// Example points of interest (adjusted for GTA 5 map)
const EXAMPLE_MARKERS = [
  { id: 1, lat: 750, lng: 950, title: 'Los Santos Beach', description: 'Main beach area with lots of activities', category: 'landmarks' },
  { id: 2, lat: 500, lng: 1500, title: 'Downtown Los Santos', description: 'The bustling city center', category: 'landmarks' },
  { id: 3, lat: 1400, lng: 1200, title: 'Introduction Mission', description: 'Where the game begins', category: 'missions' },
  { id: 4, lat: 600, lng: 1300, title: 'Vanilla Unicorn', description: 'Iconic nightclub', category: 'properties' },
  { id: 5, lat: 1000, lng: 1350, title: 'Hidden Package', description: 'A collectible item', category: 'collectibles' },
  { id: 6, lat: 600, lng: 1500, title: 'Ammu-Nation', description: 'Weapon store', category: 'stores' },
  { id: 7, lat: 2000, lng: 900, title: 'Race Track', description: 'Street racing event', category: 'activities' },
  { id: 8, lat: 1300, lng: 1300, title: 'Bank Heist', description: 'Major story mission', category: 'missions' },
];

// Custom icon creator function
const createMapIcon = (category: string) => {
  const categoryInfo = MAP_CATEGORIES.find(c => c.id === category);
  
  return L.divIcon({
    html: `<div style="background-color: ${categoryInfo?.color || '#FFF'}; color: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; font-size: 16px;">
            <img src="${categoryInfo?.icon || '/assets/icons/default-icon.png'}" alt="icon" style="width: 20px; height: 20px;" />
         </div>`,
    className: 'map-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

// Set initial view component
const SetViewOnInit = () => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([1500, 1500], 0);  // Centered with zoomed out view
    map.setMaxBounds(MAP_BOUNDS);
  }, [map]);
  
  return null;
};

export default function Map() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Add style element on component mount to customize Leaflet controls
  useEffect(() => {
    // Inject custom CSS
    const styleEl = document.createElement('style');
    styleEl.innerHTML = mapStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // Filter markers based on category and search term
  const filteredMarkers = useMemo(() => {
    return EXAMPLE_MARKERS.filter(marker => {
      // Filter by category if one is selected
      if (activeCategory && marker.category !== activeCategory) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm && !marker.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [activeCategory, searchTerm]);
  
  return (
    <div className="relative h-[calc(100vh-4rem)]" style={{ backgroundColor: '#0fa8d2' }}>
      <MapSidebar 
        categories={MAP_CATEGORIES}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <MapContainer
        center={[1500, 1500]}
        zoom={0}
        minZoom={-2}
        maxZoom={5}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
        maxBounds={MAP_BOUNDS}
        crs={L.CRS.Simple}
        style={{ backgroundColor: '#0fa8d2' }}
        zoomControl={false} // Disable default zoom control so we can position it manually
      >
        {/* Add zoom control on the right side */}
        <ZoomControl position="topright" />
        
        {/* GTA 5 Map as Image Overlay */}
        <ImageOverlay
          url="/gta5map.png"
          bounds={MAP_BOUNDS}
          opacity={1}
          zIndex={1}
        />
        
        <SetViewOnInit />
        
        {filteredMarkers.map(marker => (
          <Marker 
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={createMapIcon(marker.category)}
          >
            <Popup>
              <div>
                <h3 className="font-bold text-lg mb-1">{marker.title}</h3>
                <p className="text-sm text-gray-700">{marker.description}</p>
                <div className="mt-2 text-xs font-semibold text-gray-500 uppercase">
                  {MAP_CATEGORIES.find(c => c.id === marker.category)?.name || 'Unknown'}
                </div>
                <a 
                  href={`/wiki/locations/${marker.id}`} 
                  className="mt-2 inline-block text-blue-600 hover:underline text-sm"
                >
                  View Details
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
} 