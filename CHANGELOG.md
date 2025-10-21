# Changelog

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
