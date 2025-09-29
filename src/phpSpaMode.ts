/**
 * PhpSPA Syntax Mode for Ace Editor
 * Extends PHP syntax highlighting to support embedded HTML, CSS, and JavaScript in heredoc/nowdoc blocks
 */

// Define the custom PHP mode that extends Ace's built-in PHP mode
export class PhpSpaMode {
  private ace: any;

  constructor(ace: any) {
    this.ace = ace;
  }

  createMode() {
    const ace = this.ace;
    const oop = ace.require("ace/lib/oop");
    const TextMode = ace.require("ace/mode/text").Mode;
    const PhpMode = ace.require("ace/mode/php").Mode;
    const TextHighlightRules = ace.require("ace/mode/text_highlight_rules").TextHighlightRules;
    const PhpHighlightRules = ace.require("ace/mode/php_highlight_rules").PhpHighlightRules;

    // Create custom highlight rules that extend PHP rules
    const PhpSpaHighlightRules = function(this: any) {
      PhpHighlightRules.call(this);

      // Define patterns for heredoc/nowdoc detection with embedded language highlighting
      const heredocRules = [
        // HTML heredoc patterns
        {
          token: "string.heredoc.delimiter.html",
          regex: /<<<\s*(HTML)\s*$/,
          next: "htmlHeredocBody",
          push: true
        },
        {
          token: "string.heredoc.delimiter.html", 
          regex: /<<<\s*'(HTML)'\s*$/,
          next: "htmlNowdocBody",
          push: true
        },
        
        // CSS heredoc patterns
        {
          token: "string.heredoc.delimiter.css",
          regex: /<<<\s*(CSS)\s*$/,
          next: "cssHeredocBody",
          push: true
        },
        {
          token: "string.heredoc.delimiter.css",
          regex: /<<<\s*'(CSS)'\s*$/,
          next: "cssNowdocBody", 
          push: true
        },

        // JavaScript heredoc patterns
        {
          token: "string.heredoc.delimiter.javascript",
          regex: /<<<\s*(JS|JAVASCRIPT)\s*$/,
          next: "jsHeredocBody",
          push: true
        },
        {
          token: "string.heredoc.delimiter.javascript",
          regex: /<<<\s*'(JS|JAVASCRIPT)'\s*$/,
          next: "jsNowdocBody",
          push: true
        }
      ];

      // Add heredoc patterns to the start of PHP rules
      for (let i = heredocRules.length - 1; i >= 0; i--) {
        this.$rules.start.unshift(heredocRules[i]);
      }

      // Define HTML heredoc body rules (with variable interpolation)
      this.$rules.htmlHeredocBody = [
        {
          token: "string.heredoc.delimiter.html",
          regex: /^\s*(HTML)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "variable.interpolated.php",
          regex: /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\}/
        },
        {
          token: "meta.tag.html",
          regex: /<\/?[a-zA-Z][a-zA-Z0-9]*\b/,
          next: "htmlTag"
        },
        {
          token: "text.html",
          regex: /[^<\{]+/
        },
        {
          defaultToken: "text.html"
        }
      ];

      // HTML tag state for basic HTML highlighting
      this.$rules.htmlTag = [
        {
          token: "meta.tag.html",
          regex: />/,
          next: "htmlHeredocBody"
        },
        {
          token: "entity.other.attribute-name.html",
          regex: /[a-zA-Z-]+/
        },
        {
          token: "keyword.operator.html",
          regex: /=/
        },
        {
          token: "string.quoted.html",
          regex: /"[^"]*"/
        },
        {
          token: "string.quoted.html", 
          regex: /'[^']*'/
        },
        {
          defaultToken: "meta.tag.html"
        }
      ];

