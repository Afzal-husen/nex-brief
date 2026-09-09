import type { BriefSection, ProjectBrief } from '../api/types';

export const SECTION_ORDER = [
  'executive_summary',
  'objectives_success_criteria',
  'target_audience',
  'scope_of_work',
  'out_of_scope',
  'technical_architecture',
  'assumptions_inferences',
  'risks_contradictions',
  'budget_commercials',
  'timeline_milestones',
  'outstanding_questions',
] as const;

export const SECTION_TITLES: Record<string, string> = {
  executive_summary: 'Executive Summary & Client Background',
  objectives_success_criteria: 'Project Objectives & Success Criteria',
  target_audience: 'Target Audience & User Personas',
  scope_of_work: 'In-Scope Deliverables & Features',
  out_of_scope: 'Out-of-Scope Boundaries',
  technical_architecture: 'Technical Architecture & Constraints',
  assumptions_inferences: 'Inferred Assumptions & Working Hypotheses',
  risks_contradictions: 'Known Risks & Transcript Contradictions',
  budget_commercials: 'Budget, Commercials & Payment Terms',
  timeline_milestones: 'Timeline, Phases & Milestones',
  outstanding_questions: 'Outstanding Questions & Next Steps',
};

/**
 * Builds a complete Markdown document from individual section contents.
 */
export function buildUnifiedBriefMarkdown(
  projectTitle: string,
  sections: Record<string, BriefSection>
): string {
  let doc = `# ${projectTitle} — Project Brief\n\n`;
  doc += `*Generated and grounded with NexBrief*\n\n---\n\n`;

  SECTION_ORDER.forEach((key, index) => {
    const title = SECTION_TITLES[key] || key;
    const section = sections[key];
    const content = section?.content || '*No content provided for this section.*';

    doc += `## ${index + 1}. ${title}\n\n`;
    doc += `${content.trim()}\n\n`;
  });

  return doc;
}

/**
 * Copies markdown string to user's clipboard.
 */
export async function copyBriefToClipboard(markdown: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return false;
  }
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch {
    return false;
  }
}

/**
 * Triggers client-side download of a markdown (.md) file.
 */
export function downloadBriefMarkdown(projectName: string, markdown: string): void {
  if (typeof window === 'undefined') return;

  const sanitized = projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const filename = `${sanitized || 'project'}_brief.md`;
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
