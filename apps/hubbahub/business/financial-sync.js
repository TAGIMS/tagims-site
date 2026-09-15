/* Private account worksheet sync. Local pending copies survive failed saves. */
(() => {
  const host=document.createElement('details');host.className='style-subsection-accordion';
  host.innerHTML='<summary>Financial sync</summary><div class="appearance-actions"><button type="button" data-finance-connect>Save finances to my login</button><button type="button" data-finance-load>Load saved finances</button></div><p role="status" data-finance-status></p>';
  document.getElementById('colorLab').parentElement.append(host);
  const say=s=>host.querySelector('[data-finance-status]').textContent=s;
  let owner=null,revision=null,enabled=false,loading=false,busy=false,dirty=false,timer,epoch=0;
  const copy=()=>JSON.parse(JSON.stringify(FD.data));
  const cacheKey=id=>'hub-financial-account:'+id;
  function journal(){if(owner)localStorage.setItem(cacheKey(owner),JSON.stringify({worksheet:copy(),revision,pending:dirty}));}
  function freeze(value){document.querySelectorAll('.fd-root').forEach(e=>e.inert=value);}
  async function save(){
    if(!enabled||!owner||loading||busy||!dirty)return;
    const account=owner,run=epoch,payload=copy(),serialized=JSON.stringify(payload);busy=true;say('Saving finances…');
    try{const row=await OpsStore.saveFinancials(payload,revision);if(run!==epoch||account!==owner)return;revision=row.revision;dirty=JSON.stringify(FD.data)!==serialized;journal();say(dirty?'Saving newer edits…':'Finances saved to your login.');if(dirty)timer=setTimeout(save,400);}
    catch(e){if(run===epoch){enabled=false;say('Local edits are safe. Sync paused: '+e.message);}}
    finally{busy=false;}
  }
  async function load(force=false){
    if(!owner)return;
    const run=epoch,account=owner;loading=true;freeze(true);say('Checking saved finances…');
    try{
      const row=await OpsStore.loadFinancials();if(run!==epoch)return;
      let cached=null;try{cached=JSON.parse(localStorage.getItem(cacheKey(account)));}catch{}
      if(force&&cached)localStorage.setItem(cacheKey(account)+':before-load',JSON.stringify(cached));
      if(cached?.pending&&!force){
        FD.replace(cached.worksheet);revision=cached.revision;dirty=true;
        enabled=(row?.revision??null)===revision;
        say(enabled?'Resuming unsaved edits…':'Newer saved finances exist. Your local edits are backed up; use Load saved finances to switch.');
      }else if(row){
        if(!force)localStorage.setItem(cacheKey(account)+':before-load',JSON.stringify({worksheet:copy()}));
        FD.replace(row.worksheet);revision=row.revision;enabled=true;dirty=false;journal();say('Finances synced to your login.');
      }else{revision=null;enabled=false;dirty=false;say('No finances saved to this login yet. Use Save finances to my login on your original device.');}
    }catch(e){if(run===epoch){enabled=false;say('Local finances retained. '+e.message);}}
    finally{if(run===epoch){loading=false;freeze(false);if(enabled&&dirty)timer=setTimeout(save,100);}}
  }
  function accountChanged(){
    const next=OpsStore.mode==='cloud'?OpsStore.user?.id:null;if(next===owner)return;
    clearTimeout(timer);if(owner)journal();const previous=owner;owner=next;epoch++;enabled=false;dirty=false;revision=null;loading=true;
    // Do not expose one signed-in account's worksheet to another account.
    const bound=localStorage.getItem('hub-financial-bound-owner');
    if(previous||(bound&&bound!==next))FD.replace(FD.fresh());
    loading=false;
    if(next){localStorage.setItem('hub-financial-bound-owner',next);load();}else{freeze(false);say('Sign in to sync finances between devices.');}
  }
  document.addEventListener('hub-financial-saved',()=>{if(loading||!owner)return;dirty=true;journal();if(enabled){say('Finances waiting to sync…');clearTimeout(timer);timer=setTimeout(save,700);}});
  host.querySelector('[data-finance-connect]').addEventListener('click',async()=>{
    if(!owner){say('Sign in first.');return;}if(loading||busy)return;
    // Insert-only initial upload: a second device cannot overwrite an existing row.
    if(revision===null){enabled=true;dirty=true;journal();await save();}else if(enabled){dirty=true;journal();await save();}else say('Use Load saved finances to resolve the newer saved version first.');
  });
  host.querySelector('[data-finance-load]').addEventListener('click',()=>{if(!owner)say('Sign in first.');else if(!loading&&!busy)return load(true);});
  window.addEventListener('online',()=>{if(owner&&!loading&&!busy)load();});
  window.addEventListener('focus',()=>{if(owner&&enabled&&!dirty&&!loading&&!busy)load();});
  OpsStore.on(accountChanged);accountChanged();if(!owner)say('Sign in to sync finances between devices.');
})();
