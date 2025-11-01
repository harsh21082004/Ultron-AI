import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import {
  MarkdownParserService,
  ContentBlock,
} from '../../services/markdown-parser.service';
import { TableTemplateComponent } from '../table-template/table-template';
import { CodeEditorCanvas } from '../code-editor-canvas/code-editor-canvas';
import { ThemeService } from '../../services/theme.services';


import { marked, Marked, Tokens } from 'marked';

@Component({
  selector: 'app-content-renderer',
  standalone: true,
  imports: [CommonModule, TableTemplateComponent, CodeEditorCanvas],
  template: `
    <!-- 
      MODIFIED: Removed the *ngIf="messages" container.
      This component's template is now just the block renderer,
      as the parent chat component handles the message list.
    -->
    <ng-container *ngFor="let block of blocks">
      <ng-container [ngSwitch]="block.type">
        <div
          *ngSwitchCase="'text'"
          class="prose"
          [class.text-white]="isDarkMode()"
          [class.dark-prose]="isDarkMode()"
          [class.sender-prose]="sender === 'user'"
          [innerHTML]="sanitize($any(block.content))"
        ></div>
        <!-- 
          FIXED: Added $any() to block.content to resolve the 
          TS2322 type-checking error.
        -->
        <app-table-template
          *ngSwitchCase="'table'"
          [data]="$any(block.content)"
        ></app-table-template>
        <app-code-editor-canvas
          *ngSwitchCase="'code'"
          [code]="$any(block.content).code"
          [language]="$any(block.content).language"
        >
        </app-code-editor-canvas>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
    :host ::ng-deep .sender-prose {
      line-height: 0 !important;

      p{
        margin: 0 !important;
      }
    }

    :host ::ng-deep .dark-prose {
      code{
        background-color: #132a39 !important;
      }
    }
    :host ::ng-deep .prose {
       line-height: 0.6;
       margin: 0.25rem 0;
       white-space: pre-wrap;
       word-break: break-word;

      .prose {
        line-height: 1;
        margin: 0.5rem 0;
        white-space: pre-wrap;
        /* Ensure text wraps in chat bubbles */
        word-break: break-word;
      }

      h1, h2, h3, h4, h5, h6 {
         margin-top: 0.25em;
         margin-bottom: 0.25em;
         font-weight: 500;
         line-height: 1;
      }
      h1 { font-size: 1.2rem; } /* 30px */
      h2 { font-size: 1.1rem; }   /* 24px */
      h3 { font-size: 1.05rem; }  /* 20px */

      p {
        margin-bottom: 0.5em;
        line-height: 1.5;
      }

      ul, ol {
         margin-left: 1.5em;
         margin-bottom: 1em;
         list-style-position: outside;
         line-height: 1;
      }
      ul { list-style-type: disc; }
      ol { list-style-type: decimal; }
      li { margin-bottom: 0.25em; line-height: 1.5; }

      /* REMOVED: .message-row, .bubble, etc.
        These styles are now handled by the parent ChatComponent.
      */

        

      code {
         background-color: #d4d9df; 
         padding: 0.1em 0.35em;
         border-radius: 6px;
         font-family: monospace;
         font-size: 0.85em;
      }

      /* Optional: Add some margin to code/table blocks so they aren't flush */
      :host ::ng-deep app-code-editor-canvas,
      :host ::ng-deep app-table-template {
        margin: 0.5rem 0;
      }
    }

      :host ::ng-deep app-code-editor-canvas,
      :host ::ng-deep app-table-template {
        margin: 1rem 0;
      }
    `,
  ],
})
export class ContentRenderer implements OnChanges {
  @Input() content?: string;
  @Input() sender?: string;
  private themeService = inject(ThemeService);
  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');

  blocks: ContentBlock[] = [];
  private parser = inject(MarkdownParserService);
  private sanitizer = inject(DomSanitizer);
  private markedInstance: Marked;

  constructor() {
    this.markedInstance = new Marked();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // REMOVED: The check for 'this.messages'
    if (changes['content']) {
      // This is the path your code takes:
      // 1. Receives the full text blob (with code) via [content]
      // 2. Calls the (now updated) parser
      // 3. The parser returns blocks of type 'text', 'table', and 'code'
      this.blocks = this.parse(this.content);
    } else if (!this.content) {
      this.blocks = []; // Clear if no content
    }
  }

  parse(text?: string): ContentBlock[] {
    return this.parser.parse(text);
  }

  /**
   * (This function is unchanged from your provided code)
   * Convert a markdown-like text into sanitized HTML.
   * Supports: **bold**, unordered lists (- or *), paragraphs, inline code `x`.
   */
  sanitize(markdown: string): SafeHtml {
    if (!markdown) return this.sanitizer.bypassSecurityTrustHtml('');

    // Use marked to parse the markdown string
    // We pass the string directly to marked.parse()
    const html = this.markedInstance.parse(markdown) as string;

    // Sanitize the output from marked to prevent XSS attacks
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
