'use client';

import React from 'react';
import {
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  Target,
  User,
  Quote,
  Flame,
} from 'lucide-react';
import {
  ConfirmedFact,
  InferredPoint,
  Contradiction,
  UnknownGap,
} from '@/lib/api/types';

export type EpistemicItem =
  | { kind: 'confirmed'; data: ConfirmedFact }
  | { kind: 'inferred'; data: InferredPoint }
  | { kind: 'contradiction'; data: Contradiction }
  | { kind: 'unknown'; data: UnknownGap };

interface EpistemicCardProps {
  item: EpistemicItem;
  isActive?: boolean;
  onSelectQuote?: (factId: string) => void;
  onClickCard?: () => void;
}

export function EpistemicCard({
  item,
  isActive,
  onSelectQuote,
  onClickCard,
}: EpistemicCardProps) {
  const categoryLabel = (item.data.category || 'other').toUpperCase().replace('_', ' ');

  return (
    <div
      id={`card-${item.data.id}`}
      onClick={onClickCard}
      className={`rounded-xl border p-4.5 transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-zinc-900/95 border-emerald-500/70 ring-2 ring-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
          : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700/90 hover:bg-zinc-900/80 shadow-sm'
      }`}
    >
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {item.kind === 'confirmed' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>Confirmed Fact</span>
            </span>
          )}

          {item.kind === 'inferred' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3 h-3" />
              <span>Inferred Point</span>
            </span>
          )}

          {item.kind === 'contradiction' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
              <AlertTriangle className="w-3 h-3" />
              <span>Contradiction</span>
            </span>
          )}

          {item.kind === 'unknown' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
              <HelpCircle className="w-3 h-3" />
              <span>Unknown Gap</span>
            </span>
          )}

          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            {categoryLabel}
          </span>
        </div>

        {/* Speaker or Impact Level */}
        {item.kind === 'confirmed' && item.data.speaker && (
          <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 font-medium">
            <User className="w-3 h-3 text-zinc-500" />
            <span>{item.data.speaker}</span>
          </span>
        )}

        {item.kind === 'unknown' && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${
              item.data.impact_level === 'high'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : item.data.impact_level === 'medium'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {item.data.impact_level} impact
          </span>
        )}

        {item.kind === 'contradiction' && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <Flame className="w-3 h-3" />
            <span>{item.data.severity === 'direct_conflict' ? 'Direct Conflict' : 'Tension'}</span>
          </span>
        )}
      </div>

      {/* Body Content */}
      {item.kind === 'confirmed' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-100 leading-snug">
            {item.data.statement}
          </p>

          {item.data.source_quote && (
            <div className="rounded-lg bg-zinc-950/70 border border-zinc-800/80 p-3 space-y-2">
              <div className="flex items-start gap-2">
                <Quote className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-zinc-300/90 font-mono italic leading-relaxed line-clamp-3">
                  &ldquo;{item.data.source_quote}&rdquo;
                </p>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectQuote) onSelectQuote(item.data.id);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                >
                  <Target className="w-3 h-3" />
                  <span>Locate in Transcript</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {item.kind === 'inferred' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-zinc-100 leading-snug">
            {item.data.statement}
          </p>

          <div className="rounded-lg bg-indigo-950/20 border border-indigo-500/20 p-3">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wide">
                  AI Deduction Rationale
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {item.data.rationale}
                </p>
              </div>
            </div>
            {item.data.source_fact_ids && item.data.source_fact_ids.length > 0 && (
              <div className="mt-2 pt-2 border-t border-indigo-500/20 flex items-center gap-1.5 text-[11px] text-zinc-400">
                <span>Grounded by {item.data.source_fact_ids.length} confirmed fact(s)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {item.kind === 'contradiction' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Claim A
              </span>
              <p className="text-zinc-200 mb-1.5">{item.data.claim_a}</p>
              {item.data.quote_a && (
                <p className="text-[11px] font-mono italic text-zinc-400 line-clamp-2">
                  &ldquo;{item.data.quote_a}&rdquo;
                </p>
              )}
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                Claim B
              </span>
              <p className="text-zinc-200 mb-1.5">{item.data.claim_b}</p>
              {item.data.quote_b && (
                <p className="text-[11px] font-mono italic text-zinc-400 line-clamp-2">
                  &ldquo;{item.data.quote_b}&rdquo;
                </p>
              )}
            </div>
          </div>

          <p className="text-xs text-amber-200/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
            <strong className="text-amber-300">Conflict: </strong>
            {item.data.conflict_rationale}
          </p>
        </div>
      )}

      {item.kind === 'unknown' && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-zinc-100 mb-1">
              {item.data.missing_information}
            </p>
          </div>

          {item.data.suggested_question && (
            <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/20 space-y-1">
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wide">
                Suggested Follow-up Question
              </span>
              <p className="text-xs text-sky-100 font-medium">
                {item.data.suggested_question}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
