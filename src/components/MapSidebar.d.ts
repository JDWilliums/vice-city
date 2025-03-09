import { FC } from 'react';

declare const MapSidebar: FC<{
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
  }>;
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}>;

export default MapSidebar; 