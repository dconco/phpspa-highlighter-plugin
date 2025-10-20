/**
 * PhpSPA Syntax Mode for Ace Editor
 * Extends PHP syntax highlighting to support embedded HTML, CSS, and JavaScript in heredoc/nowdoc blocks
 * 
 * This implementation uses Ace's embedRules feature to properly embed language modes
 * for a seamless multi-language syntax highlighting experience.
 */

export class PhpSpaMode {
  private ace: any;

  constructor(ace: any) {
    this.ace = ace;
  }

  createMode() {
    const ace = this.ace;
    
    // Load required ace modules with error handling
    let oop, PhpMode, PhpHighlightRules, HtmlHighlightRules, CssHighlightRules, JavaScriptHighlightRules;
    
    try {
      oop = ace.require("ace/lib/oop");
      if (!oop) throw new Error("Failed to load ace/lib/oop");
      
      const phpModule = ace.require("ace/mode/php");
      PhpMode = phpModule.Mode;
      if (!PhpMode) throw new Error("Failed to load PHP Mode");
      
      const phpHighlightModule = ace.require("ace/mode/php_highlight_rules");
      PhpHighlightRules = phpHighlightModule.PhpHighlightRules;
      if (!PhpHighlightRules) throw new Error("Failed to load PHP Highlight Rules");
      
      const htmlHighlightModule = ace.require("ace/mode/html_highlight_rules");
      HtmlHighlightRules = htmlHighlightModule.HtmlHighlightRules;
      if (!HtmlHighlightRules) throw new Error("Failed to load HTML Highlight Rules");
      
      const cssHighlightModule = ace.require("ace/mode/css_highlight_rules");
      CssHighlightRules = cssHighlightModule.CssHighlightRules;
      if (!CssHighlightRules) throw new Error("Failed to load CSS Highlight Rules");
      
      const jsHighlightModule = ace.require("ace/mode/javascript_highlight_rules");
      JavaScriptHighlightRules = jsHighlightModule.JavaScriptHighlightRules;
      if (!JavaScriptHighlightRules) throw new Error("Failed to load JavaScript Highlight Rules");
      
      console.log('PhpSPA Highlighter: All Ace modules loaded successfully');
    } catch (error) {
      console.error('PhpSPA Highlighter: Error loading Ace modules:', error);
      throw error;
    }

    // Create custom highlight rules that extend PHP rules
    const PhpSpaHighlightRules = function(this: any) {
      // Call parent constructor
      PhpHighlightRules.call(this);

      // Get instances of the embedded language highlight rules
      const htmlRules = new HtmlHighlightRules().getRules();
      const cssRules = new CssHighlightRules().getRules();
      const jsRules = new JavaScriptHighlightRules({ jsx: false }).getRules();

      // Define heredoc start patterns for HTML
      const htmlHeredocStart = {
        token: "string.heredoc.delimiter.php",
        regex: "<<<\\s*(HTML)\\s*$",
        next: "htmlHeredoc-start",
        push: true
      };

      const htmlNowdocStart = {
        token: "string.heredoc.delimiter.php",
        regex: "<<<\\s*'(HTML)'\\s*$",
        next: "htmlNowdoc-start",
        push: true
      };

      // Define heredoc start patterns for CSS
      const cssHeredocStart = {
        token: "string.heredoc.delimiter.php",
        regex: "<<<\\s*(CSS)\\s*$",
        next: "cssHeredoc-start",
        push: true
      };

      const cssNowdocStart = {
        token: "string.heredoc.delimiter.php",
        regex: "<<<\\s*'(CSS)'\\s*$",
        next: "cssNowdoc-start",
        push: true
      };

      // Define heredoc start patterns for JavaScript
      const jsHeredocStart = {
        token: "string.heredoc.delimiter.php",
        regex: "<<<\\s*(JS|JAVASCRIPT)\\s*$",
        next: "jsHeredoc-start",
        push: true
      };

      const jsNowdocStart = {
        token: "string.heredoc.delimiter.php",
        regex: "<<<\\s*'(JS|JAVASCRIPT)'\\s*$",
        next: "jsNowdoc-start",
        push: true
      };

      // Add heredoc start patterns to PHP start rules
      // These need to be at the beginning to have higher priority
      if (this.$rules.start) {
        this.$rules.start.unshift(
          htmlHeredocStart,
          htmlNowdocStart,
          cssHeredocStart,
          cssNowdocStart,
          jsHeredocStart,
          jsNowdocStart
        );
      }

      // Embed HTML highlighting rules for heredoc (with PHP variable interpolation)
      this.embedRules(htmlRules, "htmlHeredoc-", [
        {
          token: "string.heredoc.delimiter.php",
          regex: "^\\s*(HTML)\\s*;?\\s*$",
          next: "pop"
        },
        {
          token: "variable.other.php",
          regex: "\\{\\$[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*\\}"
        }
      ]);

      // Embed HTML highlighting rules for nowdoc (no PHP variable interpolation)
      this.embedRules(htmlRules, "htmlNowdoc-", [
        {
          token: "string.heredoc.delimiter.php",
          regex: "^\\s*(HTML)\\s*;?\\s*$",
          next: "pop"
        }
      ]);

      // Embed CSS highlighting rules for heredoc (with PHP variable interpolation)
      this.embedRules(cssRules, "cssHeredoc-", [
        {
          token: "string.heredoc.delimiter.php",
          regex: "^\\s*(CSS)\\s*;?\\s*$",
          next: "pop"
        },
        {
          token: "variable.other.php",
          regex: "\\{\\$[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*\\}"
        }
      ]);

      // Embed CSS highlighting rules for nowdoc (no PHP variable interpolation)
      this.embedRules(cssRules, "cssNowdoc-", [
        {
          token: "string.heredoc.delimiter.php",
          regex: "^\\s*(CSS)\\s*;?\\s*$",
          next: "pop"
        }
      ]);

      // Embed JavaScript highlighting rules for heredoc (with PHP variable interpolation)
      this.embedRules(jsRules, "jsHeredoc-", [
        {
          token: "string.heredoc.delimiter.php",
          regex: "^\\s*(JS|JAVASCRIPT)\\s*;?\\s*$",
          next: "pop"
        },
        {
          token: "variable.other.php",
          regex: "\\{\\$[a-zA-Z_\\x7f-\\xff][a-zA-Z0-9_\\x7f-\\xff]*\\}"
        }
      ]);

      // Embed JavaScript highlighting rules for nowdoc (no PHP variable interpolation)
      this.embedRules(jsRules, "jsNowdoc-", [
        {
          token: "string.heredoc.delimiter.php",
          regex: "^\\s*(JS|JAVASCRIPT)\\s*;?\\s*$",
          next: "pop"
        }
      ]);

      // Normalize all rules
      this.normalizeRules();
    };

    // Set up inheritance
    oop.inherits(PhpSpaHighlightRules, PhpHighlightRules);

    // Create the custom mode class
    const PhpSpaMode = function(this: any) {
      PhpMode.call(this);
      this.HighlightRules = PhpSpaHighlightRules;
      this.$id = "ace/mode/phpspa";
    };

    // Set up inheritance for the mode
    oop.inherits(PhpSpaMode, PhpMode);

    // Return the mode constructor
    return PhpSpaMode;
  }

  register() {
    const PhpSpaMode = this.createMode();
    
    // Register the custom mode with Ace
    this.ace.define("ace/mode/phpspa", ["require", "exports", "module"], (require: any, exports: any) => {
      exports.Mode = PhpSpaMode;
    });

    return PhpSpaMode;
  }
}