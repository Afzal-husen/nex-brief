'use client';

import React from 'react';
import { Plus, Sparkles, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface EmptyStateProps {
  onNewProject: () => void;
  isFilterResult?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onNewProject,
  isFilterResult = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-zinc-900/40 border border-dashed border-zinc-800 my-6 animate-in fade-in duration-200">
      <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-850 border border-zinc-750 text-indigo-400 mb-4 shadow-inner">
        {isFilterResult ? (
          <FolderPlus className="w-8 h-8 text-zinc-400" />
        ) : (
          <>
            <FolderPlus className="w-8 h-8 text-indigo-400" />
            <Sparkles className="w-4 h-4 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
          </>
        )}
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-zinc-100 mb-1.5">
        {isFilterResult ? 'No matching projects found' : 'No discovery projects yet'}
      </h3>

      <p className="text-sm text-zinc-400 max-w-sm mb-6 leading-relaxed">
        {isFilterResult
          ? 'Try adjusting your search query or filter tags to find what you need.'
          : 'Create your first project to ingest client discovery transcripts, isolate grounded facts, and synthesize comprehensive project briefs.'}
      </p>

      {!isFilterResult && (
        <Button
          onClick={onNewProject}
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create First Project
        </Button>
      )}
    </div>
  );
};
