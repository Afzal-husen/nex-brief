'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, Layers } from 'lucide-react';

interface ResizableSplitViewProps {
  leftPane: React.ReactNode;
  rightPane: React.ReactNode;
  factCount: number;
  activeFactId?: string | null;
  defaultLeftPercent?: number;
}

export function ResizableSplitView({
  leftPane,
  rightPane,
  factCount,
  activeFactId,
  defaultLeftPercent = 45,
}: ResizableSplitViewProps) {
  const [leftPercent, setLeftPercent] = useState<number>(defaultLeftPercent);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [mobileActiveTab, setMobileActiveTab] = useState<'transcript' | 'facts'>('transcript');
  const containerRef = useRef<HTMLDivElement>(null);

  // Switch to facts tab automatically on mobile if an active fact is triggered
  const [prevActiveFactId, setPrevActiveFactId] = useState(activeFactId);
  if (activeFactId !== prevActiveFactId) {
    setPrevActiveFactId(activeFactId);
    if (activeFactId) {
      setMobileActiveTab('facts');
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchStart = () => {
    setIsDragging(true);
  };

  const updateSplit = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const totalWidth = rect.width;
      let newPercent = (relativeX / totalWidth) * 100;

      // Clamp between 30% and 70%
      if (newPercent < 30) newPercent = 30;
      if (newPercent > 70) newPercent = 70;

      setLeftPercent(newPercent);
    },
    []
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      updateSplit(e.clientX);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updateSplit(e.touches[0].clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, updateSplit]);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Mobile / Tablet Segmented Tab Switcher */}
      <div className="lg:hidden flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-full max-w-sm mx-auto">
        <button
          type="button"
          onClick={() => setMobileActiveTab('transcript')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobileActiveTab === 'transcript'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Transcript</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileActiveTab('facts')}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            mobileActiveTab === 'facts'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Epistemic Facts</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
            {factCount}
          </span>
        </button>
      </div>

      {/* Desktop Resizable Dual Pane Container */}
      <div
        ref={containerRef}
        className={`w-full flex relative select-none rounded-2xl overflow-hidden min-h-[680px] h-[calc(100vh-220px)] ${
          isDragging ? 'cursor-col-resize select-none' : ''
        }`}
      >
        {/* Left Pane: Transcript Reader */}
        <div
          style={{ width: `${leftPercent}%` }}
          className={`hidden lg:flex flex-col h-full overflow-hidden transition-all duration-75`}
        >
          {leftPane}
        </div>

        {/* Resizer Drag Handle */}
        <div
          role="separator"
          tabIndex={0}
          aria-valuenow={Math.round(leftPercent)}
          aria-valuemin={30}
          aria-valuemax={70}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="hidden lg:flex w-3 items-center justify-center cursor-col-resize group hover:bg-indigo-500/10 transition-colors z-20"
        >
          <div
            className={`w-1 h-12 rounded-full transition-all ${
              isDragging
                ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] h-20'
                : 'bg-zinc-700 group-hover:bg-zinc-500'
            }`}
          />
        </div>

        {/* Right Pane: Fact Cards Panel */}
        <div
          style={{ width: `${100 - leftPercent}%` }}
          className={`hidden lg:flex flex-col h-full overflow-hidden transition-all duration-75`}
        >
          {rightPane}
        </div>

        {/* Mobile View: Render only the active tab */}
        <div className="lg:hidden w-full h-full flex flex-col overflow-hidden">
          {mobileActiveTab === 'transcript' ? leftPane : rightPane}
        </div>
      </div>
    </div>
  );
}
