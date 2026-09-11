window.OpsSourceUI=({S,dialog,esc,options,input,area,status,projectId,uploadDestination,refresh})=>{
  const identity=()=>S.mode+':'+(S.user?.id||'');
  function assertIdentity(start){if(S.mode==='signed-out'||identity()!==start)throw new Error('Workspace changed. Close this import and start again.');}
  function noteImport(){
    const start=identity();
    const el=dialog('Choose / import a note',
      '<p>Review a shared Apple Note, select a text/Markdown export, or paste text. This imports a copy; it does not edit or continuously sync Apple Notes. Images, scans, and audio attachments are not included.</p>'+
      (OpsSources.pendingError?'<p role="alert">'+esc(OpsSources.pendingError)+'</p>':'')+
      '<label>Note file (optional)<input type="file" data-note-file accept=".txt,.md,.markdown,text/plain,text/markdown"></label>'+
      area('notes','Review note text',OpsSources.pendingNote)+
      '<label>Save note to project<select name="project" required><option value="">Choose a project</option>'+options(S.data.projects.map(p=>[p.id,p.name]),projectId())+'</select></label>'+
      '<p class="ops-muted">The same note will be available in CRM and Estimates. Identical text already saved to this project will not be added again.</p>',
      async f=>{
        assertIdentity(start);const notes=OpsSources.normalize(f.notes);
        if(!S.data.projects.some(p=>p.id===f.project))throw new Error('Choose an accessible project first.');
        const duplicate=S.data.walkthroughs.some(n=>n.project_id===f.project&&n.notes?.replace(/\r\n?/g,'\n').trim()===notes);
        if(!duplicate)await S.save('walkthroughs',{project_id:f.project,notes});
        OpsSources.clear();status(duplicate?'This note is already saved to that project.':'Note imported. Available in CRM and Estimates.');
      },'Confirm note import');
    let fileRead=0;
    el.querySelector('[data-note-file]').onchange=async ev=>{
      const version=++fileRead,submit=el.querySelector('[type=submit]');submit.disabled=true;
      try{const value=await OpsSources.fileText(ev.target.files[0]);if(version===fileRead&&el.isConnected){el.querySelector('textarea').value=value;el.querySelector('[role=alert]').textContent='';}}
      catch(e){if(version===fileRead&&el.isConnected)el.querySelector('[role=alert]').textContent=e.message;}
      finally{if(version===fileRead)submit.disabled=false;}
    };
  }
  function appleSetup(){
    const base=location.origin+location.pathname;
    dialog('Apple Notes handoff — iPhone / iPad',
      '<p>The website receiver is built. A one-time Shortcut setup and an on-device test are still required. No Apple password is needed.</p>'+
      '<ol><li>Create a Shortcut named <strong>Send Note to TAGIMS</strong>. Enable <strong>Show in Share Sheet</strong>, accepting Text and Rich Text.</li>'+
      '<li>Add <strong>Get Text from Input</strong> using Shortcut Input.</li>'+
      '<li>Add <strong>URL Encode</strong> using that text.</li>'+
      '<li>Add a Text action containing the prefix below, followed immediately by the URL-encoded text variable.</li>'+
      '<li>Add <strong>Open URLs</strong> using that Text action.</li></ol>'+
      input('prefix','Shortcut URL prefix',base+'#tagims-note=')+
      '<p>In Apple Notes, choose <strong>Share → Send Copy → Send Note to TAGIMS</strong>. Estimates receives the text; you review it and confirm the project before saving.</p>'+
      '<p>Keep encoded notes under 12,000 characters for this first handoff. Large notes can use .txt/.md import. Attachments need separate photo selection. Unsaved incoming text is held in this tab’s memory; refreshing before saving discards it.</p>'+
      (['localhost','127.0.0.1'].includes(location.hostname)?'<p role="alert">This preview address works only on the office PC. A phone-accessible HTTPS preview must be published before using this Shortcut on your iPhone or iPad. Do not use this localhost prefix on your phone.</p>':''),
      ()=>{},'Done');
  }
  async function googlePhotos(){
    if(!OpsGooglePhotos.configured()){
      dialog('Google Photos — setup pending','<p>The selection adapter is built but not connected. We need to verify the existing TAGiM Google OAuth project, enable the Photos Picker API, register this app’s browser origin, and review Google’s permitted-use requirements before activation.</p><p>Your existing Google login, Gmail, Calendar, and Todoist connections have not been changed. Direct photo selection and the camera still work.</p>',()=>{},'Done');return;
    }
    const start=identity(),controller=OpsGooglePhotos.create();let items=null,loading=false,importing=false;
    const el=dialog('Choose from Google Photos',
      '<p>Only photos you select will be copied into this workspace. Originals stay in Google Photos. This action does not run AI or approve website publishing.</p>'+
      '<button type="button" data-google-connect disabled>Loading Google sign-in…</button>'+
      '<div data-google-picker></div><p data-google-status role="status"></p>'+
      '<label>Import destination<select name="project">'+options([['','Photo Inbox'],...S.data.projects.map(p=>[p.id,p.name])],uploadDestination())+'</select></label>'+
      '<div data-google-items></div><label class="ops-check"><input type="checkbox" name="consent" required>I authorize copying these selected photos into '+(S.mode==='demo'?'this browser’s local demo':'the shared TAGIMS project storage')+'.</label>',
      async f=>{
        assertIdentity(start);if(!items)throw new Error('Connect, choose photos in Google, then load your selections.');
        if(importing)throw new Error('Import is already running.');importing=true;
        const destination=f.project||null,chosen=new Set(Array.from(el.querySelectorAll('[data-google-item]:checked'),x=>x.dataset.googleItem));
        if(!chosen.size){importing=false;throw new Error('Select at least one photo.');}
        el.querySelector('[name=project]').disabled=true;el.querySelector('[data-cancel]').disabled=true;
        let saved=0,duplicates=0;const failures=[];
        try{
          for(const item of items.filter(i=>chosen.has(i.id))){
            try{
              assertIdentity(start);
              const id=await OpsSources.stableId('google-photos:'+start+':'+item.id);
              assertIdentity(start);
              if(S.data.photos.some(p=>p.id===id)){duplicates++;continue;}
              el.querySelector('[data-google-status]').textContent='Importing '+(item.mediaFile?.filename||'photo')+'…';
              const file=await controller.file(item);assertIdentity(start);
              await S.upload(destination,file,id);saved++;
            }catch(e){failures.push((item.mediaFile?.filename||'Photo')+': '+e.message);}
          }
          status(saved+' photo(s) imported; '+duplicates+' already present.'+(duplicates?' Existing photos were not moved; assign Photo Inbox items from the library.':'')+(failures.length?' '+failures.length+' failed.':''),!!failures.length);
          if(failures.length)throw new Error(failures.join('\n')+'\nSaved photos are retained. Retry skips already imported selections.');
        }finally{importing=false;el.querySelector('[name=project]').disabled=false;el.querySelector('[data-cancel]').disabled=false;}
      },'Import selected photos');
    const error=e=>{if(el.isConnected)el.querySelector('.ops-form-error').textContent=e.message;};
    const unsubscribe=S.on(()=>{if(identity()!==start)el.close();});
    el.addEventListener('cancel',ev=>{if(importing)ev.preventDefault();});
    el.addEventListener('close',()=>{unsubscribe();void controller.close();});
    try{await OpsGooglePhotos.sdk();}catch(e){error(e);return;}
    if(!el.isConnected)return;
    const connect=el.querySelector('[data-google-connect]');connect.disabled=false;connect.textContent='Connect Google Photos';
    connect.onclick=async()=>{
      connect.disabled=true;
      try{
        assertIdentity(start);await controller.authorize();const {url}=await controller.begin();
        if(!el.isConnected)return;
        const container=el.querySelector('[data-google-picker]');container.replaceChildren();
        const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open Google Photos and select';
        const load=document.createElement('button');load.type='button';load.textContent='Load my selections';load.dataset.googleLoad='';
        container.append(link,load);
        load.onclick=async()=>{
          if(loading)return;loading=true;load.disabled=true;
          try{
            assertIdentity(start);const result=await controller.list();
            if(!el.isConnected)return;
            if(!result){el.querySelector('[data-google-status]').textContent='Finish selecting in Google Photos and tap Done, then load again.';return;}
            items=result;
            el.querySelector('[data-google-items]').innerHTML=items.map(i=>'<label class="ops-check"><input type="checkbox" data-google-item="'+esc(i.id)+'" checked>'+esc(i.mediaFile?.filename||'Photo')+'</label>').join('');
            el.querySelector('[data-google-status]').textContent=items.length+' selection(s) ready for review.';
          }catch(e){error(e);}finally{loading=false;load.disabled=false;}
        };
        connect.hidden=true;
      }catch(e){error(e);connect.disabled=false;}
    };
  }
  return {noteImport,appleSetup,googlePhotos};
};
