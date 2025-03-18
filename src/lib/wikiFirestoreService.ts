import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp, addDoc, DocumentReference } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { WikiCategory } from './wikiHelpers';

// Interface for wiki page content with Firestore timestamps
export interface WikiPageFirestore {
  id: string;
  slug: string; // URL-friendly identifier
  title: string;
  description: string;
  category: WikiCategory;
  subcategory?: string;
  content: string;
  imageUrl?: string;
  galleryImages?: string[]; // Array of image URLs for the gallery
  relatedPages?: string[];
  tags?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: {
    uid: string;
    displayName: string;
  };
  lastUpdatedBy: {
    uid: string;
    displayName: string;
  };
  status: 'published' | 'draft' | 'archived';
  featured?: boolean;
}

// Interface for wiki page revision
export interface WikiRevision {
  id: string;
  pageId: string;
  content: string;
  title: string;
  description: string;
  category: WikiCategory;
  subcategory?: string;
  timestamp: Timestamp;
  user: {
    uid: string;
    displayName: string;
  };
  changeDescription?: string; // Optional description of what was changed
}

// Constants for localStorage keys
const LOCAL_WIKI_PAGES_KEY = 'local_wiki_pages';
const LOCAL_WIKI_REVISIONS_KEY = 'local_wiki_revisions';

// Error flag to track if Firestore fails
let isFirestoreAvailable = true;

// Helper function to generate a random ID (similar to Firestore's auto-ID)
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to create a Timestamp from a date or current date
function createTimestamp(date?: Date): Timestamp {
  return Timestamp.fromDate(date || new Date());
}

// Helper to get wiki pages from localStorage
function getLocalWikiPages(): WikiPageFirestore[] {
  try {
    const pagesJson = localStorage.getItem(LOCAL_WIKI_PAGES_KEY);
    if (!pagesJson) return [];
    
    const pages = JSON.parse(pagesJson);
    
    // Convert date strings back to Timestamps
    return pages.map((page: any) => ({
      ...page,
      createdAt: typeof page.createdAt === 'object' 
        ? createTimestamp(new Date(page.createdAt.seconds * 1000)) 
        : createTimestamp(),
      updatedAt: typeof page.updatedAt === 'object'
        ? createTimestamp(new Date(page.updatedAt.seconds * 1000))
        : createTimestamp()
    }));
  } catch (error) {
    console.error('Error getting wiki pages from localStorage:', error);
    return [];
  }
}

// Helper to save wiki pages to localStorage
function saveLocalWikiPages(pages: WikiPageFirestore[]): void {
  try {
    localStorage.setItem(LOCAL_WIKI_PAGES_KEY, JSON.stringify(pages));
  } catch (error) {
    console.error('Error saving wiki pages to localStorage:', error);
  }
}

// Helper to get wiki revisions from localStorage
function getLocalWikiRevisions(): WikiRevision[] {
  try {
    const revisionsJson = localStorage.getItem(LOCAL_WIKI_REVISIONS_KEY);
    if (!revisionsJson) return [];
    
    const revisions = JSON.parse(revisionsJson);
    
    // Convert date strings back to Timestamps
    return revisions.map((revision: any) => ({
      ...revision,
      timestamp: typeof revision.timestamp === 'object'
        ? createTimestamp(new Date(revision.timestamp.seconds * 1000))
        : createTimestamp()
    }));
  } catch (error) {
    console.error('Error getting wiki revisions from localStorage:', error);
    return [];
  }
}

// Helper to save wiki revisions to localStorage
function saveLocalWikiRevisions(revisions: WikiRevision[]): void {
  try {
    localStorage.setItem(LOCAL_WIKI_REVISIONS_KEY, JSON.stringify(revisions));
  } catch (error) {
    console.error('Error saving wiki revisions to localStorage:', error);
  }
}

/**
 * Creates a new wiki page in Firestore or localStorage
 */
export async function createWikiPage(pageData: Omit<WikiPageFirestore, 'createdAt' | 'updatedAt'>, user: User): Promise<string> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    // Create a reference for a new document with auto-generated ID
    const pagesCollectionRef = collection(db, 'wiki-pages');
    const pageRef = doc(pagesCollectionRef);
    
    // Prepare data with timestamps and user info
    const timestamp = serverTimestamp() as Timestamp;
    const finalPageData: WikiPageFirestore = {
      ...pageData,
      id: pageRef.id,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
      status: pageData.status || 'published',
    };
    
    // Set the document data
    await setDoc(pageRef, finalPageData);
    
    // Create the initial revision
    await createRevision(finalPageData, user, 'Initial creation');
    
    return pageRef.id;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Generate a unique ID
    const pageId = generateId();
    
    // Prepare data with timestamps and user info
    const timestamp = createTimestamp();
    const finalPageData: WikiPageFirestore = {
      ...pageData,
      id: pageId,
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
      status: pageData.status || 'published',
    };
    
    // Save to localStorage
    const existingPages = getLocalWikiPages();
    saveLocalWikiPages([...existingPages, finalPageData]);
    
    // Create the initial revision
    await createRevision(finalPageData, user, 'Initial creation');
    
    return pageId;
  }
}

