import {useEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {X,Minus,Plus,Grip} from 'lucide-react';
import {PANEL_ANCHOR,panelRect,restorePlacement,movePlacement,resizePlacement,type Rect,type PanelPlacement} from './panelPlacement';
const viewport=()=>({width:innerWidth,height:innerHeight});
export default function FloatingPanel({children,onClose,onAnchor,collapsed,setCollapsed,style}:{children:ReactNode;onClose:()=>void;onAnchor:(p:{x:number;y:number}|null)=>void;collapsed:boolean;setCollapsed:(v:boolean)=>void;style?:CSSProperties}){
 const [placement,setPlacement]=useState<PanelPlacement>(()=>{try{return restorePlacement(JSON.parse(localStorage.getItem('tank-menu-position-v2')||localStorage.getItem('tank-menu-v1')||'null'),viewport());}catch{return restorePlacement(null,viewport());}});
 const [screen,setScreen]=useState(viewport);
 const rect=panelRect(placement,screen,collapsed);
 const element=useRef<HTMLElement>(null);
 const anchorCallback=useRef(onAnchor);anchorCallback.current=onAnchor;
 const drag=useRef<{x:number;y:number;rect:Rect;placement:PanelPlacement;resize:boolean}|null>(null);
 useEffect(()=>{anchorCallback.current({x:rect.x+rect.width*PANEL_ANCHOR,y:rect.y+(collapsed?44:rect.height)});},[rect.x,rect.y,rect.width,rect.height,collapsed]);
 useEffect(()=>{const outside=(e:PointerEvent)=>{if(!element.current?.contains(e.target as Node))setCollapsed(true);};document.addEventListener('pointerdown',outside,true);return()=>{document.removeEventListener('pointerdown',outside,true);anchorCallback.current(null);};},[]);
 // Window fitting is derived, never written back over the preferred placement.
 useEffect(()=>{const resize=()=>{drag.current=null;setScreen(viewport());};window.addEventListener('resize',resize);return()=>window.removeEventListener('resize',resize);},[]);
 useEffect(()=>{try{localStorage.setItem('tank-menu-position-v2',JSON.stringify(placement));}catch{}},[placement]);
 function down(e:React.PointerEvent,resize=false){if(e.button!==0)return;e.preventDefault();drag.current={x:e.clientX,y:e.clientY,rect,placement,resize};e.currentTarget.setPointerCapture(e.pointerId);}
 function move(e:React.PointerEvent){const d=drag.current;if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;setPlacement(d.resize?resizePlacement(d.placement,d.rect,screen,dx,dy):movePlacement(d.placement,d.rect,screen,dx,dy));}
 const end=()=>{drag.current=null;};
 function keyboard(e:React.KeyboardEvent,resize=false){
  if(e.key==='Home'&&!resize){e.preventDefault();setPlacement(p=>({...p,anchorX:.5}));return;}
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  e.preventDefault();const dx=e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0,dy=e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0;
  setPlacement(resize?resizePlacement(placement,rect,screen,dx,dy):movePlacement(placement,rect,screen,dx,dy));
 }
 return <aside ref={element} className={'studio floating-studio'+(collapsed?' collapsed':'')} aria-label="Aquarium menu" style={{...style,left:rect.x,top:rect.y,width:rect.width,height:collapsed?44:rect.height,'--panel-height':rect.height+'px'} as CSSProperties}>
  <div className="floating-heading"><button className="panel-move" aria-label="Move menu" title="Drag to move. Double-click or press Home to center." onDoubleClick={e=>{e.stopPropagation();setPlacement(p=>({...p,anchorX:.5}));}} onPointerDown={e=>down(e)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={e=>keyboard(e)}><Grip size={17}/>Tank menu</button><button className="icon-button" aria-label={collapsed?'Expand menu':'Minimize menu'} onClick={()=>setCollapsed(!collapsed)}>{collapsed?<Plus size={16}/>:<Minus size={16}/>}</button><button className="icon-button" aria-label="Close menu" onClick={onClose}><X size={16}/></button></div>
  {!collapsed&&<>{children}<button className="panel-resize" aria-label="Resize menu" onPointerDown={e=>down(e,true)} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={e=>keyboard(e,true)}>◢</button></>}
 </aside>;
}
