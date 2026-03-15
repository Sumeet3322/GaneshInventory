"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChefHat, LayoutDashboard, List, BookOpen, Clock } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventory', href: '/inventory', icon: List },
    { name: 'Recipes', href: '/recipes', icon: BookOpen },
    { name: 'Cook', href: '/cook', icon: ChefHat },
    { name: 'History', href: '/history', icon: Clock },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-600 rounded-lg text-white">
              <ChefHat size={24} />
            </span>
            <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
              Ganesh<span className="text-blue-600">Inventory</span>
            </Link>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`inline-flex items-center gap-2 px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  {link.name}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
