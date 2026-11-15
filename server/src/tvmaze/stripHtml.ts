const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodeEntity(entity: string, name: string): string {
  if (name.startsWith('#x')) return String.fromCodePoint(parseInt(name.slice(2), 16));
  if (name.startsWith('#')) return String.fromCodePoint(Number(name.slice(1)));
  return ENTITIES[name] ?? entity;
}

/** Plain text of a TVmaze summary: tags removed, common entities decoded. */
export function stripHtml(html: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, decodeEntity)
    .replace(/\s+/g, ' ')
    .trim();
}
