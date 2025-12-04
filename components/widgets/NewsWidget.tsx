
import React, { useState, useEffect, useCallback } from 'react';
import { getNewsSummary } from '../../services/geminiService';
import RefreshIcon from '../icons/RefreshIcon';

const NewsWidget: React.FC = () => {
  const [news, setNews] = useState<{ summary: string; sources: any[] }>({ summary: '', sources: [] });
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    const newsData = await getNewsSummary();
    setNews(newsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full">
      {loading ? (
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto pr-2">
          <div 
            className="prose prose-invert prose-sm text-gray-300" 
            dangerouslySetInnerHTML={{ __html: news.summary.replace(/\n/g, '<br />') }}
          />
          {news.sources.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">출처</h4>
              <ul className="text-xs list-none mt-2 space-y-1">
                {news.sources.map((source, index) => (
                  <li key={index}>
                    <a 
                      href={source.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 truncate block"
                      title={source.web.title}
                    >
                      {source.web.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="text-right mt-2">
        <button
          onClick={fetchNews}
          className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="새 뉴스 가져오기"
          disabled={loading}
        >
          <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default NewsWidget;
