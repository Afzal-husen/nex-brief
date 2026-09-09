'use client';

import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useProjects } from '@/lib/api/hooks';
import type { Project } from '@/lib/api/types';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from './ProjectCard';
import { EmptyState } from './EmptyState';
import { DeleteProjectModal } from './DeleteProjectModal';

export interface ProjectGridProps {
  onNewProject: () => void;
  onProjectsLoaded?: (projects: Project[]) => void;
}

export const ProjectGrid: React.FC<ProjectGridProps> = ({
  onNewProject,
  onProjectsLoaded,
}) => {
  const { projects, isLoading, error, mutate } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'ready_for_review' | 'approved'>('all');
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  React.useEffect(() => {
    if (projects && onProjectsLoaded) {
      onProjectsLoaded(projects);
    }
  }, [projects, onProjectsLoaded]);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];

    return projects.filter((p) => {
      // Status filter
      if (statusFilter === 'in_progress') {
        const isActive =
          p.status === 'analyzing' ||
          p.status === 'synthesizing' ||
          p.status === 'awaiting_clarification';
        if (!isActive) return false;
      } else if (statusFilter === 'ready_for_review' && p.status !== 'ready_for_review') {
        return false;
      } else if (statusFilter === 'approved' && p.status !== 'approved') {
        return false;
      }

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title.toLowerCase().includes(q);
      const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
      return titleMatch || descMatch;
    });
  }, [projects, searchQuery, statusFilter]);

  const handleDeleteTrigger = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    mutate();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800/80 self-start sm:self-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'ready_for_review', label: 'Ready' },
            { id: 'approved', label: 'Approved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-300">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error.detail || 'Unable to connect to backend server. Make sure FastAPI is running.'}</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={() => mutate()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-3/5 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content states */}
      {!isLoading && !error && projects && (
        <>
          {projects.length === 0 ? (
            <EmptyState onNewProject={onNewProject} />
          ) : filteredProjects.length === 0 ? (
            <EmptyState isFilterResult onNewProject={onNewProject} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onDelete={handleDeleteTrigger}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        project={projectToDelete}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onDeleted={handleDeleteSuccess}
      />
    </div>
  );
};
