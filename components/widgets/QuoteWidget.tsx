
import React, { useState, useEffect, useCallback } from 'react';
import { getInspirationalQuote } from '../../services/geminiService';
import RefreshIcon from '../icons/RefreshIcon';

const QuoteWidget: React.FC = () => {
  const [quote, setQuote] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    const newQuote = await getInspirationalQuote();
    setQuote(newQuote);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col h-full">
      {loading ? (
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <blockquote className="flex-grow flex items-center justify-center text-center">
          <p className="text-lg italic text-gray-200">"{quote}"</p>
        </blockquote>
      )}
      <div className="text-right mt-4">
        <button
          onClick={fetchQuote}
          className="p-2 rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="새 명언 가져오기"
          disabled={loading}
        >
          <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};

export default QuoteWidget;
