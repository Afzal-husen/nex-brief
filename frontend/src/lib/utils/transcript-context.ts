/**
 * Utility to extract surrounding conversation context for any verbatim quote in a transcript.
 */

export interface TranscriptContextResult {
  beforeLines: string[];
  matchedText: string;
  afterLines: string[];
  startLineNumber: number;
  matchFound: boolean;
}

export function extractSurroundingTranscriptContext(
  rawText: string,
  targetQuote: string,
  contextRadius = 5
): TranscriptContextResult {
  if (!rawText || !targetQuote) {
    return {
      beforeLines: [],
      matchedText: targetQuote || '',
      afterLines: [],
      startLineNumber: 1,
      matchFound: false,
    };
  }

  const lines = rawText.split(/\r?\n/);
  const trimmedQuote = targetQuote.trim();
  const lowerQuote = trimmedQuote.toLowerCase();

  // 1. Try finding a line containing the quote directly
  let targetLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(lowerQuote)) {
      targetLineIdx = i;
      break;
    }
  }

  // 2. If quote spans multiple lines or has slightly different whitespace,
  // find by token matching against the line text
  if (targetLineIdx === -1) {
    const tokens = trimmedQuote.split(/\s+/).filter((t) => t.length > 3);
    if (tokens.length > 0) {
      const firstToken = tokens[0].toLowerCase();
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(firstToken)) {
          targetLineIdx = i;
          break;
        }
      }
    }
  }

  // 3. Fallback: if still not found, search character position in rawText
  if (targetLineIdx === -1) {
    const charPos = rawText.toLowerCase().indexOf(lowerQuote);
    if (charPos !== -1) {
      const textUpToMatch = rawText.slice(0, charPos);
      targetLineIdx = textUpToMatch.split(/\r?\n/).length - 1;
    }
  }

  // If no match found at all
  if (targetLineIdx === -1) {
    return {
      beforeLines: lines.slice(0, Math.min(contextRadius, lines.length)),
      matchedText: targetQuote,
      afterLines: [],
      startLineNumber: 1,
      matchFound: false,
    };
  }

  const startIdx = Math.max(0, targetLineIdx - contextRadius);
  const endIdx = Math.min(lines.length - 1, targetLineIdx + contextRadius);

  return {
    beforeLines: lines.slice(startIdx, targetLineIdx),
    matchedText: lines[targetLineIdx] || targetQuote,
    afterLines: lines.slice(targetLineIdx + 1, endIdx + 1),
    startLineNumber: startIdx + 1,
    matchFound: true,
  };
}
