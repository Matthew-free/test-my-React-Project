import React, { useState, useEffect, useCallback } from 'react';
import type { Website } from './types';
import Header from './components/Header';
import WebsiteList from './components/WebsiteList';
import CreateWebsiteModal from './components/CreateWebsiteModal';
import Footer from './components/Footer';

const CATEGORIES = ['All', 'Game', 'Bike', 'Food', 'General'];

const App: React.FC = () => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('All');

  useEffect(() => {
    try {
      const storedWebsites = localStorage.getItem('my-websites');
      if (storedWebsites) {
        setWebsites(JSON.parse(storedWebsites));
      }
    } catch (error) {
      console.error("Failed to load websites from local storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('my-websites', JSON.stringify(websites));
    } catch (error) {
      console.error("Failed to save websites to local storage", error);
    }
  }, [websites]);

  const handleCreateWebsite = useCallback((newWebsite: Omit<Website, 'id' | 'imageUrl'>) => {
    setWebsites(prev => [
      ...prev,
      {
        ...newWebsite,
        id: new Date().toISOString() + Math.random(),
        imageUrl: `https://picsum.photos/seed/${Math.random()}/600/400`,
      }
    ]);
  }, []);

  const handleDeleteWebsite = useCallback((id: string) => {
    setWebsites(prev => prev.filter(website => website.id !== id));
  }, []);

  const filteredWebsites = websites.filter(website =>
    currentCategory === 'All' || website.category === currentCategory
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-white font-sans">
      <Header 
        onNewWebsiteClick={() => setIsModalOpen(true)}
        categories={CATEGORIES}
        currentCategory={currentCategory}
        onCategoryChange={setCurrentCategory}
      />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-200 mb-8">{currentCategory} Creations</h2>
        <WebsiteList websites={filteredWebsites} onDelete={handleDeleteWebsite} />
      </main>
      <CreateWebsiteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateWebsite}
      />
      <Footer />
    </div>
  );
};

export default App;