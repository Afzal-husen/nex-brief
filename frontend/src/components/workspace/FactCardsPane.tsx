'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Filter, Layers, CheckCircle2, Sparkles, AlertTriangle, HelpCircle, X } from 'lucide-react';
import {
  ConfirmedFact,
  InferredPoint,
  Contradiction,
  UnknownGap,
} from '@/lib/api/types';
import { EpistemicCard, EpistemicItem } from './EpistemicCard';

interface FactCardsPaneProps {
  confirmedFacts?: ConfirmedFact[];
  inferredPoints?: InferredPoint[];
  contradictions?: Contradiction[];
  unknownGaps?: UnknownGap[];
  activeFactId?: string | null;
  onSelectQuote?: (factId: string) => void;
  onSelectFact?: (factId: string) => void;
}

type FilterTab = 'all' | 'confirmed' | 'inferred' | 'contradictions' | 'unknowns';

export function FactCardsPane({
  confirmedFacts = [],
  inferredPoints = [],
  contradictions = [],
  unknownGaps = [],
  activeFactId,
  onSelectQuote,
  onSelectFact,
}: FactCardsPaneProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Combine into unified EpistemicItem list
  const allItems = useMemo<EpistemicItem[]>(() => {
    const items: EpistemicItem[] = [];

    for (const f of confirmedFacts) {
      items.push({ kind: 'confirmed', data: f });
    }
    for (const i of inferredPoints) {
      items.push({ kind: 'inferred', data: i });
    }
    for (const c of contradictions) {
      items.push({ kind: 'contradiction', data: c });
    }
    for (const u of unknownGaps) {
      items.push({ kind: 'unknown', data: u });
    }

    return items;
  }, [confirmedFacts, inferredPoints, contradictions, unknownGaps]);

  // Counts for each tab
  const counts = useMemo(() => {
    return {
      all: allItems.length,
      confirmed: confirmedFacts.length,
      inferred: inferredPoints.length,
      contradictions: contradictions.length,
      unknowns: unknownGaps.length,
    };
  }, [allItems.length, confirmedFacts.length, inferredPoints.length, contradictions.length, unknownGaps.length]);

  // Filtered items based on activeTab and searchQuery
  const filteredItems = useMemo(() => {
    let list = allItems;

    if (activeTab === 'confirmed') {
      list = list.filter((item) => item.kind === 'confirmed');
    } else if (activeTab === 'inferred') {
      list = list.filter((item) => item.kind === 'inferred');
    } else if (activeTab === 'contradictions') {
      list = list.filter((item) => item.kind === 'contradiction');
    } else if (activeTab === 'unknowns') {
      list = list.filter((item) => item.kind === 'unknown');
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const cat = (item.data.category || '').toLowerCase();
      if (cat.includes(q)) return true;

      if (item.kind === 'confirmed') {
        return (
          item.data.statement.toLowerCase().includes(q) ||
          item.data.source_quote.toLowerCase().includes(q) ||
          (item.data.speaker && item.data.speaker.toLowerCase().includes(q))
        );
      }
      if (item.kind === 'inferred') {
        return (
          item.data.statement.toLowerCase().includes(q) ||
          item.data.rationale.toLowerCase().includes(q)
        );
      }
      if (item.kind === 'contradiction') {
        return (
          item.data.claim_a.toLowerCase().includes(q) ||
          item.data.claim_b.toLowerCase().includes(q) ||
          item.data.conflict_rationale.toLowerCase().includes(q)
        );
      }
      if (item.kind === 'unknown') {
        return (
          item.data.missing_information.toLowerCase().includes(q) ||
          item.data.suggested_question.toLowerCase().includes(q)
        );
      }
      return false;
    });
  }, [allItems, activeTab, searchQuery]);

  // If an activeFactId is set, ensure its tab is visible (or switch to 'all' if not in current tab)
  useEffect(() => {
    if (!activeFactId) return;

    // Scroll active card into view
    const timer = setTimeout(() => {
      const cardEl = document.getElementById(`card-${activeFactId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);

    return () => clearTimeout(timer);
  }, [activeFactId]);

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
      {/* Pane Header: Filter Tabs & Search */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/60 space-y-3 shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Epistemic Fact Cards
              </h3>
              <p className="text-[11px] text-zinc-500 font-mono">
                {allItems.length} extracted knowledge points
              </p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search facts..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <span>All</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-zinc-700/60 text-zinc-300">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('confirmed')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'confirmed'
                ? 'bg-emerald-500/20 text-emerald-200 shadow-sm border border-emerald-500/40'
                : 'text-zinc-400 hover:text-emerald-300 hover:bg-zinc-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Confirmed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
              {counts.confirmed}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inferred')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'inferred'
                ? 'bg-indigo-500/20 text-indigo-200 shadow-sm border border-indigo-500/40'
                : 'text-zinc-400 hover:text-indigo-300 hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Inferred</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
              {counts.inferred}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('contradictions')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'contradictions'
                ? 'bg-amber-500/20 text-amber-200 shadow-sm border border-amber-500/40'
                : 'text-zinc-400 hover:text-amber-300 hover:bg-zinc-900'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>Contradictions</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300">
              {counts.contradictions}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unknowns')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'unknowns'
                ? 'bg-sky-500/20 text-sky-200 shadow-sm border border-sky-500/40'
                : 'text-zinc-400 hover:text-sky-300 hover:bg-zinc-900'
            }`}
          >
            <HelpCircle className="w-3 h-3 text-sky-400" />
            <span>Unknowns</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300">
              {counts.unknowns}
            </span>
          </button>
        </div>
      </div>

      {/* Pane Body: Scrollable Cards */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 select-none"
      >
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-zinc-800 text-zinc-500">
            <Filter className="w-8 h-8 mb-2 opacity-40 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-300">No epistemic facts match</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-xs">
              Try choosing a different tab filter or clearing your search term.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <EpistemicCard
              key={item.data.id}
              item={item}
              isActive={item.data.id === activeFactId}
              onSelectQuote={onSelectQuote}
              onClickCard={() => {
                if (onSelectFact) onSelectFact(item.data.id);
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
