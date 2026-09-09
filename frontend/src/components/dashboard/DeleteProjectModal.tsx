'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api/client';
import type { Project } from '@/lib/api/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export interface DeleteProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  project,
  isOpen,
  onClose,
  onDeleted,
}) => {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!project) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await apiClient.projects.delete(project.id);
      toast.success('Project deleted', `"${project.title}" was permanently removed.`);
      onDeleted();
      onClose();
    } catch (err) {
      const detail =
        err instanceof ApiError ? err.detail : 'Failed to delete project. Please try again.';
      toast.error('Deletion failed', detail);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isDeleting) onClose();
      }}
      maxWidth="sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-semibold text-zinc-100 mb-2">Delete Project?</h3>

        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Are you sure you want to permanently delete{' '}
          <span className="font-semibold text-zinc-200">&quot;{project.title}&quot;</span>? All
          uploaded transcripts, extractions, checkpoints, and synthesized briefs will be
          unrecoverable.
        </p>

        <div className="flex items-center justify-center gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isDeleting}
            className="w-1/2"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            isLoading={isDeleting}
            onClick={handleDelete}
            className="w-1/2"
          >
            Delete Project
          </Button>
        </div>
      </div>
    </Modal>
  );
};
