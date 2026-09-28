import {normalize,type TankState} from './state';
import builtins from './builtinThemes.json';
export type Theme={name:string;state:TankState};
export const THEME_SLOTS=6;
export const THEME_KEY='tank-themes-v2';
export function defaultThemes():Theme[]{return builtins.map(t=>({name:t.name,state:normalize(t.state)}));}
export function resolveThemes(raw:string|null,legacy:string|null){if(raw!==null)return readThemes(raw);const old=readThemes(legacy);return old.some(Boolean)?old:defaultThemes();}
export function thumbnailState(state:TankState):TankState{return {...structuredClone(state),fish:[],bubblers:[],paused:true};}
// Alex's six themes seed new users. Personal slots contain snapshots,
// so editing or deleting a saved scene never silently changes a chosen theme.
export function readThemes(raw:string|null):(Theme|null)[]{
 const parsed=raw?JSON.parse(raw):[];
 if(!Array.isArray(parsed))throw Error('Invalid themes');
 return Array.from({length:THEME_SLOTS},(_,i)=>{
  const t=parsed[i];return t&&typeof t.name==='string'&&t.state&&typeof t.state==='object'?{name:t.name.slice(0,40),state:normalize(t.state)}:null;
 });
}
export function assignTheme(themes:(Theme|null)[],slot:number,scene:Theme|null){
 return Array.from({length:THEME_SLOTS},(_,i)=>i===slot?(scene?structuredClone(scene):null):themes[i]??null);
}
