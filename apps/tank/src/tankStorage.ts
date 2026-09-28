import {createContext, useContext} from 'react';
export const SAVE_KEYS = ['tank-v2','tank-layouts-v2','tank-sound-v1','tank-menu-colors-v1','tank-themes-v1','tank-themes-v2'] as const;
export type TankDocument = Record<string,string>;
export interface TankStorage { getItem(key:string):string|null; setItem(key:string,value:string):void }
export const StorageContext = createContext<TankStorage>(localStorage);
export const useTankStorage = () => useContext(StorageContext);
export function readGuest():TankDocument {
 const result:TankDocument={};
 for(const key of SAVE_KEYS){const value=localStorage.getItem(key);if(value!==null)result[key]=value;}
 if(!result['tank-v2']){const old=localStorage.getItem('stillwater-v1');if(old)result['tank-v2']=old;}
 return result;
}
export function cleanDocument(value:unknown):TankDocument {
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('The account save is not readable.');
 const result:TankDocument={};
 for(const key of SAVE_KEYS){
  const item=(value as TankDocument)[key];
  if(item!==undefined){if(typeof item!=='string')throw Error('The account save is not readable.');JSON.parse(item);result[key]=item;}
 }
 return result;
}
