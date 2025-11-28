
import React from 'react';
import type { Website } from '../types';
import WebsiteCard from './WebsiteCard';

interface WebsiteListProps {
  websites: Website[];
  onDelete: (id: string) => void;
}

const WebsiteList: React.FC<WebsiteListProps> = ({ websites, onDelete }) => {
  if (websites.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
        <h3 className="text-2xl font-semibold text-slate-300">No Websites Yet!</h3>
        <p className="mt-2 text-slate-400">Click on "New Website" to generate your first website idea with AI.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {websites.map(website => (
        <WebsiteCard key={website.id} website={website} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default WebsiteList;
