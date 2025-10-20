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
          token: "invalid",
          regex: /^\s*(HTML)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "invalid",
          regex: /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\}/
        },
        {
          token: "invalid",
          regex: /<\/?[a-zA-Z][a-zA-Z0-9]*\b/,
          next: "htmlTag"
        },
        {
          token: "invalid",
          regex: /[^<\{]+/
        },
        {
          defaultToken: "invalid"
        }
      ];

      // HTML tag state for basic HTML highlighting
      this.$rules.htmlTag = [
        {
          token: "invalid",
          regex: />/,
          next: "htmlHeredocBody"
        },
        {
          token: "invalid",
          regex: /[a-zA-Z-]+/
        },
        {
          token: "invalid",
          regex: /=/
        },
        {
          token: "invalid",
          regex: /"[^"]*"/
        },
        {
          token: "invalid", 
          regex: /'[^']*'/
        },
        {
          defaultToken: "invalid"
        }
      ];

      // Define HTML nowdoc body rules (no variable interpolation)
      this.$rules.htmlNowdocBody = [
        {
          token: "invalid",
          regex: /^\s*(HTML)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "invalid",
          regex: /<\/?[a-zA-Z][a-zA-Z0-9]*\b/,
          next: "htmlTagNowdoc"
        },
        {
          token: "invalid",
          regex: /[^<]+/
        },
        {
          defaultToken: "invalid"
        }
      ];

      // HTML tag state for nowdoc
      this.$rules.htmlTagNowdoc = [
        {
          token: "invalid",
          regex: />/,
          next: "htmlNowdocBody"
        },
        {
          token: "invalid",
          regex: /[a-zA-Z-]+/
        },
        {
          token: "invalid",
          regex: /=/
        },
        {
          token: "invalid",
          regex: /"[^"]*"/
        },
        {
          token: "invalid",
          regex: /'[^']*'/
        },
        {
          defaultToken: "invalid"
        }
      ];

      // Define CSS heredoc body rules (with variable interpolation)
      this.$rules.cssHeredocBody = [
        {
          token: "invalid",
          regex: /^\s*(CSS)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "invalid",
          regex: /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\}/
        },
        {
          token: "invalid",
          regex: /[a-zA-Z-]+(?=\s*:)/
        },
        {
          token: "invalid",
          regex: /:/
        },
        {
          token: "invalid",
          regex: /[^;\{\}]+/
        },
        {
          token: "invalid",
          regex: /;/
        },
        {
          defaultToken: "invalid"
        }
      ];

      // Define CSS nowdoc body rules (no variable interpolation)
      this.$rules.cssNowdocBody = [
        {
          token: "invalid",
          regex: /^\s*(CSS)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "invalid",
          regex: /[a-zA-Z-]+(?=\s*:)/
        },
        {
          token: "invalid",
          regex: /:/
        },
        {
          token: "invalid",
          regex: /[^;\{\}]+/
        },
        {
          token: "invalid",
          regex: /;/
        },
        {
          defaultToken: "invalid"
        }
      ];

      // Define JavaScript heredoc body rules (with variable interpolation)  
      this.$rules.jsHeredocBody = [
        {
          token: "invalid",
          regex: /^\s*(JS|JAVASCRIPT)\s*;?\s*$/,
          next: "pop"
        },
        {
          token: "invalid",
          regex: /\{\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*\}/
        },
        {
          token: "invalid",
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
          defaultToken: "invalid"
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

      // Force ALL tokens across all states to 'invalid' so everything is visibly red.
      try {
        Object.keys(this.$rules).forEach((state: string) => {
          this.$rules[state] = this.$rules[state].map((rule: any) => {
            const copy: any = { ...rule };
            if (typeof copy.token === 'string') {
              copy.token = 'invalid';
            } else if (Array.isArray(copy.token)) {
              copy.token = copy.token.map(() => 'invalid');
            }
            if ('defaultToken' in copy) {
              copy.defaultToken = 'invalid';
            }
            return copy;
          });
          const hasDefault = this.$rules[state].some((r: any) => 'defaultToken' in r);
          if (!hasDefault) {
            this.$rules[state].push({ defaultToken: 'invalid' } as any);
          }
        });
      } catch (e) {
        // ignore transform errors; fallback to normal rules
      }

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