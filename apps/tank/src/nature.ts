// Individual photographic sources. Variants share botanical form without pretending to be different species.
export const NATURE_ASSETS=['rosette','feathery','ribbon','red-stems','carpet','limestone','dragon-stone','driftwood','moss'] as const;
export function natureAsset(kind:number){const map=[1,0,3,5,7,5,0,2,0,4,0,1,0,3,0,8,6,5,6,5,5,7,7,7,7,6,5,7,7,6,5,7];return NATURE_ASSETS[map[kind]??0];}
export type NatureForm={width:number;height:number;lean:number;bend:number;hue:number;saturation:number;lightness:number;burial:number;moss:number;density:number;locked:boolean};
export const naturalDefaults:NatureForm={width:1,height:1,lean:0,bend:0,hue:0,saturation:100,lightness:100,burial:.08,moss:0,density:1,locked:false};
export function natureForm(v:any):NatureForm{const out={...naturalDefaults};for(const[k,a,b]of [['width',.4,2],['height',.4,2],['lean',-35,35],['bend',-50,50],['hue',-90,90],['saturation',0,160],['lightness',40,150],['burial',0,.6],['moss',0,100],['density',1,5]]as const){const value=v?.[k];if(typeof value==='number'&&Number.isFinite(value))(out as any)[k]=Math.max(a,Math.min(b,value));}out.density=Math.round(out.density);out.locked=!!v?.locked;return out;}
