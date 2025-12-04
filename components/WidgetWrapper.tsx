import React from 'react';
import type { Project } from '../types';
import { Link } from 'react-router-dom';

interface WidgetWrapperProps {
  project: Project;
}

const WidgetWrapper: React.FC<WidgetWrapperProps> = ({ project }) => {
  return (
    <Link
      to={project.path} // website 데이터에 추가한 path 속성을 사용합니다.
      className="block bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
    >
    <article className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-shadow duration-300 flex flex-col h-full">
      <img className="w-full h-48 object-cover" src={project.imageUrl} alt={project.title} />
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-white mb-2">{project.title}</h2>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{project.description}</p>
        <p className="text-gray-500 text-xs mt-auto">생성일: {project.date}</p>
      </div>
    </article>
    </Link>
  );
};

export default WidgetWrapper;
