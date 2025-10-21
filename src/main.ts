import { PhpSpaHighlightRules } from './php_spa_highlight_rules';

class PhpSpaHighlighter {
    private highlightRules: PhpSpaHighlightRules;

    constructor() {
        this.highlightRules = new PhpSpaHighlightRules();
    }

    public async init(): Promise<void> {
        // Extend PHP mode to support embedded HTML/CSS/JS in heredocs
        this.highlightRules.extendPhpMode();
        
        // Apply globally to all PHP files
        this.applyGlobally();
        
        console.log("PhpSPA Highlighter: Initialized globally");
    }

    private applyGlobally(): void {
        // @ts-ignore
        const ace = window.ace;
        if (!ace) return;

        // Intercept when mode is set to PHP and replace with PhpSPA
        // @ts-ignore
        if (window.editorManager) {
            // @ts-ignore
            const editorManager = window.editorManager;
            
            // Hook into file switching
            const originalSwitchFile = editorManager.switchFile;
            if (originalSwitchFile) {
                editorManager.switchFile = function(file: any) {
                    const result = originalSwitchFile.apply(this, arguments);
                    setTimeout(() => {
                        if (file && file.session) {
                            const mode = file.session.getMode();
                            if (mode && mode.$id === "ace/mode/php") {
                                file.session.setMode("ace/mode/php_spa");
                                console.log("Applied PhpSPA to:", file.filename);
                            }
                        }
                    }, 50);
                    return result;
                };
            }

            // Hook into adding new files
            const originalAddFile = editorManager.addFile;
            if (originalAddFile) {
                editorManager.addFile = function(file: any) {
                    const result = originalAddFile.apply(this, arguments);
                    setTimeout(() => {
                        if (file && file.session) {
                            const mode = file.session.getMode();
                            if (mode && mode.$id === "ace/mode/php") {
                                file.session.setMode("ace/mode/php_spa");
                                console.log("Applied PhpSPA to new file:", file.filename);
                            }
                        }
                    }, 50);
                    return result;
                };
            }

            // Apply to all currently open PHP files
            if (editorManager.files) {
                editorManager.files.forEach((file: any) => {
                    if (file && file.session) {
                        const mode = file.session.getMode();
                        if (mode && mode.$id === "ace/mode/php") {
                            file.session.setMode("ace/mode/php_spa");
                            console.log("Applied PhpSPA to existing file:", file.filename);
                        }
                    }
                });
            }
        }

        console.log("PhpSPA mode applied globally");
    }

    public destroy(): void {
        console.log("PhpSPA Highlighter: Plugin unloaded");
    }
}

if (window.acode) {
    const acodePlugin = new PhpSpaHighlighter();
    acode.setPluginInit(
        "acode.plugin.phpspa",
        async (
            baseUrl: string,
            $page: HTMLElement,
            {
                cacheFile,
                cacheFileUrl,
            }: { cacheFile: string; cacheFileUrl: string }
        ) => {
            if (!baseUrl.endsWith("/")) {
                baseUrl += "/";
            }
            await acodePlugin.init();
        }
    );
    acode.setPluginUnmount("acode.plugin.phpspa", () => {
        acodePlugin.destroy();
    });
}
