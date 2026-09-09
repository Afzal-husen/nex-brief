'use client';

import React, { useState } from 'react';
import { Check, Edit3, FileText, Sparkles } from 'lucide-react';
import type { BriefSection, CritiqueIssue } from '@/lib/api/types';
import { CritiqueInlineAlert } from './CritiqueInlineAlert';
import { BriefMarkdownEditor } from './BriefMarkdownEditor';

interface BriefSectionCardProps {
  index: number;
  sectionKey: string;
  title: string;
  section: BriefSection | undefined;
  draftSection: BriefSection | undefined;
  critiqueIssues?: CritiqueIssue[];
  isApproved: boolean;
  onUpdateSectionContent: (key: string, newContent: string) => void;
  onResetSection: (key: string) => void;
}

export const BriefSectionCard: React.FC<BriefSectionCardProps> = ({
  index,
  sectionKey,
  title,
  section,
  draftSection,
  critiqueIssues = [],
  isApproved,
  onUpdateSectionContent,
  onResetSection,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const currentContent = section?.content || '';
  const draftContent = draftSection?.content || '';
  const isModified = currentContent.trim() !== draftContent.trim();
  const wordCount = currentContent.trim().length > 0 ? currentContent.trim().split(/\s+/).length : 0;

  const handleSave = (newContent: string) => {
    onUpdateSectionContent(sectionKey, newContent);
    setIsEditing(false);
  };

  const handleApplyFix = (fixText: string) => {
    if (isEditing) {
      // Append or replace
      const updated = currentContent ? `${currentContent.trim()}\n\n${fixText}` : fixText;
      onUpdateSectionContent(sectionKey, updated);
    } else {
      // Switch to edit and append fix
      const updated = currentContent ? `${currentContent.trim()}\n\n${fixText}` : fixText;
      onUpdateSectionContent(sectionKey, updated);
      setIsEditing(true);
    }
  };

  return (
    <section
      id={`section-${sectionKey}`}
      className={`scroll-mt-24 rounded-2xl border transition-all p-5 sm:p-6 space-y-4 ${
        isEditing
          ? 'border-indigo-500/50 bg-zinc-900/80 shadow-md ring-1 ring-indigo-500/20'
          : isModified
          ? 'border-emerald-500/30 bg-zinc-900/60'
          : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700/80'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {index}
          </span>
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-100 truncate">{title}</h2>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
              <span>{wordCount} words</span>
              {isModified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                  <Check className="w-2.5 h-2.5" />
                  <span>Modified by editor</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button: Edit or Done */}
        {!isApproved && (
          <div>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/60 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Section</span>
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Critique Alerts for this section */}
      {critiqueIssues.length > 0 && (
        <div className="space-y-2">
          {critiqueIssues.map((issue) => (
            <CritiqueInlineAlert
              key={issue.id}
              issue={issue}
              isEditing={isEditing}
              onApplyFix={!isApproved ? handleApplyFix : undefined}
            />
          ))}
        </div>
      )}

      {/* Body: Editor or Rendered Markdown */}
      {isEditing ? (
        <BriefMarkdownEditor
          initialContent={currentContent}
          draftContent={draftContent}
          onSave={handleSave}
          onCancel={() => setIsEditing(false)}
          onResetToDraft={() => {
            onResetSection(sectionKey);
            setIsEditing(false);
          }}
        />
      ) : (
        <div className="text-sm text-zinc-200 leading-relaxed space-y-3 whitespace-pre-wrap font-sans">
          {currentContent.trim() ? (
            currentContent
          ) : (
            <p className="text-zinc-500 italic text-xs">No content generated for this section.</p>
          )}
        </div>
      )}

      {/* Footnote: Grounding metadata (fact IDs / inferences) */}
      {((section?.source_fact_ids?.length ?? 0) > 0 || (section?.inference_ids?.length ?? 0) > 0) && (
        <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
          <span className="font-semibold text-zinc-400">Grounding links:</span>
          {section?.source_fact_ids?.map((factId) => (
            <span
              key={factId}
              className="px-2 py-0.5 rounded bg-zinc-800/60 font-mono text-[10px] text-zinc-400 border border-zinc-700/40"
              title={`Fact ID: ${factId}`}
            >
              Fact #{factId.slice(0, 6)}
            </span>
          ))}
          {section?.inference_ids?.map((infId) => (
            <span
              key={infId}
              className="px-2 py-0.5 rounded bg-amber-500/10 font-mono text-[10px] text-amber-300/80 border border-amber-500/20"
              title={`Inference ID: ${infId}`}
            >
              Inf #{infId.slice(0, 6)}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};