      // Define HTML nowdoc body rules (no variable interpolation)
      this.$rules.htmlNowdocBody = [
        {
          token: "string.heredoc.delimiter.html",
          regex: /^\s*(HTML)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "meta.tag.html",
          regex: /<\/?[a-zA-Z][a-zA-Z0-9]*\b/,
          next: "htmlTagNowdoc"
        },
        {
          token: "text.html",
          regex: /[^<]+/
        },
        {
          defaultToken: "text.html"
        }
      ];

      // HTML tag state for nowdoc
      this.$rules.htmlTagNowdoc = [
        {
          token: "meta.tag.html",
          regex: />/,
          next: "htmlNowdocBody"
        },
        {
          token: "entity.other.attribute-name.html",
          regex: /[a-zA-Z-]+/
        },
        {
          token: "keyword.operator.html",
          regex: /=/
        },
        {
          token: "string.quoted.html",
          regex: /"[^"]*"/
        },
        {
          token: "string.quoted.html",
          regex: /'[^']*'/
        },
        {
          defaultToken: "meta.tag.html"
        }
      ];

      // Define CSS heredoc body rules (with variable interpolation)
      this.$rules.cssHeredocBody = [
        {
          token: "string.heredoc.delimiter.css",
          regex: /^\s*(CSS)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "variable.interpolated.php",
          regex: /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\}/
        },
        {
          token: "support.type.property-name.css",
          regex: /[a-zA-Z-]+(?=\s*:)/
        },
        {
          token: "punctuation.separator.css",
          regex: /:/
        },
        {
          token: "support.constant.property-value.css",
          regex: /[^;\{\}]+/
        },
        {
          token: "punctuation.terminator.css",
          regex: /;/
        },
        {
          defaultToken: "source.css"
        }
      ];

      // Define CSS nowdoc body rules (no variable interpolation)
      this.$rules.cssNowdocBody = [
        {
          token: "string.heredoc.delimiter.css",
          regex: /^\s*(CSS)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "support.type.property-name.css",
          regex: /[a-zA-Z-]+(?=\s*:)/
        },
        {
          token: "punctuation.separator.css",
          regex: /:/
        },
        {
          token: "support.constant.property-value.css",
          regex: /[^;\{\}]+/
        },
        {
          token: "punctuation.terminator.css",
          regex: /;/
        },
        {
          defaultToken: "source.css"
        }
      ];

      // Define JavaScript heredoc body rules (with variable interpolation)  
      this.$rules.jsHeredocBody = [
        {
          token: "string.heredoc.delimiter.javascript",
          regex: /^\s*(JS|JAVASCRIPT)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "variable.interpolated.php",
          regex: /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\}/
        },
        {
          token: "storage.type.js",
          regex: /\b(?:function|var|let|const|class)\b/
        },
        {
          token: "keyword.control.js",
          regex: /\b(?:if|else|for|while|return|break|continue)\b/
        },
        {
          token: "string.quoted.js",
          regex: /"(?:[^"\\]|\\.)*"/
        },
        {
          token: "string.quoted.js",
          regex: /'(?:[^'\\]|\\.)*'/
        },
        {
          token: "constant.numeric.js",
          regex: /\b\d+\.?\d*\b/
        },
        {
          defaultToken: "source.js"
        }
      ];

      // Define JavaScript nowdoc body rules (no variable interpolation)
      this.$rules.jsNowdocBody = [
        {
          token: "string.heredoc.delimiter.javascript",
          regex: /^\s*(JS|JAVASCRIPT)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "storage.type.js",
          regex: /\b(?:function|var|let|const|class)\b/
        },
        {
          token: "keyword.control.js",
          regex: /\b(?:if|else|for|while|return|break|continue)\b/
        },
        {
          token: "string.quoted.js",
          regex: /"(?:[^"\\]|\\.)*"/
        },
        {
          token: "string.quoted.js",
          regex: /'(?:[^'\\]|\\.)*'/
        },
        {
          token: "constant.numeric.js",
          regex: /\b\d+\.?\d*\b/
        },
        {
          defaultToken: "source.js"
        }
      ];

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