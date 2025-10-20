# Testing PhpSPA Highlighter Plugin

This guide helps you test the PhpSPA Highlighter plugin in Acode.

## Prerequisites

- Acode app installed (version 1.8.0 or higher recommended)
- Android device or emulator

## Installation for Testing

### Method 1: Install from Acode Plugin Manager (when published)
1. Open Acode
2. Go to **Settings** → **Plugins**
3. Search for "PhpSPA Highlighter"
4. Tap **Install**
5. Restart Acode

### Method 2: Manual Installation (for development/testing)
1. Build the plugin:
   ```bash
   npm install
   npm run build
   ```
2. The `dist.zip` file will be created in the root directory
3. Transfer `dist.zip` to your Android device
4. In Acode, go to **Settings** → **Plugins** → **Install from Device**
5. Select the `dist.zip` file
6. Restart Acode

## Testing the Plugin

### Step 1: Open a PHP File
1. Create a new file or open an existing PHP file in Acode
2. The file must have a `.php` extension

### Step 2: Test Basic Heredoc Syntax

Copy and paste this code:

```php
<?php

class Test {
    public function html() {
        return <<<HTML
            <div class="container">
                <h1>Test Heading</h1>
            </div>
        HTML;
    }
}
```

**Expected Result:**
- `<<<HTML` and `HTML;` should be highlighted as heredoc delimiters
- HTML tags like `<div>`, `<h1>` should be highlighted with HTML syntax
- Attributes like `class="container"` should be properly highlighted

### Step 3: Test Variable Interpolation

```php
<?php

$name = "World";
$html = <<<HTML
    <p>Hello {$name}!</p>
HTML;
```

**Expected Result:**
- `{$name}` should be highlighted as a PHP variable (different color from regular HTML text)

### Step 4: Test CSS Heredoc

```php
<?php

$styles = <<<CSS
    .container {
        padding: 20px;
        background: #f0f0f0;
    }
CSS;
```

**Expected Result:**
- CSS selectors (`.container`) should be highlighted
- CSS properties (`padding`, `background`) should be highlighted
- CSS values should be highlighted appropriately

### Step 5: Test JavaScript Heredoc

```php
<?php

$script = <<<JS
    function sayHello() {
        console.log('Hello!');
    }
JS;
```

**Expected Result:**
- JavaScript keywords (`function`, `console`) should be highlighted
- Strings should be highlighted
- Function names should be highlighted

### Step 6: Test Nowdoc (No Interpolation)

```php
<?php

$static = <<<'HTML'
    <p>{$variable} will not be interpolated</p>
HTML;
```

**Expected Result:**
- HTML should be highlighted normally
- `{$variable}` should NOT be highlighted as a PHP variable (it's literal text)

### Step 7: Test All Identifiers

The plugin supports these heredoc identifiers:
- `<<<HTML` and `<<<'HTML'`
- `<<<CSS` and `<<<'CSS'`
- `<<<JS` and `<<<'JS'`
- `<<<JAVASCRIPT` and `<<<'JAVASCRIPT'`

### Step 8: Use the Example File

Open the `example.php` file included in the repository to see a comprehensive demonstration of all features.

## Troubleshooting

### Plugin Not Working
1. **Check Acode version**: Make sure you're using Acode 1.8.0 or higher
2. **Restart Acode**: After installing the plugin, restart the app
3. **Check file extension**: The file must have a `.php` extension
4. **Check console**: In Acode, check the developer console for any error messages

### Syntax Highlighting Not Appearing
1. **Switch files**: Try switching to another file and back
2. **Reload file**: Close and reopen the PHP file
3. **Check heredoc syntax**: Make sure you're using the correct identifiers (HTML, CSS, JS, or JAVASCRIPT)
4. **Check for console messages**: The plugin logs messages like "PhpSPA Highlighter: Mode registered successfully"

### Console Debugging

The plugin logs helpful messages to the console:
- `PhpSPA Highlighter: Mode registered successfully` - Plugin initialized correctly
- `PhpSPA Highlighter: Ace Editor not found` - Ace Editor is not available (serious issue)
- `PhpSPA Highlighter: Error applying mode to file` - There was an error applying the mode

## Expected Behavior

When working correctly, you should see:
- ✅ HTML tags, attributes, and content properly highlighted
- ✅ CSS selectors, properties, and values properly highlighted
- ✅ JavaScript keywords, strings, and functions properly highlighted
- ✅ PHP variables `{$variable}` highlighted in heredocs (but not nowdocs)
- ✅ Heredoc/nowdoc delimiters properly highlighted
- ✅ Normal PHP code outside heredocs highlighted as usual

## Reporting Issues

If you encounter any issues:
1. Check the console for error messages
2. Create an issue on GitHub: https://github.com/dconco/phpspa-highlighter-plugin/issues
3. Include:
   - Acode version
   - Plugin version
   - Android version
   - Sample PHP code that's not highlighting correctly
   - Screenshots if possible
   - Any console error messages
