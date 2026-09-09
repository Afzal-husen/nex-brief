'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, Download, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { copyBriefToClipboard, downloadBriefMarkdown } from '@/lib/utils/export-brief';
import { useToast } from '@/components/ui/Toast';
import type { ProjectStatus } from '@/lib/api/types';

interface BriefHeaderProps {
  projectId: string;
  projectTitle: string;
  status: ProjectStatus;
  isApproved: boolean;
  fullMarkdown: string;
  onOpenApprovalModal: () => void;
}

export const BriefHeader: React.FC<BriefHeaderProps> = ({
  projectId,
  projectTitle,
  status,
  isApproved,
  fullMarkdown,
  onOpenApprovalModal,
}) => {
  const { success, error: toastError } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyBriefToClipboard(fullMarkdown);
    if (ok) {
      setHasCopied(true);
      success('Copied!', 'Full brief Markdown copied to clipboard.');
      setTimeout(() => setHasCopied(false), 2000);
    } else {
      toastError('Copy Failed', 'Unable to access clipboard.');
    }
  };

  const handleDownload = () => {
    downloadBriefMarkdown(projectTitle, fullMarkdown);
    success('Downloaded', 'Project brief downloaded as markdown file.');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Breadcrumbs and Title */}
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href={`/projects/${projectId}`}
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-zinc-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Workspace</span>
          </Link>
          <div className="h-4 w-px bg-zinc-800 shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-xs sm:text-sm text-zinc-100 shrink-0">NexBrief</span>
            <span className="text-zinc-600 shrink-0">/</span>
            <span className="text-xs sm:text-sm text-zinc-300 truncate font-semibold">
              {projectTitle}
            </span>
            <span className="text-zinc-600 shrink-0">/</span>
            <span className="text-xs sm:text-sm text-indigo-400 font-semibold shrink-0">
              Brief
            </span>
          </div>
        </div>

        {/* Right: Actions and Status */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Badge status={status} />

          {/* Export Actions */}
          <button
            type="button"
            onClick={handleCopy}
            title="Copy Markdown to Clipboard"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            {hasCopied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden md:inline">{hasCopied ? 'Copied' : 'Copy MD'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            title="Download .md File"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Download</span>
          </button>

          {/* Primary Approval CTA */}
          {isApproved ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Approved</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenApprovalModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Review &amp; Approve</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
