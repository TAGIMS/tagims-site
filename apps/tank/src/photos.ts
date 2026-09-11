import {QUALITY_DECOR} from './qualityDecor';
import {DECOR_RECTS} from './decorRects';
import {newBase,kitVariant,UFO_KIND,GLASS_KIND,SINGLE_MOSS_KIND,HARD_SCAPE_RECTS,WOOD_RECTS} from './decorLibrary';
import {drawGlass} from './glass';
import {drawUFO} from './ufo';
import {natureAsset} from './nature';
const atlasRects:number[][][]=[[[10, 77, 302, 165], [336, 78, 270, 153], [640, 79, 285, 152], [941, 91, 303, 140], [11, 367, 306, 191], [320, 367, 314, 177], [638, 344, 300, 255], [942, 394, 303, 136], [26, 608, 281, 348], [312, 637, 309, 296], [630, 668, 322, 190], [992, 702, 251, 158], [7, 957, 315, 273]], [[0, 0, 331, 330], [349, 0, 236, 330], [624, 86, 310, 244], [935, 80, 319, 250], [0, 337, 318, 293], [319, 331, 309, 300], [629, 337, 328, 297], [958, 334, 273, 300], [0, 638, 320, 293], [324, 680, 296, 252], [651, 640, 287, 294], [945, 706, 299, 228], [4, 955, 309, 273], [314, 1018, 309, 210], [623, 990, 315, 238], [939, 934, 304, 294]], [[18, 108, 305, 220], [324, 43, 287, 285], [623, 60, 331, 268], [978, 121, 253, 208], [25, 332, 268, 309], [320, 381, 314, 259], [641, 396, 314, 250], [969, 384, 261, 262], [44, 646, 242, 307], [332, 704, 296, 251]]];
export type Photo={image:HTMLImageElement;sx:number;sy:number;sw:number;sh:number;mask:Uint8ClampedArray;maskWidth:number;maskHeight:number};
const loaded=new Map<string,Promise<HTMLImageElement>>(),photos=new Map<string,Promise<Photo>>();
export function loadPhoto(url:string){let item=loaded.get(url);if(!item){item=new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Could not load '+url));image.src=url;});loaded.set(url,item);}return item;}
export function photoSource(type:'fish'|'decor',kind:number){if(type==='decor'&&kind>=32)return {url:'/apps/tank/assets/decor-library-atlas.png',cell:0,columns:1,rows:1};if(type==='decor')return {url:'/apps/tank/assets/nature-'+natureAsset(kind)+'.png',cell:0,columns:1,rows:1};if(kind<6)return {url:`/apps/tank/assets/${type}-${kind}.png`,cell:0,columns:1,rows:1};if(type==='fish')return {url:'/apps/tank/assets/fish-photo-atlas.png',cell:kind-6,columns:4,rows:4};return {url:kind<22?'/apps/tank/assets/decor-photo-atlas-a.png':'/apps/tank/assets/decor-photo-atlas-b.png',cell:kind<22?kind-6:kind-22,columns:4,rows:4};}
// Trim transparent margins at render time so roots and ornament bases meet the sand.
export function getPhoto(type:'fish'|'decor',kind:number,preview=false):Promise<Photo>{const key=type+kind+(preview?'preview':'');let photo=photos.get(key);if(!photo){photo=(async()=>{const spec=photoSource(type,kind),image=type==='decor'&&kind>=32?await extraImage(kind,preview):await loadPhoto(spec.url),rect=type==='decor'||kind<6?[0,0,image.width,image.height]:atlasRects[type==='fish'?0:kind<22?1:2][spec.cell], [sx,sy,cellW,cellH]=rect;const scratch=document.createElement('canvas');scratch.width=Math.round(cellW);scratch.height=Math.round(cellH);const ctx=scratch.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(image,sx,sy,cellW,cellH,0,0,scratch.width,scratch.height);const data=ctx.getImageData(0,0,scratch.width,scratch.height).data;let left=scratch.width,top=scratch.height,right=-1,bottom=-1;for(let y=0;y<scratch.height;y++)for(let x=0;x<scratch.width;x++){if(data[(y*scratch.width+x)*4+3]>18){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}if(right<left)throw Error('An aquarium photo is empty.');left=Math.max(0,left-2);top=Math.max(0,top-2);right=Math.min(scratch.width-1,right+2);bottom=Math.min(scratch.height-1,bottom+2);const sw=right-left+1,sh=bottom-top+1;const maskCanvas=document.createElement('canvas');maskCanvas.width=128;maskCanvas.height=Math.max(1,Math.round(128*sh/sw));const maskContext=maskCanvas.getContext('2d',{willReadFrequently:true})!;maskContext.drawImage(image,sx+left,sy+top,sw,sh,0,0,maskCanvas.width,maskCanvas.height);const mask=maskContext.getImageData(0,0,maskCanvas.width,maskCanvas.height).data;return {image,sx:sx+left,sy:sy+top,sw,sh,mask,maskWidth:maskCanvas.width,maskHeight:maskCanvas.height};})();photos.set(key,photo);}return photo;}

async function extraImage(kind:number,preview=false):Promise<HTMLImageElement>{
 if(kind===SINGLE_MOSS_KIND)return loadPhoto('/apps/tank/assets/single-moss'+(preview?'-preview':'')+'.webp');
 if(kind!==UFO_KIND&&kind!==GLASS_KIND&&kitVariant(kind)<0)return cutout(newBase(kind),preview);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=850;const c=canvas.getContext('2d')!;
 if(kind===GLASS_KIND){c.translate(512,425);c.scale(14,14);drawGlass(c,'#48cbea');}else if(kind===UFO_KIND){c.translate(512,425);c.scale(9,9);drawUFO(c,0);}else{
 const base=newBase(kind),variant=kitVariant(kind),extras=variant===0?[32,33]:variant===1?[16,22]:[24,31];
 const pictures=await Promise.all([base,...extras].map(index=>cutout(index,preview)));
 const place=(image:HTMLImageElement,x:number,y:number,w:number,h:number)=>{const k=Math.min(1,w/image.width,h/image.height);c.drawImage(image,x-image.width*k/2,y-image.height*k,image.width*k,image.height*k);};
 place(pictures[1],190,790,390,650);place(pictures[0],530,800,750,720);place(pictures[2],840,805,330,380);
 }
 return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=canvas.toDataURL('image/png');});
}

const packs=new Map<string,Promise<ArrayBuffer>>();
async function qualityImage(index:number,preview:boolean){
 const spec=QUALITY_DECOR[index];
 if(preview){const atlas=await loadPhoto('/apps/tank/assets/'+(spec.atlas||'quality-previews.webp')),[x,y,w,h]=spec.thumb,c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d')!.drawImage(atlas,x,y,w,h,0,0,w,h);return loadPhoto(c.toDataURL());}
 let pack=packs.get(spec.pack);if(!pack){pack=fetch('/apps/tank/assets/'+spec.pack).then(r=>{if(!r.ok)throw Error('Decoration asset unavailable');return r.arrayBuffer();});packs.set(spec.pack,pack);}
 const bytes=await pack,url=URL.createObjectURL(new Blob([bytes.slice(spec.offset,spec.offset+spec.length)],{type:'image/webp'}));
 try{return await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Decoration decode failed'));image.src=url;});}finally{URL.revokeObjectURL(url);}
}
const cutouts=new Map<string,Promise<HTMLImageElement>>();
function cutout(index:number,preview=false){const key=index+(preview?'preview':'');let cached=cutouts.get(key);if(!cached){cached=(async()=>{if(QUALITY_DECOR[index])return qualityImage(index,preview);const extra=WOOD_RECTS[index],custom=extra||HARD_SCAPE_RECTS[index],atlas=await loadPhoto(extra?'/apps/tank/assets/extra-driftwood.png':custom?'/apps/tank/assets/distinct-hardscape.png':'/apps/tank/assets/decor-library-atlas.png'),[x,y,w,h]=custom||DECOR_RECTS[index],canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;canvas.getContext('2d')!.drawImage(atlas,x,y,w,h,0,0,w,h);return await new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=reject;image.src=canvas.toDataURL();});})();cutouts.set(key,cached);}return cached;}
