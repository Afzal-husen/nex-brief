'use client';

import React, { useState, useRef } from 'react';
import { FileUp, ClipboardList, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { apiClient } from '@/lib/api/client';
import type { Transcript } from '@/lib/api/types';
import { parseTranscriptFile, getTranscriptMetrics } from '@/lib/utils/transcript-parser';

interface IngestionHeroProps {
  projectId: string;
  projectTitle: string;
  onTranscriptSubmitted: (transcript: Transcript, autoStartAnalysis: boolean) => void;
}

export function IngestionHero({
  projectId,
  projectTitle,
  onTranscriptSubmitted,
}: IngestionHeroProps) {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptTitle, setTranscriptTitle] = useState(
    projectTitle ? `${projectTitle} Transcript` : 'Discovery Call Transcript'
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { success, error: toastError } = useToast();

  const metrics = getTranscriptMetrics(transcriptText);
  const hasText = transcriptText.trim().length > 0;

  const handleFile = async (file: File) => {
    try {
      const validExtensions = ['txt', 'md', 'vtt', 'srt'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!ext || !validExtensions.includes(ext)) {
        toastError(
          'Unsupported file type',
          'Please upload a .txt, .md, .vtt, or .srt transcript file.'
        );
        return;
      }

      const parsedText = await parseTranscriptFile(file);
      setTranscriptText(parsedText);
      setUploadedFileName(file.name);
      // Auto-set title from file name if user hasn't modified default
      if (transcriptTitle === 'Discovery Call Transcript') {
        const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTranscriptTitle(baseName.charAt(0).toUpperCase() + baseName.slice(1));
      }
      success(
        'File loaded',
        `Parsed ${file.name} (${parsedText.length.toLocaleString()} characters).`
      );
    } catch (err) {
      toastError(
        'File read error',
        err instanceof Error ? err.message : 'Could not read file.'
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (startAnalysis: boolean) => {
    if (!hasText) return;
    setIsSubmitting(true);

    try {
      const created = await apiClient.transcripts.create(projectId, {
        title: transcriptTitle.trim() || 'Discovery Call Transcript',
        raw_text: transcriptText,
        source_type: activeTab === 'upload' ? 'file_upload' : 'direct_paste',
      });

      success(
        'Transcript saved',
        startAnalysis
          ? 'Transcript saved. Starting epistemic analysis...'
          : 'Transcript saved successfully.'
      );

      onTranscriptSubmitted(created, startAnalysis);
    } catch (err) {
      toastError(
        'Failed to save transcript',
        err instanceof Error ? err.message : 'Server connection error.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>EPISTEMIC GROUNDING WORKSPACE</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
          Ingest Discovery Transcript
        </h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto">
          Paste client conversation notes or upload a call transcript to extract grounded facts,
          uncover contradictions, and trace every claim back to verbatim quotes.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Ingestion Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-6 pt-4 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'paste'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Paste Text</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>Upload File</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-5">
          {/* Transcript Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Transcript Title
            </label>
            <input
              type="text"
              value={transcriptTitle}
              onChange={(e) => setTranscriptTitle(e.target.value)}
              placeholder="e.g. Discovery Call with Sarah (Acme Corp)"
              className="w-full px-3.5 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Paste Tab Content */}
          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-300 block">
                Conversation Transcript Text
              </label>
              <textarea
                rows={12}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder={`Client: We need a high-performance inventory tracking system for 5 warehouses.\nAlex: What are your timeline expectations?\nClient: We must launch the first warehouse by November 15th, and we cannot exceed $80k budget.`}
                className="w-full p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono transition-colors resize-y leading-relaxed"
              />
            </div>
          )}

          {/* Upload Tab Content */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragOver
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40 hover:bg-zinc-950/80'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.vtt,.srt"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <FileUp className="w-6 h-6" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-zinc-200">
                    {uploadedFileName ? (
                      <span className="text-emerald-400 font-semibold">{uploadedFileName}</span>
                    ) : (
                      'Click to upload or drag and drop transcript'
                    )}
                  </p>
                  <p className="text-xs text-zinc-500">
                    Supports .txt, .md, .vtt, and .srt call recordings
                  </p>
                </div>
              </div>

              {uploadedFileName && (
                <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>{uploadedFileName}</span>
                    <span className="text-zinc-500">({metrics.charCount.toLocaleString()} chars)</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadedFileName(null);
                      setTranscriptText('');
                    }}
                    className="text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Real-Time Metrics Inspection Bar */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <div className="flex items-center gap-4">
              <span>
                <strong className="text-zinc-200 font-medium">{metrics.charCount.toLocaleString()}</strong> characters
              </span>
              <span className="text-zinc-700">•</span>
              <span>
                <strong className="text-zinc-200 font-medium">{metrics.wordCount.toLocaleString()}</strong> words
              </span>
              <span className="text-zinc-700">•</span>
              <span>
                <strong className="text-zinc-200 font-medium">{metrics.speakers.length}</strong> speakers detected
              </span>
            </div>

            {metrics.speakers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {metrics.speakers.slice(0, 4).map((speaker) => (
                  <span
                    key={speaker}
                    className="px-2 py-0.5 rounded-md bg-zinc-850 border border-zinc-750 text-zinc-300 text-[11px]"
                  >
                    {speaker}
                  </span>
                ))}
                {metrics.speakers.length > 4 && (
                  <span className="text-zinc-500 text-[11px]">
                    +{metrics.speakers.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-zinc-950/80 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 text-center sm:text-left">
            {!hasText ? (
              <span>Paste or upload transcript text above to proceed.</span>
            ) : (
              <span className="text-emerald-400/90 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Ready for AI extraction and verbatim quote anchoring
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              disabled={!hasText || isSubmitting}
              onClick={() => handleSubmit(false)}
              className="flex-1 sm:flex-none"
            >
              Save Transcript Only
            </Button>

            <Button
              variant="primary"
              disabled={!hasText || isSubmitting}
              isLoading={isSubmitting}
              onClick={() => handleSubmit(true)}
              className="flex-1 sm:flex-none gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Epistemic Analysis</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
