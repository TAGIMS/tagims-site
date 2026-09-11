(() => {
  const localTables=['payments','change_orders','change_events'];
  const tables=['clients','projects','project_members','walkthroughs','photos','estimates','estimate_items','field_items','pipeline_entries',...localTables];
  let session=null, mode='signed-out', data=Object.fromEntries(tables.map(t=>[t,[]]));
  let dbPromise, refreshPromise, generation=0;
  const listeners=new Set(), channel=typeof BroadcastChannel==='function'?new BroadcastChannel('tagims-ops-changes'):null;
  const emit=()=>listeners.forEach(fn=>fn());
  const db=()=>dbPromise??=new Promise((resolve,reject)=>{const r=indexedDB.open('tagims-operations-demo',1);r.onupgradeneeded=()=>{r.result.createObjectStore('rows',{keyPath:'id'});r.result.createObjectStore('files');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  async function local(op,store='rows'){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction(store,'readwrite');let result;try{const r=op(t.objectStore(store));if(r)r.onsuccess=()=>result=r.result;}catch(e){t.abort();reject(e);}t.oncomplete=()=>resolve(result);t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('Local save failed.'));});}
  async function request(path,init={},auth=true){
    if(auth && !session)throw new Error('Sign in to use shared records.');
    if(auth && session.expires_at<Date.now()/1000+60){
      if(!refreshPromise)refreshPromise=request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:JSON.stringify({refresh_token:session.refresh_token})},false).then(setSession).finally(()=>refreshPromise=null);
      await refreshPromise;
    }
    const headers={apikey:OpsConfig.key,...(auth?{Authorization:'Bearer '+session.access_token}:{}),...(!(init.body instanceof Blob)?{'Content-Type':'application/json'}:{}),...init.headers};
    const res=await fetch(OpsConfig.url+path,{...init,headers});
    if(!res.ok){let detail;try{detail=await res.json();}catch{}throw new Error(detail?.message||detail?.error_description||detail?.error||`Request failed (${res.status}).`);}
    return res.status===204?null:res.headers.get('content-type')?.includes('json')?res.json():res.blob();
  }
  function setSession(s){if(session?.user?.id!==s.user?.id){generation++;data=Object.fromEntries(tables.map(t=>[t,[]]));emit();}session={...s,expires_at:Date.now()/1000+s.expires_in};mode='cloud';sessionStorage.removeItem('tagims-ops-demo');sessionStorage.setItem('tagims-ops-session',JSON.stringify(session));return session;}
  const valid=t=>{if(!tables.includes(t))throw new Error('Unknown record type.');};
  const id=v=>{if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))throw new Error('Invalid record ID.');return v;};
  async function reload(){
    const run=++generation,startedMode=mode,startedUser=session?.user?.id;let next;
    if(mode==='demo'){const rows=await local(s=>s.getAll());next=Object.fromEntries(tables.map(t=>[t,rows.filter(r=>r._table===t)]));}
    else if(mode==='cloud'){
      const results=await Promise.all(tables.map(async t=>{if(localTables.includes(t))return [t,[]];const all=[];for(let offset=0;;offset+=1000){const rows=await request(`/rest/v1/ops_${t}?select=*&order=${t==='project_members'?'project_id':'id'}&limit=1000&offset=${offset}`);all.push(...rows);if(rows.length<1000)break;}return [t,all];}));next=Object.fromEntries(results);
    }else next=Object.fromEntries(tables.map(t=>[t,[]]));
    if(run!==generation||mode!==startedMode||session?.user?.id!==startedUser)return;
    data=next;
    emit();
  }
  async function changed(){await reload();channel?.postMessage({type:'changed'});}
  async function save(table,record){valid(table);if(mode==='signed-out')throw new Error('Sign in or choose the local demo first.');
    if(localTables.includes(table))throw new Error('Use the append-only project ledger to add this record.');
    if(table==='pipeline_entries'){
      OpsDomain.money(record.payments_received??0);if(record.project_total!==null)OpsDomain.money(record.project_total);
      if(!['queued','active','delayed','complete'].includes(record.status))throw new Error('Choose a pipeline status.');
      if(record.remaining_workdays!==null&&(!Number.isInteger(record.remaining_workdays)||record.remaining_workdays<0||record.remaining_workdays>3650))throw new Error('Use whole workdays from 0 to 3650, or leave blank.');
      if(data.pipeline_entries.some(x=>x.id!==record.id&&x.project_id===record.project_id))throw new Error('This project is already in the pipeline.');
      if(record.status==='active'&&data.pipeline_entries.some(x=>x.id!==record.id&&x.status==='active'))throw new Error('Finish or pause the current active project first.');
    }
    if(mode==='demo'){const row={...record,id:record.id||crypto.randomUUID(),owner_id:record.owner_id||'demo-owner',created_at:record.created_at||new Date().toISOString(),_table:table};await local(s=>s.put(row));await changed();return row;}
    const r={...record};delete r._table;
    const rows=await request(`/rest/v1/ops_${table}${r.id?'?id=eq.'+id(r.id):''}`,{method:r.id?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(r)});
    if(!rows?.length)throw new Error('No record was saved. Check your project permissions.');await changed();return rows[0];
  }
  async function upload(project,file,sourceId=null){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('Choose JPEG, PNG, or WebP up to 20 MB. Convert HEIC to JPEG first.');
    if(mode==='signed-out')throw new Error('Sign in or choose the local demo first.');
    project=project||null;
    const photoId=sourceId?id(sourceId):crypto.randomUUID(),path=project?`${id(project)}/${photoId}/original`:`inbox/${session?.user?.id||'demo-owner'}/${photoId}/original`;
    if(data.photos.some(p=>p.id===photoId))throw new Error('This photo is already imported. Use the existing library record.');
    if(mode==='demo'){await local(s=>s.put(file,path),'files');try{return await save('photos',{id:photoId,project_id:project,storage_path:path,name:file.name,stage:'unsorted',website_public:false});}catch(e){await local(s=>s.delete(path),'files');throw e;}}
    await request('/storage/v1/object/project-photos/'+path,{method:'POST',headers:{'Content-Type':file.type},body:file});
    try {const rows=await request('/rest/v1/ops_photos',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id:photoId,project_id:project,storage_path:path,name:file.name,stage:'unsorted'})});await changed();return rows[0];}
    catch(e){try{await request('/storage/v1/object/project-photos',{method:'DELETE',body:JSON.stringify({prefixes:[path]})});}catch{}throw e;}
  }
  async function assignPhoto(photoId,projectId){
    id(projectId);
    if(mode==='cloud'){await request('/rest/v1/rpc/ops_assign_photo',{method:'POST',body:JSON.stringify({photo:photoId,project:projectId})});await changed();return;}
    if(mode!=='demo')throw new Error('Open a workspace first.');
    if(!data.projects.some(p=>p.id===projectId))throw new Error('Project not found.');
    await local(s=>{const r=s.get(photoId);r.onsuccess=()=>{const p=r.result;if(!p||p._table!=='photos'||p.project_id){s.transaction.abort();return;}s.put({...p,project_id:projectId});};});
    await changed();
  }
  async function image(photo){if(mode==='demo'){const b=await local(s=>s.get(photo.storage_path),'files');if(!b)throw new Error('Original image is missing.');return URL.createObjectURL(b);}const r=await request('/storage/v1/object/sign/project-photos/'+photo.storage_path,{method:'POST',body:JSON.stringify({expiresIn:300})});return OpsConfig.url+'/storage/v1'+r.signedURL;}
  async function review(estimateId,action){
    if(mode==='cloud'){await request('/rest/v1/rpc/ops_review_estimate',{method:'POST',body:JSON.stringify({estimate:estimateId,action})});await changed();return;}
    const e=data.estimates.find(x=>x.id===estimateId),items=data.estimate_items.filter(x=>x.estimate_id===estimateId);
    if(action==='revise'){
      if(e.status==='draft')throw new Error('Already a draft.');
      const next=await save('estimates',{project_id:e.project_id,version:Math.max(...data.estimates.filter(x=>x.project_id===e.project_id).map(x=>x.version))+1,status:'draft',notes:e.notes,scope_confirmed:false});
      for(const item of items){const {_table,id:oldId,...fields}=item;await save('estimate_items',{...fields,estimate_id:next.id});}return;
    }
    const transitions={submit:['draft','internal_review'],inspector:['internal_review','final_review'],reviewer:['final_review','client_ready']};const [from,to]=transitions[action]||[];
    if(e.status!==from)throw new Error('This review step is not available.');
    const p=data.projects.find(x=>x.id===e.project_id),c=data.clients.find(x=>x.id===p?.client_id);
    if(action!=='revise'&&(!items.length||!c?.name||!p?.address||!e.scope_confirmed))throw new Error('Add scope items, client name, property address, and confirm the proposed scope.');
    if(action!=='revise')OpsDomain.total(items);
    await save('estimates',{...e,status:to});
  }
  async function publication(photo,approved){if(mode==='cloud'){await request('/rest/v1/rpc/ops_set_photo_approval',{method:'POST',body:JSON.stringify({photo:photo.id,approved})});await changed();}else await save('photos',{...photo,website_public:approved});}
  async function exportBackup(){if(mode!=='demo')throw new Error('This backup is for local demo records. Cloud records remain in Supabase.');const rows=await local(s=>s.getAll());const files={};for(const p of rows.filter(r=>r._table==='photos')){const blob=await local(s=>s.get(p.storage_path),'files');if(blob)files[p.storage_path]=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});}return {version:1,rows,files};}
  async function reorderPipeline(ids){
    if(mode==='cloud'){await request('/rest/v1/rpc/ops_reorder_pipeline',{method:'POST',body:JSON.stringify({ordered_ids:ids})});await changed();return;}
    if(mode!=='demo')throw new Error('Open a workspace first.');
    await local(store=>{const r=store.getAll();r.onsuccess=()=>{const rows=r.result.filter(x=>x._table==='pipeline_entries'&&x.status!=='complete');if(JSON.stringify(rows.map(x=>x.id).sort())!==JSON.stringify([...ids].sort())){store.transaction.abort();return;}ids.forEach((id,i)=>store.put({...rows.find(x=>x.id===id),position:i+1}));};});await changed();
  }
  // Local photo organization is one transaction; no remote schema or storage changes.
  async function organizePhotos(ids,patch){
    if(mode!=='demo')throw new Error('Gallery organization and Trash are available in the local demo only for now.');
    if(!ids.length||new Set(ids).size!==ids.length)throw new Error('Choose distinct photos.');
    const allowed=['name','caption','room','stage','gallery','albums','deleted_at'];
    await local(store=>{const r=store.getAll();r.onsuccess=()=>{const byId=new Map(r.result.filter(p=>p._table==='photos').map(p=>[p.id,p]));const rows=ids.map(id=>byId.get(id));if(rows.some(p=>!p)){store.transaction.abort();return;}rows.forEach((p,i)=>{const changes=typeof patch==='function'?patch(p,i):patch;if(Object.keys(changes).some(k=>!allowed.includes(k))){store.transaction.abort();return;}store.put({...p,...changes});});};});
    await changed();
  }
  async function ledgerTransaction(fn){if(mode!=='demo')throw new Error('Project ledger changes are local-only for now.');let failure;await local(store=>{const r=store.getAll();r.onsuccess=()=>{try{fn(store,r.result);}catch(e){failure=e;store.transaction.abort();}};}).catch(e=>{throw failure||e;});await changed();}
  function cents(n,signed=false){if(!Number.isSafeInteger(n)||Math.abs(n)>999999999999||(!signed&&n<0))throw new Error('Enter a valid amount.');return n;}
  function ledgerDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||!Number.isFinite(Date.parse(value))||new Date(value).toISOString().slice(0,10)!==value)throw new Error('Enter a valid date.');}
  async function appendProjectRecord(kind,record){
    const r={...record,id:crypto.randomUUID(),created_at:new Date().toISOString(),owner_id:'demo-owner'};
    await ledgerTransaction((store,all)=>{
      if(kind==='decision'){
        const change=all.find(c=>c._table==='change_orders'&&c.id===r.change_id);if(!change)throw new Error('Change order not found.');
        if(all.some(e=>e._table==='change_events'&&e.change_id===r.change_id))throw new Error('This change order already has a decision. Add a new change order for further changes.');
        if(!['approved','closed'].includes(r.decision))throw new Error('Invalid decision.');
        r.by=OpsDomain.required(r.by,'Approver');ledgerDate(r.date);r._table='change_events';
      }else{
        if(!all.some(p=>p._table==='projects'&&p.id===r.project_id))throw new Error('Project not found.');
        if(kind==='payment'){cents(r.amount_cents);if(!r.amount_cents)throw new Error('Payment must be greater than zero.');if(!['deposit','payment','final'].includes(r.kind))throw new Error('Choose a payment type.');ledgerDate(r.date);r.reference=OpsDomain.required(r.reference,'Reference');r._table='payments';}
        else if(kind==='change'){cents(r.amount_cents,true);if(!Number.isInteger(r.days_delta)||Math.abs(r.days_delta)>3650)throw new Error('Use whole workdays from -3650 to 3650.');r.title=OpsDomain.required(r.title,'Title');r.scope=OpsDomain.required(r.scope,'Scope');if(r.estimate_id&&!all.some(e=>e._table==='estimates'&&e.id===r.estimate_id&&e.project_id===r.project_id))throw new Error('Choose an estimate belonging to this project.');r._table='change_orders';}
        else throw new Error('Unknown ledger action.');
      }
      store.add(r);
    });return r;
  }
  async function projectBudget(projectId,fields){
    if(fields.project_total!==null)OpsDomain.money(fields.project_total);cents(fields.deposit_cents);
    if(fields.remaining_workdays!==null&&(!Number.isInteger(fields.remaining_workdays)||fields.remaining_workdays<0||fields.remaining_workdays>3650))throw new Error('Use whole workdays from 0 to 3650.');
    await ledgerTransaction((store,all)=>{const p=all.find(x=>x._table==='projects'&&x.id===projectId);if(!p)throw new Error('Project not found.');const old=all.find(x=>x._table==='pipeline_entries'&&x.project_id===projectId);store.put({...old,id:old?.id||crypto.randomUUID(),_table:'pipeline_entries',owner_id:'demo-owner',created_at:old?.created_at||new Date().toISOString(),project_id:projectId,position:old?.position??all.filter(x=>x._table==='pipeline_entries').length+1,status:old?.status||'queued',payments_received:old?.payments_received||0,next_action:old?.next_action||p.next_action||'Schedule project',not_before:old?.not_before||null,...fields});});
  }
  async function reorderProjects(ids){await ledgerTransaction((store,all)=>{const projects=all.filter(x=>x._table==='projects'&&!['complete','archived'].includes(x.status));if(ids.length!==new Set(ids).size||JSON.stringify(projects.map(p=>p.id).sort())!==JSON.stringify([...ids].sort()))throw new Error('Project list changed. Refresh and retry.');ids.forEach((id,i)=>{store.put({...projects.find(p=>p.id===id),queue_position:i+1});const e=all.find(x=>x._table==='pipeline_entries'&&x.project_id===id);if(e)store.put({...e,position:i+1});});});}
  // Bounded decode queue plus persisted thumbnail derivatives. Originals stay untouched.
  const thumbJobs=new Map(),thumbQueue=[];let thumbRunning=0;
  function pumpThumbs(){while(thumbRunning<3&&thumbQueue.length){thumbRunning++;const job=thumbQueue.shift();job().finally(()=>{thumbRunning--;pumpThumbs();});}}
  async function thumbnail(photo){
    if(mode!=='demo')return image(photo);
    const key=photo.storage_path+'/thumb-480-v1';
    if(!thumbJobs.has(key)){const task=new Promise((resolve,reject)=>{thumbQueue.push(async()=>{try{let blob=await local(s=>s.get(key),'files');if(!blob){const original=await local(s=>s.get(photo.storage_path),'files');if(!original)throw new Error('Original image is missing.');const bitmap=await createImageBitmap(original);try{const scale=Math.min(1,480/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);blob=await new Promise(r=>canvas.toBlob(r,'image/webp',.75));if(!blob)throw new Error('Could not create thumbnail.');await local(s=>s.put(blob,key),'files');}finally{bitmap.close();}}resolve(blob);}catch(e){reject(e);}});pumpThumbs();});thumbJobs.set(key,task);task.finally(()=>thumbJobs.delete(key)).catch(()=>{});}
    return URL.createObjectURL(await thumbJobs.get(key));
  }
  window.OpsStore={get mode(){return mode;},get user(){return session?.user;},get data(){return data;},on(fn){listeners.add(fn);return()=>listeners.delete(fn);},reload,save,upload,assignPhoto,image,thumbnail,review,publication,exportBackup,reorderPipeline,organizePhotos,appendProjectRecord,projectBudget,reorderProjects,
    async signIn(email,password){setSession(await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})},false));localStorage.setItem('tagims-ops-workspace','cloud');await reload();},
    async signOut(){try{if(session)await request('/auth/v1/logout',{method:'POST'});}finally{session=null;mode='signed-out';localStorage.removeItem('tagims-ops-workspace');sessionStorage.removeItem('tagims-ops-session');sessionStorage.removeItem('tagims-ops-demo');await reload();}},
    async demo(){session=null;localStorage.setItem('tagims-ops-workspace','demo');sessionStorage.removeItem('tagims-ops-session');sessionStorage.setItem('tagims-ops-demo','true');mode='demo';await reload();},
    async restore(){try{const s=JSON.parse(sessionStorage.getItem('tagims-ops-session'));if(localStorage.getItem('tagims-ops-workspace')==='demo')mode='demo';else if(s?.refresh_token){session=s;mode='cloud';}else if(sessionStorage.getItem('tagims-ops-demo')==='true')mode='demo';}catch{}await reload();},
    async contact(project){if(mode!=='cloud')return data.clients.find(c=>c.id===project.client_id);return (await request('/rest/v1/rpc/ops_project_contact',{method:'POST',body:JSON.stringify({project:project.id})}))?.[0];},
    async members(project,email,role){if(mode!=='cloud')throw new Error('Team access requires sign-in.');await request('/rest/v1/rpc/ops_assign_member',{method:'POST',body:JSON.stringify({project,email,member_role:role})});await changed();}
  };
  channel && (channel.onmessage=()=>{if(mode!=='signed-out')reload().catch(()=>{});});
})();
