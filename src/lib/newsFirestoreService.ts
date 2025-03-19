import { db } from './firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, Timestamp, addDoc, DocumentReference, limit } from 'firebase/firestore';
import { User } from 'firebase/auth';

// Interface for news article with Firestore timestamps
export interface NewsArticleFirestore {
  id: string;
  slug: string; // URL-friendly identifier
  title: string;
  excerpt: string;
  content: string;
  category: 'news' | 'features' | 'guides';
  imageUrl: string;
  author: string;
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

// Constants for localStorage keys
const LOCAL_NEWS_ARTICLES_KEY = 'local_news_articles';

// Error flag to track if Firestore fails - set to true by default (optimistic)
let isFirestoreAvailable = true;

// Helper function to generate a random ID (similar to Firestore's auto-ID)
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to create a Timestamp from a date or current date
function createTimestamp(date?: Date): Timestamp {
  return Timestamp.fromDate(date || new Date());
}

/**
 * Diagnostic function to check Firestore connectivity
 * This can be called to test if Firestore is available and reset the flag if it is
 */
export async function checkFirestoreConnectivity(): Promise<{ available: boolean, error?: string }> {
  try {
    if (typeof window === 'undefined') {
      return { available: false, error: 'Running in server context' };
    }

    // Check if Firebase is initialized
    if (!db) {
      return { available: false, error: 'Firestore not initialized' };
    }

    // Try to access a Firestore collection
    const testQuery = query(collection(db, 'news-articles'), limit(1));
    await getDocs(testQuery);
    
    // If we got here, Firestore is available
    isFirestoreAvailable = true;
    console.log('Firestore connectivity check passed');
    return { available: true };
  } catch (error) {
    console.error('Firestore connectivity check failed:', error);
    isFirestoreAvailable = false;
    return { 
      available: false, 
      error: error instanceof Error ? error.message : 'Unknown error checking Firestore'
    };
  }
}

// Helper to get news articles from localStorage
function getLocalNewsArticles(): NewsArticleFirestore[] {
  try {
    if (typeof window === 'undefined') return [];
    
    const articlesJson = localStorage.getItem(LOCAL_NEWS_ARTICLES_KEY);
    if (!articlesJson) return [];
    
    const articles = JSON.parse(articlesJson);
    
    // Convert date strings back to Timestamps
    return articles.map((article: any) => ({
      ...article,
      createdAt: typeof article.createdAt === 'object' 
        ? createTimestamp(new Date(article.createdAt.seconds * 1000)) 
        : createTimestamp(),
      updatedAt: typeof article.updatedAt === 'object'
        ? createTimestamp(new Date(article.updatedAt.seconds * 1000))
        : createTimestamp()
    }));
  } catch (error) {
    console.error('Error getting news articles from localStorage:', error);
    return [];
  }
}

// Helper to save news articles to localStorage
function saveLocalNewsArticles(articles: NewsArticleFirestore[]): void {
  try {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(LOCAL_NEWS_ARTICLES_KEY, JSON.stringify(articles));
  } catch (error) {
    console.error('Error saving news articles to localStorage:', error);
  }
}

/**
 * Creates a new news article in Firestore or localStorage
 */
export async function createNewsArticle(articleData: Omit<NewsArticleFirestore, 'createdAt' | 'updatedAt'>, user: User): Promise<string> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Create a reference for a new document with auto-generated ID
    const articlesCollectionRef = collection(db, 'news-articles');
    const articleRef = doc(articlesCollectionRef);
    
    // Prepare data with timestamps and user info
    const timestamp = serverTimestamp() as Timestamp;
    const finalArticleData: NewsArticleFirestore = {
      ...articleData,
      id: articleRef.id,
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
      status: articleData.status || 'published',
    };
    
    // Set the document data
    await setDoc(articleRef, finalArticleData);
    
    // Also save to localStorage for redundancy
    try {
      const existingArticles = getLocalNewsArticles();
      saveLocalNewsArticles([...existingArticles, {...finalArticleData, 
        createdAt: createTimestamp(),
        updatedAt: createTimestamp()
      }]);
    } catch (localError) {
      console.warn('Failed to save article to localStorage (minor issue):', localError);
    }
    
    return articleRef.id;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Generate a unique ID
    const articleId = generateId();
    
