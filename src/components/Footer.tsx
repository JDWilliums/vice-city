'use client';

import Link from 'next/link';
import Image from 'next/image';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-t from-gray-900 via-gray-800 to-gray-900 text-white border-t border-gta-blue/30 overflow-hidden relative">
      {/* Abstract graphic elements for visual interest */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-5 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-gta-pink"></div>
        <div className="absolute bottom-20 right-20 w-60 h-60 rounded-full bg-gta-blue"></div>
        <div className="absolute top-20 right-10 w-20 h-20 rounded-full bg-gta-pink"></div>
      </div>
      
      <div className="container-custom py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo-wp.png" 
                alt="GTA 6 Wiki" 
                width={150} 
                height={50} 
                className="h-10 w-auto mb-3 hover:opacity-90 transition-opacity" 
              />
            </Link>
            <p className="mt-4 text-gray-300">
              The ultimate resource for GTA VI with an interactive map and comprehensive wiki.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gta-pink">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/map" className="text-gray-300 hover:text-gta-blue transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-blue mr-2 transition-all duration-200"></span>
                  Interactive Map
                </Link>
              </li>
              <li>
                <Link href="/wiki" className="text-gray-300 hover:text-gta-pink transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-pink mr-2 transition-all duration-200"></span>
                  Wiki
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-gray-300 hover:text-gta-green transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-green mr-2 transition-all duration-200"></span>
                  News & Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Content links */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gta-pink">Content</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/wiki/characters" className="text-gray-300 hover:text-gta-pink transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-pink mr-2 transition-all duration-200"></span>
                  Characters
                </Link>
              </li>
              <li>
                <Link href="/wiki/missions" className="text-gray-300 hover:text-gta-pink transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-pink mr-2 transition-all duration-200"></span>
                  Missions
                </Link>
              </li>
              <li>
                <Link href="/wiki/vehicles" className="text-gray-300 hover:text-gta-pink transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-pink mr-2 transition-all duration-200"></span>
                  Vehicles
                </Link>
              </li>
              <li>
                <Link href="/wiki/weapons" className="text-gray-300 hover:text-gta-pink transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-pink mr-2 transition-all duration-200"></span>
                  Weapons
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gta-pink">Connect</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-gta-green transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-green mr-2 transition-all duration-200"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-gta-green transition-colors flex items-center group">
                  <span className="w-1 h-0 group-hover:h-4 bg-gta-green mr-2 transition-all duration-200"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} vice.city - an independent fan site not affiliated with Rockstar Games, Take-Two Interactive, or their subsidiaries. All trademarks and content belong to their respective owners.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="https://x.com/vicedotcity" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
              <span className="sr-only">X / Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@vicedotcity" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
              <span className="sr-only">YouTube</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://discord.gg/rGqyNP4AC6" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
              <span className="sr-only">Discord</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286z" />
              </svg>
            </a>
            <a href="https://instagram.com/vicedotcity" className="text-gray-400 hover:text-white transition-colors hover:scale-110 transform duration-200">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 18 18" aria-hidden="true">
                <path fillRule="evenodd" d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 