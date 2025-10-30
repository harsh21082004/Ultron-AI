import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-code-editor-canvas',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MonacoEditorModule, FormsModule],
  template: `
    <div class="code-block-container my-5 h-90 rounded-lg overflow-hidden border border-gray-700">
      <!-- Header -->
      <div class="flex items-center justify-between bg-[#162731] px-4 py-2">
        <span class="text-sm text-gray-400">{{ language }}</span>
        <button mat-stroked-button (click)="runCode()" class="text-gray-300 border-gray-600">
          <mat-icon>play_arrow</mat-icon>
          Run
        </button>
      </div>

      <!-- Monaco Editor -->
      <ngx-monaco-editor
        [options]="editorOptions"
        [(ngModel)]="code"
        (onInit)="onEditorInit($event)"
      ></ngx-monaco-editor>

      <!-- Output Panel -->
      @if (output()) {
        <div class="output-panel p-4 bg-black/30">
          <pre class="text-sm text-white whitespace-pre-wrap">{{ output() }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    ngx-monaco-editor {
      height: 100%;
    }
  `]
})
export class CodeEditorCanvas implements OnInit {
  @Input() code: string = '';
  @Input() language: string = 'python';

  output = signal<string | null>(null);

  editorOptions = {
    theme: 'my-custom-theme',
    language: 'python',
    minimap: { enabled: false },
    automaticLayout: true,
    stickyScroll: {
        enabled: false,
    },
    renderLineHighlight: "none"

  };

  ngOnInit(): void {
    this.editorOptions = { ...this.editorOptions, language: this.language };
  }

  onEditorInit(editor: any): void {
    // 'monaco' is globally available after the editor loads
    const monaco = (window as any).monaco;

    // 1. Define your custom theme
    monaco.editor.defineTheme('my-custom-theme', {
      base: 'vs-dark', // You can base it on 'vs', 'vs-dark', or 'hc-black'
      inherit: true,   // Inherit the defaults from 'vs-dark'
      rules: [
        // You can add custom syntax highlighting rules here if you want
        // { token: 'comment', foreground: 'ffa500', fontStyle: 'italic' }
      ],
      colors: {
        // --- 3. This is where your custom colors go ---
        
        // This is the main one you wanted:
        'editor.background': '#0a1f2b',

        // I've added a few others from your list to get you started
        'editor.foreground': '#d4d4d4',
        'editor.selectionBackground': '#264f78',
        'editorWidget.background': '#494952',
        'editorError.foreground': '#f48771',
        'editorWarning.foreground': '#cca700',
        'editorCursor.foreground': '#d4d4d4',
        'editor.selectionHighlightBorder': '#264f78',

        // You can translate the rest of your --vscode- variables
        // to this 'key': 'value' format.
      }
    });

    // --- THIS IS THE FIX ---
    // After defining the theme, explicitly tell this editor instance to use it.
    // This solves the race condition.
    editor.updateOptions({ theme: 'my-custom-theme' });
  }

  runCode(): void {
    if (this.language === 'python') {
      this.runPythonCode();
    } else {
      this.output.set('Running this language is not supported yet.');
    }
  }

  // This is a simple, sandboxed simulation of running Python code.
  // It intercepts 'print' calls.
  private runPythonCode(): void {
    let printOutput = '';
    const console = {
      log: (...args: any[]) => {
        printOutput += args.join(' ') + '\n';
      }
    };
    
    // Create a sandboxed function
    const sandboxedRun = new Function('print', this.code);
    
    try {
      // Run the code
      sandboxedRun(console.log);
      // Set the output to what was captured
      this.output.set(printOutput || 'Code executed successfully.');
    } catch (e: any) {
      this.output.set(`Error: ${e.message}`);
    }
  }
}
