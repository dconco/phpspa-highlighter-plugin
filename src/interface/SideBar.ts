interface SideBarProps {
   text: string;
   icon: string;
   onclick: () => void;
   textColor?: string;
   backgroundColor?: string;
}

interface SideBarReturnFunc {
   show: () => void;
   hide: () => void;
}

export { SideBarProps, SideBarReturnFunc }