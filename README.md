# GTA 6 Map & Wiki

![GTA 6 Map & Wiki](public/logo-wp.png)

An interactive map and comprehensive wiki for Grand Theft Auto VI, built with Next.js, React, and Tailwind CSS.

## 🎮 Features

- **Interactive Map**: Explore the GTA 6 world with an interactive map powered by Leaflet.js
- **Custom Map Markers**: Categorized markers for missions, collectibles, stores, and more
- **Comprehensive Wiki**: Detailed information about characters, missions, locations, vehicles, and more
- **Modern UI**: Beautiful and intuitive interface with GTA-themed styling
- **Fully Responsive**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom GTA-themed color scheme
- **Map Library**: Leaflet.js with React Leaflet
- **Animations**: Custom CSS animations for an immersive experience
- **Backend**: Firebase Firestore for database and Firebase Auth for authentication

## 📝 Project Structure

- `/src/app`: Next.js app directory with page components
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and shared logic 
- `/src/styles`: Global styles and Tailwind configuration
- `/src/types`: TypeScript type definitions
- `/public`: Static assets including logos and map images

## 🔍 Logging and Debugging

The project uses a centralized logging utility to control debug output in different environments:

- **Development Environment**: Detailed logs for debugging are displayed
- **Production Environment**: Only essential error logs are shown, debug logs are disabled
- **How to Use**:
  ```typescript
  import logger from '@/utils/logger';
  
  // Debug logs - only shown in development
  logger.debug('This is a debug message');
  
  // Info logs - only shown in development
  logger.info('This is an info message');
  
  // Warning logs - shown in both environments
  logger.warn('This is a warning message');
  
  // Error logs - always shown
  logger.error('This is an error message');
  ```

- **Security**: The logging system prevents sensitive information from being exposed in production
- **Customization**: You can enable debug mode in production for testing by setting localStorage.debugMode = 'true' in the browser console

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v14 or newer) and npm installed on your machine.

### Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/gta6-map-wiki.git
   cd gta6-map-wiki
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🚀 Deployment on Vercel

This project is configured for seamless deployment on Vercel.

### One-Click Deployment

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Visit [Vercel](https://vercel.com/new) and import your repository
3. Vercel will automatically detect Next.js and configure the build settings
4. Click "Deploy" and your site will be live in minutes!

### Using Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. From your project directory, run:
   ```
   vercel
   ```

3. Follow the prompts to link to your Vercel account and project

4. For production deployment, use:
   ```
   vercel --prod
   ```

### Environment Variables

If your project uses environment variables, make sure to add them in the Vercel project settings:
1. Go to your project on Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add any required environment variables

## 📷 Screenshots

### Home Page
![Home Page](https://via.placeholder.com/800x400?text=GTA+6+Home+Page)

### Interactive Map
![Interactive Map](https://via.placeholder.com/800x400?text=GTA+6+Interactive+Map)

### Wiki Page
![Wiki Page](https://via.placeholder.com/800x400?text=GTA+6+Wiki+Page)

## 🔮 Future Plans

- Add more detailed map data as official GTA 6 information becomes available
- Implement user authentication for contributions
- Add a search feature across all wiki content
- Create mobile app versions

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This is a fan-made project and is not affiliated with Rockstar Games or Take-Two Interactive. Grand Theft Auto and all related marks are trademarks of Take-Two Interactive and/or its subsidiaries.

All game content, artwork, and trademarks belong to their respective owners. 