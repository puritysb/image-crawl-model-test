import React from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Crawler', href: '/crawler', icon: MagnifyingGlassIcon },
  { name: 'Results', href: '/results', icon: ChartBarIcon },
  { name: 'Images', href: '/images', icon: PhotoIcon },
];

const Sidebar: React.FC = () => {
  return (
    <div className="flex flex-col w-64 bg-gray-900 text-white p-4">
      <nav className="flex-1 mt-8">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md"
          >
            <item.icon className="h-6 w-6 mr-3" aria-hidden="true" />
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
