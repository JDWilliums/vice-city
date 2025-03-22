import fs from 'fs';
import path from 'path';

// Define the wiki category types
export type WikiCategory = 
  | 'characters' 
  | 'missions' 
  | 'locations' 
  | 'vehicles' 
  | 'weapons' 
  | 'activities'
  | 'collectibles'
  | 'gameplay-mechanics'
  | 'updates'
  | 'gangs'
  | 'media'
  | 'misc';

// Wiki content interfaces
export interface WikiPageContent {
  id: string;
  title: string;
  description: string;
  category: WikiCategory;
  subcategory?: string;
  content: string;
  imageUrl?: string;
  relatedPages?: string[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Wiki page template generator
export const generateWikiMarkdown = (data: Partial<WikiPageContent>): string => {
  const {
    title = '',
    description = '',
    category = 'locations',
    subcategory = '',
    content = '',
  } = data;

  return `# ${title}

${description}

## Overview

${content || 'Add detailed content about this entry here...'}

## Details

- **Category**: ${category}${subcategory ? `\n- **Subcategory**: ${subcategory}` : ''}
- **Location**: Add location details here
- **Interactions**: Add possible interactions here

## Gallery

Add images here

## Related Pages

- Related page 1
- Related page 2
- Related page 3
`;
};

// Specific templates for each category
export const generateTemplateByCategory = (category: WikiCategory, title: string): string => {
  const templates: Record<WikiCategory, string> = {
    characters: `# ${title}

## Biography

Add character biography here...

## Appearance

Describe the character's appearance...

## Personality

Describe the character's personality traits...

## Relationships

- **Character Name**: Relationship description
- **Character Name**: Relationship description

## Missions

- Mission 1
- Mission 2
- Mission 3

## Trivia

- Interesting fact 1
- Interesting fact 2
- Interesting fact 3
`,
    locations: `# ${title}

## Geography

Describe the location's geography...

## Points of Interest

- **Point 1**: Description
- **Point 2**: Description
- **Point 3**: Description

## Activities

- Activity 1
- Activity 2
- Activity 3

## Missions and Events

- Mission 1
- Event 1
`,
    missions: `# ${title}

## Mission Overview

Brief mission description...

## Prerequisites

- Prerequisite 1
- Prerequisite 2

## Objectives

1. First objective
2. Second objective
3. Third objective

## Walkthrough

Detailed walkthrough of the mission...

## Rewards

- Reward 1
- Reward 2
- Reward 3

## Tips

- Helpful tip 1
- Helpful tip 2
`,
    vehicles: `# ${title}

## Vehicle Overview

Brief vehicle description...

## Performance

- **Speed**: X/10
- **Acceleration**: X/10
- **Handling**: X/10
- **Braking**: X/10

## Locations

- Location 1
- Location 2
- Location 3

## Modifications

- Modification 1
- Modification 2
- Modification 3
`,
    weapons: `# ${title}

## Weapon Overview

Brief weapon description...

## Stats

- **Damage**: X/10
- **Fire Rate**: X/10
- **Range**: X/10
- **Accuracy**: X/10
- **Ammo Capacity**: X rounds

## Locations

- Location 1
- Location 2
- Location 3

## Upgrades

- Upgrade 1
- Upgrade 2
- Upgrade 3
`,
    activities: `# ${title}

## Activity Overview

Brief activity description...

## How to Play

Detailed instructions on how to play or participate...

## Locations

- Location 1
- Location 2
- Location 3

## Rewards

- Reward 1
- Reward 2
- Reward 3

## Tips

- Helpful tip 1
- Helpful tip 2
`,
    collectibles: `# ${title}

## Collectible Overview

Brief collectible description...

## Locations

- Location 1
- Location 2
- Location 3

## Rewards

- Reward for collecting X
- Reward for collecting all

## Tips

- Helpful tip 1
- Helpful tip 2
- Helpful tip 3
`,
    'gameplay-mechanics': `# ${title}

## Mechanic Overview

Brief description of the gameplay mechanic...

## How It Works

Detailed explanation of how this gameplay mechanic functions...

## Tips & Strategies

- Strategy 1
- Strategy 2
- Strategy 3

## Related Mechanics

- Related mechanic 1
- Related mechanic 2
`,
    updates: `# ${title}

## Update Overview

Brief description of the update...

## Release Date

When this update was released...

## New Features

- Feature 1
- Feature 2
- Feature 3

## Bug Fixes

- Bug fix 1
- Bug fix 2
- Bug fix 3

## Patch Notes

Full patch notes for the update...
`,
    gangs: `# ${title}

## Gang Overview

Brief description of the gang...

## Territory

Where this gang operates in the game world...

## Members

- Leader: Leader name
- Notable members

## Activities

What criminal activities this gang is involved in...

## Rivals

- Rival gang 1
- Rival gang 2
`,
    media: `# ${title}

## Media Overview

Brief description of this media piece...

## Type

What type of media this is (TV show, radio station, movie, etc.)

## Content

Description of the content...

## Where to Find

Where this media can be found in-game...

## Easter Eggs

- Easter egg 1
- Easter egg 2
`,
    misc: `# ${title}

## Overview

Brief description...

## Details

- Detail 1
- Detail 2
- Detail 3

## Related Content

- Related item 1
- Related item 2
`
  };

  return templates[category] || generateWikiMarkdown({ title });
};

// Function to create the wiki page file (to be used in NodeJS environment, not client-side)
export const saveWikiPage = async (data: Partial<WikiPageContent>): Promise<boolean> => {
  try {
    // This would write to a database or file in a real application
    // For now, we'll return true to simulate success
    return true;
  } catch (error) {
    console.error('Error saving wiki page:', error);
    return false;
  }
}; 