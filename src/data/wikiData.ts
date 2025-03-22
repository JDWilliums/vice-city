import { WikiPageContent, WikiCategory } from '@/lib/wikiHelpers';

// Wiki categories configuration
export const WIKI_CATEGORIES: Array<{
  id: WikiCategory;
  title: string;
  description: string;
  icon: string;
  color: string;
  textColor: string;
  borderColor: string;
  shadowColor: string;
  subcategories: string[];
}> = [
  {
    id: 'characters',
    title: 'Characters',
    description: 'Information about all playable and non-playable characters in GTA VI.',
    icon: '/images/icons/characters.png',
    color: 'bg-gta-pink',
    textColor: 'text-gta-pink',
    borderColor: 'border-gta-pink',
    shadowColor: 'shadow-gta-pink/20',
    subcategories: ['Protagonists', 'Antagonists', 'Side Characters', 'Faction Leaders'],
  },
  {
    id: 'missions',
    title: 'Missions',
    description: 'Walkthroughs and guides for all main and side missions in the game.',
    icon: '/images/icons/missions.png',
    color: 'bg-gta-blue',
    textColor: 'text-gta-blue',
    borderColor: 'border-gta-blue',
    shadowColor: 'shadow-gta-blue/20',
    subcategories: ['Main Story', 'Side Missions', 'Strangers', 'Heists'],
  },
  {
    id: 'locations',
    title: 'Locations',
    description: 'Detailed information about all locations in Vice City and Leonida.',
    icon: '/images/icons/locations.png',
    color: 'bg-gta-green',
    textColor: 'text-gta-green',
    borderColor: 'border-gta-green',
    shadowColor: 'shadow-gta-green/20',
    subcategories: ['Vice City', 'Leonida', 'Landmarks', 'Hidden Areas'],
  },
  {
    id: 'vehicles',
    title: 'Vehicles',
    description: 'Stats and information about all vehicles available in GTA VI.',
    icon: '/images/icons/vehicles.png',
    color: 'bg-gta-yellow',
    textColor: 'text-gta-yellow',
    borderColor: 'border-gta-yellow',
    shadowColor: 'shadow-gta-yellow/20',
    subcategories: ['Cars', 'Motorcycles', 'Aircraft', 'Boats', 'Special Vehicles'],
  },
  {
    id: 'weapons',
    title: 'Weapons',
    description: 'Details about all weapons and combat mechanics in the game.',
    icon: '/images/icons/weapons.png',
    color: 'bg-gta-red',
    textColor: 'text-gta-red',
    borderColor: 'border-gta-red',
    shadowColor: 'shadow-gta-red/20',
    subcategories: ['Handguns', 'Shotguns', 'Assault Rifles', 'Sniper Rifles', 'Explosives', 'Melee'],
  },
  {
    id: 'activities',
    title: 'Activities',
    description: 'Guides for all side activities and mini-games in GTA VI.',
    icon: '/images/icons/activities.png',
    color: 'bg-gta-purple',
    textColor: 'text-gta-purple',
    borderColor: 'border-gta-purple',
    shadowColor: 'shadow-gta-purple/20',
    subcategories: ['Sports', 'Gambling', 'Nightlife', 'Business', 'Collectibles'],
  },
  {
    id: 'collectibles',
    title: 'Collectibles',
    description: 'Locations and guides for all collectible items in GTA VI.',
    icon: '/images/icons/collectibles.png',
    color: 'bg-gta-orange',
    textColor: 'text-gta-orange',
    borderColor: 'border-gta-orange',
    shadowColor: 'shadow-gta-orange/20',
    subcategories: ['Stashes', 'Hidden Packages', 'Unique Items', 'Achievements'],
  },
  {
    id: 'gameplay-mechanics',
    title: 'Gameplay Mechanics',
    description: 'Detailed guides on core gameplay systems and mechanics in GTA VI.',
    icon: '/images/icons/gameplaymechanics.png',
    color: 'bg-gta-teal',
    textColor: 'text-gta-teal',
    borderColor: 'border-gta-teal',
    shadowColor: 'shadow-gta-teal/20',
    subcategories: ['Character Skills', 'Combat', 'Economy', 'Wanted System', 'Stealth'],
  },
  {
    id: 'updates',
    title: 'Updates',
    description: 'Information about game updates, patches, and DLC content.',
    icon: '/images/icons/updates.png',
    color: 'bg-gta-lime',
    textColor: 'text-gta-lime',
    borderColor: 'border-gta-lime',
    shadowColor: 'shadow-gta-lime/20',
    subcategories: ['Major Updates', 'Patch Notes', 'DLC', 'Hotfixes'],
  },
  {
    id: 'gangs',
    title: 'Gangs',
    description: 'Information about criminal organizations and gangs in GTA VI.',
    icon: '/images/icons/gangs.png',
    color: 'bg-gta-crimson',
    textColor: 'text-gta-crimson',
    borderColor: 'border-gta-crimson',
    shadowColor: 'shadow-gta-crimson/20',
    subcategories: ['Vice City Gangs', 'Leonida Gangs', 'Cartels', 'Street Gangs'],
  },
  {
    id: 'media',
    title: 'Media',
    description: 'Information about in-game media, radio stations, TV shows, and internet.',
    icon: '/images/icons/media.png',
    color: 'bg-gta-indigo',
    textColor: 'text-gta-indigo',
    borderColor: 'border-gta-indigo',
    shadowColor: 'shadow-gta-indigo/20',
    subcategories: ['Radio Stations', 'TV Shows', 'Internet', 'Advertisements'],
  },
  {
    id: 'misc',
    title: 'Misc',
    description: 'Miscellaneous information about GTA VI that doesn\'t fit in other categories.',
    icon: '/images/icons/misc.png',
    color: 'bg-gta-gray',
    textColor: 'text-gta-gray',
    borderColor: 'border-gta-gray',
    shadowColor: 'shadow-gta-gray/20',
    subcategories: ['Easter Eggs', 'References', 'Cheats', 'Glitches'],
  },
];

