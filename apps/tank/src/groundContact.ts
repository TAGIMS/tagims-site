// Anchor to the visible opaque silhouette, not transparent margins or soft shadows.
export function groundContact(mask:Uint8ClampedArray,mw:number,mh:number,width:number,height:number,horizontal:number,tilt:number,lean:number){
 let contact=-Infinity;
 for(let y=0;y<mh;y++)for(let x=0;x<mw;x++){
  if(mask[(y*mw+x)*4+3]<160)continue;
  const ly=((y+1)/mh-1)*height,lx=(((x+.5)/mw-.5)*width+Math.tan(lean)*ly)*horizontal;
  contact=Math.max(contact,Math.sin(tilt)*lx+Math.cos(tilt)*ly);
 }
 return Number.isFinite(contact)?contact:0;
}
