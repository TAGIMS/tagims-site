import {useEffect,useState} from 'react';
import {Plus,Trash2,Copy,ArrowLeft,Check,MousePointer2} from 'lucide-react';
import {projectPoint} from './perspective';
import Thumbnail from './Thumbnail';
import {DECOR,SPECIES,uid,type TankState,type Selection} from './state';
import {natureForm} from './nature';
import {UFO_KIND,GLASS_KIND,catalogDecor} from './decorLibrary';
import {Slider} from './components/ui/slider';

// Menu priority only: species indices remain stable for saved tanks.
const fishPriority=(kind:number)=>SPECIES[kind].name==='Fantail goldfish'?0:SPECIES[kind].name==='Emerald betta'?1:2;
type Props={view:'owned'|'add'|'editor';category?:string;type:'fish'|'decor';state:TankState;selected:Selection;onSelect:(s:Selection)=>void;onAdd:(kind:number)=>void;onRemove:(s:Selection)=>void;onChange:(patch:Partial<TankState>,record?:boolean)=>void;begin:()=>void;end:()=>void};
function Dial({label,value,min=0,max=100,unit='%',onChange,onBegin,onEnd}:{label:string;value:number;min?:number;max?:number;unit?:string;onChange:(v:number)=>void;onBegin:()=>void;onEnd:()=>void}){
 return <div className="edit-dial"><label><span>{label}</span><span className="dial-value"><input aria-label={label+' value'} type="number" min={min} max={max} value={Math.round(value)} onChange={e=>{if(e.target.value==='')return;onBegin();onChange(Math.min(max,Math.max(min,Number(e.target.value))));}} onBlur={onEnd}/>{unit}</span></label><Slider aria-label={label} min={min} max={max} value={[value]} onValueChange={v=>{onBegin();onChange(Array.isArray(v)?v[0]:v);}} onValueCommitted={onEnd}/></div>;
}
export default function Inventory(p:Props){
 const {type,state}=p,isFish=type==='fish',catalog=isFish?SPECIES:DECOR;
 const items=isFish?[...state.fish].sort((a,b)=>fishPriority(a.kind)-fishPriority(b.kind)):state.decor.filter(d=>!p.category||DECOR[d.kind].category===p.category);
 const mode=p.view;
 const [section,setSection]=useState<'look'|'position'>('look');
 const item=items.find(i=>p.selected?.type===type&&p.selected.id===i.id);
 useEffect(()=>{setSection('look');},[item?.id]);
 const form=natureForm(item&&'form'in item?item.form:undefined);
 const update=(patch:Record<string,unknown>)=>{if(!item)return;p.onChange(isFish?{fish:state.fish.map(f=>f.id===item.id?{...f,...patch}:f)}:{decor:state.decor.map(d=>d.id===item.id?{...d,...patch}:d)},false);};
 const dial=(label:string,value:number,onChange:(v:number)=>void,min=0,max=100,unit='%')=><Dial label={label} value={value} onChange={onChange} min={min} max={max} unit={unit} onBegin={p.begin} onEnd={p.end}/>;
 const choices=catalog.map((spec,kind)=>({spec,kind})).filter(({spec,kind})=>(isFish||catalogDecor(kind)&&(!p.category||'category'in spec&&spec.category===p.category))).sort((a,b)=>isFish?fishPriority(a.kind)-fishPriority(b.kind):0);
 const atLimit=(isFish?state.fish.length:state.decor.length)>=(isFish?80:180);
 const copy=(source=item,openEditor=true)=>{if(!source||atLimit||!isFish&&source.kind===UFO_KIND)return;p.end();const id=uid();if(isFish)p.onChange({fish:[...state.fish,{...source,id}]});else if('x'in source)p.onChange({decor:[...state.decor,{...structuredClone(source),id,x:Math.min(1.5,source.x+.04)}]});if(openEditor)p.onSelect({type,id});};
 return <div className={'object-workspace'+(item?' has-selection':'')}>
  {mode!=='editor'&&<section className="object-browser" aria-label={isFish?'Fish collection':'Decor collection'}>
   <p className="browser-guidance">{mode==='owned'?'Choose an item here or click it in the water to edit.':atLimit?'Your tank is full. Remove an item before adding another.':'Choose an item to add it to your tank.'}</p>
   <div className={'object-cards'+(mode==='owned'?' owned-cards':'')}>
    {mode==='owned'?items.map(i=>{const siblings=items.filter(other=>other.kind===i.kind),number=siblings.findIndex(other=>other.id===i.id)+1,name=catalog[i.kind].name+(siblings.length>1?' · '+number:'');return <div className="owned-item" key={i.id}><button className="object-card" aria-label={'Select '+name} aria-pressed={item?.id===i.id} onClick={()=>p.onSelect({type,id:i.id})}><span style={{filter:`hue-rotate(${isFish?('hue'in i?i.hue:0)||0:natureForm('form'in i?i.form:undefined).hue}deg)`}}><Thumbnail type={type} kind={i.kind}/></span><b>{name}</b>{item?.id===i.id&&<Check className="object-add" size={15}/>}</button><div className="owned-item-actions">{(isFish||i.kind!==UFO_KIND)&&<button title="Duplicate" aria-label={'Duplicate '+name} disabled={atLimit} onClick={()=>copy(i,false)}><Copy size={15}/></button>}<button title="Remove" aria-label={'Remove '+name} onClick={()=>{p.end();p.onRemove({type,id:i.id});}}><Trash2 size={15}/></button></div></div>}):choices.map(({spec,kind})=><button className="object-card" key={kind} aria-label={'Add '+spec.name} disabled={atLimit||!isFish&&kind===UFO_KIND&&state.decor.some(d=>d.kind===UFO_KIND)} onClick={()=>p.onAdd(kind)}><Thumbnail type={type} kind={kind}/><b>{spec.name}</b><Plus size={15} className="object-add"/></button>)}
    {mode==='owned'&&!items.length&&<div className="object-empty"><p>No {isFish?'fish':'decor'} in this collection yet.</p></div>}
   </div>
  </section>}
  {mode==='editor'&&<section className="object-editor" aria-label="Selected item editor">
   {item?<><div className="selected-heading"><div className="selected-identity"><span className="selected-preview"><Thumbnail type={type} kind={item.kind}/></span><div><span className="studio-eyebrow">SELECTED {isFish?'FISH':'DECOR'}</span><h2>{catalog[item.kind].name}</h2></div></div><button className="finish-editing" onClick={()=>{p.end();p.onSelect(null);}}><Check size={15}/>Done</button></div>
    {!isFish&&<div className="inspector-sections" aria-label="Editing controls"><button aria-pressed={section==='look'} onClick={()=>{p.end();setSection('look');}}>Appearance</button><button aria-pressed={section==='position'} onClick={()=>{p.end();setSection('position');}}>Placement</button></div>}
    <div className="selected-controls">
     {(isFish||section==='look')&&<>

      {dial('Size',item.size*100,v=>update({size:v/100}),isFish?40:20,isFish?250:600)}
      {isFish?dial('Color shift',('hue'in item?item.hue:0)||0,hue=>update({hue}),-180,180,'°'):item.kind===GLASS_KIND&&'x'in item?<label className="edit-color"><span>Pebble color</span><input aria-label="Pebble color" type="color" value={item.glassColor||'#48cbea'} onChange={e=>{p.begin();update({glassColor:e.target.value});}} onBlur={p.end}/></label>:dial('Color shift',form.hue,hue=>update({form:{...form,hue}}),-90,90,'°')}
      {!isFish&&'x'in item&&<>{item.kind!==UFO_KIND&&item.kind!==GLASS_KIND&&dial('Moss coverage',form.moss,moss=>update({form:{...form,moss}}))}<button className="mirror-item" aria-pressed={item.flip} onClick={()=>{p.begin();update({flip:!item.flip});p.end();}}>Mirror horizontally {item.flip&&<Check size={14}/>}</button></>}
     </>}
     {!isFish&&section==='position'&&'x'in item&&<>
      {item.kind!==UFO_KIND&&dial('Left / right',projectPoint((item.x-.5)*15,0,((item.y-.73)/.25-.5)*5.1,1,1).x*100,v=>{const scale=projectPoint(0,0,((item.y-.73)/.25-.5)*5.1,1,1).scale;update({x:(v/100-.5)*16/scale/15+.5});})}
      {dial(item.kind===UFO_KIND?'Chain length':'Back / front',(item.y-.73)/.25*100,v=>update({y:.73+v/100*.25}))}
      {dial('Lift / lower',(item.elevation||0)*100,v=>update({elevation:v/100}),-200,600,'')}
      {item.kind!==UFO_KIND&&<>{dial('Tilt',item.tilt||0,tilt=>update({tilt}),-180,180,'°')}{dial('Turn',item.rotation,rotation=>update({rotation}),-180,180,'°')}</>}
      <p className="editor-note">{item.kind===UFO_KIND?'Drag the floating toolbar to move the UFO’s hanging point.':'You can also drag this decoration directly in the tank.'}</p>
     </>}
     {!isFish&&item.kind===UFO_KIND&&'x'in item&&(<div className="ufo-lamp-settings"><button className="mirror-item" aria-pressed={!!item.beamOn} onClick={()=>{p.begin();update({beamOn:!item.beamOn});p.end();}}>Lamp {item.beamOn?'on':'off'}</button><label className="edit-color"><span>Beam color</span><input aria-label="Beam color" type="color" value={item.beamColor||'#48baff'} onChange={e=>{p.begin();update({beamColor:e.target.value});}} onBlur={p.end}/></label></div>)}
    </div><div className="inspector-footer"><button className="back-to-collection" onClick={()=>{p.end();p.onSelect(null);}}><ArrowLeft size={15}/>Collection</button>{(isFish||item.kind!==UFO_KIND)&&<button disabled={atLimit} onClick={()=>copy()}><Copy size={15}/>Duplicate</button>}<button className="inspector-remove" onClick={()=>p.onRemove({type,id:item.id})}><Trash2 size={15}/>Remove</button></div>
   </>:<div className="editor-empty"><MousePointer2 size={26}/><h2>A little personal touch</h2><p>Select a fish or decoration to adjust its size, color and placement.</p><span>Changes appear in the tank as you edit.</span></div>}
  </section>}
 </div>;
}