import {useEffect,useState} from 'react';
import ThemeThumbnails from './ThemeThumbnails';
import {useTankStorage} from './tankStorage';
import {assignTheme,readThemes,resolveThemes,THEME_KEY,type Theme} from './themeSlots';
export default function Themes({layouts,onLoad,notify}:{layouts:(Theme&{id:number})[];onLoad:(theme:Theme)=>void;notify:(message:string)=>void}){
 const storage=useTankStorage();
 const [themes,setThemes]=useState<(Theme|null)[]>(()=>readThemes(null)),[ready,setReady]=useState(false),[managing,setManaging]=useState(false);
 useEffect(()=>{try{setThemes(resolveThemes(storage.getItem(THEME_KEY),storage.getItem('tank-themes-v1')));setReady(true);}catch{notify('Your themes could not be read. The previous save has been left intact.');}},[storage]);
 const save=(next:(Theme|null)[])=>{try{storage.setItem(THEME_KEY,JSON.stringify(next));setThemes(next);notify('Theme slots saved. Your saved scenes are unchanged.');}catch{notify('Themes could not be saved. Please try again.');}};
 const populated=themes.flatMap((theme,slot)=>theme?[{theme,slot}]:[]);
 const exportThemes=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({format:'tank-themes',version:1,themes},null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='tank-themes.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 return <section className="themes-panel">
  <p className="hint">Your favorite aquariums, ready to switch. Save your current scene before loading another; Undo brings it back.</p>
  <ThemeThumbnails themes={themes} onLoad={onLoad}/>
  <button className="text-button" aria-expanded={managing} onClick={()=>setManaging(!managing)}>{managing?'Hide theme slots':'Manage theme slots'} · {populated.length}/6</button>
  <button className="text-button" disabled={!populated.length} onClick={exportThemes}>Export themes</button>
  {managing&&<div className="theme-slots"><p className="hint">Assign up to six saved scenes. Each slot keeps its own copy. Reassign it to capture later edits.</p>{themes.map((theme,slot)=><div className="theme-slot" key={slot}><label htmlFor={'theme-slot-'+slot}>Theme {slot+1}{theme&&<span>{theme.name}</span>}</label><select id={'theme-slot-'+slot} aria-label={'Assign theme '+(slot+1)} value="" disabled={!ready} onChange={e=>{const source=layouts.find(l=>String(l.id)===e.target.value);if(source)save(assignTheme(themes,slot,{name:source.name,state:source.state}));}}><option value="">{theme?'Replace from saved scenes…':'Choose a saved scene…'}</option>{layouts.map(l=><option key={l.id} value={l.id}>{l.name}</option>)}</select>{theme&&<button className="text-button" aria-label={'Clear theme '+(slot+1)} onClick={()=>{save(assignTheme(themes,slot,null));}}>Clear</button>}</div>)}{!layouts.length&&<p className="hint">Create a layout in Saved Scenes first, then assign it here.</p>}</div>}
 </section>;
}
