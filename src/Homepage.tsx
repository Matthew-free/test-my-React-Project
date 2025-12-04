import React, { useState, useEffect } from 'react';
import type { Project, Category } from '../types';
import Dashboard from '../components/Dashboard';

const initialProjects: Project[] = [
    {
        id: 1,
        title: '내 첫 포트폴리오',
        description: '리액트와 Tailwind로 만든 개인 프로젝트 쇼케이스',
        date: '2023-10-26',
        imageUrl: 'https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800&auto=format&fit=crop',
        category: '포트폴리오',
        path: '/1st-game',
    },
    {
        id: 2,
        title: 'MBTI 심리 테스트',
        description: '나의 진짜 MBTI 유형을 알아보는 심층 테스트',
        date: '2023-11-15',
        imageUrl: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=800&auto=format&fit=crop',
        category: 'MBTI',
        path: '/1st-game',
    },
    {
        id: 3,
        title: '인디 게임 추천',
        description: '숨겨진 명작 인디 게임들을 소개합니다.',
        date: '2024-01-08',
        imageUrl: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop',
        category: '게임',
        path: '/1st-game',
    },
    {
        id: 4,
        title: '나만의 게임 만들기',
        description: 'Unity로 만드는 나만의 2D 플랫포머 게임',
        date: '2024-03-20',
        imageUrl: 'https://images.unsplash.com/photo-1612287230202-95a041628d64?w=800&auto=format&fit=crop',
        category: '게임',
        path: '/1st-game',
    },
    {
        id: 5,
        title: 'New Page Example',
        description: 'TESTTESTTESTTESTTESTTESTTEST',
        date: '2025-03-20',
        imageUrl: 'https://images.unsplash.com/photo-1612287230202-95a041628d64?w=800&auto=format&fit=crop',
        category: '게임',
        path: '/NewPage',
    }
];

const TABS: Category[] = ['전체', '게임', 'MBTI'];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array: Project[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};


const App: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeTab, setActiveTab] = useState<Category>('전체');

    useEffect(() => {
        setProjects(shuffleArray(initialProjects));
    }, []);

    const filteredProjects = activeTab === '전체'
        ? projects
        : projects.filter(p => p.category === activeTab);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
            <main className="flex-grow">
                <Dashboard projects={filteredProjects} />
            </main>
        </div>
    );
};

export default App;