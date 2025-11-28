
import React from 'react';
import type { Website } from '../types';
import { TrashIcon } from './icons';

interface WebsiteCardProps {
  website: Website;
  onDelete: (id: string) => void;
}

const WebsiteCard: React.FC<WebsiteCardProps> = ({ website, onDelete }) => {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden group transition-all duration-300 hover:shadow-cyan-500/20 hover:-translate-y-2">
      <div className="relative">
        <img src={website.imageUrl} alt={website.title} className="w-full h-48 object-cover" />
        <span className="absolute top-3 right-3 bg-indigo-600/80 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-indigo-500/50">
          {website.category}
        </span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-slate-100 mb-2">{website.title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{website.description}</p>
      </div>
      <div className="p-4 bg-slate-800/50 flex justify-end">
         <button
          onClick={() => onDelete(website.id)}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-700 rounded-full transition-colors duration-200"
          aria-label="Delete website"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default WebsiteCard;
