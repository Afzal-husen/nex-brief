'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Calendar, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/lib/api/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

export interface ProjectCardProps {
  project: Project;
  onDelete: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onDelete }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/projects/${project.id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project);
  };

  const formattedDate = (() => {
    try {
      const date = new Date(project.created_at);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return project.created_at;
    }
  })();

  return (
    <Card
      isInteractive
      onClick={handleCardClick}
      className="group relative flex flex-col justify-between h-full bg-zinc-900/90 hover:bg-zinc-850/90 border-zinc-800/90 hover:border-zinc-700 transition-all duration-150 p-5 rounded-xl shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-zinc-100 group-hover:text-indigo-400 transition-colors line-clamp-1 flex-1">
            {project.title}
          </h3>
          <Badge status={project.status} />
        </div>

        <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed min-h-[2.5rem]">
          {project.description || (
            <span className="italic text-zinc-500">No description provided</span>
          )}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-zinc-500" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleDeleteClick}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
            aria-label={`Delete project ${project.title}`}
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="p-1.5 text-zinc-500 group-hover:text-indigo-400 transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Card>
  );
};
