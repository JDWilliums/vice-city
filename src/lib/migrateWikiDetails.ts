import { db } from './firebase';
import { collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { WikiPageDetail } from './wikiFirestoreService';

// Default details for each category
const defaultDetails: Record<string, WikiPageDetail[]> = {
  characters: [
    { label: 'Full Name', value: '', type: 'text' },
    { label: 'Occupation', value: 'Criminal', type: 'text' },
    { label: 'Status', value: 'Alive', type: 'badge', badgeColor: 'green' },
    { label: 'Location', value: 'Vice City', type: 'text' },
    { label: 'First Appearance', value: 'Prologue', type: 'text' },
    { label: 'Affiliation', value: 'Rodriguez Cartel', type: 'link', linkHref: '/wiki/factions/rodriguez-cartel' }
  ],
  locations: [
    { label: 'Region', value: 'Leonida', type: 'text' },
    { label: 'Type', value: 'City', type: 'text' },
    { label: 'Status', value: 'Active', type: 'badge', badgeColor: 'blue' },
    { label: 'Population', value: '2.7 million', type: 'text' },
    { label: 'Activities', value: 'Various Missions', type: 'text' },
    { label: 'Related', value: 'Vice Beach', type: 'link', linkHref: '/wiki/locations/vice-beach' }
  ],
  vehicles: [
    { label: 'Manufacturer', value: 'Declasse', type: 'text' },
    { label: 'Type', value: 'Sports Car', type: 'text' },
    { label: 'Speed', value: '9/10', type: 'text' },
    { label: 'Handling', value: '8/10', type: 'text' },
    { label: 'Price', value: '$850,000', type: 'text' },
    { label: 'Similar', value: 'Infernus', type: 'link', linkHref: '/wiki/vehicles/infernus' }
  ],
  weapons: [
    { label: 'Type', value: 'Assault Rifle', type: 'text' },
    { label: 'Damage', value: '7/10', type: 'text' },
    { label: 'Rate of Fire', value: '8/10', type: 'text' },
    { label: 'Accuracy', value: '6/10', type: 'text' },
    { label: 'Price', value: '$3,500', type: 'text' },
    { label: 'Similar', value: 'Carbine Rifle', type: 'link', linkHref: '/wiki/weapons/carbine-rifle' }
  ]
};

export async function migrateWikiDetails() {
  try {
    const pagesRef = collection(db, 'wiki-pages');
    const q = query(pagesRef, where('status', '==', 'published'));
    const querySnapshot = await getDocs(q);

    console.log(`Found ${querySnapshot.docs.length} pages to migrate`);

    for (const doc of querySnapshot.docs) {
      const pageData = doc.data();
      
      // Skip if page already has details
      if (pageData.details && pageData.details.length > 0) {
        console.log(`Skipping page ${doc.id} - already has details`);
        continue;
      }

      // Get default details for the category
      const categoryDetails = defaultDetails[pageData.category] || [
        { label: 'Category', value: pageData.category.charAt(0).toUpperCase() + pageData.category.slice(1), type: 'text' },
        { label: 'ID', value: doc.id, type: 'text' },
        { label: 'Status', value: 'Available', type: 'badge', badgeColor: 'green' },
        { label: 'Added', value: new Date().toLocaleDateString(), type: 'text' }
      ];

      // Update the document with default details
      await updateDoc(doc.ref, {
        details: categoryDetails
      });

      console.log(`Updated page ${doc.id} with default details`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
} 