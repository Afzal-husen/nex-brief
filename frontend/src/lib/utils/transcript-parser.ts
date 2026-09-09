/**
 * Utility functions for client-side transcript parsing, metric extraction, and format normalization.
 */

export interface TranscriptMetrics {
  charCount: number;
  wordCount: number;
  speakers: string[];
}

/**
 * Strips WebVTT and SubRip (SRT) timing headers and cue numbering,
 * leaving pure dialogue and speaker cues intact.
 */
export function cleanTimedTranscriptText(raw: string): string {
  const lines = raw.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Skip WEBVTT header or NOTE blocks
    if (/^WEBVTT/i.test(line) || /^NOTE\b/i.test(line)) continue;

    // Skip standalone integer cue numbers (SRT cues)
    if (/^\d+$/.test(line)) continue;

    // Skip timestamp arrow lines (00:01:23.000 --> 00:01:25.000 or with commas 00:01:23,000)
    if (/\d{2}:\d{2}(?::\d{2})?[.,]\d{3}\s*-->\s*\d{2}:\d{2}(?::\d{2})?[.,]\d{3}/.test(line)) {
      continue;
    }

    cleanedLines.push(line);
  }

  return cleanedLines.join('\n');
}

/**
 * Reads and cleans an uploaded transcript file (.txt, .md, .vtt, .srt).
 */
export async function parseTranscriptFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  const rawText = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string) || '');
    reader.onerror = () => reject(new Error('Failed to read transcript file.'));
    reader.readAsText(file);
  });

  if (extension === 'vtt' || extension === 'srt') {
    return cleanTimedTranscriptText(rawText);
  }

  return rawText;
}

/**
 * Calculates character count, estimated words, and detects multi-party speaker cues.
 */
export function getTranscriptMetrics(text: string): TranscriptMetrics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      charCount: 0,
      wordCount: 0,
      speakers: [],
    };
  }

  const charCount = trimmed.length;
  // Split on whitespace for estimated word count
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Regex to detect speaker patterns at start of line: "Speaker Name:", "Client:", "Alex:", "Person 1:"
  const speakerRegex = /^[ \t]*([A-Za-z0-9][A-Za-z0-9 _-]{1,24}):/gm;
  const speakerSet = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = speakerRegex.exec(text)) !== null) {
    const candidate = match[1].trim();
    // Exclude common false positives like "http", "https", "note"
    if (!['http', 'https', 'note', 'timestamp', 'chapter'].includes(candidate.toLowerCase())) {
      speakerSet.add(candidate);
    }
  }

  return {
    charCount,
    wordCount,
    speakers: Array.from(speakerSet),
  };
}
