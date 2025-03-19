'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { WikiCategory } from '@/lib/wikiHelpers';
import { WikiPageFirestore, createWikiPage, updateWikiPage, getWikiPage, generateSlug, WikiPageDetail } from '@/lib/wikiFirestoreService';
import MarkdownEditor from './MarkdownEditor';
import WikiDetailsEditor from './WikiDetailsEditor';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { TagIcon, XMarkIcon, PlusIcon, CheckIcon, PencilIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface WikiEditorProps {
  pageId?: string; // If provided, we're editing an existing page
  user: User;
  onSuccess?: (pageId: string) => void;
  onError?: (error: Error) => void;
}

export default function WikiEditor({ 
  pageId, 
  user,
  onSuccess,
  onError 
}: WikiEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  // Form data state
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    description: string;
    category: WikiCategory;
    subcategory: string;
    content: string;
    imageUrl: string;
    galleryImages: string[];
    tags: string[];
    status: 'published' | 'draft' | 'archived';
    featured: boolean;
    details: WikiPageDetail[];
  }>({
    title: '',
    slug: '',
    description: '',
    category: 'locations',
    subcategory: '',
    content: '',
    imageUrl: '',
    galleryImages: [],
    tags: [],
    status: 'draft',
    featured: false,
    details: []
  });
  
  // Current tag input
  const [currentTag, setCurrentTag] = useState<string>('');
  
  // New state for gallery image input
  const [newGalleryImage, setNewGalleryImage] = useState<string>('');
  
  // New state for gallery image error
  const [galleryImageError, setGalleryImageError] = useState('');
  
  // New state for editing gallery image
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  
  // New state for preview image
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // New state for featured image error
  const [featuredImageError, setFeaturedImageError] = useState('');
  
  // Load existing page data if editing
  useEffect(() => {
    const loadPageData = async () => {
      if (!pageId) {
        setLoading(false);
        return;
      }
      
      try {
        const pageData = await getWikiPage(pageId);
        if (pageData) {
          setFormData({
            title: pageData.title || '',
            slug: pageData.slug || '',
            description: pageData.description || '',
            category: pageData.category || 'locations',
            subcategory: pageData.subcategory || '',
            content: pageData.content || '',
            imageUrl: pageData.imageUrl || '',
            galleryImages: pageData.galleryImages || [],
            tags: pageData.tags || [],
            status: pageData.status || 'draft',
            featured: pageData.featured || false,
            details: pageData.details || []
          });
        }
      } catch (error) {
        console.error('Error loading wiki page:', error);
        setErrorMessage('Failed to load the wiki page');
      } finally {
        setLoading(false);
      }
    };
    
    loadPageData();
  }, [pageId]);
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  // Handle fields being marked as touched
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  // Check if all required fields are filled
  const isFormComplete = () => {
    return (
      formData.title.trim() !== '' &&
      formData.description.trim() !== '' &&
      formData.content.trim() !== '' &&
      formData.imageUrl.trim() !== ''
    );
  };
  
  // Get field error state
  const getFieldError = (fieldName: string) => {
    if (!touched[fieldName]) return false;
    
    switch (fieldName) {
      case 'title':
        return formData.title.trim() === '';
      case 'description':
        return formData.description.trim() === '';
      case 'content':
        return formData.content.trim() === '';
      case 'imageUrl':
        return formData.imageUrl.trim() === '';
      default:
        return false;
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle content changes
  const handleContentChange = (content: string) => {
    setFormData(prev => ({ ...prev, content }));
    setTouched(prev => ({ ...prev, content: true }));
  };
  
  // Handle adding gallery image
  const handleAddGalleryImage = () => {
    if (!newGalleryImage.trim()) return;
    
    let formattedImage = newGalleryImage.trim();
    setGalleryImageError('');
    
    // Check if it's a local image path (not an external URL)
    const isLocalImagePath = !formattedImage.startsWith('http') && 
      (formattedImage.endsWith('.png') || 
       formattedImage.endsWith('.jpg') || 
       formattedImage.endsWith('.jpeg') || 
       formattedImage.endsWith('.gif') || 
       formattedImage.endsWith('.webp'));
       
    // For local images, ensure they start with /images/
    if (isLocalImagePath) {
      if (formattedImage.startsWith('images/')) {
        formattedImage = `/${formattedImage}`;
      } else if (!formattedImage.startsWith('/images/')) {
        setGalleryImageError('Local image paths should start with "/images/"');
        return;
      }
    }
    
    // Check if image already exists in gallery
    if (formData.galleryImages.includes(formattedImage)) {
      setGalleryImageError('This image has already been added to the gallery');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, formattedImage]
    }));
    setNewGalleryImage('');
  };
  
  // Handle removing gallery image
  const handleRemoveGalleryImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter(image => image !== imageToRemove)
    }));
  };
  
  // Handle tag addition
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  // Handle tag input keypress (add tag on Enter)
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // Handle editing gallery image
  const handleEditGalleryImage = (index: number) => {
    setEditingImageIndex(index);
    setNewGalleryImage(formData.galleryImages[index]);
    setGalleryImageError('');
  };
  
  // Handle updating gallery image
  const handleUpdateGalleryImage = () => {
    if (editingImageIndex === null) return handleAddGalleryImage();
    
    if (!newGalleryImage.trim()) {
      setGalleryImageError('Image path cannot be empty');
      return;
    }
    
    let formattedImage = newGalleryImage.trim();
    setGalleryImageError('');
    
    // Check if it's a local image path (not an external URL)
    const isLocalImagePath = !formattedImage.startsWith('http') && 
      (formattedImage.endsWith('.png') || 
       formattedImage.endsWith('.jpg') || 
       formattedImage.endsWith('.jpeg') || 
       formattedImage.endsWith('.gif') || 
       formattedImage.endsWith('.webp'));
       
    // For local images, ensure they start with /images/
    if (isLocalImagePath) {
      if (formattedImage.startsWith('images/')) {
        formattedImage = `/${formattedImage}`;
      } else if (!formattedImage.startsWith('/images/')) {
        setGalleryImageError('Local image paths should start with "/images/"');
        return;
      }
    }
    
    // Check if image already exists in gallery (except for the one being edited)
    const otherImages = formData.galleryImages.filter((_, idx) => idx !== editingImageIndex);
    if (otherImages.includes(formattedImage)) {
      setGalleryImageError('This image has already been added to the gallery');
      return;
    }
    
    setFormData(prev => {
      const newGalleryImages = [...prev.galleryImages];
      newGalleryImages[editingImageIndex!] = formattedImage;
      return {
        ...prev,
        galleryImages: newGalleryImages
      };
    });
    
    setNewGalleryImage('');
    setEditingImageIndex(null);
  };
  
  // Handle cancel editing
  const handleCancelEditing = () => {
    setNewGalleryImage('');
    setEditingImageIndex(null);
    setGalleryImageError('');
  };
  
  // Update gallery image input keypress handler
  const handleGalleryImageKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (editingImageIndex !== null) {
        handleUpdateGalleryImage();
      } else {
        handleAddGalleryImage();
      }
    } else if (e.key === 'Escape' && editingImageIndex !== null) {
      e.preventDefault();
      handleCancelEditing();
    }
  };
  
  // Add handler for details changes
  const handleDetailsChange = (details: WikiPageDetail[]) => {
    setFormData(prev => ({ ...prev, details }));
  };
  
  // Handle fixing all gallery image paths
  const handleFixAllImagePaths = () => {
    const fixedImages = formData.galleryImages.map(url => {
      // Don't modify external URLs
      if (url.startsWith('http')) return url;
      
      // Fix images/ to /images/
      if (url.startsWith('images/') && !url.startsWith('/images/')) {
        return `/${url}`;
      }
      
      // If path is a local image but doesn't start with /images/, add the prefix
      const isLocalImage = 
        url.endsWith('.png') || 
        url.endsWith('.jpg') || 
        url.endsWith('.jpeg') || 
        url.endsWith('.gif') || 
        url.endsWith('.webp');
        
      if (isLocalImage && !url.startsWith('/')) {
        // Check if it needs /images/ or just /
        if (url.startsWith('images/')) {
          return `/${url}`;
        } else if (!url.startsWith('/images/')) {
          return `/images/${url}`;
        }
      }
      
      return url;
    });
    
    // Check if any changes were made
    const pathsFixed = JSON.stringify(fixedImages) !== JSON.stringify(formData.galleryImages);
    
    setFormData(prev => ({
      ...prev,
      galleryImages: fixedImages
    }));
    
    if (pathsFixed) {
      setSuccessMessage('All gallery image paths have been fixed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setSuccessMessage('All paths are already correctly formatted');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  // Handle featured image input change
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Update the form data
    handleInputChange(e);
    
    // Clear any previous error
    setFeaturedImageError('');
  };
  
  // Function to fix featured image path
  const handleFixFeaturedImagePath = () => {
    const imageUrl = formData.imageUrl;
    
    // Don't modify if empty
    if (!imageUrl.trim()) return;
    
    // Don't modify external URLs
    if (imageUrl.startsWith('http')) return;
    
    let fixedUrl = imageUrl.trim();
    
    // Fix images/ to /images/
    if (fixedUrl.startsWith('images/') && !fixedUrl.startsWith('/images/')) {
      fixedUrl = `/${fixedUrl}`;
    } 
    // Check if it's a local image that doesn't start with /images/
    else if (!fixedUrl.startsWith('/images/') && !fixedUrl.startsWith('http')) {
      const isLocalImage = 
        fixedUrl.endsWith('.png') || 
        fixedUrl.endsWith('.jpg') || 
        fixedUrl.endsWith('.jpeg') || 
        fixedUrl.endsWith('.gif') || 
        fixedUrl.endsWith('.webp');
        
      if (isLocalImage) {
        fixedUrl = `/images/${fixedUrl}`;
      }
    }
    
    // Only update if the URL was actually changed
    if (fixedUrl !== imageUrl) {
      setFormData(prev => ({
        ...prev,
        imageUrl: fixedUrl
      }));
      setSuccessMessage('Featured image path has been fixed');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setSuccessMessage('Featured image path is already correctly formatted');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (publishStatus: 'draft' | 'published' = 'published') => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Enhanced validation for required fields
      const validationErrors = [];
      
      if (!formData.title.trim()) {
        validationErrors.push('Title is required');
      }
      
      if (!formData.description.trim()) {
        validationErrors.push('Description is required');
      }
      
      if (!formData.content.trim()) {
        validationErrors.push('Content is required');
      }
      
      // Validate featured image if publishing
      if (publishStatus === 'published' && !formData.imageUrl.trim()) {
        validationErrors.push('Featured image URL is required for published pages');
      }
      
      // Check if user is trying to publish without required fields
      if (validationErrors.length > 0) {
        throw new Error(`Please fix the following issues before ${publishStatus === 'published' ? 'publishing' : 'saving'}:\n• ${validationErrors.join('\n• ')}`);
      }
      
      // Auto-format the featured image URL
      let formattedImageUrl = formData.imageUrl.trim();
      if (formattedImageUrl && !formattedImageUrl.startsWith('http')) {
        if (formattedImageUrl.startsWith('images/') && !formattedImageUrl.startsWith('/images/')) {
          formattedImageUrl = `/${formattedImageUrl}`;
        } else if (!formattedImageUrl.startsWith('/images/')) {
          const isLocalImage = 
            formattedImageUrl.endsWith('.png') || 
            formattedImageUrl.endsWith('.jpg') || 
            formattedImageUrl.endsWith('.jpeg') || 
            formattedImageUrl.endsWith('.gif') || 
            formattedImageUrl.endsWith('.webp');
            
          if (isLocalImage) {
            formattedImageUrl = `/images/${formattedImageUrl}`;
          }
        }
      }
      
      // Auto-format all gallery image URLs
      const formattedGalleryImages = formData.galleryImages.map(url => {
        if (url.startsWith('http')) return url;
        
        if (url.startsWith('images/') && !url.startsWith('/images/')) {
          return `/${url}`;
        } 
        
        if (!url.startsWith('/images/')) {
          const isLocalImage = 
            url.endsWith('.png') || 
            url.endsWith('.jpg') || 
            url.endsWith('.jpeg') || 
            url.endsWith('.gif') || 
            url.endsWith('.webp');
            
          if (isLocalImage) {
            return `/images/${url}`;
          }
        }
        
        return url;
      });
      
      // Generate slug if not editing
      const slug = pageId ? formData.slug : generateSlug(formData.title);
      
      // Prepare page data with formatted image URLs
      const pageData: Omit<WikiPageFirestore, 'createdAt' | 'updatedAt'> = {
        id: pageId || '', // Will be set by createWikiPage if new
        slug,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || '',
        content: formData.content,
        imageUrl: formattedImageUrl,
        galleryImages: formattedGalleryImages,
        tags: formData.tags || [],
        details: formData.details || [],
        createdBy: {
          uid: user.uid,
          displayName: user.displayName || 'Unknown User',
        },
        lastUpdatedBy: {
          uid: user.uid,
          displayName: user.displayName || 'Unknown User',
        },
        status: publishStatus,
        featured: formData.featured,
      };
      
      if (pageId) {
        // Update existing page
        await updateWikiPage(pageId, pageData, user);
        setSuccessMessage('Wiki page updated successfully!');
        if (onSuccess) onSuccess(pageId);
      } else {
        // Create new page
        const newPageId = await createWikiPage(pageData, user);
        setSuccessMessage('Wiki page created successfully!');
        if (onSuccess) onSuccess(newPageId);
      }
    } catch (error) {
      console.error('Error saving wiki page:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save the wiki page');
      if (onError) onError(error as Error);
    } finally {
      setSaving(false);
    }
  };
  
  // Update newGalleryImage and set preview
  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewGalleryImage(value);
    
    // Only set preview if there's a value
    if (value.trim()) {
      setPreviewImage(value.trim());
    } else {
      setPreviewImage(null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gta-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-gray-900 p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-white mb-6">
        {pageId ? 'Edit Wiki Page' : 'Create New Wiki Page'}
      </h1>
      
      {errorMessage && (
        <div className="bg-red-900/50 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
          {errorMessage.includes('\n') ? (
            <div>
              <p className="font-medium mb-2">Please fix the following issues:</p>
              <ul className="list-disc pl-5 space-y-1">
                {errorMessage.split('\n').filter(msg => msg.trim().startsWith('•')).map((msg, idx) => (
                  <li key={idx}>{msg.trim().substring(2)}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>{errorMessage}</p>
          )}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-900/50 border border-green-500 text-green-100 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            onBlur={handleBlur}
            className={`mt-1 block w-full bg-gray-800 border ${getFieldError('title') ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue`}
            placeholder="Enter page title"
            required
          />
          {getFieldError('title') && (
            <p className="mt-1 text-sm text-red-500">Title is required</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={handleBlur}
            rows={2}
            className={`mt-1 block w-full bg-gray-800 border ${getFieldError('description') ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue`}
            placeholder="Brief description of this page"
            required
          />
          {getFieldError('description') && (
            <p className="mt-1 text-sm text-red-500">Description is required</p>
          )}
        </div>
        
        {/* Category and Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
            >
              {WIKI_CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-300">
              Subcategory (Optional)
            </label>
            <input
              type="text"
              id="subcategory"
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
              placeholder="E.g., Downtown, Main Character, Sports Car"
            />
          </div>
        </div>
        
        {/* Featured Image */}
        <div className="mt-8">
          <div className="flex items-center mb-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">
              Featured Image URL <span className="text-red-500">*</span>
            </label>
            {!formData.imageUrl && <span className="ml-2 text-sm text-gray-500">(Required for publishing)</span>}
            <div className="relative ml-2 group">
              <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg z-10">
                <p className="mb-1"><strong>Image Path Requirements:</strong></p>
                <p className="mb-1">• Local images should start with <code className="bg-gray-700 p-0.5 rounded">/images/</code></p>
                <p className="mb-1">• Paths starting with <code className="bg-gray-700 p-0.5 rounded">images/</code> will be automatically corrected</p>
                <p>• External URLs should start with <code className="bg-gray-700 p-0.5 rounded">http://</code> or <code className="bg-gray-700 p-0.5 rounded">https://</code></p>
              </div>
            </div>
          </div>
          <div className="flex">
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleFeaturedImageChange}
              onBlur={handleBlur}
              className={`block w-full bg-gray-800 border ${getFieldError('imageUrl') ? 'border-red-500' : 'border-gray-700'} rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue`}
              placeholder="/images/featured-image.png or any URL to an image"
              required
            />
            <button
              type="button"
              onClick={handleFixFeaturedImagePath}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gta-blue hover:bg-gta-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gta-blue"
            >
              <CheckIcon className="h-5 w-5 mr-1" />
              Fix Path
            </button>
          </div>
          
          {getFieldError('imageUrl') && (
            <p className="mt-1 text-sm text-red-500">Featured image URL is required for publishing</p>
          )}
          
          {featuredImageError && (
            <p className="mt-1 text-sm text-red-500">{featuredImageError}</p>
          )}
          
          {/* Preview of the featured image */}
          {formData.imageUrl && (
            <div className="mt-4 flex items-start">
              <div className="w-64 h-40 relative rounded-md overflow-hidden border border-gray-700">
                <Image 
                  src={formData.imageUrl} 
                  alt="Featured image preview" 
                  fill 
                  style={{ objectFit: 'cover' }}
                  className="rounded-md" 
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.png';
                    setFeaturedImageError('Unable to load image. Please check the URL.');
                  }}
                />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-300 mb-2">Featured Image Preview</h3>
                <p className="text-xs text-gray-400 mb-2">This image will be displayed at the top of your wiki page.</p>
                <p className="text-xs text-gray-400">
                  {formData.imageUrl.startsWith('/images/') || formData.imageUrl.startsWith('https://') || formData.imageUrl.startsWith('http://') 
                    ? '✓ Valid image path format' 
                    : '⚠️ Path may need correction - click "Fix Path"'}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Gallery Images */}
        <div className="mt-8">
          <div className="flex items-center mb-2">
            <label htmlFor="galleryImages" className="block text-sm font-medium text-gray-300">
              Gallery Images (Optional)
            </label>
            <div className="relative ml-2 group">
              <InformationCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-300" />
              <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-xs text-gray-300 rounded-md shadow-lg z-10">
                <p className="mb-1"><strong>Image Path Requirements:</strong></p>
                <p className="mb-1">• Local images should start with <code className="bg-gray-700 p-0.5 rounded">/images/</code></p>
                <p className="mb-1">• Paths starting with <code className="bg-gray-700 p-0.5 rounded">images/</code> will be automatically corrected</p>
                <p>• External URLs should start with <code className="bg-gray-700 p-0.5 rounded">http://</code> or <code className="bg-gray-700 p-0.5 rounded">https://</code></p>
              </div>
            </div>
          </div>
          <div className="flex">
            <input
              type="text"
              id="galleryImages"
              value={newGalleryImage}
              onChange={handleGalleryImageChange}
              onKeyPress={handleGalleryImageKeyPress}
              className="block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
              placeholder="/images/gallery-1.png or any URL to an image"
            />
            {editingImageIndex !== null ? (
              <>
                <button
                  type="button"
                  onClick={handleUpdateGalleryImage}
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckIcon className="h-5 w-5 mr-1" />
                  Update
                </button>
                <button
                  type="button"
                  onClick={handleCancelEditing}
                  className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  <XMarkIcon className="h-5 w-5 mr-1" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleAddGalleryImage}
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gta-blue hover:bg-gta-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gta-blue"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add
              </button>
            )}
          </div>
          
          {galleryImageError && (
            <p className="mt-1 text-sm text-red-500">{galleryImageError}</p>
          )}
          
          {/* Preview image */}
          {previewImage && (
            <div className="mt-2 flex items-center">
              <div className="w-32 h-20 relative border border-gray-700 rounded-md overflow-hidden">
                <Image 
                  src={previewImage} 
                  alt="Image preview" 
                  fill 
                  style={{ objectFit: 'cover' }}
                  className="rounded-md" 
                  onError={(e) => {
                    e.currentTarget.src = '/images/placeholder.png';
                  }}
                />
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-300">Image preview</p>
                <p className="text-xs text-gray-400">
                  {previewImage.startsWith('/images/') || previewImage.startsWith('https://') || previewImage.startsWith('http://') 
                    ? '✓ Valid image path format' 
                    : '⚠️ Path may need correction'}
                </p>
              </div>
            </div>
          )}
          
          {/* Display gallery images */}
          {formData.galleryImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {formData.galleryImages.map((url, index) => (
                <div key={index} className="relative rounded-md overflow-hidden bg-gray-800 border border-gray-700 group">
                  <div className="aspect-w-16 aspect-h-9 relative">
                    <Image 
                      src={url} 
                      alt={`Gallery image ${index + 1}`} 
                      fill 
                      style={{ objectFit: 'cover' }}
                      className="rounded-t-md" 
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder.png';
                      }}
                    />
                  </div>
                  <div className="p-2 text-xs text-gray-300 truncate">
                    {url}
                  </div>
                  <div className="absolute top-2 right-2 flex">
                    <button
                      type="button"
                      onClick={() => handleEditGalleryImage(index)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-1"
                    >
                      <PencilIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(url)}
                      className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {formData.galleryImages.length > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={handleFixAllImagePaths}
                className="text-sm text-gray-300 hover:text-white"
              >
                Fix all image paths
              </button>
            </div>
          )}
        </div>
        
        {/* Tags */}
        <div className="mt-8">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-2">
            Tags
          </label>
          <div className="flex">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <TagIcon className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="text"
                id="tags"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                onBlur={handleBlur}
                className="block w-full pl-10 bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
                placeholder="Add tags..."
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gta-blue hover:bg-gta-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gta-blue"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-800 text-gray-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1.5 inline-flex text-gray-400 hover:text-gray-200"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Details */}
        <div className="mt-8">
          <WikiDetailsEditor
            details={formData.details}
            onChange={handleDetailsChange}
            category={formData.category}
          />
        </div>
        
        {/* Content */}
        <div className="mt-8">
          <div className="flex items-center mb-2">
            <span className="block text-sm font-medium text-gray-300">
              Content <span className="text-red-500">*</span>
            </span>
          </div>
          <MarkdownEditor
            initialValue={formData.content || ''}
            onChange={handleContentChange}
            label=""
            height="500px"
            placeholder="Write your wiki content here using Markdown..."
          />
          {getFieldError('content') && (
            <p className="mt-1 text-sm text-red-500">Content is required</p>
          )}
        </div>
        
        {/* Featured Checkbox */}
        <div className="flex items-center">
          <input
            id="featured"
            name="featured"
            type="checkbox"
            checked={formData.featured}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-gta-blue focus:ring-gta-blue border-gray-700 rounded bg-gray-800"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-300">
            Feature this page on the homepage
          </label>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => handleSubmit('draft')}
            disabled={saving}
            className="px-4 py-2 border border-gray-700 text-gray-300 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gta-blue"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit('published')}
            disabled={saving}
            className={`px-4 py-2 ${(!isFormComplete()) ? 'bg-gray-700 cursor-not-allowed' : 'bg-gta-blue hover:bg-gta-blue-dark'} text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gta-blue flex items-center`}
            title={(!isFormComplete()) ? 'Fill out all required fields to publish' : ''}
          >
            {saving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : pageId ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
} 