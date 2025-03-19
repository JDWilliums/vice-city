import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { WikiPageFirestore, WikiPageDetail } from './wikiFirestoreService';

/**
 * Fixes badge colors for all wiki pages in Firestore
 */
export async function fixBadgeColors(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    console.log('Starting badge color fix for wiki pages...');
    
    // Get all published wiki pages that have details
    const pagesRef = collection(db, 'wiki-pages');
    const q = query(pagesRef, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);
    
    let updatedCount = 0;
    
    // Process each page
    const updatePromises = querySnapshot.docs.map(async (docSnapshot) => {
      const pageData = docSnapshot.data() as WikiPageFirestore;
      const pageId = docSnapshot.id;
      
      // Skip pages without details
      if (!pageData.details || pageData.details.length === 0) {
        return;
      }
      
      let needsUpdate = false;
      
      // Fix badge colors
      const updatedDetails = pageData.details.map((detail: WikiPageDetail) => {
        // Only process badge type details
        if (detail.type !== 'badge') {
          return detail;
        }
        
        // Check if badge color is missing or undefined
        if (!detail.badgeColor) {
          needsUpdate = true;
          
          // Assign appropriate color based on the value and label
          if (detail.label === 'Status') {
            if (detail.value.toLowerCase().includes('alive') || 
                detail.value.toLowerCase().includes('active') ||
                detail.value.toLowerCase().includes('available')) {
              return { ...detail, badgeColor: 'green' };
            } else if (detail.value.toLowerCase().includes('dead') ||
                       detail.value.toLowerCase().includes('inactive') ||
                       detail.value.toLowerCase().includes('wanted')) {
              return { ...detail, badgeColor: 'red' };
            } else if (detail.value.toLowerCase().includes('missing') ||
                       detail.value.toLowerCase().includes('unknown')) {
              return { ...detail, badgeColor: 'yellow' };
            }
          }
          
          // Default to blue for other cases
          return { ...detail, badgeColor: 'blue' };
        }
        
        return detail;
      });
      
      // Only update if changes were made
      if (needsUpdate) {
        console.log(`Fixing badge colors for page: ${pageData.title} (${pageId})`);
        await updateDoc(doc(db, 'wiki-pages', pageId), { details: updatedDetails });
        updatedCount++;
      }
    });
    
    // Wait for all updates to complete
    await Promise.all(updatePromises);
    
    console.log(`Badge color fix completed. Updated ${updatedCount} pages.`);
    return { success: true, count: updatedCount };
  } catch (error) {
    console.error('Error fixing badge colors:', error);
    return { 
      success: false, 
      count: 0, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
} 