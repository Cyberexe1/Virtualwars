import { describe, it, expect } from 'vitest';
import { parseMarkdown, serializeNodes, validateTopicSchema, estimateReadingTime } from './contentService';

// Feature: election-process-education, Property 2: content round-trip

describe('parseMarkdown', () => {
  it('parses H1 headings', () => {
    const nodes = parseMarkdown('# Voter Registration');
    expect(nodes).toEqual([{ type: 'heading', level: 1, text: 'Voter Registration' }]);
  });

  it('parses H2 headings', () => {
    const nodes = parseMarkdown('## How to Register');
    expect(nodes).toEqual([{ type: 'heading', level: 2, text: 'How to Register' }]);
  });

  it('parses unordered lists', () => {
    const nodes = parseMarkdown('- Item 1\n- Item 2');
    expect(nodes).toEqual([{ type: 'list', ordered: false, items: ['Item 1', 'Item 2'] }]);
  });

  it('parses ordered lists', () => {
    const nodes = parseMarkdown('1. Step one\n2. Step two');
    expect(nodes).toEqual([{ type: 'list', ordered: true, items: ['Step one', 'Step two'] }]);
  });

  it('parses paragraphs', () => {
    const nodes = parseMarkdown('This is a paragraph.');
    expect(nodes).toEqual([{ type: 'paragraph', text: 'This is a paragraph.' }]);
  });

  it('parses images', () => {
    const nodes = parseMarkdown('![alt text](https://example.com/img.png)');
    expect(nodes).toEqual([{ type: 'image', alt: 'alt text', src: 'https://example.com/img.png' }]);
  });

  it('skips blank lines', () => {
    const nodes = parseMarkdown('# Title\n\nParagraph');
    expect(nodes).toHaveLength(2);
  });
});

describe('serializeNodes + round-trip (Property 2)', () => {
  it('serializes headings back to Markdown', () => {
    const md = '# Title';
    const nodes = parseMarkdown(md);
    expect(serializeNodes(nodes)).toBe(md);
  });

  it('round-trip: parse → serialize → parse produces equivalent AST', () => {
    const samples = [
      '# Voter Registration\n\n## How to Register\n\n1. Visit voters.eci.gov.in\n2. Fill Form 6',
      '## Documents Required\n\n- Aadhaar card\n- Passport\n- Driving licence',
      '# ECI\n\nThe Election Commission of India was established in 1950.',
    ];
    for (const md of samples) {
      const ast1 = parseMarkdown(md);
      const serialized = serializeNodes(ast1);
      const ast2 = parseMarkdown(serialized);
      expect(ast2).toEqual(ast1);
    }
  });
});

describe('validateTopicSchema', () => {
  const validTopic = {
    title: 'Voter Registration',
    slug: 'voter-registration',
    category: 'registration',
    contentMd: '# Test\n\nContent here.',
    mediaRefs: [],
    locale: 'en',
    readingTimeMinutes: 3,
  };

  it('accepts a valid topic document', () => {
    expect(() => validateTopicSchema(validTopic)).not.toThrow();
  });

  it('rejects missing title', () => {
    expect(() => validateTopicSchema({ ...validTopic, title: '' })).toThrow();
  });

  it('rejects invalid category', () => {
    expect(() => validateTopicSchema({ ...validTopic, category: 'invalid-cat' })).toThrow();
  });

  it('rejects invalid slug (non-kebab-case)', () => {
    expect(() => validateTopicSchema({ ...validTopic, slug: 'Voter Registration' })).toThrow();
  });

  it('rejects invalid locale', () => {
    expect(() => validateTopicSchema({ ...validTopic, locale: 'fr' })).toThrow();
  });
});

describe('estimateReadingTime', () => {
  it('returns at least 1 minute', () => {
    expect(estimateReadingTime('short')).toBe(1);
  });

  it('estimates correctly for 400 words (2 min at 200 wpm)', () => {
    const text = 'word '.repeat(400);
    expect(estimateReadingTime(text)).toBe(2);
  });
});
