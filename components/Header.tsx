
import React from 'react';
import { PlusIcon } from './icons';

interface HeaderProps {
  onNewWebsiteClick: () => void;
  categories: string[];
  currentCategory: string;
  onCategoryChange: (category: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onNewWebsiteClick, categories, currentCategory, onCategoryChange }) => {
  return (
    <header className="sticky top-0 py-4 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex-1 flex justify-start">
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                AI Website Builder
            </h1>
        </div>
        
        <nav className="hidden md:flex flex-1 justify-center items-center gap-2 lg:gap-4">
            {categories.map(category => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentCategory === category
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
        </nav>

        <div className="flex-1 flex justify-end">
            <button
                onClick={onNewWebsiteClick}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-600/30 transition-all duration-300 transform hover:scale-105"
                >
                <PlusIcon />
                <span className="hidden sm:inline">New Website</span>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
