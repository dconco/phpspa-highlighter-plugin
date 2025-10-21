# 🎨 PhpSPA Highlighter

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Acode](https://img.shields.io/badge/Acode-Plugin-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green)

**Syntax highlighting for PhpSPA components in Acode**

</div>

## What is this?

PhpSPA uses heredoc syntax to write HTML, CSS, and JavaScript inside PHP components. This plugin makes that code actually look good with proper syntax highlighting.

## Features

- 🎯 Highlights `<<<HTML`, `<<<CSS`, `<<<JS`, `<<<JAVASCRIPT` heredocs
- 🔄 Supports both heredoc and nowdoc (`<<<'HTML'`)
- 📐 Variable interpolation: `{$name}` in heredocs
- ✨ Indented heredoc syntax (PHP 7.3+)

## Installation

1. Open Acode → **Settings** → **Plugins**
2. Search for **"PhpSPA Highlighter"**
3. Tap **Install** and restart

## Usage

Just write your PhpSPA components normally:

```php
<?php

class Button {
   public function __render($name) {
      return <<<HTML
         <button class="btn" onclick="handleClick()">
            Hello {$name}!
         </button>
      HTML;
   }
   
   public function styles($defaultColor) {
      return <<<CSS
         .btn {
            padding: 10px 20px;
            background: {$defaultColor};
            color: white;
         }
      CSS;
   }
   
   public function script() {
      return <<<JS
         function handleClick() {
            alert('Clicked!');
         }
      JS;
   }
}
```

That's it! The plugin automatically detects and highlights your heredoc blocks.

## Supported Identifiers

| Heredoc | Nowdoc | Language |
|---------|--------|----------|
| `<<<HTML` | `<<<'HTML'` | HTML |
| `<<<CSS` | `<<<'CSS'` | CSS |
| `<<<JS` | `<<<'JS'` | JavaScript |
| `<<<JAVASCRIPT` | `<<<'JAVASCRIPT'` | JavaScript |


## License

MIT

---

<div align="center">

**Made for the PhpSPA community** ❤️

[Report Bug](https://github.com/dconco/phpspa-highlighter-plugin/issues) • [Request Feature](https://github.com/dconco/phpspa-highlighter-plugin/issues) • [View Docs](QUICK_START.md)

</div>