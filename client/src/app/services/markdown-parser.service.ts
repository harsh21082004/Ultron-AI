import { Injectable } from '@angular/core';

export type ContentBlock = { type: 'text' | 'table'; content: any };

@Injectable({ providedIn: 'root' })
export class MarkdownParserService {
  constructor() { }

  /**
   * Parse raw AI text into blocks:
   * - table blocks: contiguous markdown table lines starting with '|'
   * - text blocks: everything else
   */
  parse(text: string | undefined): ContentBlock[] {
    if (!text) return [];

    // Normalize weird pipe concatenations from streaming
    const normalized = text.replace(/\|\|/g, '\n|').replace(/\r\n/g, '\n').trim();

    const lines = normalized.split('\n');

    const blocks: ContentBlock[] = [];
    let textBuffer: string[] = [];
    let tableBuffer: string[] = [];

    const flushText = () => {
      if (textBuffer.length) {
        blocks.push({ type: 'text', content: textBuffer.join('\n').trim() });
        textBuffer = [];
      }
    };

    const flushTable = () => {
      if (tableBuffer.length) {
        const tableMarkdown = tableBuffer.join('\n').trim();
        const parsed = this.parseTable(tableMarkdown); // <-- now 'this' is safe!
        if (parsed) {
          blocks.push({ type: 'table', content: parsed });
        } else {
          textBuffer.push(...tableBuffer);
        }
        tableBuffer = [];
      }
    };


    for (const rawLine of lines) {
      const line = rawLine.trim();
      const isTableLine = line.startsWith('|');

      if (isTableLine) {
        // if we were collecting text, flush it first
        flushText.call(this);
        tableBuffer.push(line);
      } else {
        // if we were collecting a table, flush it first
        if (tableBuffer.length) {
          flushTable.call(this);
        }
        if (line !== '') {
          textBuffer.push(line);
        } else {
          // preserve paragraph break
          textBuffer.push('');
        }
      }
    }

    // End-of-input flush
    if (tableBuffer.length) flushTable.call(this);
    if (textBuffer.length) flushText.call(this);

    if (!blocks.length && text) {
      blocks.push({ type: 'text', content: text });
    }
    return blocks;
  }

  /**
   * Parse a markdown table (simple). Returns { headers, rows, title? } or null.
   */
  private parseTable(markdown: string): { headers: string[]; rows: any[]; title?: string } | null {
    // keep only lines that look like table rows
    const lines = markdown.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'));
    if (lines.length < 2) return null;

    // find header and separator lines
    const headerLine = lines[0];
    const sepLineIndex = lines.findIndex(l => /\|\s*:?-+:?\s*(\|\s*:?-+:?\s*)+/.test(l) || l.includes('---'));
    if (sepLineIndex === -1) return null;

    // headers
    const headers = headerLine.split('|').map(h => h.replace(/\*\*/g, '').trim()).filter(Boolean);
    if (headers.length === 0) return null;
    const columnCount = headers.length;

    // collect cell values after separator
    const dataLines = lines.slice(sepLineIndex + 1);
    if (!dataLines.length) return null;

    // join and split to handle concatenated/streamed rows robustly
    const allCells = dataLines
      .join('|')
      .split('|')
      .map(c => c.trim())
      .filter(Boolean);

    const rows: string[][] = [];
    for (let i = 0; i < allCells.length; i += columnCount) {
      const slice = allCells.slice(i, i + columnCount);
      if (slice.length === columnCount) rows.push(slice);
    }
    if (!rows.length) return null;

    const formattedRows = rows.map(r =>
      headers.reduce((acc, h, i) => {
        acc[h] = r[i] ?? '';
        return acc;
      }, {} as any)
    );

    return { headers, rows: formattedRows };
  }
}