    // Prepare data with timestamps and user info
    const timestamp = createTimestamp();
    const finalArticleData: NewsArticleFirestore = {
      ...articleData,
      id: articleId,
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
      status: articleData.status || 'published',
    };
    
    // Save to localStorage
    const existingArticles = getLocalNewsArticles();
    saveLocalNewsArticles([...existingArticles, finalArticleData]);
    
    return articleId;
  }
}

/**
 * Updates an existing news article in Firestore or localStorage
 */
export async function updateNewsArticle(
  articleId: string, 
  articleData: Partial<NewsArticleFirestore>, 
  user: User
): Promise<void> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Get reference to the article document
    const articleRef = doc(db, 'news-articles', articleId);
    
    // Prepare update data with timestamp and user info
    const updateData = {
      ...articleData,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    };
    
    // Update the document
    await updateDoc(articleRef, updateData);
    
    // Also update in localStorage for redundancy
    try {
      const existingArticles = getLocalNewsArticles();
      const articleIndex = existingArticles.findIndex(article => article.id === articleId);
      
      if (articleIndex !== -1) {
        existingArticles[articleIndex] = {
          ...existingArticles[articleIndex],
          ...articleData,
          updatedAt: createTimestamp(),
          lastUpdatedBy: {
            uid: user.uid,
            displayName: user.displayName || 'Unknown User',
          },
        };
        
        saveLocalNewsArticles(existingArticles);
      }
    } catch (localError) {
      console.warn('Failed to update article in localStorage (minor issue):', localError);
    }
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Update in localStorage
    const existingArticles = getLocalNewsArticles();
    const articleIndex = existingArticles.findIndex(article => article.id === articleId);
    
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    // Update the article
    existingArticles[articleIndex] = {
      ...existingArticles[articleIndex],
      ...articleData,
      updatedAt: createTimestamp(),
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    };
    
    saveLocalNewsArticles(existingArticles);
  }
}

/**
 * Soft deletes (archives) a news article
 */
export async function deleteNewsArticle(articleId: string, user: User): Promise<void> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Get reference to the article document
    const articleRef = doc(db, 'news-articles', articleId);
    
    // Update to mark as archived
    await updateDoc(articleRef, {
      status: 'archived',
      updatedAt: serverTimestamp(),
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    });
    
    // Also update in localStorage for redundancy
    try {
      const existingArticles = getLocalNewsArticles();
      const articleIndex = existingArticles.findIndex(article => article.id === articleId);
      
      if (articleIndex !== -1) {
        existingArticles[articleIndex] = {
          ...existingArticles[articleIndex],
          status: 'archived',
          updatedAt: createTimestamp(),
          lastUpdatedBy: {
            uid: user.uid,
            displayName: user.displayName || 'Unknown User',
          },
        };
        
        saveLocalNewsArticles(existingArticles);
      }
    } catch (localError) {
      console.warn('Failed to archive article in localStorage (minor issue):', localError);
    }
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Update in localStorage
    const existingArticles = getLocalNewsArticles();
    const articleIndex = existingArticles.findIndex(article => article.id === articleId);
    
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    // Mark as archived
    existingArticles[articleIndex] = {
      ...existingArticles[articleIndex],
      status: 'archived',
      updatedAt: createTimestamp(),
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    };
    
    saveLocalNewsArticles(existingArticles);
  }
}

/**
 * Unarchives a news article
 */
export async function unarchiveNewsArticle(
  articleId: string, 
  user: User, 
  newStatus: 'published' | 'draft' = 'published'
): Promise<void> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Get reference to the article document
    const articleRef = doc(db, 'news-articles', articleId);
    
    // Update to unarchive
    await updateDoc(articleRef, {
      status: newStatus,
      updatedAt: serverTimestamp(),
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    });
    
    // Also update in localStorage for redundancy
    try {
      const existingArticles = getLocalNewsArticles();
      const articleIndex = existingArticles.findIndex(article => article.id === articleId);
      
      if (articleIndex !== -1) {
        existingArticles[articleIndex] = {
          ...existingArticles[articleIndex],
          status: newStatus,
          updatedAt: createTimestamp(),
          lastUpdatedBy: {
            uid: user.uid,
            displayName: user.displayName || 'Unknown User',
          },
        };
        
        saveLocalNewsArticles(existingArticles);
      }
    } catch (localError) {
      console.warn('Failed to unarchive article in localStorage (minor issue):', localError);
    }
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Update in localStorage
    const existingArticles = getLocalNewsArticles();
    const articleIndex = existingArticles.findIndex(article => article.id === articleId);
    
    if (articleIndex === -1) {
      throw new Error('Article not found');
    }
    
    // Unarchive
    existingArticles[articleIndex] = {
      ...existingArticles[articleIndex],
      status: newStatus,
      updatedAt: createTimestamp(),
      lastUpdatedBy: {
        uid: user.uid,
        displayName: user.displayName || 'Unknown User',
      },
    };
    
    saveLocalNewsArticles(existingArticles);
  }
}

