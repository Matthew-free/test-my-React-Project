import React, { useState } from 'react';
import PlusIcon from './icons/PlusIcon';
import type { Project, Category } from '../types';

const TABS: Category[] = ['전체', '게임', 'MBTI'];

const NavigationBar: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Category>('전체');

    return (
        <div>
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold flex items-center">
                    나만의 웹사이트
                </h1>
            </header>

            <nav className="mb-8">
                <ul className="flex items-center space-x-2">
                    {TABS.map(tab => (
                        <li key={tab}>
                            <button
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${activeTab === tab
                                    ? 'border-blue-500 text-white'
                                    : 'border-transparent text-gray-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default NavigationBar;