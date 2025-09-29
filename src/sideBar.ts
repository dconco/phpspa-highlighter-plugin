import { SideBarProps, SideBarReturnFunc } from './interface/SideBar'
const SideButton = acode.require('sideButton')

function SideBar({
   text,
   icon,
   onclick,
   backgroundColor,
   textColor
}: SideBarProps): SideBarReturnFunc {
   const sideButton = SideButton({
     text,
     icon,
     onclick,
     backgroundColor: backgroundColor ?? '#fff',
     textColor: textColor ?? '#000',
   });

   return sideButton;
}
export default SideBar;

/*
let func = SideBar({
   text: 'Run',
   icon: 'play_arrow',
   onclick: () => {
      alert('Script Loading');
   }
});
func.show();
this.sideButton = func;*/