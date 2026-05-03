
/**
 * Renders the custom Markdown format used in topic contentMd.
 * Supports: # headings, - lists, 1. ordered lists, ![alt](src) images,
 * :::factsheet blocks, and plain paragraphs.
 * Accessibility: aria-hidden on decorative icons, aria-describedby on links,
 * role="tooltip" on factsheet, alt text on images.
 */
export default function MarkdownRenderer({ content }) {
  if (!content) return null;

  const lines = content.split('\n');
  const nodes = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Factsheet block ───────────────────────────────────────────────────────
    if (line.trim() === ':::factsheet') {
      const title = lines[++i]?.trim() ?? '';
      const body  = lines[++i]?.trim() ?? '';
      const actionParts = (lines[++i]?.trim() ?? '').split('|');
      const actionLabel = actionParts[0] ?? '';
      const actionUrl   = actionParts[1] ?? '#';
      i += 2; // skip closing :::
      const fsId = `fs-${i}`;
      nodes.push(
        <div
          key={fsId}
          className="border-l-4 border-primary-container bg-primary-fixed/30 rounded-r-lg p-5 my-4"
          role="note"
          aria-label={`Factsheet: ${title}`}
        >
          <div className="flex items-center gap-2 text-primary-container font-bold mb-2">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">info</span>
            <span className="text-[13px] uppercase tracking-widest" id={`${fsId}-title`}>{title}</span>
          </div>
          <p className="text-[14px] text-on-surface mb-3" id={`${fsId}-body`}>{body}</p>
          {actionLabel && (
            <a
              href={actionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary-container hover:underline"
              aria-describedby={`${fsId}-title ${fsId}-body`}
              aria-label={`${actionLabel} — opens official website in new tab`}
            >
              {actionLabel}
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">open_in_new</span>
            </a>
          )}
        </div>
      );
      continue;
    }

    // ── H1 ────────────────────────────────────────────────────────────────────
    const h1 = line.match(/^# (.+)/);
    if (h1) {
      nodes.push(
        <h1 key={`h1-${i}`} className="font-['Public_Sans'] text-[28px] font-bold text-primary mt-6 mb-3 leading-tight">
          {h1[1]}
        </h1>
      );
      i++; continue;
    }

    // ── H2 ────────────────────────────────────────────────────────────────────
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      nodes.push(
        <h2 key={`h2-${i}`} className="font-['Public_Sans'] text-[20px] font-semibold text-on-surface mt-6 mb-2 pb-1 border-b border-outline-variant">
          {h2[1]}
        </h2>
      );
      i++; continue;
    }

    // ── H3 ────────────────────────────────────────────────────────────────────
    const h3 = line.match(/^### (.+)/);
    if (h3) {
      nodes.push(
        <h3 key={`h3-${i}`} className="font-['Public_Sans'] text-[17px] font-semibold text-on-surface mt-4 mb-1">
          {h3[1]}
        </h3>
      );
      i++; continue;
    }

    // ── Image ─────────────────────────────────────────────────────────────────
    const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (img) {
      nodes.push(
        <img
          key={`img-${i}`}
          src={img[2]}
          alt={img[1] || 'Election education illustration'}
          className="w-full rounded-lg my-4 border border-[#DEE2E6]"
          loading="lazy"
        />
      );
      i++; continue;
    }

    // ── Unordered list ────────────────────────────────────────────────────────
    if (line.match(/^[-*] /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(lines[i].replace(/^[-*] /, '').trim());
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="space-y-2 my-3 ml-1" role="list">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[15px] text-on-surface-variant leading-relaxed">
              <span
                className="material-symbols-outlined text-secondary text-[16px] mt-0.5 flex-shrink-0"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                check_circle
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Ordered list ──────────────────────────────────────────────────────────
    if (line.match(/^\d+\. /)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, '').trim());
        i++;
      }
      nodes.push(
        <ol key={`ol-${i}`} className="space-y-2 my-3 ml-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-3 text-[15px] text-on-surface-variant leading-relaxed">
              <span
                className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-container text-white text-[11px] font-bold flex items-center justify-center mt-0.5"
                aria-hidden="true"
              >
                {idx + 1}
              </span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Blank line ────────────────────────────────────────────────────────────
    if (!line.trim()) { i++; continue; }

    // ── Paragraph ─────────────────────────────────────────────────────────────
    nodes.push(
      <p key={`p-${i}`} className="text-[15px] text-on-surface-variant leading-relaxed my-2">
        {renderInline(line.trim())}
      </p>
    );
    i++;
  }

  return <div className="prose-civic">{nodes}</div>;
}

/**
 * Renders inline Markdown: **bold**, *italic*, `code`
 */
function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-on-surface">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="bg-surface-container px-1.5 py-0.5 rounded text-[13px] font-mono text-primary-container">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
