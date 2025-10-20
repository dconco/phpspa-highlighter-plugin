const alert = acode.require("alert");
const fileList = acode.require("fileList");
const editorManager = acode.require("editorManager");
import SideBar from './sideBar';
import { SideBarReturnFunc } from './interface/SideBar';
import { PhpSpaMode } from './phpSpaMode';

class AcodePlugin {
   baseUrl!: string;
   sideButton!: SideBarReturnFunc;
   private phpSpaMode: PhpSpaMode | null = null;
   private originalPhpMode: any = null;

   async init(): Promise<void> {
      this.initializePhpSpaMode();

      // Apply mode to any already-open PHP files after a short delay
      setTimeout(() => {
         this.applyModeToOpenFiles();
         this.applyModeToCurrentFile();
      }, 300);

      // Set up event listeners for file operations
      if (editorManager && typeof editorManager.on === 'function') {
         // Apply mode when switching between files
         editorManager.on('switch-file', () => this.applyModeToCurrentFile());
         // Apply mode when a file is loaded/opened
         editorManager.on('file-loaded', () => this.applyModeToCurrentFile());
         // Apply mode when a new file is created
         editorManager.on('new-file', () => this.applyModeToCurrentFile());
      }
   }

   private applyModeToCurrentFile(): void {
      if (!editorManager || !editorManager.activeFile) {
         return;
      }
      
      const file = editorManager.activeFile;
      if (file.filename && /\.php$/i.test(file.filename) && file.session && this.phpSpaMode) {
         try {
            // Set our custom mode
            file.session.setMode('ace/mode/phpspa');
            // Force re-tokenization to apply the new mode immediately
            if (file.session.bgTokenizer) {
               file.session.bgTokenizer.start(0);
            }
         } catch (error) {
            console.error('PhpSPA Highlighter: Error applying mode to file:', error);
         }
      }
   }

   private applyModeToOpenFiles(): void {
      if (!editorManager || !editorManager.files) {
         return;
      }
      
      const files = editorManager.files;
      files.forEach((file: any) => {
         try {
            if (file.filename && /\.php$/i.test(file.filename) && file.session) {
               file.session.setMode('ace/mode/phpspa');
               if (file.session.bgTokenizer) {
                  file.session.bgTokenizer.start(0);
               }
            }
         } catch (error) {
            console.error('PhpSPA Highlighter: Error applying mode to open file:', error);
         }
      });
   }

   private initializePhpSpaMode(): void {
      const ace = window.ace;
      if (!ace) {
         console.error('PhpSPA Highlighter: Ace Editor not found');
         return;
      }

      try {
         this.phpSpaMode = new PhpSpaMode(ace);
         // Register our custom mode with Ace
         this.phpSpaMode.register();
         console.log('PhpSPA Highlighter: Mode registered successfully');
      } catch (error) {
         console.error('PhpSPA Highlighter: Error initializing mode:', error);
      }
   }

   async destroy(): Promise<void> {
      this.sideButton?.hide();
      
      if (this.originalPhpMode && window.ace) {
         window.ace.define("ace/mode/php", ["require", "exports", "module"], (require: any, exports: any) => {
            exports.Mode = this.originalPhpMode;
         });
      }
      
      this.phpSpaMode = null;
      this.originalPhpMode = null;
   }
}

export default AcodePlugin;