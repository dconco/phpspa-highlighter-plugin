# PhpSPA Highlighter - Technical Documentation

## How It Works

This Acode plugin extends the default PHP syntax highlighter to support embedded language highlighting in heredoc and nowdoc blocks. It achieves this by:

### 1. Custom Syntax Mode
- Creates a custom Ace Editor mode (`PhpSpaMode`) that extends the built-in PHP mode
- Overrides the default PHP highlighting rules to detect heredoc/nowdoc patterns

### 2. Pattern Detection
The plugin detects the following patterns:

**Heredoc (with variable interpolation):**
- `<<<HTML` ... `HTML;`
- `<<<CSS` ... `CSS;`
- `<<<JS` ... `JS;`
- `<<<JAVASCRIPT` ... `JAVASCRIPT;`

**Nowdoc (no variable interpolation):**
- `<<<'HTML'` ... `HTML;`
- `<<<'CSS'` ... `CSS;`
- `<<<'JS'` ... `JS;`
- `<<<'JAVASCRIPT'` ... `JAVASCRIPT;`

### 3. Embedded Language Highlighting
For each detected heredoc/nowdoc block:
- **HTML blocks**: Highlights HTML tags, attributes, and content
- **CSS blocks**: Highlights properties, values, and selectors
- **JavaScript blocks**: Highlights keywords, strings, and functions
- **Variable interpolation**: Highlights `{$variable}` patterns in heredocs (not in nowdocs)

### 4. Implementation Details

#### File Structure
```
src/
├── phpSpaMode.ts     # Custom Ace Editor syntax mode
├── acodePlugin.ts    # Main plugin class, registers the mode
└── main.ts          # Plugin entry point
```

#### Key Components

**PhpSpaMode Class:**
- Extends Ace's PHP highlighter
- Defines custom highlight rules for heredoc detection
- Creates language-specific highlighting states

**AcodePlugin Class:**
- Initializes and registers the custom mode
- Overrides the default PHP mode with PhpSPA mode
- Handles cleanup on plugin destruction

### 5. Usage
Once installed, the plugin automatically activates for all `.php` files in Acode. No additional configuration is required.

### 6. Supported Features
- ✅ HTML highlighting in `<<<HTML` blocks
- ✅ CSS highlighting in `<<<CSS` blocks  
- ✅ JavaScript highlighting in `<<<JS` and `<<<JAVASCRIPT` blocks
- ✅ Variable interpolation highlighting (`{$variable}`) in heredocs
- ✅ Nowdoc support (quoted identifiers) without variable interpolation
- ✅ Proper delimiter highlighting
- ✅ Seamless integration with existing PHP syntax

### 7. Example
```php
<?php
class Component {
    public function render($name) {
        return <<<HTML
            <div class="component">
                <h1>Hello {$name}!</h1>
            </div>
        HTML;
    }
    
    public function styles() {
        return <<<CSS
            .component {
                padding: 20px;
                background: blue;
            }
        CSS;
    }
}
```

In this example:
- The `<<<HTML` and `HTML;` delimiters are highlighted as heredoc delimiters
- HTML tags like `<div>`, `<h1>` are highlighted with HTML syntax
- The `{$name}` variable is highlighted as PHP interpolation
- CSS properties and values are highlighted appropriately