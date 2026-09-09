'use client';

import React, { useEffect } from 'react';
import { X, Quote, User, FileText } from 'lucide-react';
import { extractSurroundingTranscriptContext } from '@/lib/utils/transcript-context';

interface TranscriptContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quoteText: string;
  speaker?: string | null;
  category?: string;
  rawTranscriptText?: string;
}

export function TranscriptContextDrawer({
  isOpen,
  onClose,
  quoteText,
  speaker,
  category,
  rawTranscriptText = '',
}: TranscriptContextDrawerProps) {
  // Listen for Escape key to close drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const context = extractSurroundingTranscriptContext(rawTranscriptText, quoteText, 5);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      />

      {/* Drawer Surface */}
      <div className="relative w-full max-w-lg bg-zinc-900 border-l border-zinc-800 shadow-2xl z-10 flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
                Transcript Context
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">
                Surrounding conversation excerpt
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Quote Callout Banner */}
        <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/40 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wide px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Target Quote
              </span>
              {category && (
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                  {category.replace('_', ' ')}
                </span>
              )}
            </div>
            {speaker && (
              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400">
                <User className="w-3 h-3 text-zinc-500" />
                <span>{speaker}</span>
              </span>
            )}
          </div>

          <div className="flex items-start gap-2 text-xs text-emerald-300 font-mono italic">
            <Quote className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="line-clamp-3 leading-relaxed">&ldquo;{quoteText}&rdquo;</p>
          </div>
        </div>

        {/* Scrollable Dialogue Lines */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 font-mono text-xs select-text">
          {/* Preceding Lines */}
          {context.beforeLines.map((line, idx) => (
            <div key={`before-${idx}`} className="flex items-start gap-3 text-zinc-500 hover:text-zinc-400">
              <span className="w-6 text-right shrink-0 select-none text-zinc-600 text-[10px]">
                {context.startLineNumber + idx}
              </span>
              <p className="flex-1 leading-relaxed whitespace-pre-wrap">{line || '\u00A0'}</p>
            </div>
          ))}

          {/* Target Matched Line */}
          <div className="flex items-start gap-3 p-2.5 rounded-lg bg-emerald-500/15 border-l-4 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)] text-emerald-100 font-medium my-1">
            <span className="w-6 text-right shrink-0 select-none text-emerald-400 font-bold text-[10px]">
              {context.startLineNumber + context.beforeLines.length}
            </span>
            <p className="flex-1 leading-relaxed whitespace-pre-wrap">{context.matchedText}</p>
          </div>

          {/* Following Lines */}
          {context.afterLines.map((line, idx) => (
            <div key={`after-${idx}`} className="flex items-start gap-3 text-zinc-500 hover:text-zinc-400">
              <span className="w-6 text-right shrink-0 select-none text-zinc-600 text-[10px]">
                {context.startLineNumber + context.beforeLines.length + 1 + idx}
              </span>
              <p className="flex-1 leading-relaxed whitespace-pre-wrap">{line || '\u00A0'}</p>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/60 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            Back to Questionnaire
          </button>
        </div>
      </div>
    </div>
  );
}
