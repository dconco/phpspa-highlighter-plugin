/**
 * Type definitions for Ace Editor
 * Used by PhpSPA Highlighter plugin
 */

interface AceHighlightRule {
  token: string | string[];
  regex: string | RegExp;
  next?: string;
  push?: boolean | string;
  defaultToken?: string;
}

interface AceHighlightRules {
  $rules: { [state: string]: AceHighlightRule[] };
  embedRules(rules: any, prefix: string, escapeRules?: AceHighlightRule[]): void;
  normalizeRules(): void;
}

interface AceMode {
  $id: string;
  HighlightRules: new () => AceHighlightRules;
}

interface AceEditor {
  require(module: string): any;
  define(name: string, deps: string[], factory: (require: any, exports: any, module?: any) => void): void;
}

declare global {
  interface Window {
    ace?: AceEditor;
  }
}

export {};