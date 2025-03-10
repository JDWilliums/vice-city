'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { WIKI_CATEGORIES } from '@/data/wikiData';
import { WikiCategory, WikiPageContent, generateTemplateByCategory } from '@/lib/wikiHelpers';
import { saveWikiPage, saveWikiDraft, getWikiDraft, clearWikiDraft, getWikiPageFromAllSources } from '@/lib/clientStorage';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function WikiGeneratorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const initialCategory = searchParams.get('category') as WikiCategory || 'locations';

  const [formData, setFormData] = useState<Partial<WikiPageContent>>({
    title: '',
    description: '',
    category: initialCategory,
    subcategory: '',
    content: '',
    tags: [],
  });
  const [previewMarkdown, setPreviewMarkdown] = useState<string>('');
  const [newTag, setNewTag] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [step, setStep] = useState<number>(1);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Generate a URL-friendly ID from the title
  const generateId = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Update the ID when the title changes
  useEffect(() => {
    if (formData.title) {
      setFormData(prev => ({
        ...prev,
        id: generateId(formData.title || ''),
      }));
    }
  }, [formData.title]);

  // Generate template content when category changes
  useEffect(() => {
    if (formData.category && formData.title) {
      const template = generateTemplateByCategory(formData.category, formData.title);
      setFormData(prev => ({
        ...prev,
        content: template,
      }));
      setPreviewMarkdown(template);
    }
  }, [formData.category, formData.title]);

  // Update preview when content changes
  useEffect(() => {
    if (formData.content) {
      setPreviewMarkdown(formData.content);
    }
  }, [formData.content]);

  // Get subcategories for the selected category
  const getSubcategories = () => {
    const category = WIKI_CATEGORIES.find(cat => cat.id === formData.category);
    return category ? category.subcategories : [];
  };

  // Load existing page if in edit mode
  useEffect(() => {
    if (editId && typeof window !== 'undefined') {
      const existingPage = getWikiPageFromAllSources(editId);
      if (existingPage) {
        setFormData(existingPage);
        setPreviewMarkdown(existingPage.content || '');
        setIsEditMode(true);
      } else {
        setErrorMessage(`Wiki page with ID "${editId}" not found.`);
      }
    }
  }, [editId]);

  // Load saved draft on initial render
  useEffect(() => {
    // Only load draft if not in edit mode
    if (!editId && typeof window !== 'undefined') {
      const savedDraft = getWikiDraft();
      if (savedDraft && Object.keys(savedDraft).length > 0) {
        setFormData(prev => ({
          ...prev,
          ...savedDraft,
        }));
        
        if (savedDraft.lastSaved) {
          setLastSaved(new Date(savedDraft.lastSaved).toLocaleString());
        }
      }
    }
  }, [editId]);

  // Auto-save draft when form data changes
  useEffect(() => {
    if (autoSaveEnabled && formData.title) {
      const saveTimer = setTimeout(() => {
        if (saveWikiDraft(formData)) {
          const now = new Date().toLocaleString();
          setLastSaved(now);
        }
      }, 2000);
      
      return () => clearTimeout(saveTimer);
    }
  }, [formData, autoSaveEnabled]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear messages
    setSuccessMessage('');
    setErrorMessage('');
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value as WikiCategory;
    setFormData(prev => ({
      ...prev,
      category,
      subcategory: '', // Reset subcategory when category changes
    }));
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag('');
    }
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.title || !formData.description || !formData.content) {
      setErrorMessage('Please fill out all required fields');
      return;
    }

    // Prepare the wiki page data
    const newWikiPage: WikiPageContent = {
      ...formData,
      id: formData.id || generateId(formData.title!),
      tags: formData.tags || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as WikiPageContent;

    // Save to localStorage
    if (saveWikiPage(newWikiPage)) {
      setSuccessMessage(`Wiki page "${newWikiPage.title}" ${isEditMode ? 'updated' : 'generated'} successfully!`);
      clearWikiDraft(); // Clear the draft after successful save
      console.log(`${isEditMode ? 'Updated' : 'Generated'} wiki page:`, newWikiPage);
      
      // Redirect to the wiki page after 1.5 seconds
      setTimeout(() => {
        router.push(`/wiki/${newWikiPage.category}/${newWikiPage.id}`);
      }, 1500);
    } else {
      setErrorMessage('Failed to save the wiki page');
    }
  };

  // Move to the next step
  const handleNextStep = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      setErrorMessage('Please fill out all required fields in this step');
      return;
    }
    
    setErrorMessage('');
    setStep(prev => prev + 1);
  };

  // Move to the previous step
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
  };

  // Export the markdown content
  const handleExportMarkdown = () => {
    const blob = new Blob([formData.content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.id || 'wiki-page'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white bg-opacity-90 flex flex-col">
      <Navbar />
      <div className="h-24 w-full"></div>
      
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="bg-gray-900 bg-opacity-80 backdrop-blur-sm rounded-lg shadow-2xl p-6 border border-gta-blue">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gta-blue">GTA VI Wiki Page Generator</h1>
          
          {/* Step indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-gta-blue' : 'bg-gray-700'}`}>1</div>
              <div className={`h-1 w-16 ${step >= 2 ? 'bg-gta-blue' : 'bg-gray-700'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-gta-blue' : 'bg-gray-700'}`}>2</div>
              <div className={`h-1 w-16 ${step >= 3 ? 'bg-gta-blue' : 'bg-gray-700'}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-gta-blue' : 'bg-gray-700'}`}>3</div>
            </div>
          </div>
          
          {/* Auto-save status */}
          <div className="mb-6 flex justify-end items-center">
            <div className="flex items-center mr-4">
              <input
                type="checkbox"
                id="autosave"
                checked={autoSaveEnabled}
                onChange={() => setAutoSaveEnabled(!autoSaveEnabled)}
                className="mr-2"
              />
              <label htmlFor="autosave" className="text-sm text-gray-400">Auto-save draft</label>
            </div>
            
            {lastSaved && (
              <span className="text-sm text-gray-400">
                Last saved: {lastSaved}
              </span>
            )}
          </div>
          
          {/* Success/Error messages */}
          {successMessage && (
            <div className="bg-green-800 text-white rounded-md p-4 mb-6">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="bg-red-800 text-white rounded-md p-4 mb-6">
              {errorMessage}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gta-blue">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium mb-2">Title <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                      placeholder="e.g. Vice City Beach"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="id" className="block text-sm font-medium mb-2">ID (URL Slug)</label>
                    <input
                      type="text"
                      id="id"
                      name="id"
                      value={formData.id}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                      placeholder="Auto-generated from title"
                      disabled
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">Description <span className="text-red-500">*</span></label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white h-24"
                    placeholder="Brief description of this wiki entry..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-2">Category <span className="text-red-500">*</span></label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryChange}
                      className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                      required
                    >
                      {WIKI_CATEGORIES.map(category => (
                        <option key={category.id} value={category.id}>{category.title}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="subcategory" className="block text-sm font-medium mb-2">Subcategory</label>
                    <select
                      id="subcategory"
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                    >
                      <option value="">Select a subcategory</option>
                      {getSubcategories().map(subcat => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="text"
                    id="imageUrl"
                    name="imageUrl"
                    value={formData.imageUrl || ''}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                    placeholder="e.g. /images/locations/vice-city-beach.jpg"
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Content */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gta-blue">Content</h2>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label htmlFor="content" className="block text-sm font-medium">Markdown Content <span className="text-red-500">*</span></label>
                    <span className="text-sm text-gray-400">Template based on selected category</span>
                  </div>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800 rounded-md border border-gray-700 p-3 text-white h-96 font-mono"
                    placeholder="Enter wiki content in Markdown format..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags?.map(tag => (
                      <span 
                        key={tag} 
                        className="bg-gta-blue bg-opacity-30 rounded-full px-3 py-1 text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button 
                          type="button" 
                          onClick={() => handleRemoveTag(tag)}
                          className="text-white hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      className="flex-grow bg-gray-800 rounded-md border border-gray-700 p-3 text-white"
                      placeholder="New tag..."
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Preview */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gta-blue">Preview</h2>
                
                <div className="bg-gray-800 rounded-md border border-gray-700 p-6">
                  <h3 className="text-xl font-bold mb-1">{formData.title}</h3>
                  <p className="text-gray-400 mb-4">{formData.description}</p>
                  
                  {formData.subcategory && (
                    <div className="mb-4">
                      <span className="text-sm bg-gta-blue bg-opacity-30 rounded-full px-3 py-1">
                        {formData.subcategory}
                      </span>
                    </div>
                  )}
                  
                  <div className="prose prose-invert max-w-none border-t border-gray-700 pt-4 mt-4">
                    {/* In a real application, you would render the markdown with a library like react-markdown */}
                    <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-96 p-4 bg-gray-900 rounded">
                      {previewMarkdown}
                    </pre>
                  </div>
                  
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <span className="text-sm font-medium mb-2 block">Tags:</span>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="bg-gta-blue bg-opacity-30 rounded-full px-3 py-1 text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="bg-gta-green px-4 py-2 rounded-md hover:bg-opacity-80"
                  >
                    Export Markdown
                  </button>
                  
                  <button
                    type="submit"
                    className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80"
                  >
                    Generate Wiki Page
                  </button>
                </div>
              </div>
            )}
            
            {/* Navigation buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-700">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="bg-gray-700 px-4 py-2 rounded-md hover:bg-opacity-80"
                >
                  Previous
                </button>
              ) : (
                <Link href="/wiki" className="bg-gray-700 px-4 py-2 rounded-md hover:bg-opacity-80">
                  Cancel
                </Link>
              )}
              
              {step < 3 && (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-gta-blue px-4 py-2 rounded-md hover:bg-opacity-80"
                >
                  Next
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 