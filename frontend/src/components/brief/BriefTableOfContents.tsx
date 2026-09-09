'use client';

import React from 'react';
import { SECTION_ORDER, SECTION_TITLES } from '@/lib/utils/export-brief';
import type { CritiqueIssue } from '@/lib/api/types';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';

interface BriefTableOfContentsProps {
  activeSectionKey: string | null;
  onSelectSection: (key: string) => void;
  critiqueIssues?: CritiqueIssue[];
  modifiedSectionKeys?: Set<string>;
}

export const BriefTableOfContents: React.FC<BriefTableOfContentsProps> = ({
  activeSectionKey,
  onSelectSection,
  critiqueIssues = [],
  modifiedSectionKeys = new Set(),
}) => {
  return (
    <nav className="sticky top-24 space-y-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Table of Contents
        </h4>
        <span className="text-[11px] font-mono text-zinc-500">11 Sections</span>
      </div>

      <ul className="space-y-1 text-xs">
        {SECTION_ORDER.map((key, idx) => {
          const title = SECTION_TITLES[key] || key;
          const isActive = activeSectionKey === key;
          const isModified = modifiedSectionKeys.has(key);

          const sectionIssues = critiqueIssues.filter((i) => i.section_key === key);
          const hasCritical = sectionIssues.some((i) => i.severity === 'critical');
          const hasWarning = sectionIssues.some((i) => i.severity === 'warning');

          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelectSection(key)}
                className={`w-full text-left px-2.5 py-2 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-200 border border-indigo-500/30 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`text-[10px] font-mono shrink-0 w-4 h-4 rounded flex items-center justify-center ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className="truncate">{title}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isModified && (
                    <span
                      title="Modified by editor"
                      className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    />
                  )}
                  {hasCritical ? (
                    <AlertCircle className="w-3 h-3 text-rose-400" />
                  ) : hasWarning ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
