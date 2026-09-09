/**
 * Whitespace-tolerant quote matching and non-destructive transcript span segmenter.
 */

export interface TranscriptQuoteItem {
  factId: string;
  quote: string;
}

export interface TranscriptSegment {
  text: string;
  isQuote: boolean;
  factId?: string;
  startIndex: number;
  endIndex: number;
}

interface MatchInterval {
  start: number;
  end: number;
  factId: string;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Searches for a quote inside raw text using exact matching first,
 * falling back to whitespace/linebreak normalization.
 */
function findQuoteInterval(rawText: string, quote: string): { start: number; end: number } | null {
  const trimmedQuote = quote.trim();
  if (!trimmedQuote) return null;

  // 1. Direct exact match
  const exactIndex = rawText.indexOf(trimmedQuote);
  if (exactIndex !== -1) {
    return {
      start: exactIndex,
      end: exactIndex + trimmedQuote.length,
    };
  }

  // 2. Case-insensitive exact match
  const lowerText = rawText.toLowerCase();
  const lowerQuote = trimmedQuote.toLowerCase();
  const lowerIndex = lowerText.indexOf(lowerQuote);
  if (lowerIndex !== -1) {
    return {
      start: lowerIndex,
      end: lowerIndex + trimmedQuote.length,
    };
  }

  // 3. Normalized whitespace regex match: collapse internal whitespace in quote to \s+
  try {
    const tokens = trimmedQuote.split(/\s+/).map(escapeRegExp);
    if (tokens.length === 0) return null;
    const pattern = tokens.join('\\s+');
    const regex = new RegExp(pattern, 'i');
    const match = regex.exec(rawText);
    if (match) {
      return {
        start: match.index,
        end: match.index + match[0].length,
      };
    }
  } catch {
    // In case regex construction fails on edge cases
  }

  return null;
}

/**
 * Slices rawText into sequential non-overlapping segments containing regular text
 * and verbatim quotes anchored to fact IDs.
 */
export function buildTranscriptSegments(
  rawText: string,
  quotes: TranscriptQuoteItem[]
): TranscriptSegment[] {
  if (!rawText) return [];

  // Find intervals for all valid quotes
  const intervals: MatchInterval[] = [];

  for (const item of quotes) {
    if (!item.quote) continue;
    const match = findQuoteInterval(rawText, item.quote);
    if (match) {
      intervals.push({
        start: match.start,
        end: match.end,
        factId: item.factId,
      });
    }
  }

  // Sort intervals by start position
  intervals.sort((a, b) => a.start - b.start);

  // Filter out overlapping intervals (first one wins)
  const nonOverlapping: MatchInterval[] = [];
  let lastEnd = 0;

  for (const interval of intervals) {
    if (interval.start >= lastEnd) {
      nonOverlapping.push(interval);
      lastEnd = interval.end;
    }
  }

  // Build sequential segments
  const segments: TranscriptSegment[] = [];
  let currentIndex = 0;

  for (const interval of nonOverlapping) {
    // Preceding non-quote segment
    if (interval.start > currentIndex) {
      segments.push({
        text: rawText.slice(currentIndex, interval.start),
        isQuote: false,
        startIndex: currentIndex,
        endIndex: interval.start,
      });
    }

    // Anchored quote segment
    segments.push({
      text: rawText.slice(interval.start, interval.end),
      isQuote: true,
      factId: interval.factId,
      startIndex: interval.start,
      endIndex: interval.end,
    });

    currentIndex = interval.end;
  }

  // Trailing non-quote segment
  if (currentIndex < rawText.length) {
    segments.push({
      text: rawText.slice(currentIndex),
      isQuote: false,
      startIndex: currentIndex,
      endIndex: rawText.length,
    });
  }

  return segments;
}
