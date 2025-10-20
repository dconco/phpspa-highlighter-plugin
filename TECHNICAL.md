# PhpSPA Highlighter - Technical Documentation

## How It Works

This Acode plugin extends the default PHP syntax highlighter to support embedded language highlighting in heredoc and nowdoc blocks. It achieves this by leveraging Ace Editor's built-in language modes and the `embedRules` feature.

### 1. Custom Syntax Mode
- Creates a custom Ace Editor mode (`PhpSpaMode`) that extends the built-in PHP mode
- Uses Ace's `embedRules` method to properly embed HTML, CSS, and JavaScript highlighting
- Registers the custom mode as `ace/mode/phpspa`

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
The plugin uses Ace's built-in language modes for authentic syntax highlighting:
- **HTML blocks**: Uses `HtmlHighlightRules` from Ace's HTML mode
- **CSS blocks**: Uses `CssHighlightRules` from Ace's CSS mode
- **JavaScript blocks**: Uses `JavaScriptHighlightRules` from Ace's JavaScript mode
- **Variable interpolation**: Highlights `{$variable}` patterns in heredocs (not in nowdocs)

This approach ensures that:
- All HTML, CSS, and JavaScript features are highlighted correctly
- The highlighting stays up-to-date with Ace Editor's language definitions
- The code is maintainable and follows Ace Editor best practices

### 4. Implementation Details

#### File Structure
```
src/
├── phpSpaMode.ts     # Custom Ace Editor syntax mode with embedRules
├── acodePlugin.ts    # Main plugin class, registers and applies the mode
├── main.ts           # Plugin entry point
├── sideBar.ts        # Sidebar component (unused, reserved for future features)
└── interface/        # TypeScript interfaces
```

#### Key Components

**PhpSpaMode Class:**
- Extends Ace's PHP highlighter using `oop.inherits`
- Uses `embedRules` to embed HTML, CSS, and JavaScript modes
- Defines start patterns for heredoc/nowdoc detection
- Defines end patterns with proper delimiter matching
- Handles variable interpolation in heredocs only

**AcodePlugin Class:**
- Initializes the PhpSpaMode with the Ace Editor instance
- Registers the custom mode with Ace's module system
- Applies the mode to all `.php` files automatically
- Listens to editor events (file switch, file load, new file)
- Provides proper cleanup on plugin unmount

### 5. Mode Application
The plugin applies the custom mode in several ways:
1. **On initialization**: Applies to currently open PHP files
2. **On file switch**: Applies when switching between files
3. **On file load**: Applies when opening a PHP file
4. **On new file**: Applies when creating a new PHP file

No manual configuration is required - the plugin works automatically for all `.php` files.

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