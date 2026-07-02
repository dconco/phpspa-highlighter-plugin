# Changelog

## [1.1.2] - 2026-07-02

### Added
- Added support for Acode's newer CodeMirror editor while keeping Ace support for older Acode versions
- Added `phpspa` language registration for CodeMirror-based Acode versions
- Added CodeMirror heredoc highlighting for `<<<HTML`, `<<<CSS`, `<<<JS`, and `<<<JAVASCRIPT`
- Added nowdoc highlighting for `<<<'HTML'`, `<<<'CSS'`, `<<<'JS'`, and `<<<'JAVASCRIPT'`
- Added theme-aware CodeMirror colors using Acode's active editor theme
- Added improved JavaScript highlighting inside JS heredocs, including keywords, function names, class names, properties, strings, comments, regex literals, numbers, operators, and variables
- Added improved CSS highlighting inside CSS heredocs, including selectors, properties, custom properties, variables, functions, strings, comments, and numbers

### Fixed
- Fixed PhpSPA mode not being applied on newer CodeMirror-based Acode versions
- Fixed quoted nowdoc heredocs not being detected in CodeMirror
- Fixed indented heredoc closing detection for endings such as `HTML;`, `HTML)`, and `HTML, $params)`
- Fixed CodeMirror decoration ordering so heredoc highlighting reliably renders
- Fixed hardcoded CodeMirror heredoc colors so highlighting follows the selected Acode theme

## [1.1.1] - 2025-10-21

### Fixed
- Fixed plugin not working at all
- Fixed heredoc syntax highlighting for HTML, CSS, and JavaScript
- Fixed global application across all PHP files

### Added
- Embedded HTML syntax highlighting in `<<<HTML` heredocs
- Embedded CSS syntax highlighting in `<<<CSS` heredocs
- Embedded JavaScript syntax highlighting in `<<<JS` and `<<<JAVASCRIPT` heredocs
- PHP variable interpolation support (`{$var}`) inside heredocs
- Green highlighting for `@Component` style tags
- Heredoc ending detection with `;`, `,`, or no punctuation
