import {memo,useEffect,useRef,useState} from 'react';
import {getPhoto} from './photos';
function Thumbnail({kind,type}:{kind:number;type:'fish'|'decor'}){const canvas=useRef<HTMLCanvasElement>(null),[failed,setFailed]=useState(false);useEffect(()=>{let active=true;getPhoto(type,kind,true).then(photo=>{if(!active||!canvas.current)return;const ctx=canvas.current.getContext('2d')!;ctx.clearRect(0,0,180,130);const scale=Math.min(164/photo.sw,116/photo.sh);ctx.drawImage(photo.image,photo.sx,photo.sy,photo.sw,photo.sh,(180-photo.sw*scale)/2,(130-photo.sh*scale)/2,photo.sw*scale,photo.sh*scale);}).catch(()=>{if(active)setFailed(true);});return()=>{active=false;};},[type,kind]);return failed?<span className="thumb-loading" aria-hidden="true">Photo unavailable</span>:<canvas className="photo-thumbnail" ref={canvas} width={180} height={130} aria-hidden="true"/>;}

export default memo(Thumbnail);
