// Lexical adapter: NEVER replace window.localStorage or touch the main HUB keys.
const localStorage = (()=>{
 const prefix='gestures-sandbox-v1:', memory=new Map();
 let storage;try{storage=window.localStorage;storage.setItem(prefix+'probe','1');storage.removeItem(prefix+'probe');}catch{}
 const keys=()=>storage?Object.keys(storage).filter(k=>k.startsWith(prefix)).map(k=>k.slice(prefix.length)):[...memory.keys()];
 return {getItem:k=>storage?storage.getItem(prefix+k):(memory.get(k)??null),setItem:(k,v)=>storage?storage.setItem(prefix+k,String(v)):memory.set(k,String(v)),removeItem:k=>storage?storage.removeItem(prefix+k):memory.delete(k),key:i=>keys()[i]??null,get length(){return keys().length;}};
})();
if(!localStorage.getItem('hub-widget-ids')){
 localStorage.setItem('hub-widget-ids','["widget1"]');
 localStorage.setItem('hub-widget-content-widget1','gestures');
 localStorage.setItem('hub-background-mode','color');
 localStorage.setItem('hub-bg-color','#151923');
 for(const profile of ['desktop','ultrawide','tablet','mobile']){
  for(const [key,value] of Object.entries({'--widget-width':640,'--widget-height':640,'--widget-x':40,'--widget-y':50}))localStorage.setItem('hub-layout-'+profile+'-widget1-'+key,value);
 }
}
