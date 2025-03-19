'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Image gallery categories
const categories = [
  { id: 'all', name: 'All Images' },
  { id: 'official', name: 'Official Art' },
  { id: 'screenshots', name: 'Screenshots' },
  { id: 'fanart', name: 'Fan Art' },
  { id: 'icons', name: 'Icons' },
  { id: 'phone', name: 'Phone Backgrounds' },
  { id: 'desktop', name: 'Desktop Backgrounds' }
];

// Image resolutions for download
const resolutions = [
  { id: '720p', name: '720p', width: 1280, height: 720 },
  { id: '1080p', name: '1080p', width: 1920, height: 1080 },
  { id: '1440p', name: '1440p', width: 2560, height: 1440 },
  { id: '4k', name: '4K', width: 3840, height: 2160 }
];

// Image gallery items with availability for different resolutions
const galleryItems = [
  {
    id: 1,
    title: 'Lucia & Jason',
    category: 'official',
    image: '/images/gta6-0.png',
    description: 'Official artwork featuring Lucia and Jason, the protagonists of GTA 6',
    availableResolutions: ['720p', '1080p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 2,
    title: 'Vice City Beach',
    category: 'screenshots',
    image: '/images/gta6-1.png',
    description: 'A beautiful view of Vice City Beach at sunset',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 3,
    title: 'Downtown Vice City',
    category: 'screenshots',
    image: '/images/gta6-2.png',
    description: 'The bustling downtown area of Vice City',
    availableResolutions: ['720p', '1080p', '1440p'],
    date: '2023-12-05'
  },
  {
    id: 4,
    title: 'Nightlife',
    category: 'screenshots',
    image: '/images/gta6-3.png',
    description: 'Vice City nightlife featuring neon lights and vibrant streets',
    availableResolutions: ['720p', '1080p'],
    date: '2023-12-05'
  },
  {
    id: 5,
    title: 'Beach Club',
    category: 'screenshots',
    image: '/images/gta6-4.png',
    description: 'Popular beach club in Vice City',
    availableResolutions: ['720p', '1080p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 6,
    title: 'Countryside',
    category: 'screenshots',
    image: '/images/gta6-5.png',
    description: 'The lush countryside of Leonida',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 7,
    title: 'Night Cruising',
    category: 'screenshots',
    image: '/images/gta6-6.png',
    description: 'Cruising through Vice City at night',
    availableResolutions: ['720p', '1080p'],
    date: '2023-12-05'
  },
  {
    id: 8,
    title: 'Swamps',
    category: 'screenshots',
    image: '/images/gta6-7.png',
    description: 'The mysterious swamps of Leonida',
    availableResolutions: ['720p', '1080p', '1440p'],
    date: '2023-12-05'
  },
  {
    id: 9,
    title: 'Lucia Character',
    category: 'official',
    image: '/images/gta6-8.png',
    description: 'Official character art for Lucia',
    availableResolutions: ['720p', '1080p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 10,
    title: 'Vice City Skyline',
    category: 'screenshots',
    image: '/images/gta6-9.png', 
    description: 'The iconic Vice City skyline',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 11,
    title: 'GTA 6 Logo',
    category: 'official',
    image: '/images/gta6-logo.png',
    description: 'The official GTA 6 logo',
    availableResolutions: ['720p', '1080p'],
    date: '2023-12-05'
  },
  {
    id: 12,
    title: 'Vice City Sign',
    category: 'screenshots',
    image: '/images/vice-sign.png',
    description: 'The iconic Vice City welcome sign',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 13,
    title: 'Vice City Sign',
    category: 'screenshots',
    image: '/images/gta6-10.png',
    description: 'The iconic Vice City welcome sign',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 14,
    title: 'Vice City Sign',
    category: 'screenshots',
    image: '/images/gta6-11.png',
    description: 'The iconic Vice City welcome sign',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-05'
  },
  {
    id: 15,
    title: 'Lucia Phone Wallpaper',
    category: 'phone',
    image: '/images/gta6-13.png',
    description: 'Vertical phone wallpaper featuring Lucia',
    availableResolutions: ['720p', '1080p'],
    date: '2023-12-10'
  },
  {
    id: 16,
    title: 'Vice City Neon Nights',
    category: 'phone',
    image: '/images/gta6-14.png',
    description: 'Neon-lit Vice City streets optimized for phone screens',
    availableResolutions: ['720p', '1080p'],
    date: '2023-12-10'
  },
  {
    id: 17,
    title: 'GTA 6 Logo Minimal',
    category: 'phone',
    image: '/images/gta6-15.png',
    description: 'Minimalist GTA 6 logo wallpaper for phones',
    availableResolutions: ['720p', '1080p'],
    date: '2023-12-10'
  },
  {
    id: 18,
    title: 'Vice City Panorama',
    category: 'desktop',
    image: '/images/gta6-16.png',
    description: 'Widescreen panorama of Vice City for desktop backgrounds',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-15'
  },
  {
    id: 19,
    title: 'Leonida Sunset',
    category: 'desktop',
    image: '/images/gta6-17.png',
    description: 'Beautiful sunset over Leonida landscapes, perfect for desktop',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-15'
  },
  {
    id: 20,
    title: 'Lucia & Jason Action',
    category: 'desktop',
    image: '/images/gta6-18.png',
    description: 'Action scene featuring both protagonists, formatted for widescreen displays',
    availableResolutions: ['720p', '1080p', '1440p', '4k'],
    date: '2023-12-15'
  }
];

// In real implementation, we'd fetch images from an API with pagination
// This would be the function to get images from backend
const fetchGalleryItems = (
  page: number, 
  pageSize: number, 
  category: string, 
  searchQuery: string, 
  sortOption: string
) => {
  // Simulate API call with the current array
  // In a real app, this would be an API call
  
  // Filter items
  let filtered = galleryItems
    .filter(item => category === 'all' || item.category === category)
    .filter(item => 
      searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Sort items
  filtered = [...filtered].sort((a, b) => {
    if (sortOption === 'newest') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortOption === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortOption === 'name-asc') {
      return a.title.localeCompare(b.title);
    } else { // name-desc
      return b.title.localeCompare(a.title);
    }
  });
  
  // Calculate total pages
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Get items for current page
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const itemsForPage = filtered.slice(startIndex, endIndex);
  
  return {
    items: itemsForPage,
    totalItems,
    totalPages
  };
};

export default function Gallery() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 12; // Number of items per page

  // Fetch gallery items with pagination and filtering
  const { items: sortedItems, totalItems, totalPages } = useMemo(() => {
    return fetchGalleryItems(
      currentPage,
      pageSize,
      activeCategory,
      searchQuery,
      sortOption
    );
  }, [currentPage, pageSize, activeCategory, searchQuery, sortOption]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortOption]);

  // Handle image click for lightbox
  const handleImageClick = (id: number) => {
    setSelectedImage(id);
    // When opening the lightbox, scroll to the top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close lightbox
  const closeLightbox = () => {
    setSelectedImage(null);
  };

  // Handle download image
  const handleDownload = (imageUrl: string, resolution: string, title: string) => {
    // Create a temporary link element
    const link = document.createElement('a');
    
    // In a real app, you would generate different resolution versions
    // For this example, we'll just use the existing image
    link.href = imageUrl;
    
    // Set the download attribute with the filename
    link.download = `GTA6-${title.replace(/\s+/g, '-')}-${resolution}.png`;
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Trigger the download
    link.click();
    
    // Remove the link from the body
    document.body.removeChild(link);
  };

  // Copy image link to clipboard
  const copyImageLink = (imageUrl: string) => {
    const fullUrl = window.location.origin + imageUrl;
    navigator.clipboard.writeText(fullUrl)
      .then(() => {
        setCopySuccess('Link copied!');
        setTimeout(() => setCopySuccess(''), 2000);
      })
      .catch(() => {
        setCopySuccess('Failed to copy');
      });
  };

  // Handle keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        // Navigate to next image
        const currentIndex = sortedItems.findIndex(item => item.id === selectedImage);
        if (currentIndex < sortedItems.length - 1) {
          setSelectedImage(sortedItems[currentIndex + 1].id);
        }
      } else if (e.key === 'ArrowLeft') {
        // Navigate to previous image
        const currentIndex = sortedItems.findIndex(item => item.id === selectedImage);
        if (currentIndex > 0) {
          setSelectedImage(sortedItems[currentIndex - 1].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, sortedItems]);

  // Change page
  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    // In a real application with API, we would fetch data here
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
      // Scroll to top of gallery
      const galleryElement = document.getElementById('gallery-grid');
      if (galleryElement) {
        galleryElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtonsToShow = 5; // Show max 5 buttons at a time
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = startPage + maxButtonsToShow - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }
    
    // Always show first page
    if (startPage > 1) {
      buttons.push(
        <button 
          key="first" 
          onClick={() => handlePageChange(1)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1" className="px-3 py-2 text-gray-500">...</span>);
      }
    }
    
    // Page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 ${
            i === currentPage 
              ? 'bg-gta-pink text-white' 
              : 'bg-gray-800 hover:bg-gray-700 text-white'
          } rounded-md`}
        >
          {i}
        </button>
      );
    }
    
    // Always show last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2" className="px-3 py-2 text-gray-500">...</span>);
      }
      buttons.push(
        <button 
          key="last" 
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  // Get selected image data
  const selectedImageData = selectedImage 
    ? galleryItems.find(item => item.id === selectedImage) 
    : null;

  // Get the index of the selected image in the sorted array
  const selectedImageIndex = selectedImageData
    ? sortedItems.findIndex(item => item.id === selectedImageData.id)
    : -1;

  return (
    <>
      <Navbar transparent={false} />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-dark-bg pt-24 pb-16">
        <div className="container-custom">
          {/* Page Header with Featured Image Background */}
          <header className="relative rounded-lg overflow-hidden mb-12">
            <div className="absolute inset-0 z-0 opacity-30">
              <Image 
                src="/images/gta6-0.png" 
                alt="GTA 6 Background" 
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-0"></div>
            <div className="relative z-10 text-center py-16 px-4">
              <h1 className="text-5xl font-bold mb-4 text-white">
                GTA 6 <span className="text-gta-pink">Gallery</span>
              </h1>
              <p className="text-gray-300 max-w-2xl mx-auto">
                Explore official artwork, screenshots, and fan creations from the upcoming Grand Theft Auto VI set in Vice City and Leonida.
              </p>
            </div>
          </header>

          {/* Search and Filter Controls */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              {/* Search */}
              <div className="w-full md:w-1/3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search gallery..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gta-pink/50"
                  />
                  <svg
                    className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Sort */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="px-4 py-2 bg-gray-900/70 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gta-pink/50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="name-asc">Name (A-Z)</option>
                  <option value="name-desc">Name (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-gta-pink text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div id="gallery-grid" className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 border-4 border-gta-blue border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-white">Loading images...</p>
                </div>
              </div>
            )}
            
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${isLoading ? 'opacity-50' : ''}`}>
              {sortedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-700 hover:border-gta-blue/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-gta-blue/20 cursor-pointer group"
                  onClick={() => handleImageClick(item.id)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {item.availableResolutions.length > 0 
                          ? `Up to ${item.availableResolutions[item.availableResolutions.length - 1]}` 
                          : 'Preview only'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-white font-semibold group-hover:text-gta-pink transition-colors">{item.title}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-400 text-sm">{item.category.charAt(0).toUpperCase() + item.category.slice(1)}</p>
                      <p className="text-gray-500 text-xs">{new Date(item.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results Message */}
            {sortedItems.length === 0 && !isLoading && (
              <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700 backdrop-blur-sm">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-300 text-lg mb-2">No images found</p>
                <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
                <button 
                  className="mt-4 px-4 py-2 bg-gta-pink/80 hover:bg-gta-pink text-white rounded-md transition-colors"
                  onClick={() => {
                    setActiveCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {/* Previous page button */}
              <button 
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-md flex items-center gap-1 ${
                  currentPage === 1 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>
              
              {/* Page number buttons */}
              <div className="flex items-center gap-1">
                {renderPaginationButtons()}
              </div>
              
              {/* Next page button */}
              <button 
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 rounded-md flex items-center gap-1 ${
                  currentPage === totalPages 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white'
                }`}
              >
                <span>Next</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Results count */}
          {sortedItems.length > 0 && (
            <div className="mt-4 text-center text-gray-400 text-sm">
              Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalItems)} of {totalItems} images
            </div>
          )}
        </div>

        {/* Lightbox */}
        {selectedImage && selectedImageData && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0" onClick={closeLightbox}></div>
            <div className="relative z-10 max-w-6xl w-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              {/* Navigation controls - fixed position and centered vertically */}
              <div className="absolute top-0 bottom-0 left-0 w-20 flex items-center justify-center z-20">
                {selectedImageIndex > 0 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(sortedItems[selectedImageIndex - 1].id);
                    }}
                    className="bg-black/70 hover:bg-gta-pink/80 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Previous image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="absolute top-0 bottom-0 right-0 w-20 flex items-center justify-center z-20">
                {selectedImageIndex < sortedItems.length - 1 && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedImage(sortedItems[selectedImageIndex + 1].id);
                    }}
                    className="bg-black/70 hover:bg-gta-pink/80 text-white w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                    aria-label="Next image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="relative aspect-video">
                <Image
                  src={selectedImageData.image}
                  alt={selectedImageData.title}
                  fill
                  className="object-contain"
                  priority
                />
                {/* Image counter overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded-full">
                  {selectedImageIndex + 1} / {sortedItems.length}
                </div>
              </div>
              
              <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedImageData.title}</h3>
                    <p className="text-gray-300 mt-1">{selectedImageData.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-md">
                        {selectedImageData.category.charAt(0).toUpperCase() + selectedImageData.category.slice(1)}
                      </span>
                      <span className="px-2 py-1 bg-gray-800 text-xs text-gray-300 rounded-md">
                        {new Date(selectedImageData.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-800/80 rounded-md p-4 flex flex-col gap-3">
                    <h4 className="text-white font-semibold">Download Options</h4>
                    
                    {selectedImageData.availableResolutions.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {selectedImageData.availableResolutions.map((resolution) => {
                          const resData = resolutions.find(r => r.id === resolution);
                          return (
                            <button
                              key={resolution}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(selectedImageData.image, resolution, selectedImageData.title);
                              }}
                              className="px-3 py-2 bg-gta-blue/90 hover:bg-gta-blue text-white text-sm rounded flex items-center justify-between transition-colors shadow-sm shadow-black/30"
                            >
                              <span className="font-medium">{resData?.name}</span>
                              <span className="bg-black/30 text-white text-xs px-1.5 py-0.5 rounded ml-1">{resData?.width}×{resData?.height}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-sm">No download options available</p>
                    )}

                    <div className="flex justify-between items-center mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyImageLink(selectedImageData.image);
                        }}
                        className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded flex items-center gap-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy Link</span>
                      </button>
                      {copySuccess && (
                        <span className="text-green-400 text-xs animate-fade-in-out">{copySuccess}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image navigation indicators */}
                <div className="flex justify-center mt-6">
                  <span className="text-gray-500 text-xs">
                    Use arrow keys or side buttons to navigate
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeLightbox();
                }}
                className="absolute top-2 right-2 bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-gta-pink transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
      <style jsx global>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }

        .animate-fade-in-out {
          animation: fadeInOut 2s ease-in-out;
        }
      `}</style>
    </>
  );
} 