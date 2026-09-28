import {useMemo} from 'react';
import type {Theme} from './themeSlots';
import {themePreview} from './themePreview';
import Thumbnail from './Thumbnail';
export default function ThemeThumbnails({themes,onLoad}:{themes:(Theme|null)[];onLoad:(theme:Theme)=>void}){
 const items=useMemo(()=>themes.flatMap((theme,slot)=>theme?[{theme,slot,preview:themePreview(theme)}]:[]),[themes]);
 return <><div className="theme-cards" role="group" aria-label="Aquarium themes">{items.map(({theme,slot,preview})=><button className="object-card theme-card" key={slot} aria-label={'Load theme '+theme.name} onClick={()=>onLoad(theme)}>{preview?<img src={preview} alt="" width={320} height={180} decoding="async"/>:<span className="theme-preview-collage" aria-hidden="true">{theme.state.decor.slice(0,3).map(d=><Thumbnail key={d.id} type="decor" kind={d.kind}/>)}</span>}<b>{theme.name}</b></button>)}</div>{!items.length&&<p className="hint">Assign a saved scene to a theme slot below.</p>}</>;
}
