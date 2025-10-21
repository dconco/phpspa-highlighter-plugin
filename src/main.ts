import { PhpSpaHighlightRules } from './php_spa_highlight_rules';

class PhpSpaHighlighter {
    private highlightRules: PhpSpaHighlightRules;

    constructor() {
        this.highlightRules = new PhpSpaHighlightRules();
    }

    public async init(): Promise<void> {
        // Extend PHP mode to support embedded HTML/CSS/JS in heredocs
        this.highlightRules.extendPhpMode();
        
        // Apply custom mode to PHP files
        this.applyToEditor();
        
        alert("PhpSPA Highlighter: Initialized");
    }

    private applyToEditor(): void {
        // @ts-ignore
        const ace = window.ace;
        if (!ace) return;

        // Get active editor and apply custom mode
        // @ts-ignore
        if (window.editorManager && window.editorManager.activeFile) {
            // @ts-ignore
            const activeFile = window.editorManager.activeFile;
            if (activeFile.session && activeFile.session.getMode().$id === "ace/mode/php") {
                activeFile.session.setMode("ace/mode/php_spa");
                alert("Applied PhpSPA mode to active PHP file");
            }
        }

        // Hook into new file opens
        // @ts-ignore
        if (window.editorManager) {
            // @ts-ignore
            const originalSwitch = window.editorManager.switchFile;
            // @ts-ignore
            window.editorManager.switchFile = function(file: any) {
                const result = originalSwitch.call(this, file);
                setTimeout(() => {
                    if (file && file.session && file.session.getMode().$id === "ace/mode/php") {
                        file.session.setMode("ace/mode/php_spa");
                        alert("Applied PhpSPA mode to: " + file.filename);
                    }
                }, 100);
                return result;
            };
        }
    }

    public destroy(): void {
        alert("PhpSPA Highlighter: Plugin unloaded");
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
