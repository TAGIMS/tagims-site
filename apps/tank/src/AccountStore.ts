import {cleanDocument,type TankDocument,type TankStorage} from './tankStorage';
export type SavedDocument={document:TankDocument;revision:number};
export interface SaveService {
 read():Promise<SavedDocument|null>;
 write(document:TankDocument,revision:number):Promise<SavedDocument|null>;
}
export class AccountStore implements TankStorage {
 document:TankDocument={};
 revision=0;
 dirty=false;
 conflict=false;
 status='Loading account…';
 private timer:ReturnType<typeof setTimeout>|undefined;
 private busy=false;
 private stopped=false;
 private generation=0;
 private key:string;
 constructor(id:string,private service:SaveService,private cache:Storage,private changed:()=>void,private reload:()=>void){
  this.key='tank-account-data-v1:'+id;
  try{
   const raw=cache.getItem(this.key);
   if(raw){const data=JSON.parse(raw);this.document=cleanDocument(data.document);this.revision=Number.isInteger(data.revision)&&data.revision>=0?data.revision:0;this.dirty=data.dirty===true;}
  }catch{this.status='The browser backup could not be read. Reconnecting to your account…';}
 }
 getItem(key:string){return this.document[key]??null;}
 setItem(key:string,value:string){
  if(this.stopped||this.document[key]===value)return;
  this.document={...this.document,[key]:value};this.dirty=true;this.generation++;
  this.persist();this.status=this.conflict?'Another device has changes. Choose which save to keep.':'Changes saved on this device; waiting to sync…';this.changed();this.schedule();
 }
 private persist(){this.cache.setItem(this.key,JSON.stringify({document:this.document,revision:this.revision,dirty:this.dirty}));}
 private schedule(){clearTimeout(this.timer);if(!this.stopped&&!this.conflict)this.timer=setTimeout(()=>void this.sync(),1000);}
 private backup(){this.cache.setItem(this.key+':backup:'+Date.now(),JSON.stringify({document:this.document,revision:this.revision}));}
 private fail(error:unknown){this.status='Not synced. Your changes stay on this device. '+(error instanceof Error?error.message:'Please retry.');this.changed();}
 async refresh(){
  if(this.stopped||this.busy)return;
  if(this.dirty){await this.sync();return;}
  this.busy=true;
  const generation=this.generation;
  try{
   const remote=await this.service.read();
   if(this.stopped)return;
   if(generation!==this.generation){this.schedule();return;}
   const incoming=cleanDocument(remote?.document??{});
   const keys=new Set([...Object.keys(this.document),...Object.keys(incoming)]);
   const changed=[...keys].some(key=>this.document[key]!==incoming[key]);
   this.document=cleanDocument(remote?.document??{});this.revision=remote?.revision??0;this.persist();
   this.status=remote?'Saved to your account':'Your account is ready. Copy browser saves or build a new tank.';
   if(changed)this.reload();
  }catch(error){this.fail(error);}finally{this.busy=false;this.changed();}
 }
 async sync(){
  if(this.stopped||this.busy||this.conflict||!this.dirty)return;
  this.busy=true;this.status='Saving to your account…';this.changed();
  const generation=this.generation, snapshot={...this.document};
  try{
   const saved=await this.service.write(snapshot,this.revision);
   if(this.stopped)return;
   if(!saved){this.conflict=true;this.status='Another device has changes. Choose which save to keep.';return;}
   this.revision=saved.revision;
   this.dirty=generation!==this.generation;
   this.persist();this.status=this.dirty?'Saving recent changes…':'Saved to your account';
   if(this.dirty)this.schedule();
  }catch(error){this.fail(error);}finally{this.busy=false;this.changed();}
 }
 async resolve(useDevice:boolean){
  if(this.busy||this.stopped)return;
  this.busy=true;
  const generation=this.generation;
  try{
   const remote=await this.service.read();
   if(this.stopped)return;
   if(generation!==this.generation)throw Error('The tank changed while loading. Please try again.');
   this.backup();
   this.revision=remote?.revision??0;this.conflict=false;
   if(useDevice){this.dirty=true;this.persist();this.schedule();}
   else {this.document=cleanDocument(remote?.document??{});this.dirty=false;this.persist();this.status='Loaded your account save';this.reload();}
  }catch(error){this.fail(error);}finally{this.busy=false;this.changed();}
 }
 replace(document:TankDocument){
  this.backup();this.document=cleanDocument(document);this.generation++;this.dirty=true;this.persist();this.reload();
  this.status='Browser saves copied. Saving to your account…';this.changed();this.schedule();
 }
 stop(){this.stopped=true;clearTimeout(this.timer);}
}
