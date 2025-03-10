import { WikiPageContent, WikiCategory } from './wikiHelpers';
import { SAMPLE_WIKI_PAGES } from '@/data/wikiData';

const WIKI_STORAGE_KEY = 'gta6-wiki-pages';
const DRAFTS_STORAGE_KEY = 'gta6-wiki-drafts';

// Get all wiki pages from localStorage
export const getStoredWikiPages = (): WikiPageContent[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedData = localStorage.getItem(WIKI_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error getting stored wiki pages:', error);
    return [];
  }
};

// Save a wiki page to localStorage
export const saveWikiPage = (page: WikiPageContent): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const existingPages = getStoredWikiPages();
    const existingIndex = existingPages.findIndex(p => p.id === page.id);
    
    if (existingIndex >= 0) {
      // Update existing page
      existingPages[existingIndex] = {
        ...page,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add new page
      existingPages.push({
        ...page,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    
    localStorage.setItem(WIKI_STORAGE_KEY, JSON.stringify(existingPages));
    return true;
  } catch (error) {
    console.error('Error saving wiki page:', error);
    return false;
  }
};

// Delete a wiki page from localStorage
export const deleteWikiPage = (pageId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const existingPages = getStoredWikiPages();
    const filteredPages = existingPages.filter(p => p.id !== pageId);
    
    localStorage.setItem(WIKI_STORAGE_KEY, JSON.stringify(filteredPages));
    return true;
  } catch (error) {
    console.error('Error deleting wiki page:', error);
    return false;
  }
};

// Save draft wiki page
export const saveWikiDraft = (draft: Partial<WikiPageContent>): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const draftWithTimestamp = {
      ...draft,
      lastSaved: new Date().toISOString(),
    };
    
    localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(draftWithTimestamp));
    return true;
  } catch (error) {
    console.error('Error saving wiki draft:', error);
    return false;
  }
};

// Get draft wiki page
export const getWikiDraft = (): Partial<WikiPageContent> & { lastSaved?: string } => {
  if (typeof window === 'undefined') return {};
  
  try {
    const storedDraft = localStorage.getItem(DRAFTS_STORAGE_KEY);
    return storedDraft ? JSON.parse(storedDraft) : {};
  } catch (error) {
    console.error('Error getting wiki draft:', error);
    return {};
  }
};

// Clear draft wiki page
export const clearWikiDraft = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing wiki draft:', error);
    return false;
  }
};

// Get all wiki pages (combining stored pages with default pages)
export const getAllWikiPages = (): WikiPageContent[] => {
  const storedPages = getStoredWikiPages();
  const defaultPages = SAMPLE_WIKI_PAGES;
  
  // Create a map of all pages by ID to avoid duplicates
  const pagesMap = new Map<string, WikiPageContent>();
  
  // Add default pages first
  defaultPages.forEach(page => {
    pagesMap.set(page.id, page);
  });
  
  // Add stored pages (these will overwrite default pages with the same ID)
  storedPages.forEach(page => {
    pagesMap.set(page.id, page);
  });
  
  // Convert map values back to array
  return Array.from(pagesMap.values());
};

// Get a specific wiki page by ID (from both stored and default pages)
export const getWikiPageFromAllSources = (id: string): WikiPageContent | undefined => {
  const allPages = getAllWikiPages();
  return allPages.find(page => page.id === id);
};

// Get all wiki pages by category (from both stored and default pages)
export const getAllWikiPagesByCategory = (category: WikiCategory): WikiPageContent[] => {
  const allPages = getAllWikiPages();
  return allPages.filter(page => page.category === category);
}; 