// Sample wiki pages for development
export const SAMPLE_WIKI_PAGES: WikiPageContent[] = [
  {
    id: 'vice-city-beach',
    title: 'Vice City Beach',
    description: 'The iconic beach area of Vice City, featuring beautiful sandy shores, bustling boardwalks, and vibrant nightlife.',
    category: 'locations',
    subcategory: 'Vice City',
    content: `
# Vice City Beach

Vice City Beach is one of the most iconic locations in Grand Theft Auto VI, situated on the eastern shore of Vice City. Drawing inspiration from Miami's South Beach, this vibrant area features pristine sandy shores, crystal-blue waters, and a bustling boardwalk lined with palm trees.

## Geography

The beach stretches for approximately 3 miles along the eastern edge of Vice City, bordered by the Atlantic Ocean to the east and Ocean Drive to the west. The northern end connects to North Beach, while the southern portion leads to South Point.

## Points of Interest

- **Ocean Drive**: A strip lined with Art Deco hotels, restaurants, and clubs
- **Boardwalk**: A pedestrian walkway perfect for joggers, skaters, and tourists
- **Beach Pavilion**: Central hub with changing rooms, food vendors, and equipment rentals
- **Lifeguard Towers**: Distinctive red and white towers spaced along the beach
- **Muscle Beach**: Outdoor gym area where bodybuilders work out

## Activities

Visitors to Vice City Beach can participate in numerous activities:
- Swimming
- Volleyball (with dynamic NPC games you can join)
- Jet skiing (rental shops available)
- Parasailing
- Sunbathing (with an actual tan mechanic in the game)

## Nightlife

As the sun sets, Vice City Beach transforms into a nightlife hotspot with:
- Beachfront clubs with different music genres
- Open-air bars serving tropical cocktails
- Street performers and musicians
- Special beach parties on weekends (in-game time)
    `,
    imageUrl: '/images/locations/vice-city-beach.jpg',
    tags: ['Beach', 'Vice City', 'Landmark', 'Entertainment'],
    createdAt: '2023-12-15T12:00:00Z',
    updatedAt: '2023-12-15T12:00:00Z',
  },
  {
    id: 'luciana-porter',
    title: 'Luciana Porter',
    description: 'One of the two main protagonists of GTA VI, a skilled driver and former cartel member with a complex past.',
    category: 'characters',
    subcategory: 'Protagonists',
    content: `
# Luciana Porter

## Biography

Luciana Porter is one of the two main protagonists of Grand Theft Auto VI. Born in a small town in Leonida to a Colombian mother and American father, Luciana grew up straddling two worlds. Her early ties to South American cartels and exceptional driving skills made her valuable to various criminal organizations, but she eventually broke away to forge her own path.

## Appearance

Luciana is in her early 30s with dark hair often worn in a practical ponytail or braid. Her style is adaptable but tends toward functional clothing that doesn't restrict movement - fitted jeans, boots, and tank tops or practical shirts. She sports several tattoos representing significant life events, including a small hummingbird on her wrist symbolizing freedom.

## Personality

Luciana is pragmatic, resourceful, and often the voice of reason. She's calculating in her approach to crime, preferring to plan carefully rather than rush in. While she can be cold and efficient during jobs, she shows loyalty and warmth to her inner circle. Her sense of humor tends to be dry and sarcastic, especially when dealing with her partner-in-crime, Jason.

## Relationships

- **Jason Bennett**: Her criminal partner and the other playable protagonist. They have a complex relationship built on mutual respect and dependency, though tensions can arise from their different approaches to problem-solving.
- **Diego Mendez**: Former cartel connection who serves as both mentor and occasional antagonist.
- **Sarah Porter**: Luciana's younger sister who chose a legitimate life, creating ongoing tension.

## Skills & Abilities

- Expert driver (special driving abilities in-game)
- Fluent in English and Spanish (helps in certain mission scenarios)
- Skilled in hand-to-hand combat
- Better at stealth approaches than Jason

## Signature Missions

- "Past Lives" - A deep dive into Luciana's cartel history
- "Family Ties" - Mission involving her sister Sarah
- "Velocity" - Showcases her elite driving skills in a high-stakes chase
    `,
    imageUrl: '/images/characters/luciana-porter.png',
    tags: ['Protagonist', 'Criminal', 'Driver'],
    createdAt: '2023-12-10T14:30:00Z',
    updatedAt: '2023-12-15T16:45:00Z',
  }
];

// Function to get a wiki page by ID
export const getWikiPageById = (id: string): WikiPageContent | undefined => {
  return SAMPLE_WIKI_PAGES.find(page => page.id === id);
};

// Function to get wiki pages by category
export const getWikiPagesByCategory = (category: WikiCategory): WikiPageContent[] => {
  return SAMPLE_WIKI_PAGES.filter(page => page.category === category);
};

// Function to add a new wiki page (in a real app, this would interface with a database)
export const addWikiPage = (page: WikiPageContent): void => {
  // In a real application, this would add to a database
  SAMPLE_WIKI_PAGES.push(page);
}; 