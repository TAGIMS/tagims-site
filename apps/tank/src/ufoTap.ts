// Delay a single tap briefly so a double tap edits without changing the lamp.
export function createUfoTap(onSingle:(id:number)=>void,onDouble:(id:number)=>void,delay=300){
 let pending:number|null=null,timer:ReturnType<typeof setTimeout>|undefined;
 const cancel=()=>{clearTimeout(timer);timer=undefined;pending=null;};
 return {cancel,tap(id:number){if(pending===id){cancel();onDouble(id);return;}cancel();pending=id;timer=setTimeout(()=>{pending=null;timer=undefined;onSingle(id);},delay);}};
}
