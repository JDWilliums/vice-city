'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { WikiCategory } from '@/lib/wikiHelpers';
import { WikiPageFirestore, createWikiPage, updateWikiPage, getWikiPage, generateSlug } from '@/lib/wikiFirestoreService';
import ImageUploader, { MultipleImageUploader } from './ImageUploader';
import MarkdownEditor from './MarkdownEditor';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { TagIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  
  // Form data state
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    description: string;
    category: WikiCategory;
    subcategory?: string;
    content: string;
    imageUrl?: string;
    galleryImages: string[];
    tags: string[];
    status: 'published' | 'draft' | 'archived';
    featured: boolean;
  }>({
    title: '',
    slug: '',
    description: '',
    category: 'locations',
    content: '',
    galleryImages: [],
    tags: [],
    status: 'draft',
    featured: false
  });
  
  // Current tag input
  const [currentTag, setCurrentTag] = useState<string>('');
  
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
            title: pageData.title,
            slug: pageData.slug,
            description: pageData.description,
            category: pageData.category,
            subcategory: pageData.subcategory,
            content: pageData.content,
            imageUrl: pageData.imageUrl,
            galleryImages: pageData.galleryImages || [],
            tags: pageData.tags || [],
            status: pageData.status,
            featured: pageData.featured || false
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
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  // Handle featured image upload
  const handleFeaturedImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl }));
  };
  
  // Handle gallery images upload
  const handleGalleryImagesUploaded = (imageUrls: string[]) => {
    setFormData(prev => ({ ...prev, galleryImages: imageUrls }));
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
  
  // Handle form submission
  const handleSubmit = async (publishStatus: 'draft' | 'published' = 'published') => {
    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Title is required');
      }
      
      if (!formData.description.trim()) {
        throw new Error('Description is required');
      }
      
      if (!formData.content.trim()) {
        throw new Error('Content is required');
      }
      
      // Generate slug if not editing
      const slug = pageId ? formData.slug : generateSlug(formData.title);
      
      // Prepare page data
      const pageData: Omit<WikiPageFirestore, 'createdAt' | 'updatedAt'> = {
        id: pageId || '', // Will be set by createWikiPage if new
        slug,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        content: formData.content,
        imageUrl: formData.imageUrl,
        galleryImages: formData.galleryImages.length > 0 ? formData.galleryImages : undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
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
          <p>{errorMessage}</p>
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
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
            placeholder="Enter page title"
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={2}
            className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
            placeholder="Brief description of this page"
          />
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
              value={formData.subcategory || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full bg-gray-800 border border-gray-700 rounded-md shadow-sm py-2 px-3 text-gray-100 focus:outline-none focus:ring-gta-blue focus:border-gta-blue"
              placeholder="E.g., Downtown, Main Character, Sports Car"
            />
          </div>
        </div>
        
        {/* Featured Image */}
        <div className="mt-8">
          <ImageUploader
            initialImageUrl={formData.imageUrl}
            onImageUploaded={handleFeaturedImageUploaded}
            onError={setErrorMessage}
            label="Featured Image"
            user={user}
            category={formData.category}
          />
        </div>
        
        {/* Gallery Images */}
        <div className="mt-8">
          <MultipleImageUploader
            initialImageUrls={formData.galleryImages}
            onImagesUploaded={handleGalleryImagesUploaded}
            onError={setErrorMessage}
            label="Gallery Images"
            maxImages={20}
            user={user}
            category={formData.category}
          />
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
        
        {/* Content */}
        <div className="mt-8">
          <MarkdownEditor
            initialValue={formData.content || ''}
            onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            label="Content"
            height="500px"
            placeholder="Write your wiki content here using Markdown..."
          />
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
            className="px-4 py-2 bg-gta-blue text-white rounded-md hover:bg-gta-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gta-blue flex items-center"
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