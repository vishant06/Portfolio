// Single source of truth for note content blocks, shared between the admin
// BlockEditor and the public NoteRenderer.

export const BLOCK_TYPES = [
  { type: 'heading', label: 'Heading' },
  { type: 'text', label: 'Text' },
  { type: 'code', label: 'Code' },
  { type: 'output', label: 'Output' },
  { type: 'bulletList', label: 'Bullet List' },
  { type: 'numberedList', label: 'Numbered List' },
  { type: 'callout', label: 'Callout' },
  { type: 'image', label: 'Image' },
  { type: 'table', label: 'Table' },
  { type: 'divider', label: 'Divider' }
];

export const CODE_LANGUAGE_LABELS = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  python: 'Python',
  c: 'C',
  cpp: 'C++',
  csharp: 'C#',
  html: 'HTML',
  css: 'CSS',
  json: 'JSON',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  php: 'PHP',
  go: 'Go',
  rust: 'Rust',
  other: 'Other'
};

export const CALLOUT_TYPES = ['note', 'important', 'tip', 'warning'];

export const createBlock = (type) => {
  switch (type) {
    case 'heading':
      return { type, level: 2, content: '' };
    case 'text':
      return { type, content: '' };
    case 'code':
      return { type, language: 'javascript', content: '' };
    case 'output':
      return { type, content: '' };
    case 'bulletList':
    case 'numberedList':
      return { type, items: [''] };
    case 'callout':
      return { type, calloutType: 'note', content: '' };
    case 'image':
      return { type, url: '', alt: '', caption: '' };
    case 'table':
      return { type, headers: ['Column 1', 'Column 2'], rows: [{ cells: ['', ''] }] };
    case 'divider':
      return { type };
    default:
      return { type: 'text', content: '' };
  }
};

// Drops blocks the admin left empty so a Save doesn't persist blank noise.
export const cleanBlocks = (blocks) =>
  (blocks || []).filter((block) => {
    if (block.type === 'divider') return true;
    if (block.type === 'image') return Boolean(block.url);
    if (block.type === 'table') return (block.headers || []).some(Boolean);
    if (block.type === 'bulletList' || block.type === 'numberedList') {
      return (block.items || []).some((item) => item && item.trim());
    }
    return Boolean(block.content && block.content.trim());
  });

// Best-effort, in-memory conversion of a pre-block-editor note (plain
// `content` string + `codeExamples` array) into the new block shape. Used so
// opening an old note in the editor starts from something editable instead
// of an empty page. Nothing is written to the database until the admin hits
// Save — old notes are never touched unless an admin explicitly re-saves.
export const legacyToBlocks = (note) => {
  const blocks = [];
  (note?.content || '').split('\n').forEach((line) => {
    if (!line.trim()) return;
    const headingMatch = line.match(/^(#{1,4})\s+(.*)/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2] });
    } else {
      blocks.push({ type: 'text', content: line });
    }
  });
  (note?.codeExamples || []).forEach((example) => {
    if (example?.title) blocks.push({ type: 'heading', level: 4, content: example.title });
    blocks.push({ type: 'code', language: example?.language || 'javascript', content: example?.code || '' });
  });
  return blocks;
};
