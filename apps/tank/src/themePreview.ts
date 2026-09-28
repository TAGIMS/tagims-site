import {defaultThemes,type Theme} from './themeSlots';
import type {TankState} from './state';
// Only visible scenery affects the snapshot. Fish and audio changes can reuse it.
export const sceneryKey=(state:TankState)=>JSON.stringify({...state,fish:[],bubblers:[],audio:undefined,paused:true});
const previews=new Map(defaultThemes().map((theme,index)=>[sceneryKey(theme.state),'/apps/tank/assets/theme-previews/scene-'+(index+1)+'.webp']));
export const themePreview=(theme:Theme)=>previews.get(sceneryKey(theme.state));
