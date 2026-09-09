'use client';

import React, { useState } from 'react';
import { Bold, Check, Code, Heading, Italic, List, RotateCcw, X } from 'lucide-react';

interface BriefMarkdownEditorProps {
  initialContent: string;
  draftContent: string;
  onSave: (newContent: string) => void;
  onCancel: () => void;
  onResetToDraft: () => void;
}

export const BriefMarkdownEditor: React.FC<BriefMarkdownEditorProps> = ({
  initialContent,
  draftContent,
  onSave,
  onCancel,
  onResetToDraft,
}) => {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

  const wordCount = content.trim().length > 0 ? content.trim().split(/\s+/).length : 0;
  const isChangedFromDraft = content.trim() !== draftContent.trim();

  // Helper to insert markdown tags at selection
  const handleInsertSyntax = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('section-markdown-input') as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const updated = content.substring(0, start) + replacement + content.substring(end);
    setContent(updated);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  return (
    <div className="space-y-3 rounded-xl border border-indigo-500/40 bg-zinc-950 p-4 shadow-lg ring-1 ring-indigo-500/20">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-1">
          {/* Write / Preview Mode Toggle */}
          <div className="flex items-center rounded-lg bg-zinc-900 p-0.5 border border-zinc-800 mr-2">
            <button
              type="button"
              onClick={() => setActiveTab('write')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Quick Syntax Buttons */}
          {activeTab === 'write' && (
            <div className="flex items-center gap-0.5 border-l border-zinc-800 pl-2">
              <button
                type="button"
                onClick={() => handleInsertSyntax('**', '**')}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Bold (**text**)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax('*', '*')}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Italic (*text*)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax('### ')}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Heading (### )"
              >
                <Heading className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax('- ')}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Bullet List (- )"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleInsertSyntax('`', '`')}
                className="p-1.5 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                title="Inline Code (`code`)"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Word Count */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
          <span>{wordCount} words</span>
          <span>{content.length} chars</span>
        </div>
      </div>

      {/* Write Area or Live Preview */}
      {activeTab === 'write' ? (
        <textarea
          id="section-markdown-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          placeholder="Enter Markdown section content..."
          className="w-full bg-transparent text-sm font-mono text-zinc-100 placeholder:text-zinc-600 focus:outline-none resize-y leading-relaxed"
        />
      ) : (
        <div className="min-h-[220px] max-h-[450px] overflow-y-auto p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/80 text-sm text-zinc-200 prose prose-invert max-w-none leading-relaxed whitespace-pre-wrap">
          {content.trim() ? (
            content
          ) : (
            <span className="text-zinc-500 italic">Empty section content.</span>
          )}
        </div>
      )}

      {/* Footer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-800">
        <div>
          {isChangedFromDraft && (
            <button
              type="button"
              onClick={() => {
                setContent(draftContent);
                onResetToDraft();
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to AI Draft</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
          <button
            type="button"
            onClick={() => onSave(content)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Section</span>
          </button>
        </div>
      </div>
    </div>
  );
};
