/* Monaco empacotado localmente (sem CDN), com apenas os recursos usados
   pela biblioteca de códigos: leitura, busca, dobra, seleção e cópia. */
import * as monaco from 'monaco-editor/editor/editor.api';
import 'monaco-editor/features/codicon/register';
import 'monaco-editor/features/find/register';
import 'monaco-editor/features/folding/register';
import 'monaco-editor/features/bracketMatching/register';
import 'monaco-editor/features/clipboard/register';
import 'monaco-editor/features/contextmenu/register';
import 'monaco-editor/features/wordHighlighter/register';
import 'monaco-editor/features/lineSelection/register';
import 'monaco-editor/features/stickyScroll/register';
import 'monaco-editor/languages/definitions/cpp/register';
import 'monaco-editor/languages/definitions/python/register';
import 'monaco-editor/languages/definitions/javascript/register';
import EditorWorker from 'monaco-editor/editor/editor.worker?worker';
import { loader } from '@monaco-editor/react';

(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};

monaco.editor.defineTheme('battle-bots', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b6b6b', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'ff642f' },
    { token: 'keyword.directive', foreground: 'ef3535' },
    { token: 'string', foreground: 'd9d9d9' },
    { token: 'number', foreground: 'ef3535' },
    { token: 'type', foreground: 'f5f5f5', fontStyle: 'bold' },
    { token: 'identifier', foreground: 'c8c8c8' },
    { token: 'delimiter', foreground: '7a7a7a' },
  ],
  colors: {
    'editor.background': '#0d0d0d',
    'editor.foreground': '#d4d4d4',
    'editorLineNumber.foreground': '#3c3c3c',
    'editorLineNumber.activeForeground': '#929292',
    'editor.lineHighlightBackground': '#161616',
    'editor.lineHighlightBorder': '#00000000',
    'editor.selectionBackground': '#ef353540',
    'editor.inactiveSelectionBackground': '#ef353525',
    'editorCursor.foreground': '#ff642f',
    'editorIndentGuide.background1': '#1d1d1d',
    'editorIndentGuide.activeBackground1': '#333333',
    'scrollbarSlider.background': '#ffffff14',
    'scrollbarSlider.hoverBackground': '#ffffff24',
    'scrollbarSlider.activeBackground': '#ffffff30',
    'editorWidget.background': '#141414',
    'editorWidget.border': '#333333',
    'editorStickyScroll.background': '#0d0d0d',
    'editorBracketHighlight.foreground1': '#8a8a8a',
    'editorBracketHighlight.foreground2': '#8a8a8a',
    'editorBracketHighlight.foreground3': '#8a8a8a',
  },
});

loader.config({ monaco });

export { monaco };
