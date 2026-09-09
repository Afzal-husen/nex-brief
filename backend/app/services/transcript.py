import re
import unicodedata


def normalize_transcript_text(text: str) -> str:
    """
    Normalizes discovery transcript text while strictly preserving:
    - Verbatim wording and spelling
    - Speaker identification markers (e.g. 'Client:', 'Interviewer:', 'Speaker 1:')
    - Timestamp prefixes (e.g. '[00:01:23]')
    - Dialogue paragraph/line breaks

    Normalizations applied:
    - Normalizes Unicode characters (NFKC)
    - Normalizes CRLF / CR line endings to standard LF (\n)
    - Replaces smart/curly quotes and typographical dashes with ASCII equivalents
    - Collapses 3 or more consecutive blank lines down to 2 blank lines
    - Trims extraneous trailing/leading whitespace per line while preserving structural indentation
    """
    if not text:
        return ""

    # 1. Normalize unicode characters (compatibility decomposition followed by canonical composition)
    normalized = unicodedata.normalize("NFKC", text)

    # 2. Standardize line endings to LF
    normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")

    # 3. Replace typographic smart quotes, apostrophes, and dashes
    replacements = {
        "\u2018": "'",  # left single quote
        "\u2019": "'",  # right single quote
        "\u201c": '"',  # left double quote
        "\u201d": '"',  # right double quote
        "\u2014": "--",  # em dash
        "\u2013": "-",  # en dash
        "\u2026": "...",  # ellipsis
        "\u00a0": " ",  # non-breaking space
    }
    for orig, repl in replacements.items():
        normalized = normalized.replace(orig, repl)

    # 4. Clean line by line, preserving speaker prefixes and line breaks
    lines = normalized.split("\n")
    cleaned_lines = [line.rstrip() for line in lines]
    normalized = "\n".join(cleaned_lines)

    # 5. Collapse excessive blank lines (more than 2 consecutive newlines)
    normalized = re.sub(r"\n{3,}", "\n\n", normalized)

    return normalized.strip()
