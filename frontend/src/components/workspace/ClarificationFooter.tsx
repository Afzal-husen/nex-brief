'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface ClarificationFooterProps {
  confirmedCount: number;
  inferredCount: number;
  contradictionCount: number;
  unknownCount: number;
  projectId: string;
}

export function ClarificationFooter({
  confirmedCount,
  inferredCount,
  contradictionCount,
  unknownCount,
  projectId,
}: ClarificationFooterProps) {
  const router = useRouter();
  const clarificationItemsCount = contradictionCount + unknownCount;

  const handleProceed = () => {
    router.push(`/projects/${projectId}/clarify`);
  };

  return (
    <footer className="sticky bottom-0 z-30 w-full bg-zinc-950/95 border-t border-zinc-800/80 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Grounding Summary Metrics */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>
              <strong className="font-bold text-zinc-100">{confirmedCount}</strong> confirmed
            </span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">&bull;</span>

          <div className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span>
              <strong className="font-bold text-zinc-100">{inferredCount}</strong> inferred
            </span>
          </div>

          <span className="text-zinc-700 hidden sm:inline">&bull;</span>

          <div className="flex items-center gap-1.5 text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>
              <strong className="font-bold text-zinc-100">{clarificationItemsCount}</strong> to clarify
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>Proceed to Clarifications ({clarificationItemsCount} items)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
