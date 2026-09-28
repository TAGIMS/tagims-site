import {useLayoutEffect,useRef,useState,type ReactNode} from 'react';
import {GripHorizontal,X} from 'lucide-react';
export type ItemBounds={x:number;y:number;width:number;height:number};
export default function ItemPopup({itemKey,getBounds,onClose,children}:{itemKey:string;getBounds:()=>ItemBounds|undefined;onClose:()=>void;children:ReactNode}){
 const root=useRef<HTMLElement>(null),[position,setPosition]=useState({x:16,y:80}),[placedItem,setPlacedItem]=useState<string|null>(null),drag=useRef<{id:number;x:number;y:number;left:number;top:number}|null>(null);
 useLayoutEffect(()=>{
  let frame=0,tries=0,lastGeometry='';
  const pointers=new Set<number>();let holdUntil=0;
  const start=(e:PointerEvent)=>{if(root.current?.contains(e.target as Node))pointers.add(e.pointerId);};
  const stop=(e:PointerEvent)=>{pointers.delete(e.pointerId);holdUntil=performance.now()+350;};
  document.addEventListener('pointerdown',start,true);document.addEventListener('pointerup',stop,true);document.addEventListener('pointercancel',stop,true);
  const fit=()=>{
   frame=requestAnimationFrame(fit);
   const box=root.current?.getBoundingClientRect(),bounds=getBounds();
   // Never move a slider out from under the pointer or an active numeric edit.
   if(!box||drag.current||pointers.size||performance.now()<holdUntil||root.current?.contains(document.activeElement)&&document.activeElement?.matches('input,[role="slider"]'))return;
   if(!bounds&&tries++<90)return;
   const b=bounds||{x:innerWidth/2,y:innerHeight/2,width:0,height:0};
   // Bounds come from the canvas each frame, including object dragging and swimming.
   // Ignore unchanged geometry so manually moving the popup still works.
   const menuRight=document.querySelector('.hub-panel.open')?.getBoundingClientRect().right||0;
   const minX=innerWidth-menuRight>box.width+36?Math.max(12,menuRight+12):12;
   const geometry=[b.x,b.y,b.width,b.height,box.width,box.height,innerWidth,innerHeight,minX].join(':');
   if(geometry===lastGeometry)return;
   lastGeometry=geometry;
   const gap=16,margin=12;
   const clampX=(x:number)=>Math.max(minX,Math.min(innerWidth-box.width-margin,x));
   const clampY=(y:number)=>Math.max(margin,Math.min(innerHeight-box.height-margin,y));
   const candidates=[
    {x:b.x+b.width+gap,y:clampY(b.y)},
    {x:b.x-box.width-gap,y:clampY(b.y)},
    {x:clampX(b.x),y:b.y-box.height-gap},
    {x:clampX(b.x),y:b.y+b.height+gap},
   ];
   const next=candidates.find(p=>p.x>=minX&&p.y>=margin&&p.x+box.width<=innerWidth-margin&&p.y+box.height<=innerHeight-margin)
    ||{x:clampX(b.x+b.width/2<innerWidth/2?candidates[0].x:candidates[1].x),y:clampY(b.y)};
   setPosition(p=>p.x===next.x&&p.y===next.y?p:next);
   setPlacedItem(itemKey);
  };
  fit();
  return()=>{cancelAnimationFrame(frame);document.removeEventListener('pointerdown',start,true);document.removeEventListener('pointerup',stop,true);document.removeEventListener('pointercancel',stop,true);};
 },[itemKey]);
 return <aside ref={root} className="item-popup" role="dialog" aria-label="Item settings" style={{left:position.x,top:position.y,visibility:placedItem===itemKey?'visible':'hidden'}}><header className="item-popup-heading"><button className="item-popup-grip" aria-label="Move item settings" onPointerDown={e=>{drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,left:position.x,top:position.y};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{const d=drag.current,r=root.current?.getBoundingClientRect();if(!d||!r)return;setPosition({x:Math.max(12,Math.min(innerWidth-r.width-12,d.left+e.clientX-d.x)),y:Math.max(12,Math.min(innerHeight-r.height-12,d.top+e.clientY-d.y))});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onKeyDown={e=>{const step=20;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const r=root.current!.getBoundingClientRect();setPosition(p=>({x:Math.max(12,Math.min(innerWidth-r.width-12,p.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0))),y:Math.max(12,Math.min(innerHeight-r.height-12,p.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)))}));}}><GripHorizontal size={16}/>Item settings</button><button aria-label="Close item settings" onClick={onClose}><X size={18}/></button></header><div className="item-popup-body">{children}</div></aside>;
}
