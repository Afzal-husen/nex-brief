'use client';

import React, { useState } from 'react';
import { AlertTriangle, Check, Quote, FileText, ChevronRight, Ban } from 'lucide-react';
import { Contradiction } from '@/lib/api/types';

interface ContradictionResolverCardProps {
  contradiction: Contradiction;
  questionId: string;
  questionText?: string;
  resolvedText: string;
  isSkipped: boolean;
  onChangeResolution: (text: string) => void;
  onToggleSkip: (skip: boolean) => void;
  onViewContext: (quote: string, speaker?: string | null) => void;
}

type ChoiceMode = 'claim_a' | 'claim_b' | 'reconcile' | 'custom' | null;

export function ContradictionResolverCard({
  contradiction,
  questionId,
  questionText,
  resolvedText,
  isSkipped,
  onChangeResolution,
  onToggleSkip,
  onViewContext,
}: ContradictionResolverCardProps) {
  const [activeChoice, setActiveChoice] = useState<ChoiceMode>(() => {
    if (!resolvedText) return null;
    if (resolvedText.startsWith('Accept Claim A:')) return 'claim_a';
    if (resolvedText.startsWith('Accept Claim B:')) return 'claim_b';
    if (resolvedText.startsWith('Reconcile:')) return 'reconcile';
    return 'custom';
  });

  const categoryLabel = (contradiction.category || 'other').toUpperCase().replace('_', ' ');

  const handleSelectChoice = (choice: ChoiceMode) => {
    setActiveChoice(choice);
    if (isSkipped) onToggleSkip(false);

    if (choice === 'claim_a') {
      onChangeResolution(`Accept Claim A: ${contradiction.claim_a}`);
    } else if (choice === 'claim_b') {
      onChangeResolution(`Accept Claim B: ${contradiction.claim_b}`);
    } else if (choice === 'reconcile') {
      onChangeResolution(
        `Reconcile: ${contradiction.claim_a} and ${contradiction.claim_b}. Resolution: `
      );
    } else if (choice === 'custom') {
      if (!resolvedText) {
        onChangeResolution('');
      }
    }
  };

  const isAddressed = isSkipped || (resolvedText && resolvedText.trim().length > 0);

  return (
    <div
      id={`contradiction-${questionId}`}
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Contradiction</span>
          </span>

          <span className="px-2 py-0.5 rounded text-[10px] font-mono tracking-wider font-semibold uppercase bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            {categoryLabel}
          </span>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
              contradiction.severity === 'direct_conflict'
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {contradiction.severity === 'direct_conflict' ? 'Direct Conflict' : 'Tension'}
          </span>
        </div>

        {/* Skip Toggle */}
        <button
          type="button"
          onClick={() => {
            onToggleSkip(!isSkipped);
            if (!isSkipped) {
              setActiveChoice(null);
            }
          }}
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

      {/* Conflict Question / Summary */}
      {questionText && (
        <h3 className="text-sm sm:text-base font-semibold text-zinc-100 mb-3 leading-snug">
          {questionText}
        </h3>
      )}

      {/* Side-by-Side Conflicting Claims */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
        {/* Claim A */}
        <div
          onClick={() => !isSkipped && handleSelectChoice('claim_a')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeChoice === 'claim_a' && !isSkipped
              ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/50 shadow-sm'
              : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
              Claim A
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (contradiction.quote_a) onViewContext(contradiction.quote_a);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-300 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>Transcript</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-medium text-zinc-200 mb-2 leading-snug">
            {contradiction.claim_a}
          </p>

          {contradiction.quote_a && (
            <div className="flex items-start gap-1.5 p-2 rounded bg-zinc-900/80 text-[11px] font-mono text-zinc-400 italic">
              <Quote className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
              <p className="line-clamp-2">&ldquo;{contradiction.quote_a}&rdquo;</p>
            </div>
          )}
        </div>

        {/* Claim B */}
        <div
          onClick={() => !isSkipped && handleSelectChoice('claim_b')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeChoice === 'claim_b' && !isSkipped
              ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/50 shadow-sm'
              : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
              Claim B
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (contradiction.quote_b) onViewContext(contradiction.quote_b);
              }}
              className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-300 transition-colors"
            >
              <FileText className="w-3 h-3" />
              <span>Transcript</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm font-medium text-zinc-200 mb-2 leading-snug">
            {contradiction.claim_b}
          </p>

          {contradiction.quote_b && (
            <div className="flex items-start gap-1.5 p-2 rounded bg-zinc-900/80 text-[11px] font-mono text-zinc-400 italic">
              <Quote className="w-3 h-3 text-zinc-500 shrink-0 mt-0.5" />
              <p className="line-clamp-2">&ldquo;{contradiction.quote_b}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Rationale Callout */}
      <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
        <strong className="text-amber-300 font-semibold">Tension Rationale: </strong>
        {contradiction.conflict_rationale}
      </div>

      {/* 1-Click Resolution Choice Cards */}
      {!isSkipped && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            <span>Choose Preferred Resolution:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSelectChoice('claim_a')}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeChoice === 'claim_a'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {activeChoice === 'claim_a' && <Check className="w-3.5 h-3.5" />}
              <span>Accept Claim A</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectChoice('claim_b')}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeChoice === 'claim_b'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {activeChoice === 'claim_b' && <Check className="w-3.5 h-3.5" />}
              <span>Accept Claim B</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectChoice('reconcile')}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeChoice === 'reconcile'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {activeChoice === 'reconcile' && <Check className="w-3.5 h-3.5" />}
              <span>Reconcile Both</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectChoice('custom')}
              className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeChoice === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
              }`}
            >
              {activeChoice === 'custom' && <Check className="w-3.5 h-3.5" />}
              <span>Custom Text</span>
            </button>
          </div>

          {/* Editable Resolution Textarea */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <label htmlFor={`res-${questionId}`} className="font-medium">
                Finalized Resolution (sent to brief synthesis):
              </label>
              <span className="text-[11px] text-zinc-500">Editable preview</span>
            </div>
            <textarea
              id={`res-${questionId}`}
              rows={2}
              value={resolvedText}
              onChange={(e) => {
                onChangeResolution(e.target.value);
                if (activeChoice === null) setActiveChoice('custom');
              }}
              placeholder="Select an option above or type how this contradiction should be settled..."
              className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 leading-relaxed resize-y"
            />
          </div>
        </div>
      )}

      {/* Skipped State Notice */}
      {isSkipped && (
        <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
          <span>This contradiction is marked skipped. The AI synthesizer will use its working inference.</span>
          <button
            type="button"
            onClick={() => onToggleSkip(false)}
            className="text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
          >
            <span>Resolve Now</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
