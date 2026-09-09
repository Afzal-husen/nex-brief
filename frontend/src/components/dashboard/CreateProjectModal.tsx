'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, ApiError } from '@/lib/api/client';
import type { Project } from '@/lib/api/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setErrorMsg(null);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setErrorMsg('Project title is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const created = await apiClient.projects.create({
        title: cleanTitle,
        description: description.trim() || null,
      });

      toast.success('Project created', `"${created.title}" is ready for discovery input.`);
      resetForm();
      onClose();

      if (onCreated) {
        onCreated(created);
      }

      router.push(`/projects/${created.id}`);
    } catch (err) {
      const detail =
        err instanceof ApiError ? err.detail : 'Failed to create project. Please try again.';
      setErrorMsg(detail);
      toast.error('Creation failed', detail);
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Discovery Project"
      description="Initialize a new project workspace to ingest call transcripts and synthesize briefs."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <div>
          <label
            htmlFor="project-title"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Project Title <span className="text-red-400">*</span>
          </label>
          <input
            id="project-title"
            type="text"
            required
            autoFocus
            disabled={isSubmitting}
            placeholder="e.g. Acme Corp Mobile App Redesign"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="project-description"
            className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5"
          >
            Description <span className="text-zinc-500 text-[10px] normal-case font-normal">(Optional)</span>
          </label>
          <textarea
            id="project-description"
            rows={3}
            disabled={isSubmitting}
            placeholder="Brief scope notes or client context..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800/80">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
