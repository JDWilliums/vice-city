'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'firebase/auth';
import { NewsArticleFirestore, createNewsArticle, updateNewsArticle, getNewsArticle, generateSlug } from '@/lib/newsFirestoreService';
import MarkdownEditor from '@/components/wiki/MarkdownEditor';

interface NewsEditorProps {
  articleId?: string; // If provided, we're editing an existing article
  user: User;
  onSuccess?: (articleId: string) => void;
  onError?: (error: Error) => void;
}

export default function NewsEditor({ 
  articleId, 
  user,
  onSuccess,
  onError 
}: NewsEditorProps) {
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
    excerpt: string;
    content: string;
    category: 'news' | 'features' | 'guides';
    imageUrl: string;
    author: string;
    status: 'published' | 'draft' | 'archived';
    featured: boolean;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'news',
    imageUrl: '',
    author: user.displayName || 'Anonymous',
    status: 'draft',
    featured: false
  });
  
  // Preview image state
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Featured image error
  const [featuredImageError, setFeaturedImageError] = useState('');
  
  // Load existing article data if editing
  useEffect(() => {
    const loadArticleData = async () => {
      if (!articleId) {
        setLoading(false);
        return;
      }
      
      try {
        const articleData = await getNewsArticle(articleId);
        if (articleData) {
          setFormData({
            title: articleData.title || '',
            slug: articleData.slug || '',
            excerpt: articleData.excerpt || '',
            content: articleData.content || '',
            category: articleData.category || 'news',
            imageUrl: articleData.imageUrl || '',
            author: articleData.author || user.displayName || 'Anonymous',
            status: articleData.status || 'draft',
            featured: articleData.featured || false
          });
        }
      } catch (error) {
        console.error('Error loading news article:', error);
        setErrorMessage('Failed to load the news article');
        if (onError) onError(new Error('Failed to load the news article'));
      } finally {
        setLoading(false);
      }
    };
    
    loadArticleData();
  }, [articleId, user.displayName, onError]);
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug when title changes
    if (name === 'title' && (!formData.slug || !touched.slug)) {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        slug: generateSlug(value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Mark field as touched
    setTouched(prev => ({ ...prev, [name]: true }));
  };
  
  // Handle fields being marked as touched
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
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
  
  // Check if all required fields are filled
  const isFormComplete = () => {
    return (
      formData.title.trim() !== '' &&
      formData.excerpt.trim() !== '' &&
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
      case 'excerpt':
        return formData.excerpt.trim() === '';
      case 'content':
        return formData.content.trim() === '';
      case 'imageUrl':
        return formData.imageUrl.trim() === '';
      default:
        return false;
    }
  };
  
  // Handle featured image change
  const handleFeaturedImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, imageUrl: value }));
    setTouched(prev => ({ ...prev, imageUrl: true }));
    setFeaturedImageError('');
    
    // Clear preview if empty
    if (!value.trim()) {
      setPreviewImage(null);
      return;
    }
    
    // For local image preview
    setPreviewImage(value);
  };
  
  // Handle form submission
  const handleSubmit = async (publishStatus: 'draft' | 'published' = 'published') => {
    // Validate form
    if (!isFormComplete()) {
      setErrorMessage('Please fill in all required fields');
      // Mark all fields as touched to show validation errors
      setTouched({
        title: true,
        excerpt: true,
        content: true,
        imageUrl: true,
        category: true,
        author: true,
        slug: true
      });
      return;
    }
    
    try {
      setSaving(true);
      setErrorMessage('');
      
      // Prepare article data with required properties for Firestore
      const articleData: any = {
        ...formData,
        status: publishStatus,
        // For updates, these fields will be handled by the service
        lastUpdatedBy: {
          uid: user.uid,
          displayName: user.displayName || 'Unknown User',
        }
      };
      
      // Only for new articles (not updates)
      if (!articleId) {
        // Generate a temporary ID (will be replaced by Firestore)
        articleData.id = 'temp-' + Date.now();
        // Set createdBy for new articles
        articleData.createdBy = {
          uid: user.uid,
          displayName: user.displayName || 'Unknown User',
        };
      }
      
      if (articleId) {
        // Update existing article
        await updateNewsArticle(articleId, articleData, user);
        setSuccessMessage('Article updated successfully!');
        
        if (onSuccess) {
          onSuccess(articleId);
        }
      } else {
        // Create new article
        const newArticleId = await createNewsArticle(articleData, user);
        setSuccessMessage('Article created successfully!');
        
        if (onSuccess) {
          onSuccess(newArticleId);
        }
      }
    } catch (error) {
      console.error('Error saving news article:', error);
      setErrorMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (onError) {
        onError(error instanceof Error ? error : new Error('Failed to save article'));
      }
    } finally {
      setSaving(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gta-blue"></div>
      </div>
    );
  }
  
  return (
    <div className="w-full">
      {/* Form feedback messages */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-lg">
          <p className="text-red-300">{errorMessage}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-900/50 border border-green-600 rounded-lg">
          <p className="text-green-300">{successMessage}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content - left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              className={`w-full bg-gray-800/50 border ${
                getFieldError('title') ? 'border-red-500' : 'border-gray-700'
              } rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent`}
              placeholder="Article Title"
            />
            {getFieldError('title') && (
              <p className="mt-1 text-sm text-red-500">Title is required</p>
            )}
          </div>
          
          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              onBlur={handleBlur}
              rows={3}
              className={`w-full bg-gray-800/50 border ${
                getFieldError('excerpt') ? 'border-red-500' : 'border-gray-700'
              } rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent`}
              placeholder="A brief summary of the article (shown in article previews)"
            />
            {getFieldError('excerpt') && (
              <p className="mt-1 text-sm text-red-500">Excerpt is required</p>
            )}
          </div>
          
          {/* Content */}
          <div>
            <MarkdownEditor
              initialValue={formData.content}
              onChange={handleContentChange}
              label="Content"
              height="h-96"
            />
            {getFieldError('content') && (
              <p className="mt-1 text-sm text-red-500">Content is required</p>
            )}
          </div>
        </div>
        
        {/* Sidebar - right 1/3 */}
        <div className="space-y-6">
          {/* Save/Publish Buttons */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Publish</h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={saving}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
              >
                {saving ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={saving || !isFormComplete()}
                className="w-full px-4 py-2 bg-gradient-to-r from-gta-blue to-gta-blue/70 hover:from-gta-blue/90 hover:to-gta-blue/60 text-white rounded-md transition-colors disabled:opacity-50 disabled:hover:from-gta-blue disabled:hover:to-gta-blue/70"
              >
                {saving ? 'Publishing...' : 'Publish'}
              </button>
            </div>
          </div>
          
          {/* Article Details */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Article Details</h3>
            
            {/* Category */}
            <div className="mb-4">
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent"
              >
                <option value="news">News</option>
                <option value="features">Features</option>
                <option value="guides">Guides</option>
              </select>
            </div>
            
            {/* Author */}
            <div className="mb-4">
              <label htmlFor="author" className="block text-sm font-medium text-gray-300 mb-2">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                placeholder="Author Name"
              />
            </div>
            
            {/* Slug */}
            <div className="mb-4">
              <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent"
                placeholder="url-friendly-title"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will be used in the URL (auto-generated from title)
              </p>
            </div>
            
            {/* Featured */}
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 bg-gray-800 border-gray-700 rounded focus:ring-gta-blue"
                />
                <label htmlFor="featured" className="ml-2 text-sm font-medium text-gray-300">
                  Featured Article
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Featured articles appear prominently on the news page
              </p>
            </div>
          </div>
          
          {/* Featured Image */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-4">Featured Image</h3>
            
            <div className="mb-4">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Image URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleFeaturedImageChange}
                onBlur={handleBlur}
                className={`w-full bg-gray-800/50 border ${
                  getFieldError('imageUrl') ? 'border-red-500' : 'border-gray-700'
                } rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-gta-blue focus:border-transparent`}
                placeholder="/images/your-image.jpg"
              />
              {getFieldError('imageUrl') && (
                <p className="mt-1 text-sm text-red-500">Featured image is required</p>
              )}
              {featuredImageError && (
                <p className="mt-1 text-sm text-red-500">{featuredImageError}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Use a path like /images/filename.jpg or a full URL
              </p>
            </div>
            
            {/* Image preview */}
            {previewImage && (
              <div className="mt-4 border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-full h-auto object-cover"
                  onError={() => {
                    setFeaturedImageError("Couldn't load the image. Please check the URL.");
                    setPreviewImage(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 