const alert = acode.require("alert");
const fileList = acode.require("fileList");
import SideBar from './sideBar';
import { SideBarReturnFunc } from './interface/SideBar';

class AcodePlugin {
   baseUrl!: string;
   sideButton!: SideBarReturnFunc;

   async init(): Promise<void> {
      const list = await fileList();
      list.forEach((item: Record<string, unknown>) => {
         //alert(item.name + ' ' + item.path);
      });

   }

   async destroy(): Promise<void> {
      this.sideButton?.hide();
   }
}

export default AcodePlugin;