/**
 * Retrieves a news article by ID
 */
export async function getNewsArticle(articleId: string): Promise<NewsArticleFirestore | null> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Get reference to the article document
    const articleRef = doc(db, 'news-articles', articleId);
    const articleDoc = await getDoc(articleRef);
    
    if (articleDoc.exists()) {
      return articleDoc.data() as NewsArticleFirestore;
    }
    
    return null;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Look up in localStorage
    const existingArticles = getLocalNewsArticles();
    const article = existingArticles.find(article => article.id === articleId);
    
    return article || null;
  }
}

/**
 * Retrieves a news article by slug
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticleFirestore | null> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Query for articles with the given slug
    const articlesCollection = collection(db, 'news-articles');
    const q = query(articlesCollection, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as NewsArticleFirestore;
    }
    
    return null;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Look up in localStorage
    const existingArticles = getLocalNewsArticles();
    const article = existingArticles.find(article => article.slug === slug);
    
    return article || null;
  }
}

/**
 * Retrieves all news articles
 */
export async function getAllNewsArticles(includeArchived: boolean = false): Promise<NewsArticleFirestore[]> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Query for articles, latest first
    const articlesCollection = collection(db, 'news-articles');
    const constraints = [];
    
    // If not including archived, filter them out
    if (!includeArchived) {
      constraints.push(where('status', '!=', 'archived'));
    }
    
    // Order by createdAt (most recent first)
    constraints.push(orderBy('createdAt', 'desc'));
    
    const q = query(articlesCollection, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const articles: NewsArticleFirestore[] = [];
    
    querySnapshot.forEach((doc) => {
      articles.push(doc.data() as NewsArticleFirestore);
    });
    
    return articles;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get from localStorage
    const existingArticles = getLocalNewsArticles();
    
    // Filter out archived if needed
    const filteredArticles = includeArchived 
      ? existingArticles 
      : existingArticles.filter(article => article.status !== 'archived');
    
    // Sort by createdAt timestamp (most recent first)
    return filteredArticles.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }
}

/**
 * Retrieves news articles by category
 */
export async function getNewsArticlesByCategory(category: 'news' | 'features' | 'guides'): Promise<NewsArticleFirestore[]> {
  try {
    // First check if Firestore is available
    if (!isFirestoreAvailable) {
      await checkFirestoreConnectivity();
    }
    
    if (!isFirestoreAvailable || !db) {
      throw new Error('Using localStorage fallback');
    }
    
    // Query for articles in the given category, excluding archived
    const articlesCollection = collection(db, 'news-articles');
    const q = query(
      articlesCollection, 
      where('category', '==', category),
      where('status', '!=', 'archived'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const articles: NewsArticleFirestore[] = [];
    
    querySnapshot.forEach((doc) => {
      articles.push(doc.data() as NewsArticleFirestore);
    });
    
    return articles;
  } catch (error) {
    console.error('Firestore error, using localStorage fallback:', error);
    isFirestoreAvailable = false;
    
    // Get from localStorage
    const existingArticles = getLocalNewsArticles();
    
    // Filter by category and exclude archived
    const filteredArticles = existingArticles.filter(
      article => article.category === category && article.status !== 'archived'
    );
    
    // Sort by createdAt timestamp (most recent first)
    return filteredArticles.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0;
      const bTime = b.createdAt?.seconds || 0;
      return bTime - aTime;
    });
  }
}

/**
 * Generates a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
} 