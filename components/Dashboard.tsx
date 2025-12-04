import React from 'react';
import type { Project } from '../types';
import WidgetWrapper from './WidgetWrapper';

interface DashboardProps {
  projects: Project[];
}

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {projects.map(project => (
        <WidgetWrapper key={project.id} project={project} />
      ))}
    </div>
  );
};

export default Dashboard;
