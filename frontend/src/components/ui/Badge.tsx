'use client';

import React from 'react';
import type { ProjectStatus } from '@/lib/api/types';

export interface BadgeProps {
  status: ProjectStatus;
  className?: string;
  showPulse?: boolean;
}

interface StatusConfig {
  label: string;
  styles: string;
  dotColor: string;
  pulse: boolean;
}

const statusMap: Record<ProjectStatus, StatusConfig> = {
  created: {
    label: 'Created',
    styles: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80',
    dotColor: 'bg-zinc-400',
    pulse: false,
  },
  analyzing: {
    label: 'Analyzing Call',
    styles: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    dotColor: 'bg-indigo-400',
    pulse: true,
  },
  awaiting_clarification: {
    label: 'Needs Clarification',
    styles: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dotColor: 'bg-amber-400',
    pulse: false,
  },
  synthesizing: {
    label: 'Synthesizing Brief',
    styles: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dotColor: 'bg-purple-400',
    pulse: true,
  },
  ready_for_review: {
    label: 'Ready for Review',
    styles: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-400',
    pulse: false,
  },
  approved: {
    label: 'Approved Brief',
    styles: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dotColor: 'bg-emerald-400',
    pulse: false,
  },
};

export const Badge: React.FC<BadgeProps> = ({ status, className = '', showPulse = true }) => {
  const config = statusMap[status] || {
    label: status,
    styles: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    dotColor: 'bg-zinc-400',
    pulse: false,
  };

  const hasPulse = showPulse && config.pulse;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${config.styles} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {hasPulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotColor}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dotColor}`} />
      </span>
      <span>{config.label}</span>
    </span>
  );
};