/**
 * Updates an existing wiki page in Firestore or localStorage and creates a revision
 */
export async function updateWikiPage(
  pageId: string, 
  pageData: Partial<WikiPageFirestore>, 
  user: User,
  changeDescription?: string
): Promise<void> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const pageRef = doc(db, 'wiki-pages', pageId);
    const pageSnap = await getDoc(pageRef);
    
    if (!pageSnap.exists()) {
      throw new Error(`Wiki page with ID ${pageId} not found`);
    }
    
    const existingData = pageSnap.data() as WikiPageFirestore;
    
    // Prepare update data
    const updateData = {
      ...pageData,
      updatedAt: serverTimestamp() as Timestamp,
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    };
    
    // Update the document
    await updateDoc(pageRef, updateData);
    
    // Create a revision record with the previous content
    await createRevision(
      { ...existingData, ...pageData, id: pageId },
      user,
      changeDescription || 'Updated page'
    );
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get existing pages from localStorage
    const existingPages = getLocalWikiPages();
    const pageIndex = existingPages.findIndex(page => page.id === pageId);
    
    if (pageIndex === -1) {
      throw new Error(`Wiki page with ID ${pageId} not found`);
    }
    
    const existingData = existingPages[pageIndex];
    
    // Prepare update data
    const timestamp = createTimestamp();
    const updatedPage = {
      ...existingData,
      ...pageData,
      updatedAt: timestamp,
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    };
    
    // Update the page in localStorage
    existingPages[pageIndex] = updatedPage;
    saveLocalWikiPages(existingPages);
    
    // Create a revision record with the previous content
    await createRevision(
      updatedPage,
      user,
      changeDescription || 'Updated page'
    );
  }
}

/**
 * Creates a revision record for tracking changes
 */
export async function createRevision(
  pageData: WikiPageFirestore,
  user: User,
  changeDescription?: string
): Promise<string> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const revisionsCollectionRef = collection(db, 'wiki-revisions');
    
    const revisionData: WikiRevision = {
      id: '', // Will be set after creation
      pageId: pageData.id,
      content: pageData.content,
      title: pageData.title,
      description: pageData.description,
      category: pageData.category,
      subcategory: pageData.subcategory,
      timestamp: serverTimestamp() as Timestamp,
      user: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
      changeDescription,
    };
    
    const revisionRef = await addDoc(revisionsCollectionRef, revisionData);
    
    // Update the document with its ID
    await updateDoc(revisionRef, { id: revisionRef.id });
    
    return revisionRef.id;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Generate a unique ID
    const revisionId = generateId();
    
    const revisionData: WikiRevision = {
      id: revisionId,
      pageId: pageData.id,
      content: pageData.content,
      title: pageData.title,
      description: pageData.description,
      category: pageData.category,
      subcategory: pageData.subcategory,
      timestamp: createTimestamp(),
      user: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
      changeDescription,
    };
    
    // Save to localStorage
    const existingRevisions = getLocalWikiRevisions();
    saveLocalWikiRevisions([...existingRevisions, revisionData]);
    
    return revisionId;
  }
}

/**
 * Deletes a wiki page (soft delete by setting status to archived)
 */
export async function deleteWikiPage(pageId: string, user: User): Promise<void> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const pageRef = doc(db, 'wiki-pages', pageId);
    
    // Soft delete - mark as archived
    await updateDoc(pageRef, {
      status: 'archived',
      updatedAt: serverTimestamp() as Timestamp,
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    });
    
    // Create a deletion revision
    const pageSnap = await getDoc(pageRef);
    if (pageSnap.exists()) {
      const pageData = pageSnap.data() as WikiPageFirestore;
      await createRevision(pageData, user, 'Page archived');
    }
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get existing pages from localStorage
    const existingPages = getLocalWikiPages();
    const pageIndex = existingPages.findIndex(page => page.id === pageId);
    
    if (pageIndex === -1) {
      throw new Error(`Wiki page with ID ${pageId} not found`);
    }
    
    // Update the page status
    const pageData = existingPages[pageIndex];
    pageData.status = 'archived';
    pageData.updatedAt = createTimestamp();
    pageData.lastUpdatedBy = {
      uid: user.uid,
      displayName: user.displayName || 'Unknown User',
    };
    
    // Save the updated pages
    saveLocalWikiPages(existingPages);
    
    // Create a deletion revision
    await createRevision(pageData, user, 'Page archived');
  }
}

/**
 * Hard deletes a wiki page (permanent deletion - use with caution)
 */
export async function permanentlyDeleteWikiPage(pageId: string): Promise<void> {
  try {
    const pageRef = doc(db, 'wiki-pages', pageId);
    await deleteDoc(pageRef);
  } catch (error) {
    console.error('Error permanently deleting wiki page:', error);
    throw error;
  }
}

