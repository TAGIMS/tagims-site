export type Rect={x:number;y:number;width:number;height:number};
export type Viewport={width:number;height:number};
export type PanelPlacement={version:2;anchorX:number;y:number;width:number;height:number};
// Keep the existing UFO attachment point aligned with the center of the tank.
export const PANEL_ANCHOR=.55;
const bound=(n:number,min:number,max:number)=>Math.max(min,Math.min(n,max));
const finite=(n:unknown,fallback:number)=>typeof n==='number'&&Number.isFinite(n)?n:fallback;
export function restorePlacement(raw:any,viewport:Viewport):PanelPlacement{
 const width=bound(finite(raw?.width,660),360,4000),height=bound(finite(raw?.height,400),260,4000);
 const anchor=raw?.version===2?finite(raw.anchorX,.5):raw&&Number.isFinite(raw.x)?(raw.x+width*PANEL_ANCHOR)/viewport.width:.5;
 return {version:2,width,height,y:bound(finite(raw?.y,90),8,4000),anchorX:raw?.version!==2&&Math.abs(anchor-.5)*viewport.width<=32?.5:bound(anchor,0,1)};
}
export function panelRect(placement:PanelPlacement,viewport:Viewport,collapsed:boolean):Rect{
 const width=Math.min(placement.width,Math.max(1,viewport.width-16));
 const height=Math.min(placement.height,Math.max(1,viewport.height-16));
 return {width,height,x:bound(viewport.width*placement.anchorX-width*PANEL_ANCHOR,8,Math.max(8,viewport.width-width-8)),y:bound(placement.y,8,Math.max(8,viewport.height-(collapsed?44:height)-8))};
}
export function movePlacement(placement:PanelPlacement,rect:Rect,viewport:Viewport,dx:number,dy:number):PanelPlacement{
 const x=bound(rect.x+dx,8,Math.max(8,viewport.width-rect.width-8));
 const anchor=(x+rect.width*PANEL_ANCHOR)/viewport.width;
 return {...placement,anchorX:Math.abs(anchor-.5)*viewport.width<=18?.5:anchor,y:Math.max(8,rect.y+dy)};
}
export function resizePlacement(placement:PanelPlacement,rect:Rect,viewport:Viewport,dx:number,dy:number):PanelPlacement{
 const width=bound(rect.width+dx,Math.min(360,viewport.width-16),Math.max(1,viewport.width-16));
 const height=bound(rect.height+dy,Math.min(260,viewport.height-16),Math.max(1,viewport.height-16));
 return {...placement,width,height,anchorX:placement.anchorX===.5?.5:(rect.x+width*PANEL_ANCHOR)/viewport.width};
}
