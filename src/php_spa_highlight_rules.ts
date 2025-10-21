// Custom PHP Highlight Rules with embedded HTML/CSS/JS in heredocs

export class PhpSpaHighlightRules {
    private ace: any;

    constructor() {
        // @ts-ignore - Ace is global in Acode
        this.ace = window.ace;
    }

    public extendPhpMode(): void {
        const ace = this.ace;
        if (!ace || !ace.define) {
            console.error("Ace editor not available");
            return;
        }

        // Define custom PHP mode with embedded highlighting
        ace.define('ace/mode/php_spa_highlight_rules', ['require', 'exports', 'module'], 
            (require: any, exports: any, module: any) => {
                const oop = require("ace/lib/oop");
                const PhpHighlightRules = require("ace/mode/php_highlight_rules").PhpHighlightRules;
                const HtmlHighlightRules = require("ace/mode/html_highlight_rules").HtmlHighlightRules;
                const CssHighlightRules = require("ace/mode/css_highlight_rules").CssHighlightRules;
                const JavaScriptHighlightRules = require("ace/mode/javascript_highlight_rules").JavaScriptHighlightRules;

                const PhpSpaHighlightRules = function(this: any) {
                    PhpHighlightRules.call(this);

                    // Embed HTML highlighting for <<<HTML heredocs
                    this.embedRules(HtmlHighlightRules, "html-heredoc-", [
                        {
                            token: "markup.list",
                            regex: /^\s*HTML\s*[;,]?\s*$/,
                            next: "php-start"
                        }
                    ]);

                    // Add PHP variable interpolation to ALL HTML heredoc states
                    Object.keys(this.$rules).forEach((state: string) => {
                        if (state.startsWith("html-heredoc-")) {
                            this.$rules[state].unshift(
                                // {$variable} or {$object->property} or {$array['key']}
                                {
                                    token: ["text", "variable.language", "text"],
                                    regex: /(\{)(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*(?:->[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*|\[[^\]]+\])*)(\})/
                                }
                            );
                        }
                    });

                    // Embed CSS highlighting for <<<CSS heredocs
                    this.embedRules(CssHighlightRules, "css-heredoc-", [
                        {
                            token: "markup.list",
                            regex: /^\s*CSS\s*[;,]?\s*$/,
                            next: "php-start"
                        }
                    ]);

                    // Add PHP variable interpolation to ALL CSS heredoc states
                    Object.keys(this.$rules).forEach((state: string) => {
                        if (state.startsWith("css-heredoc-")) {
                            this.$rules[state].unshift(
                                {
                                    token: ["text", "variable.language", "text"],
                                    regex: /(\{)(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*(?:->[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*|\[[^\]]+\])*)(\})/
                                }
                            );
                        }
                    });

                    // Embed JavaScript highlighting for <<<JS and <<<JAVASCRIPT heredocs
                    this.embedRules(JavaScriptHighlightRules, "js-heredoc-", [
                        {
                            token: "markup.list",
                            regex: /^\s*(JS|JAVASCRIPT)\s*[;,]?\s*$/,
                            next: "php-start"
                        }
                    ]);

                    // Add PHP variable interpolation to ALL JS heredoc states
                    Object.keys(this.$rules).forEach((state: string) => {
                        if (state.startsWith("js-heredoc-")) {
                            this.$rules[state].unshift(
                                {
                                    token: ["text", "variable.language", "text"],
                                    regex: /(\{)(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*(?:->[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*|\[[^\]]+\])*)(\})/
                                }
                            );
                        }
                    });

                    // Add custom highlighting for @ component tags
                    Object.keys(this.$rules).forEach((state: string) => {
                        if (state.startsWith("html-heredoc-")) {
                            this.$rules[state].unshift(
                                // Closing tag: </@Button> or </@button.icon>
                                {
                                    token: ["text", "entity.name.tag.component", "text"],
                                    regex: /(<\/)(@[a-zA-Z_][\w.-]*)(>)/
                                },
                                // Opening tag: <@Button> or <@button.icon>
                                {
                                    token: ["text", "entity.name.tag.component", "text"],
                                    regex: /(<)(@[a-zA-Z_][\w.-]*)([\s>\/])/,
                                    next: state
                                }
                            );
                        }
                    });

                    // Modify heredoc detection to transition to embedded modes
                    const phpRules = this.$rules["php-start"];
                    if (phpRules) {
                        // Find and modify the heredoc rule
                        for (let i = 0; i < phpRules.length; i++) {
                            if (phpRules[i].regex && phpRules[i].regex.toString().includes("<<<")) {
                                // Replace heredoc rule with custom detection
                                phpRules[i] = {
                                    token: "markup.list",
                                    regex: /<<<(?:HTML|'HTML'|"HTML")$/,
                                    next: "html-heredoc-start"
                                };
                                
                                // Add CSS heredoc rule
                                phpRules.splice(i + 1, 0, {
                                    token: "markup.list",
                                    regex: /<<<(?:CSS|'CSS'|"CSS")$/,
                                    next: "css-heredoc-start"
                                });

                                // Add JS heredoc rule
                                phpRules.splice(i + 2, 0, {
                                    token: "markup.list",
                                    regex: /<<<(?:JS|JAVASCRIPT|'JS'|'JAVASCRIPT'|"JS"|"JAVASCRIPT")$/,
                                    next: "js-heredoc-start"
                                });
                                break;
                            }
                        }
                    }
                };

                oop.inherits(PhpSpaHighlightRules, PhpHighlightRules);
                exports.PhpSpaHighlightRules = PhpSpaHighlightRules;
            }
        );

        // Define custom PHP mode
        ace.define('ace/mode/php_spa', ['require', 'exports', 'module'], 
            (require: any, exports: any, module: any) => {
                const oop = require("ace/lib/oop");
                const PhpMode = require("ace/mode/php").Mode;
                const PhpSpaHighlightRules = require("ace/mode/php_spa_highlight_rules").PhpSpaHighlightRules;
                const HtmlMode = require("ace/mode/html").Mode;
                const CssMode = require("ace/mode/css").Mode;
                const JavaScriptMode = require("ace/mode/javascript").Mode;

                const Mode = function(this: any) {
                    PhpMode.call(this);
                    this.HighlightRules = PhpSpaHighlightRules;

                    // Create mode delegates for embedded languages
                    this.createModeDelegates({
                        "html-heredoc-": HtmlMode,
                        "css-heredoc-": CssMode,
                        "js-heredoc-": JavaScriptMode
                    });
                };

                oop.inherits(Mode, PhpMode);

                (function(this: any) {
                    this.$id = "ace/mode/php_spa";
                }).call(Mode.prototype);

                exports.Mode = Mode;
            }
        );

        console.log("PhpSPA custom mode registered");
    }

    public activateForPhpFiles(): void {
        const ace = this.ace;
        
        // Hook into editor session creation to apply custom mode
        if (ace && ace.edit) {
            const originalEdit = ace.edit;
            ace.edit = function(el: any, options: any) {
                const editor = originalEdit.call(ace, el, options);
                
                // Watch for PHP file mode changes
                editor.session.on('changeMode', () => {
                    const mode = editor.session.getMode();
                    if (mode.$id === "ace/mode/php") {
                        alert("Switching to PhpSPA mode");
                        editor.session.setMode("ace/mode/php_spa");
                    }
                });

                return editor;
            };
        }
    }
}
