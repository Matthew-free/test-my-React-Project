export type Category = '전체' | '게임' | 'MBTI';

export interface Project {
  id: number;
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  category: string;
  path: string;
}

// Fix: Add WidgetType export to resolve missing type error in components/AddWidgetModal.tsx.
export type WidgetType = 'Clock' | 'Weather' | 'Quote' | 'News' | 'Notes';

// Fix: Add Widget export to resolve missing type error in components/widgets/NotesWidget.tsx.
export interface Widget {
  id: string;
  type: WidgetType;
  data?: any;
}
