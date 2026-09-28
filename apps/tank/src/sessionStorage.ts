export const AUTH_STORAGE_KEY='tank-account-session-v1';
const PREFERENCE_KEY='tank-stay-signed-in-v1';

// A per-tab preference keeps temporary sessions separate from remembered sessions.
export function createSessionStorage(local:Storage,temporary:Storage){
 const remember=()=> (temporary.getItem(PREFERENCE_KEY)??local.getItem(PREFERENCE_KEY))!=='false';
 const storage={
  getItem(key:string){return (remember()?local:temporary).getItem(key);},
  setItem(key:string,value:string){const target=remember()?local:temporary;target.setItem(key,value);(remember()?temporary:local).removeItem(key);},
  removeItem(key:string){local.removeItem(key);temporary.removeItem(key);}
 };
 function setRemember(value:boolean){
  const source=remember()?local:temporary,target=value?local:temporary;
  const entries:Array<[string,string]>=[];
  for(let i=0;i<source.length;i++){const key=source.key(i);if(key?.startsWith(AUTH_STORAGE_KEY)){const item=source.getItem(key);if(item!==null)entries.push([key,item]);}}
  for(const [key,item] of entries)target.setItem(key,item);
  temporary.setItem(PREFERENCE_KEY,String(value));local.setItem(PREFERENCE_KEY,String(value));
  const other=value?temporary:local;
  for(let i=other.length-1;i>=0;i--){const key=other.key(i);if(key?.startsWith(AUTH_STORAGE_KEY))other.removeItem(key);}
 }
 return {storage,remember,setRemember};
}
