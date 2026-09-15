/* Appearance backups contain no credentials, client records, or financial amounts. */
(() => {
  const keys=new Set([
    'hub-bg-color','hub-menu-color','hub-accent','hub-menu-2-color','hub-accent-2',
    'hub-font-family','hub-font-color','hub-font-size','hub-list-density','hub-parallax',
    'hub-parallax-speed','hub-widget-theme','hub-background-mode','hub-background-style',
    'hub-bg-gradient-color','hub-bg-gradient-angle','hub-background-image-disabled','hub-fd-sections-v1',
    ...Array.from(document.querySelectorAll('[data-widget-var]'),e=>'hub-'+e.id)
  ]);
  const status=document.createElement('p');status.className='appearance-status';status.role='status';
  const host=document.createElement('details');host.className='style-subsection-accordion';
  host.innerHTML='<summary>Saved appearance</summary><div class="appearance-actions"><button type="button" data-appearance="export">Back up appearance</button><button type="button" data-appearance="import">Restore backup</button><button type="button" data-appearance="save">Save to my login</button><button type="button" data-appearance="load">Load from my login</button><label><input type="checkbox" id="appearanceAuto"> Sync appearance automatically</label><input type="file" accept=".json,application/json" hidden id="appearanceFile"></div>';
  host.append(status);document.getElementById('colorLab').parentElement.append(host);
  const say=m=>status.textContent=m;
  async function imageRead(){
    const db=await openDB();
    try{return await new Promise((resolve,reject)=>{const q=db.transaction('settings').objectStore('settings').get('background');q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error);});}finally{db.close();}
  }
  async function capture(){return {version:1,settings:Object.fromEntries([...keys].map(k=>[k,localStorage.getItem(k)])),background:await imageRead()};}
  function validate(bundle){
    if(bundle?.version!==1||!bundle.settings||typeof bundle.settings!=='object')throw Error('Choose a Hub appearance backup.');
    const settings={};
    for(const [k,v] of Object.entries(bundle.settings)){
      if(!keys.has(k))continue;
      if(v!==null&&(typeof v!=='string'||v.length>20000))throw Error('Invalid appearance value.');
      settings[k]=v;
    }
    const bg=bundle.background;
    if(bg!==null&&bg!==undefined&&(typeof bg!=='string'||bg.length>11000000||!(/^(https?:\/\/|data:image\/(png|jpeg|webp|gif);base64,|assets\/)/i.test(bg))))throw Error('Unsupported background image in backup.');
    return {version:1,settings,background:bg||null};
  }
  async function apply(bundle){
    const clean=validate(bundle);
    // Keep a recoverable local copy before replacing appearance.
    const before=await capture(),db=await openDB();
    await new Promise((resolve,reject)=>{const t=db.transaction('settings','readwrite');t.objectStore('settings').put(before,'appearance-before-restore');t.oncomplete=resolve;t.onerror=()=>reject(t.error);});db.close();
    await saveImage(clean.background);
    for(const [k,v] of Object.entries(clean.settings))v===null?localStorage.removeItem(k):localStorage.setItem(k,v);
    location.reload();
  }
  const auto=host.querySelector('#appearanceAuto'),file=host.querySelector('#appearanceFile');
  const ownerKey=()=>OpsStore.user?.id?'hub-appearance-auto:'+OpsStore.user.id:null;
  const setAuto=()=>{auto.checked=!!ownerKey()&&localStorage.getItem(ownerKey())==='true';};
  let loadedUser=null,busy=false,timer,loading=false;
  const canonical=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
  async function cloudLoad(){loading=true;try{const value=await OpsStore.loadAppearance();if(value){say('Loading your saved appearance…');await apply(value);}else say('No appearance saved to this login yet. Use Save to my login.');}finally{loading=false;}}
  async function cloudSave(){if(busy||loading)return;busy=true;try{await OpsStore.saveAppearance(await capture());say('Appearance and background saved to your login.');}catch(e){say('Account sync unavailable. Your local appearance is safe. '+e.message);}finally{busy=false;}}
  host.addEventListener('click',async e=>{
    const action=e.target.dataset.appearance;if(!action)return;
    try{
      if(action==='export'){const url=URL.createObjectURL(new Blob([JSON.stringify(await capture())],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='Hub-Appearance.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Backup includes colors, selections, and the background image.');}
      if(action==='import')file.click();
      if(action==='save')await cloudSave();
      if(action==='load')await cloudLoad();
    }catch(err){say('Appearance unchanged. '+err.message);}
  });
  file.addEventListener('change',async()=>{if(!file.files[0])return;try{if(file.files[0].size>12000000)throw Error('Backup exceeds 12 MB.');await apply(JSON.parse(await file.files[0].text()));}catch(e){say(e.message);}});
  auto.addEventListener('change',()=>{const key=ownerKey();if(!key){auto.checked=false;say('Sign in first to enable account sync.');return;}localStorage.setItem(key,String(auto.checked));if(auto.checked)cloudSave();});
  function schedule(){if(loading||!auto.checked)return;clearTimeout(timer);timer=setTimeout(cloudSave,1800);}
  document.getElementById('panel').addEventListener('input',schedule);
  document.getElementById('panel').addEventListener('change',schedule);
  document.getElementById('panel').addEventListener('click',e=>{if(!e.target.closest('.appearance-actions'))schedule();});
  document.addEventListener('hub-background-saved',schedule);
  async function onAccount(){
    setAuto();const owner=OpsStore.user?.id||null;
    if(!owner){loadedUser=null;return;}
    if(owner===loadedUser)return;loadedUser=owner;
    // A new device can discover an existing account preference without first
    // uploading its defaults. An explicit local opt-out is still respected.
    if(auto.checked||localStorage.getItem(ownerKey())===null)try{
      const cloud=await OpsStore.loadAppearance();
      if(OpsStore.user?.id!==owner)return;
      if(cloud){
        const clean=validate(cloud),current=await capture();
        localStorage.setItem(ownerKey(),'true');auto.checked=true;
        if(canonical(clean)!==canonical(validate(current)))await apply(clean);
      }
    }catch(e){say('Account sync unavailable. Local appearance retained. '+e.message);}
  }
  OpsStore.on(onAccount);onAccount();
  say('Local appearance stays on this browser address. Back up before moving to another address or device.');
})();
