import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MarkdownParserService, ContentBlock } from '../../services/markdown-parser.service';
import { TableTemplateComponent } from "../table-template/table-template";

type Message = { sender: 'user' | 'ai'; content: string };

@Component({
  selector: 'app-content-renderer',
  standalone: true,
  imports: [CommonModule, TableTemplateComponent],
  template: `
    <!-- If messages provided (chat mode) render bubble-per-message -->
    <ng-container *ngIf="messages?.length; else singleContent">
      <div *ngFor="let msg of messages" class="message-row" [ngClass]="{'user': msg.sender==='user','ai': msg.sender==='ai'}">
        <div class="bubble">
          <ng-container *ngFor="let block of parse(msg.content)">
            <ng-container [ngSwitch]="block.type">
              <div *ngSwitchCase="'text'" [innerHTML]="sanitize(block.content)"></div>
              <app-table-template *ngSwitchCase="'table'" [data]="block.content"></app-table-template>
            </ng-container>
          </ng-container>
        </div>
      </div>
    </ng-container>

    <!-- Single content mode -->
    <ng-template #singleContent>
      <ng-container *ngFor="let block of blocks">
        <ng-container [ngSwitch]="block.type">
          <div *ngSwitchCase="'text'" class="prose" [innerHTML]="sanitize(block.content)"></div>
          <app-table-template *ngSwitchCase="'table'" [data]="block.content"></app-table-template>
        </ng-container>
      </ng-container>
    </ng-template>
  `,
  styles: [`
    .prose { line-height: 1.6; margin: .5rem 0; white-space: pre-wrap; }
    .message-row { display:flex; margin: .6rem 0; }
    .message-row.user { justify-content: flex-end; }
    .message-row.ai { justify-content: flex-start; }
    .bubble { max-width: 78%; padding: 0.75rem 1rem; border-radius: 12px; background: var(--mat-surface, #f3f4f6); color: var(--mat-on-surface, #111827); }
    .message-row.user .bubble { background: linear-gradient(90deg, #DCF8C6, #CFFAE0); }
  `]
})
export class ContentRenderer implements OnChanges {
  @Input() content?: string;
  @Input() messages?: Message[]; // optional chat-mode input

  blocks: ContentBlock[] = [];
  private parser = inject(MarkdownParserService);
  private sanitizer = inject(DomSanitizer);

  ngOnChanges(changes: SimpleChanges): void {
    if (this.messages && this.messages.length) {
      // nothing to pre-parse here — component will parse per message inside template
      return;
    }
    if (changes['content']) {
      this.blocks = this.parse(this.content);
    }
  }

  parse(text?: string): ContentBlock[] {
    return this.parser.parse(text);
  }

  /**
   * Convert a markdown-like text into sanitized HTML.
   * Supports: **bold**, unordered lists (- or *), paragraphs, inline code `x`.
   */
  sanitize(markdown: string): SafeHtml {
    if (!markdown) return this.sanitizer.bypassSecurityTrustHtml('');

    // 1) Escape HTML special chars to avoid injection
    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Work on escaped text
    let text = escapeHtml(markdown);

    // 2) Inline code: `code`
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 3) Bold **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 4) Convert lines starting with - or * to <ul><li> groups
    const lines = text.split('\n');
    const out: string[] = [];
    let inList = false;
    for (const rawLine of lines) {
      const line = rawLine.trim();
      const listMatch = line.match(/^[-*]\s+(.*)/);
      if (listMatch) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push(`<li>${listMatch[1]}</li>`);
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        if (line === '') {
          out.push('<p></p>');
        } else {
          out.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) out.push('</ul>');
    const html = out.join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
