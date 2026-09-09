'use client';

import React from 'react';
import { FolderGit2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Project } from '@/lib/api/types';

export interface ProjectMetricsProps {
  projects: Project[];
}

export const ProjectMetrics: React.FC<ProjectMetricsProps> = ({ projects }) => {
  const total = projects.length;
  const inProgress = projects.filter(
    (p) => p.status === 'analyzing' || p.status === 'synthesizing'
  ).length;
  const needsClarification = projects.filter(
    (p) => p.status === 'awaiting_clarification'
  ).length;
  const approved = projects.filter((p) => p.status === 'approved').length;

  const metrics = [
    {
      label: 'Total Projects',
      value: total,
      icon: <FolderGit2 className="w-4 h-4 text-zinc-400" />,
      color: 'text-zinc-100',
    },
    {
      label: 'In Progress',
      value: inProgress,
      icon: <Loader2 className={`w-4 h-4 text-indigo-400 ${inProgress > 0 ? 'animate-spin' : ''}`} />,
      color: inProgress > 0 ? 'text-indigo-400 font-semibold' : 'text-zinc-300',
    },
    {
      label: 'Needs Clarification',
      value: needsClarification,
      icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
      color: needsClarification > 0 ? 'text-amber-400 font-semibold' : 'text-zinc-300',
    },
    {
      label: 'Approved Briefs',
      value: approved,
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      color: approved > 0 ? 'text-emerald-400 font-semibold' : 'text-zinc-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {metrics.map((m, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-zinc-900/70 border border-zinc-800/80 shadow-sm"
        >
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-400">{m.label}</span>
            <span className={`text-xl sm:text-2xl font-bold mt-1 ${m.color}`}>
              {m.value}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-zinc-800/60 border border-zinc-750/50">
            {m.icon}
          </div>
        </div>
      ))}
    </div>
  );
};
