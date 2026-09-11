(() => {
  const tables=['clients','projects','project_members','walkthroughs','photos','estimates','estimate_items','field_items'];
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
      const results=await Promise.all(tables.map(async t=>{const all=[];for(let offset=0;;offset+=1000){const rows=await request(`/rest/v1/ops_${t}?select=*&order=${t==='project_members'?'project_id':'id'}&limit=1000&offset=${offset}`);all.push(...rows);if(rows.length<1000)break;}return [t,all];}));next=Object.fromEntries(results);
    }else next=Object.fromEntries(tables.map(t=>[t,[]]));
    if(run!==generation||mode!==startedMode||session?.user?.id!==startedUser)return;
    data=next;
    emit();
  }
  async function changed(){await reload();channel?.postMessage({type:'changed'});}
  async function save(table,record){valid(table);if(mode==='signed-out')throw new Error('Sign in or choose the local demo first.');
    if(mode==='demo'){const row={...record,id:record.id||crypto.randomUUID(),owner_id:record.owner_id||'demo-owner',created_at:record.created_at||new Date().toISOString(),_table:table};await local(s=>s.put(row));await changed();return row;}
    const r={...record};delete r._table;
    const rows=await request(`/rest/v1/ops_${table}${r.id?'?id=eq.'+id(r.id):''}`,{method:r.id?'PATCH':'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(r)});
    if(!rows?.length)throw new Error('No record was saved. Check your project permissions.');await changed();return rows[0];
  }
  async function upload(project,file){
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>20*1024*1024)throw new Error('Choose JPEG, PNG, or WebP up to 20 MB. Convert HEIC to JPEG first.');
    const photoId=crypto.randomUUID(),path=`${id(project)}/${photoId}/original`;
    if(mode==='demo'){await local(s=>s.put(file,path),'files');try{return await save('photos',{id:photoId,project_id:project,storage_path:path,name:file.name,stage:'unsorted',website_public:false});}catch(e){await local(s=>s.delete(path),'files');throw e;}}
    await request('/storage/v1/object/project-photos/'+path,{method:'POST',headers:{'Content-Type':file.type},body:file});
    try {const rows=await request('/rest/v1/ops_photos',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({id:photoId,project_id:project,storage_path:path,name:file.name,stage:'unsorted'})});await changed();return rows[0];}
    catch(e){try{await request('/storage/v1/object/project-photos',{method:'DELETE',body:JSON.stringify({prefixes:[path]})});}catch{}throw e;}
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
  window.OpsStore={get mode(){return mode;},get user(){return session?.user;},get data(){return data;},on(fn){listeners.add(fn);return()=>listeners.delete(fn);},reload,save,upload,image,review,publication,exportBackup,
    async signIn(email,password){setSession(await request('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})},false));await reload();},
    async signOut(){try{if(session)await request('/auth/v1/logout',{method:'POST'});}finally{session=null;mode='signed-out';sessionStorage.removeItem('tagims-ops-session');sessionStorage.removeItem('tagims-ops-demo');await reload();}},
    async demo(){session=null;sessionStorage.removeItem('tagims-ops-session');sessionStorage.setItem('tagims-ops-demo','true');mode='demo';await reload();},
    async restore(){try{const s=JSON.parse(sessionStorage.getItem('tagims-ops-session'));if(s?.refresh_token){session=s;mode='cloud';}else if(sessionStorage.getItem('tagims-ops-demo')==='true')mode='demo';}catch{}await reload();},
    async contact(project){if(mode!=='cloud')return data.clients.find(c=>c.id===project.client_id);return (await request('/rest/v1/rpc/ops_project_contact',{method:'POST',body:JSON.stringify({project:project.id})}))?.[0];},
    async members(project,email,role){if(mode!=='cloud')throw new Error('Team access requires sign-in.');await request('/rest/v1/rpc/ops_assign_member',{method:'POST',body:JSON.stringify({project,email,member_role:role})});await changed();}
  };
  channel && (channel.onmessage=()=>{if(mode!=='signed-out')reload().catch(()=>{});});
})();
