import {defaultScene} from './defaultScene';
import {useLayoutEffect,useRef,useState,type ReactNode,type CSSProperties} from 'react';
import {GripHorizontal} from 'lucide-react';
type Position={anchorX:number;y:number};
export default function ControlDock({children,onAnchor,style}:{children:ReactNode;onAnchor:(p:{x:number;y:number})=>void;style?:CSSProperties}){
 const [position,setPosition]=useState<Position>(()=>{try{const saved=JSON.parse(localStorage.getItem('tank-control-dock-v1')||'null');if(saved&&Number.isFinite(saved.anchorX)&&Number.isFinite(saved.y))return {anchorX:Math.max(0,Math.min(1,saved.anchorX)),y:Math.max(8,saved.y)};}catch{}return {...defaultScene.controls};});
 const frame=useRef<HTMLDivElement>(null),drag=useRef<{x:number;y:number;left:number;top:number}|null>(null);
 const [viewport,setViewport]=useState({width:innerWidth,height:innerHeight}),[size,setSize]=useState({width:310,height:65});
 const left=Math.max(8,Math.min(viewport.width-size.width-8,viewport.width*position.anchorX-size.width/2));
 const top=Math.max(8,Math.min(viewport.height-size.height-8,position.y));
 useLayoutEffect(()=>{const resize=()=>{setViewport({width:innerWidth,height:innerHeight});drag.current=null;};window.addEventListener('resize',resize);const observer=new ResizeObserver(()=>{if(frame.current)setSize({width:frame.current.offsetWidth,height:frame.current.offsetHeight});});if(frame.current)observer.observe(frame.current);return()=>{window.removeEventListener('resize',resize);observer.disconnect();};},[]);
 useLayoutEffect(()=>{onAnchor({x:left+size.width/2,y:top+size.height});},[left,top,size.width,size.height,onAnchor]);
 useLayoutEffect(()=>{try{localStorage.setItem('tank-control-dock-v1',JSON.stringify(position));}catch{}},[position]);
 function moveTo(x:number,y:number){const anchor=(Math.max(8,Math.min(viewport.width-size.width-8,x))+size.width/2)/viewport.width;setPosition({anchorX:Math.abs(anchor-.5)*viewport.width<=18?.5:anchor,y:Math.max(8,Math.min(viewport.height-size.height-8,y))});}
 return <div ref={frame} className="control-dock" style={{...style,left,top}} onDoubleClick={e=>e.stopPropagation()}>
  <button className="dock-grip" aria-label="Move controls" title="Drag to move. Double-click or press Home to center." onDoubleClick={()=>setPosition(p=>({...p,anchorX:.5}))} onPointerDown={e=>{if(e.button!==0)return;e.preventDefault();drag.current={x:e.clientX,y:e.clientY,left,top};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=drag.current;if(d)moveTo(d.left+e.clientX-d.x,d.top+e.clientY-d.y);}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} onKeyDown={e=>{if(e.key==='Home'){e.preventDefault();setPosition(p=>({...p,anchorX:.5}));}else if(e.key.startsWith('Arrow')){e.preventDefault();moveTo(left+(e.key==='ArrowRight'?20:e.key==='ArrowLeft'?-20:0),top+(e.key==='ArrowDown'?20:e.key==='ArrowUp'?-20:0));}}}><GripHorizontal size={22}/></button>
  {children}
 </div>;
}
