'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { FileText, Sparkles, X, Target } from 'lucide-react';
import { buildTranscriptSegments, TranscriptQuoteItem } from '@/lib/utils/quote-matcher';

interface TranscriptPaneProps {
  rawText: string;
  quotes: TranscriptQuoteItem[];
  activeFactId?: string | null;
  onSelectFact?: (factId: string) => void;
  onClearActiveFact?: () => void;
  title?: string;
}

export function TranscriptPane({
  rawText,
  quotes,
  activeFactId,
  onSelectFact,
  onClearActiveFact,
  title = 'Discovery Call Transcript',
}: TranscriptPaneProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Compute non-overlapping transcript segments
  const segments = useMemo(() => {
    return buildTranscriptSegments(rawText, quotes);
  }, [rawText, quotes]);

  // Compute word and character counts
  const stats = useMemo(() => {
    const chars = rawText.length;
    const words = rawText.trim() ? rawText.trim().split(/\s+/).length : 0;
    return { chars, words };
  }, [rawText]);

  // Smooth scroll and center active quote when activeFactId changes
  useEffect(() => {
    if (!activeFactId || !scrollContainerRef.current) return;

    // Small timeout to ensure DOM update if activeFactId just changed
    const timer = setTimeout(() => {
      const quoteEl = document.getElementById(`quote-${activeFactId}`);
      if (quoteEl) {
        quoteEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [activeFactId]);

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Pane Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-900/60 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-zinc-200 truncate uppercase tracking-wider">
              {title}
            </h3>
            <p className="text-[11px] text-zinc-500 font-mono">
              {stats.words.toLocaleString()} words &bull; {stats.chars.toLocaleString()} chars
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFactId && (
            <button
              type="button"
              onClick={onClearActiveFact}
              className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border border-zinc-700 transition-colors"
              title="Clear active quote highlight"
            >
              <X className="w-3 h-3" />
              <span>Reset focus</span>
            </button>
          )}

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-400 text-[11px] font-mono border border-zinc-800">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>{quotes.length} grounded</span>
          </div>
        </div>
      </div>

      {/* Pane Body: Scrollable Transcript Text */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 text-zinc-300 font-mono text-xs sm:text-[13px] leading-relaxed select-text space-y-4"
      >
        <div className="whitespace-pre-wrap">
          {segments.map((segment, index) => {
            if (!segment.isQuote) {
              return <span key={`seg-${index}`}>{segment.text}</span>;
            }

            const isActive = segment.factId === activeFactId;

            return (
              <mark
                key={`quote-${segment.factId || index}`}
                id={segment.factId ? `quote-${segment.factId}` : undefined}
                onClick={() => {
                  if (segment.factId && onSelectFact) {
                    onSelectFact(segment.factId);
                  }
                }}
                className={`inline rounded transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/35 text-emerald-100 ring-2 ring-emerald-400 border-l-4 border-emerald-400 font-medium px-1.5 py-0.5 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-emerald-500/15 text-emerald-300/90 border-l-2 border-emerald-500/50 hover:bg-emerald-500/25 hover:text-emerald-200 px-1 py-0.2'
                }`}
                title="Click to view anchored epistemic fact"
              >
                {isActive && (
                  <Target className="inline-block w-3 h-3 mr-1 text-emerald-400 animate-pulse align-middle" />
                )}
                {segment.text}
              </mark>
            );
          })}
        </div>
      </div>
    </div>
  );
}
