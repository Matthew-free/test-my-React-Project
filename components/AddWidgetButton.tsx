
import React from 'react';
import PlusIcon from './icons/PlusIcon';

interface AddWidgetButtonProps {
  onClick: () => void;
}

const AddWidgetButton: React.FC<AddWidgetButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transform hover:scale-110 transition-transform duration-200 ease-in-out z-50"
      aria-label="위젯 추가"
    >
      <PlusIcon className="w-8 h-8" />
    </button>
  );
};

export default AddWidgetButton;
