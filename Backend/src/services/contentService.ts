import { z } from 'zod';
import { ContentNode, TopicDocument } from '../types';
import { Timestamp } from 'firebase-admin/firestore';

// ─── Markdown Parser ──────────────────────────────────────────────────────────

/**
 * Parses a Markdown string into a ContentNode[] AST.
 * Supports: headings (h1-h3), paragraphs, ordered/unordered lists, images,
 * and custom factsheet blocks (:::factsheet ... :::).
 *
 * Property 2: parseMarkdown(serializeNodes(parseMarkdown(md))) ≡ parseMarkdown(md)
 * Tag: // Feature: election-process-education, Property 2: content round-trip
 */
export function parseMarkdown(md: string): ContentNode[] {
  const nodes: ContentNode[] = [];
  const lines = md.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Factsheet block: :::factsheet\ntitle\nbody\nactionLabel|actionUrl\n:::
    if (line.trim() === ':::factsheet') {
      const title = lines[++i]?.trim() ?? '';
      const body = lines[++i]?.trim() ?? '';
      const actionParts = (lines[++i]?.trim() ?? '').split('|');
      const actionLabel = actionParts[0] ?? '';
      const actionUrl = actionParts[1] ?? '';
      i++; // skip closing :::
      nodes.push({ type: 'factsheet', title, body, actionLabel, actionUrl });
      i++;
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    if (h3) { nodes.push({ type: 'heading', level: 3, text: h3[1].trim() }); i++; continue; }
    const h2 = line.match(/^## (.+)/);
    if (h2) { nodes.push({ type: 'heading', level: 2, text: h2[1].trim() }); i++; continue; }
    const h1 = line.match(/^# (.+)/);
    if (h1) { nodes.push({ type: 'heading', level: 1, text: h1[1].trim() }); i++; continue; }

    // Image: ![alt](src)
    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (img) { nodes.push({ type: 'image', alt: img[1], src: img[2] }); i++; continue; }

    // Unordered list
    if (line.match(/^[-*] /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].replace(/^[-*] /, '').trim());
        i++;
      }
      nodes.push({ type: 'list', ordered: false, items });
      continue;
    }

    // Ordered list
    if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, '').trim());
        i++;
      }
      nodes.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Paragraph (skip blank lines)
    if (line.trim()) {
      nodes.push({ type: 'paragraph', text: line.trim() });
    }
    i++;
  }

  return nodes;
}

/**
 * Serialises a ContentNode[] AST back to a Markdown string.
 * Round-trip: parseMarkdown(serializeNodes(parseMarkdown(md))) ≡ parseMarkdown(md)
 */
export function serializeNodes(nodes: ContentNode[]): string {
  return nodes.map((node) => {
    switch (node.type) {
      case 'heading':
        return `${'#'.repeat(node.level)} ${node.text}`;
      case 'paragraph':
        return node.text;
      case 'list':
        return node.ordered
          ? node.items.map((item, idx) => `${idx + 1}. ${item}`).join('\n')
          : node.items.map((item) => `- ${item}`).join('\n');
      case 'image':
        return `![${node.alt}](${node.src})`;
      case 'factsheet':
        return `:::factsheet\n${node.title}\n${node.body}\n${node.actionLabel}|${node.actionUrl}\n:::`;
    }
  }).join('\n');
}

// ─── Zod Schema Validation ────────────────────────────────────────────────────

const TopicCategoryEnum = z.enum([
  'registration', 'ballot', 'polling', 'eci-structure',
  'postal-voting', 'election-security', 'candidates',
  'campaign-finance', 'certification', 'civic-rights',
]);

const TopicDocumentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be kebab-case'),
  category: TopicCategoryEnum,
  contentMd: z.string().min(1, 'Content is required'),
  mediaRefs: z.array(z.string()),
  locale: z.enum(['en', 'hi']),
  readingTimeMinutes: z.number().int().positive(),
});

/**
 * Validates a raw object against the TopicDocument schema.
 * Throws a ZodError with descriptive messages if invalid.
 */
export function validateTopicSchema(doc: unknown): Omit<TopicDocument, 'createdAt' | 'updatedAt'> {
  return TopicDocumentSchema.parse(doc);
}

/**
 * Estimates reading time from Markdown content (avg 200 words/min).
 */
export function estimateReadingTime(contentMd: string): number {
  const wordCount = contentMd.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

// Re-export Timestamp for convenience in seed scripts
export { Timestamp };
