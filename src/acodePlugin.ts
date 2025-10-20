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

      // Try applying to current and open files shortly after init (covers load timing)
      setTimeout(() => {
         this.applyModeToOpenFiles();
         this.applyModeToCurrentFile();
      }, 300);

      // Apply on editor events when available
      if (editorManager && typeof editorManager.on === 'function') {
         // Common Acode events
         editorManager.on('switch-file', () => this.applyModeToCurrentFile());
         editorManager.on('file-loaded', () => this.applyModeToCurrentFile());
      }
   }

   private applyModeToCurrentFile(): void {
      if (!editorManager || !editorManager.activeFile) {
         return;
      }
      
      const file = editorManager.activeFile;
      if (file.filename && /\.php$/i.test(file.filename) && file.session && this.phpSpaMode) {
         // Ensure our mode is registered, then set by name so Ace loads it properly
         this.phpSpaMode.register();
         try {
            file.session.setMode('ace/mode/phpspa');
            // Force re-tokenize
            if (file.session.bgTokenizer) {
               file.session.bgTokenizer.start(0);
            }
         } catch (_) {
            // no-op
         }
      }
   }

   private applyModeToOpenFiles(): void {
      if (!editorManager || !editorManager.files) {
         return;
      }
      
      const files = editorManager.files;
      this.phpSpaMode?.register();
      files.forEach((file: any) => {
         try {
            if (file.filename && /\.php$/i.test(file.filename) && file.session) {
               file.session.setMode('ace/mode/phpspa');
               if (file.session.bgTokenizer) {
                  file.session.bgTokenizer.start(0);
               }
            }
         } catch (_) {
            // ignore
         }
      });
   }

   private initializePhpSpaMode(): void {
      const ace = window.ace;
      if (!ace) {
         return;
      }

      this.phpSpaMode = new PhpSpaMode(ace);
      // Ensure our custom mode module is defined
      this.phpSpaMode.register();
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