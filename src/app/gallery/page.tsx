'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { availableResolutions, phoneResolutions, formatImageFilename, getPhoneResolution, getImageUrl } from '@/utils/imageProcessing';
import { categories, galleryItems, fetchGalleryItems } from '@/data/galleryData';

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
  const handleDownload = (imageUrl: string, resolution: string, title: string, isPhoneResolution = false) => {
    try {
      // Find the resolution data based on the selected resolution
      const resolutionData = isPhoneResolution 
        ? getPhoneResolution(resolution)
        : availableResolutions.find(r => r.id === resolution);
      
      if (!resolutionData) {
        console.error(`Resolution not found: ${resolution}`);
        return;
      }
      
      console.log(`Downloading image: ${imageUrl} at ${resolution} (${resolutionData.width}x${resolutionData.height})`);
      
      // Extract base image path by removing any existing resolution folder prefix
      let baseImagePath = imageUrl;
      const resolutionPattern = /^\/(720p|1080p|1440p|4k|iphone|android|ipad)\//;
      const match = imageUrl.match(resolutionPattern);
      
      if (match) {
        // Remove the resolution folder prefix to get the base image path
        baseImagePath = imageUrl.substring(match[0].length);
        // Ensure it has a leading slash for proper API handling
        baseImagePath = `/${baseImagePath}`;
        
        console.log(`Image is in resolution folder ${match[1]}, using base path: ${baseImagePath}`);
      }
      
      // Generate a proper filename for download
      const downloadFilename = formatImageFilename(baseImagePath, resolution);
      
      // Generate a download URL for the pre-sized image from the resolution folder
      const downloadUrl = getImageUrl(
        baseImagePath, // Use the base image path without resolution prefix
        resolution,    // This points to the resolution folder (e.g., "720p", "1080p", etc.)
        true,          // Request download
        downloadFilename
      );
      
      console.log(`Download URL: ${downloadUrl}`);
      
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${downloadFilename}${baseImagePath.slice(baseImagePath.lastIndexOf('.'))}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generating download URL:', error);
    }
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
      <Navbar transparent={true} />
      <main className="min-h-screen bg-gradient-to-b from-gray-900 to-dark-bg pb-16">
        {/* Hero Section with Header */}
        <div className="relative min-h-[400px] flex items-center justify-center overflow-hidden bg-gradient-to-br z-10 from-gray-900 via-gray-800 to-gray-900 pt-20">
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/gta6-0.png" 
              alt="Gallery Background" 
              fill 
              className="object-cover object-center opacity-100"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-gray-900/70 to-transparent"></div>
          </div>
          
          {/* Animated Gradients */}
          <div className="absolute inset-0 z-5 opacity-40">
            <div className="absolute top-0 -left-1/3 w-2/3 h-2/3 bg-gta-pink opacity-5 rounded-full blur-[200px] animate-pulse"></div>
            <div className="absolute bottom-0 -right-1/3 w-2/3 h-2/3 bg-gta-blue opacity-5 rounded-full blur-[200px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-6 z-10 text-center relative mt-10">
            <div className="animate-fadeIn">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">
                GTA 6 <span className="text-gta-pink">Gallery</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-10 drop-shadow-md">
                Explore official artwork, screenshots, and fan creations from the upcoming Grand Theft Auto VI.
              </p>
              
              {/* Category Filter Buttons */}
              <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory === category.id
                        ? 'bg-gta-pink text-white'
                        : 'bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Scroll indicator - positioned at bottom of header */}
            <div className="mt-6 mb-4 flex justify-center animate-bounce">
              <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
            
          </div>

          
        </div>
        
        <div className="container-custom pt-16">
          {/* Search and Filter Controls */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 mb-8 border border-gray-700 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
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

          {/* Gallery Grid */}
          <div id="gallery-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              // Loading placeholders
              Array.from({ length: pageSize }).map((_, index) => (
                <div 
                  key={`placeholder-${index}`} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-md animate-pulse"
                >
                  <div className="w-full h-48 bg-gray-700"></div>
                  <div className="p-4">
                    <div className="h-5 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : sortedItems.length > 0 ? (
              sortedItems.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-transform transform hover:scale-[1.02] cursor-pointer"
                  onClick={() => handleImageClick(item.id)}
                >
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                      loading="lazy"
                      quality={75}
                    />
                    {item.category === 'phone' && (
                      <div className="absolute top-2 right-2 bg-gta-pink/80 text-white text-xs px-2 py-1 rounded-md shadow-md">
                        Phone
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg truncate">{item.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mt-1">{item.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                        {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                      </span>
                      {item.availableResolutions.includes('4k') && (
                        <span className="px-2 py-0.5 bg-gta-pink/80 text-white text-xs rounded">
                          4K
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 text-center border border-gray-700">
                <p className="text-gray-300 text-lg">No images found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination - with animation */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center mt-12 animate-fadeInUp" style={{ animationDelay: '1s' }}>
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-700 p-2 inline-flex gap-2">
                {renderPaginationButtons()}
              </div>
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
          <div 
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div 
              className="relative w-full max-w-6xl bg-gray-900 rounded-lg overflow-hidden shadow-2xl animate-fadeIn"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Navigation buttons */}
              <div className="absolute left-0 inset-y-0 flex items-center z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = sortedItems.findIndex(item => item.id === selectedImage);
                    if (currentIndex > 0) {
                      setSelectedImage(sortedItems[currentIndex - 1].id);
                    }
                  }}
                  className={`bg-black/50 hover:bg-black/80 text-white p-2 rounded-r-lg transition-colors ${
                    sortedItems.findIndex(item => item.id === selectedImage) === 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={sortedItems.findIndex(item => item.id === selectedImage) === 0}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              
              <div className="absolute right-0 inset-y-0 flex items-center z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const currentIndex = sortedItems.findIndex(item => item.id === selectedImage);
                    if (currentIndex < sortedItems.length - 1) {
                      setSelectedImage(sortedItems[currentIndex + 1].id);
                    }
                  }}
                  className={`bg-black/50 hover:bg-black/80 text-white p-2 rounded-l-lg transition-colors ${
                    sortedItems.findIndex(item => item.id === selectedImage) === sortedItems.length - 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={sortedItems.findIndex(item => item.id === selectedImage) === sortedItems.length - 1}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="relative h-[70vh] bg-black/30">
                <Image
                  src={selectedImageData.image}
                  alt={selectedImageData.title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                  quality={90}
                />
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
                      <div className="flex flex-col gap-3">
                        {/* Show standard resolutions */}
                        <div>
                          <h5 className="text-sm text-gray-300 mb-2">Standard Resolutions</h5>
                          <div className="grid grid-cols-2 gap-2">
                            {selectedImageData.availableResolutions.map((resolution) => {
                              const resData = availableResolutions.find((r) => r.id === resolution);
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
                        </div>
                        
                        {/* Show phone resolutions for phone category */}
                        {selectedImageData.category === 'phone' && (
                          <div>
                            <h5 className="text-sm text-gray-300 mb-2">Phone Resolutions</h5>
                            <div className="grid grid-cols-2 gap-2">
                              {phoneResolutions.map((resolution) => (
                                <button
                                  key={resolution.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownload(selectedImageData.image, resolution.id, selectedImageData.title, true);
                                  }}
                                  className="px-3 py-2 bg-gta-pink/90 hover:bg-gta-pink text-white text-sm rounded flex items-center justify-between transition-colors shadow-sm shadow-black/30"
                                >
                                  <span className="font-medium">{resolution.name}</span>
                                  <span className="bg-black/30 text-white text-xs px-1.5 py-0.5 rounded ml-1">{resolution.width}×{resolution.height}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
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
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        
        .animate-fadeIn {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
        }
        
        .animate-fadeInUp {
          opacity: 0;
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-pulse {
          animation: pulse 8s infinite;
        }
      `}</style>
    </>
  );
} 