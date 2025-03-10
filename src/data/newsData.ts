// Define the NewsArticle type
export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  author: string;
  date: string;
  category: 'news' | 'features' | 'guides';
  imageUrl: string;
  excerpt: string;
  content: string;
}

// Sample news articles
export const newsArticles: NewsArticle[] = [
  {
    id: 1,
    title: 'Rockstar Confirms GTA 6 Will Feature Two Playable Protagonists',
    slug: 'rockstar-confirms-two-protagonists',
    author: 'Mike Johnson',
    date: '2023-12-09',
    category: 'news',
    imageUrl: '/article.jpg',
    excerpt: 'In a recent press release, Rockstar Games has confirmed that GTA 6 will feature two playable protagonists, Lucia and Jason, in a Bonnie and Clyde-inspired story.',
    content: `
# Rockstar Confirms GTA 6 Will Feature Two Playable Protagonists

In a recent press release, Rockstar Games has officially confirmed that Grand Theft Auto VI will feature two playable protagonists, Lucia and Jason, in what appears to be a Bonnie and Clyde-inspired criminal saga set in the Vice City metropolitan area.

The announcement comes following the explosive debut trailer that broke records with over 90 million views in 24 hours. While the trailer had already introduced both characters, this confirmation provides more insight into the game's structure and narrative approach.

## Dual Protagonist System

According to Rockstar, players will be able to switch between Lucia and Jason throughout the game, similar to how GTA V handled its three protagonists but with deeper character development and more intertwined storylines.

"We wanted to tell a more intimate story this time," said Sam Houser, President of Rockstar Games. "Having two protagonists with a close relationship allows us to explore themes and dynamics we haven't before in the series. It's still GTA, but with a new emotional core."

## Inspired by Bonnie and Clyde

The characters' relationship appears to be inspired by the infamous criminal couple Bonnie and Clyde, with Lucia and Jason seemingly embarking on a crime spree across the state of Leonida.

The trailer already gave us a glimpse of this dynamic, showing the pair robbing a convenience store together and Lucia being arrested at some point, potentially setting up a prison break or post-prison storyline.

## Vice City Return

The confirmation also officially establishes that the game will be set in Vice City and surrounding areas, marking the first return to the Miami-inspired location since 2006's Vice City Stories.

The expanded map will include not just the city itself but also surrounding swamplands, beaches, and smaller towns, making it the most diverse GTA setting yet.

More details are expected to be revealed in the coming months as we approach the game's expected release date in Fall 2025.
    `
  },
  {
    id: 2,
    title: 'Vice City Map Revealed: Largest Open World in GTA History',
    slug: 'vice-city-map-revealed',
    author: 'Sarah Martinez',
    date: '2023-12-07',
    category: 'news',
    imageUrl: '/images/gta6map.jpg',
    excerpt: 'Rockstar Games has released the first official map of Vice City, confirming it will be the largest open world in the series history with multiple regions and biomes.',
    content: 'Full article content would go here...'
  },
  {
    id: 3,
    title: 'Breaking Down Every Scene in the GTA 6 Trailer',
    slug: 'gta6-trailer-breakdown',
    author: 'Tom Wilson',
    date: '2023-12-05',
    category: 'features',
    imageUrl: '/characters.png',
    excerpt: 'Our frame-by-frame analysis of the GTA 6 trailer reveals hidden details, Easter eggs, and hints about gameplay features you might have missed.',
    content: 'Full article content would go here...'
  },
  {
    id: 4,
    title: 'GTA 6 Economy System Will Feature Stock Market and Crypto',
    slug: 'gta6-economy-system',
    author: 'Alex Chen',
    date: '2023-12-02',
    category: 'news',
    imageUrl: '/stonks.png',
    excerpt: 'Sources close to Rockstar Games reveal that GTA 6 will feature an expanded economy system including a stock market, cryptocurrency trading, and property management.',
    content: 'Full article content would go here...'
  },
  {
    id: 5,
    title: 'The Evolution of Vice City: From GTA Vice City to GTA 6',
    slug: 'evolution-of-vice-city',
    author: 'Emma Davis',
    date: '2023-11-30',
    category: 'features',
    imageUrl: '/images/evolution.png',
    excerpt: 'We explore how Vice City has evolved from its 2002 debut to its newest incarnation in GTA 6, comparing locations, architectural styles, and cultural references.',
    content: 'Full article content would go here...'
  },
  {
    id: 6,
    title: 'All Vehicle Brands Confirmed for GTA 6 So Far',
    slug: 'gta6-vehicle-brands',
    author: 'Ryan Parker',
    date: '2023-11-28',
    category: 'guides',
    imageUrl: '/news/gta6-vehicles.jpg',
    excerpt: 'A comprehensive list of all the vehicle brands and models spotted in trailers and promotional materials for Grand Theft Auto VI.',
    content: 'Full article content would go here...'
  },
  {
    id: 7,
    title: 'Social Media Reactions: GTA 6 Becoming Most Hyped Game in History',
    slug: 'gta6-social-media-reactions',
    author: 'Mia Roberts',
    date: '2023-11-25',
    category: 'news',
    imageUrl: '/news/social-media-reactions.jpg',
    excerpt: 'Analysis of social media data shows GTA 6 is on track to become the most anticipated video game in history, breaking engagement records across platforms.',
    content: 'Full article content would go here...'
  },
  {
    id: 8,
    title: 'Interview: Former Rockstar Developer on Creating the GTA 6 World',
    slug: 'rockstar-developer-interview',
    author: 'James Thompson',
    date: '2023-11-22',
    category: 'features',
    imageUrl: '/news/developer-interview.jpg',
    excerpt: 'In an exclusive interview, a former Rockstar developer shares insights into the process of creating the massive open world of GTA 6 and the challenges faced.',
    content: 'Full article content would go here...'
  },
  {
    id: 9,
    title: "Beginner's Guide to the GTA VI Reveal: What We Know So Far",
    slug: 'gta6-beginners-guide',
    author: 'Lisa Walker',
    date: '2023-11-20',
    category: 'guides',
    imageUrl: '/news/beginners-guide.jpg',
    excerpt: 'New to the GTA series or just catching up? This comprehensive guide covers everything we know about GTA VI so far, from confirmed features to credible rumors.',
    content: 'Full article content would go here...'
  },
  {
    id: 10,
    title: 'GTA 6 Weather System Will Feature Hurricanes and Storms',
    slug: 'gta6-weather-system',
    author: 'Carlos Mendez',
    date: '2023-11-18',
    category: 'news',
    imageUrl: '/news/weather-system.jpg',
    excerpt: 'Rockstar Games has confirmed that GTA 6 will feature the most advanced weather system in the series, including hurricanes, tropical storms, and flooding in Vice City.',
    content: 'Full article content would go here...'
  }
]; 