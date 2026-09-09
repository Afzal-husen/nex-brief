'use client';

import React, { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import type { Project } from '@/lib/api/types';
import { Button } from '@/components/ui/Button';
import { ProjectMetrics } from '@/components/dashboard/ProjectMetrics';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { CreateProjectModal } from '@/components/dashboard/CreateProjectModal';

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [currentProjects, setCurrentProjects] = useState<Project[]>([]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Top Navigation / App Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-850 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 shadow-md shadow-indigo-500/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-zinc-100">
                  NexBrief
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-750">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                Epistemic Discovery to Grounded Briefs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Page Title & Mission */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
              Project Workspaces
            </h1>
            <p className="mt-1 text-sm text-zinc-400 max-w-2xl leading-relaxed">
              Transform unstructured client discovery calls into verifiable, fact-grounded
              project briefs with human sign-off at every step.
            </p>
          </div>
        </div>

        {/* Metric Summary Bar */}
        <ProjectMetrics projects={currentProjects} />

        {/* Project Grid & Filters */}
        <section aria-label="Projects">
          <ProjectGrid
            onNewProject={() => setIsCreateModalOpen(true)}
            onProjectsLoaded={setCurrentProjects}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <p>NexBrief • Strict Epistemic Grounding • FastAPI & Next.js</p>
      </footer>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
