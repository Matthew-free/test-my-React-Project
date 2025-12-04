
import React from 'react';
import type { Widget } from '../../types';

interface NotesWidgetProps {
  widget: Widget;
  updateWidgetData: (id: string, data: any) => void;
}

const NotesWidget: React.FC<NotesWidgetProps> = ({ widget, updateWidgetData }) => {
  const content = widget.data?.content || '';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateWidgetData(widget.id, { content: e.target.value });
  };

  return (
    <textarea
      value={content}
      onChange={handleChange}
      className="w-full h-full bg-transparent text-gray-300 resize-none focus:outline-none placeholder-gray-500 text-sm"
      placeholder="여기에 메모를 입력하세요..."
    />
  );
};

export default NotesWidget;
