import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-700/50 py-6">
      <div className="container mx-auto px-4 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} AI Website Builder. All rights reserved.</p>
        <p className="mt-2">123 AI Avenue, Innovation City, 12345</p>
      </div>
    </footer>
  );
};

export default Footer;