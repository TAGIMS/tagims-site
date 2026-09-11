// One smooth height field drives sculpting, substrate, placement, and collision.
export const COLS=97,ROWS=33,XMIN=-12,XMAX=12,ZMIN=-2.6,ZMAX=2.6;
export type Terrain={heights:number[];materials:number[];tint:string;floorColor?:string;grain:number;natural?:boolean};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function makeTerrain(_shape='natural',material=0):Terrain{const heights=Array.from({length:COLS*ROWS},(_,i)=>{const x=i%COLS/(COLS-1)*24-12,z=Math.floor(i/COLS)/(ROWS-1)*5.2-2.6;return .15+.045*Math.sin(x*.65+z*.7)+.025*Math.cos(x*1.2-z*.45)+.015*Math.sin(z*5.8+x*.38+Math.sin(x*.7)*.5)+.04*(2.6-z)/5.2;});return {heights,materials:Array(COLS*ROWS).fill(material),tint:'#ffffff',grain:1,natural:true};}
export function normalizeTerrain(v:any,material=0):Terrain{const t=makeTerrain('natural',material);if(!v||typeof v!=='object')return t;if(Array.isArray(v.heights)&&v.heights.length===COLS*ROWS)t.heights=v.heights.map((n:any)=>typeof n==='number'&&Number.isFinite(n)?clamp(n,0,1.8):0);if(Array.isArray(v.heights)&&v.heights.length===49*19){t.heights=t.heights.map((_,i)=>{const u=(i%COLS)/(COLS-1)*48,vv=Math.floor(i/COLS)/(ROWS-1)*18,a=Math.min(47,Math.floor(u)),b=Math.min(17,Math.floor(vv)),fx=u-a,fz=vv-b;const h=(c:number,r:number)=>Number.isFinite(v.heights[r*49+c])?clamp(v.heights[r*49+c],0,1.8):.15;return (h(a,b)*(1-fx)+h(a+1,b)*fx)*(1-fz)+(h(a,b+1)*(1-fx)+h(a+1,b+1)*fx)*fz;});}if(Array.isArray(v.materials)&&v.materials.length===COLS*ROWS)t.materials=v.materials.map((n:any)=>Number.isInteger(n)?clamp(n,0,27):material);t.tint=typeof v.tint==='string'&&/^#[a-f\d]{6}$/i.test(v.tint)?v.tint:'#ffffff';if(typeof v.floorColor==='string'&&/^#[a-f\d]{6}$/i.test(v.floorColor))t.floorColor=v.floorColor;t.grain=typeof v.grain==='number'&&Number.isFinite(v.grain)?clamp(v.grain,.4,2.5):1;return t;}
export function gridPoint(col:number,row:number){return {x:XMIN+col/(COLS-1)*(XMAX-XMIN),z:ZMIN+row/(ROWS-1)*(ZMAX-ZMIN)};}
export function heightAt(t:Terrain,x:number,z:number){const u=clamp((x-XMIN)/(XMAX-XMIN)*(COLS-1),0,COLS-1),v=clamp((z-ZMIN)/(ZMAX-ZMIN)*(ROWS-1),0,ROWS-1),a=Math.min(COLS-2,Math.floor(u)),b=Math.min(ROWS-2,Math.floor(v)),fx=u-a,fz=v-b;return (t.heights[b*COLS+a]*(1-fx)+t.heights[b*COLS+a+1]*fx)*(1-fz)+(t.heights[(b+1)*COLS+a]*(1-fx)+t.heights[(b+1)*COLS+a+1]*fx)*fz;}

export type SculptBrush={mode:'raise'|'lower';radius:number;strength:number;grid:boolean};
export function sculpt(t:Terrain,x:number,z:number,brush:SculptBrush,dt:number):Terrain{
 const heights=t.heights.slice(),radius=brush.radius;
 for(let row=0;row<ROWS;row++)for(let col=0;col<COLS;col++){const q=gridPoint(col,row),r=Math.hypot(q.x-x,q.z-z)/radius;if(r>=1)continue;const falloff=(1-r*r)**3,i=row*COLS+col;heights[i]=clamp(heights[i]+(brush.mode==='raise'?1:-1)*brush.strength*dt*falloff,0,1.8);}
 // Local diffusion is part of every stroke, with a feathered boundary.
 const source=heights.slice();for(let row=1;row<ROWS-1;row++)for(let col=1;col<COLS-1;col++){const q=gridPoint(col,row),r=Math.hypot(q.x-x,q.z-z)/(radius*1.25);if(r>=1)continue;const i=row*COLS+col,avg=(source[i-1]+source[i+1]+source[i-COLS]+source[i+COLS])/4;heights[i]+=(avg-source[i])*Math.min(.45,dt*6)*(1-r*r)**2;}
 return {...t,natural:true,heights};
}
