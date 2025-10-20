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
      // Set up event listeners for file operations
      if (editorManager && typeof editorManager.on === 'function') {
         // Apply mode when switching between files
         editorManager.on('switch-file', () => this.applyModeToCurrentFile());
         // Apply mode when a file is loaded/opened
         editorManager.on('file-loaded', () => this.applyModeToCurrentFile());
         // Apply mode when a new file is created
         editorManager.on('new-file', () => this.applyModeToCurrentFile());
      }

      // Initialize the mode after a delay to ensure Ace is fully loaded
      // Apply mode to any already-open PHP files after initialization
      setTimeout(() => {
         this.initializePhpSpaMode();
         if (this.phpSpaMode) {
            this.applyModeToOpenFiles();
            this.applyModeToCurrentFile();
         }
      }, 500);
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
      // In Acode, Ace Editor can be accessed through different paths
      // Try multiple methods to get the ace object
      let ace: any = null;
      
      // Method 1: Check for window.ace (standard Ace Editor global)
      if (typeof window.ace !== 'undefined' && window.ace) {
         ace = window.ace;
         console.log('PhpSPA Highlighter: Found ace via window.ace');
      }
      
      // Method 2: Check for global acequire (Ace's module loader)
      if (!ace && typeof (window as any).acequire !== 'undefined') {
         const acequire = (window as any).acequire;
         ace = {
            require: acequire,
            define: acequire.define || function() {
               console.warn('acequire.define not available');
            }
         };
         console.log('PhpSPA Highlighter: Found ace via global acequire');
      }
      
      // Method 3: Try to get ace from editorManager
      if (!ace && editorManager && editorManager.editor) {
         const editor = editorManager.editor;
         
         // Check if the editor has an ace property
         if (editor.ace) {
            ace = editor.ace;
            console.log('PhpSPA Highlighter: Found ace via editorManager.editor.ace');
         }
         // Check if editor.env exists (Ace Editor instance has env property)
         else if (editor.env && editor.env.editor) {
            ace = window.ace || {
               require: (window as any).acequire || function() {},
               define: ((window as any).acequire && (window as any).acequire.define) || function() {}
            };
            console.log('PhpSPA Highlighter: Found ace via editor.env');
         }
      }
      
      if (!ace) {
         console.error('PhpSPA Highlighter: Ace Editor not found after trying all methods');
         console.error('Debugging information:');
         console.error('- typeof window.ace:', typeof window.ace);
         console.error('- typeof window.acequire:', typeof (window as any).acequire);
         console.error('- typeof editorManager:', typeof editorManager);
         if (editorManager) {
            console.error('- typeof editorManager.editor:', typeof editorManager.editor);
            if (editorManager.editor) {
               console.error('- typeof editorManager.editor.ace:', typeof editorManager.editor.ace);
               console.error('- typeof editorManager.editor.env:', typeof editorManager.editor.env);
            }
         }
         console.error('Please report this issue with the above debugging information');
         return;
      }

      try {
         this.phpSpaMode = new PhpSpaMode(ace);
         // Register our custom mode with Ace
         this.phpSpaMode.register();
         console.log('PhpSPA Highlighter: Mode registered successfully');
      } catch (error) {
         console.error('PhpSPA Highlighter: Error initializing mode:', error);
         console.error('Error details:', error);
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