'use client';

import React from 'react';
import { HelpCircle, Sparkles, Check, Ban, ChevronRight } from 'lucide-react';
import { ClarificationQuestion, UnknownGap } from '@/lib/api/types';

interface UnknownGapQuestionCardProps {
  question: ClarificationQuestion;
  unknownGap?: UnknownGap;
  resolvedText: string;
  isSkipped: boolean;
  onChangeResolution: (text: string) => void;
  onToggleSkip: (skip: boolean) => void;
}

export function UnknownGapQuestionCard({
  question,
  unknownGap,
  resolvedText,
  isSkipped,
  onChangeResolution,
  onToggleSkip,
}: UnknownGapQuestionCardProps) {
  const impact = unknownGap?.impact_level || 'medium';
  const categoryLabel = (unknownGap?.category || 'other').toUpperCase().replace('_', ' ');

  const handleChipClick = (optionText: string) => {
    if (isSkipped) onToggleSkip(false);
    onChangeResolution(optionText);
  };

  const isAddressed = isSkipped || (resolvedText && resolvedText.trim().length > 0);

  return (
    <div
      id={`gap-${question.id}`}
      className={`rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
        isSkipped
          ? 'bg-zinc-900/30 border-zinc-800/60 opacity-75'
          : isAddressed
          ? 'bg-zinc-900/90 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.08)]'
          : 'bg-zinc-900/70 border-zinc-800 shadow-md'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Unknown Gap</span>
          </span>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            {categoryLabel}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              impact === 'high'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : impact === 'medium'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
          >
            {impact} impact
          </span>
        </div>

        {/* Skip Toggle */}
        <button
          type="button"
          onClick={() => onToggleSkip(!isSkipped)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            isSkipped
              ? 'bg-zinc-800 text-amber-300 border border-amber-500/30 font-semibold'
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60'
          }`}
        >
          <Ban className="w-3 h-3" />
          <span>{isSkipped ? 'Skipped (Using AI Default)' : 'Skip Question'}</span>
        </button>
      </div>

      {/* Main Question */}
      <h3 className="text-sm sm:text-base font-semibold text-zinc-100 mb-2 leading-snug">
        {question.question}
      </h3>

      {/* Question Rationale / Missing Info */}
      <p className="text-xs text-zinc-400 leading-relaxed mb-4">
        {question.rationale || unknownGap?.missing_information}
      </p>

      {/* Suggested Options Chips */}
      {!isSkipped && question.suggested_options && question.suggested_options.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Suggested Options (click to fill):</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {question.suggested_options.map((opt, idx) => {
              const isSelected = resolvedText === opt;
              return (
                <button
                  key={`opt-${idx}`}
                  type="button"
                  onClick={() => handleChipClick(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-sky-500/20 text-sky-200 border border-sky-500/40 shadow-sm font-semibold'
                      : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 hover:text-zinc-100'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-sky-400" />}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Custom Answer Input Textarea */}
      {!isSkipped && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <label htmlFor={`answer-${question.id}`} className="font-medium">
              Clarification Answer:
            </label>
            <span className="text-[11px] text-zinc-500">Pick an option above or type client decision</span>
          </div>
          <textarea
            id={`answer-${question.id}`}
            rows={2}
            value={resolvedText}
            onChange={(e) => onChangeResolution(e.target.value)}
            placeholder="Type client clarification or project decision here..."
            className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 leading-relaxed resize-y"
          />
        </div>
      )}

      {/* Skipped State Notice */}
      {isSkipped && (
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
          <span>This question is skipped. The brief synthesis will proceed with best inferred assumptions.</span>
          <button
            type="button"
            onClick={() => onToggleSkip(false)}
            className="text-sky-400 hover:text-sky-300 font-semibold inline-flex items-center gap-1"
          >
            <span>Answer Question</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
