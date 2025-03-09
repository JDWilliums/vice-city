'use client';

import { useState } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface MapSidebarProps {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

export default function MapSidebar({ 
  categories, 
  activeCategory, 
  onCategoryChange, 
  searchTerm, 
  onSearchChange 
}: MapSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleCategoryClick = (categoryId: string) => {
    if (activeCategory === categoryId) {
      // If clicking the active category, deselect it
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryId);
    }
  };
  
  return (
    <div className={`map-sidebar transition-all duration-300 ${isCollapsed ? 'w-12' : 'w-72'}`}>
      {/* Toggle button */}
      <button 
        className="absolute -right-3 top-2 bg-gray-800 rounded-full p-1 shadow-lg z-10"
        onClick={toggleSidebar}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <svg 
          className={`w-5 h-5 text-white transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Sidebar content */}
      {!isCollapsed && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">GTA VI Map</h2>
          
          {/* Search */}
          <div>
            <label htmlFor="map-search" className="block text-sm font-medium mb-1">
              Search Locations
            </label>
            <input
              id="map-search"
              type="text"
              placeholder="Search the map..."
              className="w-full px-3 py-2 bg-gray-800 rounded-md focus:ring-2 focus:ring-gta-pink focus:outline-none"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium mb-2">Filter by Category</h3>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    activeCategory === category.id
                      ? 'bg-gray-700 ring-2 ring-offset-1 ring-offset-gray-900 ring-gray-500'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2" style={{ color: category.color }}>
                    {category.icon}
                  </span>
                  <span className="text-sm">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div>
            <h3 className="text-sm font-medium">Legend</h3>
            <div className="mt-2 space-y-1">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center text-sm">
                  <span 
                    className="w-4 h-4 mr-2 rounded-full flex items-center justify-center text-xs"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Collapsed view - only show icons */}
      {isCollapsed && (
        <div className="flex flex-col items-center space-y-4 mt-10">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                activeCategory === category.id
                  ? 'ring-2 ring-white'
                  : ''
              }`}
              style={{ backgroundColor: category.color }}
              title={category.name}
            >
              <span>{category.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 