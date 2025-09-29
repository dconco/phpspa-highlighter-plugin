const alert = acode.require("alert");
const fileList = acode.require("fileList");
import SideBar from './sideBar';
import { SideBarReturnFunc } from './interface/SideBar';
import { PhpSpaMode } from './phpSpaMode';

class AcodePlugin {
   baseUrl!: string;
   sideButton!: SideBarReturnFunc;
   private phpSpaMode: PhpSpaMode | null = null;
   private originalPhpMode: any = null;

   async init(): Promise<void> {
      try {
         // Initialize the custom PhpSPA syntax mode
         this.initializePhpSpaMode();
         
         // Log successful initialization
         console.log('PhpSPA Highlighter: Successfully initialized custom syntax mode');
         
      } catch (error) {
         console.error('PhpSPA Highlighter: Error during initialization:', error);
         alert('PhpSPA Highlighter Error', 'Failed to initialize syntax highlighting. Check console for details.');
      }
   }

   private initializePhpSpaMode(): void {
      // Get access to Ace editor instance
      const ace = window.ace;
      if (!ace) {
         throw new Error('Ace Editor not found. PhpSPA Highlighter requires Ace Editor to be loaded.');
      }

      // Create and register the custom mode
      this.phpSpaMode = new PhpSpaMode(ace);
      const CustomMode = this.phpSpaMode.register();

      // Store original PHP mode for cleanup
      this.originalPhpMode = ace.require("ace/mode/php").Mode;

      // Override the PHP mode with our custom mode
      ace.define("ace/mode/php", ["require", "exports", "module"], (require: any, exports: any) => {
         exports.Mode = CustomMode;
      });

      // Also register as phpspa mode for explicit usage
      ace.define("ace/mode/phpspa", ["require", "exports", "module"], (require: any, exports: any) => {
         exports.Mode = CustomMode;
      });

      console.log('PhpSPA Highlighter: Custom PHP syntax mode registered successfully');
   }

   async destroy(): Promise<void> {
      try {
         this.sideButton?.hide();
         
         // Restore original PHP mode if we have it
         if (this.originalPhpMode && window.ace) {
            window.ace.define("ace/mode/php", ["require", "exports", "module"], (require: any, exports: any) => {
               exports.Mode = this.originalPhpMode;
            });
            console.log('PhpSPA Highlighter: Original PHP mode restored');
         }
         
         this.phpSpaMode = null;
         this.originalPhpMode = null;
         
      } catch (error) {
         console.error('PhpSPA Highlighter: Error during cleanup:', error);
      }
   }
}

export default AcodePlugin;