/**
 * Gets a wiki page by ID
 */
export async function getWikiPage(pageId: string): Promise<WikiPageFirestore | null> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const pageRef = doc(db, 'wiki-pages', pageId);
    const pageSnap = await getDoc(pageRef);
    
    if (pageSnap.exists()) {
      return pageSnap.data() as WikiPageFirestore;
    }
    
    return null;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get pages from localStorage
    const pages = getLocalWikiPages();
    const page = pages.find(p => p.id === pageId);
    
    return page || null;
  }
}

/**
 * Gets a wiki page by slug
 */
export async function getWikiPageBySlug(slug: string): Promise<WikiPageFirestore | null> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const pagesRef = collection(db, 'wiki-pages');
    const q = query(pagesRef, where('slug', '==', slug), where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as WikiPageFirestore;
    }
    
    return null;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get pages from localStorage
    const pages = getLocalWikiPages();
    const page = pages.find(p => p.slug === slug && p.status === 'published');
    
    return page || null;
  }
}

/**
 * Gets all wiki pages
 */
export async function getAllWikiPages(includeArchived: boolean = false): Promise<WikiPageFirestore[]> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const pagesRef = collection(db, 'wiki-pages');
    
    let q;
    if (includeArchived) {
      q = query(pagesRef, orderBy('updatedAt', 'desc'));
    } else {
      q = query(pagesRef, where('status', '!=', 'archived'), orderBy('status'), orderBy('updatedAt', 'desc'));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as WikiPageFirestore);
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get pages from localStorage
    const pages = getLocalWikiPages();
    
    // Filter and sort pages
    let filteredPages = pages;
    if (!includeArchived) {
      filteredPages = pages.filter(page => page.status !== 'archived');
    }
    
    // Sort by updatedAt (newest first)
    return filteredPages.sort((a, b) => {
      const aTime = a.updatedAt.toDate().getTime();
      const bTime = b.updatedAt.toDate().getTime();
      return bTime - aTime;
    });
  }
}

/**
 * Gets wiki pages by category
 */
export async function getWikiPagesByCategory(category: WikiCategory): Promise<WikiPageFirestore[]> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const pagesRef = collection(db, 'wiki-pages');
    const q = query(
      pagesRef, 
      where('category', '==', category),
      where('status', '==', 'published'),
      orderBy('updatedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as WikiPageFirestore);
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get pages from localStorage
    const pages = getLocalWikiPages();
    
    // Filter by category and status
    const filteredPages = pages.filter(
      page => page.category === category && page.status === 'published'
    );
    
    // Sort by updatedAt (newest first)
    return filteredPages.sort((a, b) => {
      const aTime = a.updatedAt.toDate().getTime();
      const bTime = b.updatedAt.toDate().getTime();
      return bTime - aTime;
    });
  }
}

/**
 * Gets wiki page revisions
 */
export async function getWikiPageRevisions(pageId: string): Promise<WikiRevision[]> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const revisionsRef = collection(db, 'wiki-revisions');
    const q = query(
      revisionsRef,
      where('pageId', '==', pageId),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as WikiRevision);
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get revisions from localStorage
    const revisions = getLocalWikiRevisions();
    
    // Filter by pageId
    const pageRevisions = revisions.filter(revision => revision.pageId === pageId);
    
    // Sort by timestamp (newest first)
    return pageRevisions.sort((a, b) => {
      const aTime = a.timestamp.toDate().getTime();
      const bTime = b.timestamp.toDate().getTime();
      return bTime - aTime;
    });
  }
}

/**
 * Gets a specific wiki page revision
 */
export async function getWikiRevision(revisionId: string): Promise<WikiRevision | null> {
  try {
    if (!isFirestoreAvailable) {
      throw new Error('Using localStorage fallback');
    }
    
    const revisionRef = doc(db, 'wiki-revisions', revisionId);
    const revisionSnap = await getDoc(revisionRef);
    
    if (revisionSnap.exists()) {
      return revisionSnap.data() as WikiRevision;
    }
    
    return null;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get revisions from localStorage
    const revisions = getLocalWikiRevisions();
    const revision = revisions.find(r => r.id === revisionId);
    
    return revision || null;
  }
}

/**
 * Searches wiki pages
 */
export async function searchWikiPages(searchTerm: string): Promise<WikiPageFirestore[]> {
  try {
    // Whether using Firestore or localStorage, we need to do client-side filtering
    const allPages = await getAllWikiPages(false); // Exclude archived pages
    
    // Simple client-side search
    const normalizedTerm = searchTerm.toLowerCase();
    return allPages.filter(page => 
      page.title.toLowerCase().includes(normalizedTerm) ||
      page.description.toLowerCase().includes(normalizedTerm) ||
      (page.tags && page.tags.some(tag => tag.toLowerCase().includes(normalizedTerm))) ||
      page.content.toLowerCase().includes(normalizedTerm)
    );
  } catch (error) {
    console.error('Error searching wiki pages:', error);
    throw error;
  }
}

/**
 * Generates a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
} 