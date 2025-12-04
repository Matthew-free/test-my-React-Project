
import React from 'react';
import type { WidgetType } from '../types';
import ClockIcon from './icons/ClockIcon';
import NewsIcon from './icons/NewsIcon';
import NoteIcon from './icons/NoteIcon';
import QuoteIcon from './icons/QuoteIcon';
import WeatherIcon from './icons/WeatherIcon';
import CloseIcon from './icons/CloseIcon';


interface AddWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (type: WidgetType) => void;
}

const widgetOptions: { type: WidgetType, name: string, description: string, icon: React.FC<any> }[] = [
  { type: 'Clock', name: '시계', description: '현재 시간을 표시합니다.', icon: ClockIcon },
  { type: 'Weather', name: '날씨', description: '간단한 날씨 정보를 봅니다.', icon: WeatherIcon },
  { type: 'Quote', name: '명언', description: '영감을 주는 명언을 받습니다.', icon: QuoteIcon },
  { type: 'News', name: '뉴스', description: '최신 뉴스 요약을 확인합니다.', icon: NewsIcon },
  { type: 'Notes', name: '메모', description: '간단한 메모를 작성합니다.', icon: NoteIcon },
];

const AddWidgetModal: React.FC<AddWidgetModalProps> = ({ isOpen, onClose, onAddWidget }) => {
  if (!isOpen) return null;

  const handleAdd = (type: WidgetType) => {
    onAddWidget(type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl ring-1 ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-white/10">
          <h3 className="text-xl font-bold">위젯 추가하기</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <CloseIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgetOptions.map(option => (
            <button
              key={option.type}
              onClick={() => handleAdd(option.type)}
              className="flex items-center p-4 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-left transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="p-3 bg-indigo-600/30 rounded-lg mr-4">
                <option.icon className="w-6 h-6 text-indigo-300" />
              </div>
              <div>
                <p className="font-semibold text-white">{option.name}</p>
                <p className="text-sm text-gray-400">{option.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddWidgetModal;
