const aliases: Record<string, string[]> = {
  'fastarc-g1': ['Fastarc G1', 'Fastarc G-1', 'G1', 'G-1'],
  'glayzer-09c': ['Glayzer 09C', 'Glayzer09C', 'G09C', 'G-09C'],
};
const normalized = (value: string) => value.toLocaleLowerCase('de').replace(/[^a-z0-9]+/g, ' ').trim();
export function expandQuery(query: string): string[] {
  const clean = query.trim().replace(/\s+/g, ' ');
  if (!clean) return [];
  const haystack = normalized(clean);
  const match = Object.values(aliases).find((values) => values.some((value) => haystack === normalized(value)));
  return match ? [...new Set([clean, ...match])].slice(0, 4) : [clean];
}
