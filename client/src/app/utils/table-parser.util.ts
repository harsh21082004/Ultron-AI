// table-parser.util.ts
export function parseMarkdownTable(text: string) {
  const lines = text
    .split('\n')
    .filter(line => line.trim().startsWith('|') && line.includes('|'));

  if (lines.length < 2) return [];

  const headers = lines[0]
    .split('|')
    .map(h => h.replace(/\*\*/g, '').trim())
    .filter(Boolean);

  const rows = lines
    .slice(2)
    .map(line =>
      line
        .split('|')
        .map(cell => cell.trim())
        .filter(Boolean)
    );

  return { headers, rows };
}
