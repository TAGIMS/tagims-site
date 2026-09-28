import type {ReactNode,CSSProperties} from 'react';
import {X} from 'lucide-react';
export default function BottomTray({children,onClose,style}:{children:ReactNode;onClose:()=>void;style?:CSSProperties}){
 return <aside className="studio bottom-studio" aria-label="Aquarium studio" style={style}><div className="tray-heading"><div><span className="studio-eyebrow">AQUARIUM WORKBENCH</span><span className="tray-subtitle">Build • Personalize • Explore</span></div><button className="icon-button" aria-label="Close build menu" onClick={onClose}><X size={17}/></button></div>{children}</aside>;
}
