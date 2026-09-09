'use client';

import React, { useState } from 'react';
import { AlertCircle, Check, Copy, Download, FileText, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { SECTION_ORDER, SECTION_TITLES, copyBriefToClipboard, downloadBriefMarkdown } from '@/lib/utils/export-brief';
import type { BriefSection } from '@/lib/api/types';
import { useToast } from '@/components/ui/Toast';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectTitle: string;
  draftSections: Record<string, BriefSection>;
  editedSections: Record<string, BriefSection>;
  fullMarkdown: string;
  isApproving: boolean;
  onConfirmApproval: () => Promise<void>;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  onClose,
  projectTitle,
  draftSections,
  editedSections,
  fullMarkdown,
  isApproving,
  onConfirmApproval,
}) => {
  const { success, error: toastError } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  if (!isOpen) return null;

  // Compute modified sections
  const modifiedSections: {
    key: string;
    title: string;
    draftText: string;
    editedText: string;
  }[] = [];

  SECTION_ORDER.forEach((key) => {
    const draftText = draftSections[key]?.content?.trim() || '';
    const editedText = editedSections[key]?.content?.trim() || '';
    if (draftText !== editedText) {
      modifiedSections.push({
        key,
        title: SECTION_TITLES[key] || key,
        draftText,
        editedText,
      });
    }
  });

  const handleCopy = async () => {
    const ok = await copyBriefToClipboard(fullMarkdown);
    if (ok) {
      setHasCopied(true);
      success('Copied!', 'Brief Markdown copied to clipboard.');
      setTimeout(() => setHasCopied(false), 2000);
    } else {
      toastError('Copy Failed', 'Unable to copy text.');
    }
  };

  const handleDownload = () => {
    downloadBriefMarkdown(projectTitle, fullMarkdown);
    success('Downloaded', 'Project brief saved to disk.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">Review &amp; Approve Brief</h3>
              <p className="text-xs text-zinc-400">
                Final human sign-off &bull; Logs editorial corrections for quality benchmarks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isApproving}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Diff / Changes Overview */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Summary Banner */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
                Editorial Review Summary
              </span>
              <p className="text-sm text-zinc-200 font-medium mt-0.5">
                {modifiedSections.length === 0
                  ? 'No manual edits made. Approving pure AI draft.'
                  : `${modifiedSections.length} of 11 sections modified by human editor.`}
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                {11 - modifiedSections.length} untouched &bull; {modifiedSections.length} edited
              </span>
            </div>
          </div>

          {/* Section Diffs */}
          {modifiedSections.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Modified Sections Breakdown
              </span>
              <div className="space-y-3">
                {modifiedSections.map((sec) => (
                  <div
                    key={sec.key}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-800/80">
                      <span className="font-semibold text-indigo-300">{sec.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">Diff Preview</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* AI Draft */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider block">
                          Original AI Draft
                        </span>
                        <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/20 text-rose-200/90 font-mono text-[11px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {sec.draftText || '(empty)'}
                        </div>
                      </div>

                      {/* Approved Edit */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                          Your Approved Content
                        </span>
                        <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-200 font-mono text-[11px] leading-relaxed max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {sec.editedText}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evaluation Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              Approving this brief locks the final version and records section-level diffs in the evaluation
              dataset (<span className="font-mono text-[11px]">correction_log</span>). This enables benchmark
              evaluations to continuously improve future extraction and synthesis prompts.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-3">
          {/* Export Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            >
              {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{hasCopied ? 'Copied' : 'Copy MD'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>
          </div>

          {/* Confirmation Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isApproving}
              className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirmApproval}
              disabled={isApproving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              {isApproving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Approving Brief...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Final Approval</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
