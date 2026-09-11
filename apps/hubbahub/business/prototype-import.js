// Adapter for the existing PHR Photo Management prototype's phr-photos-v1 backup.
// Import goes to the explicit local demo first; ownership and public permission must be reapproved before cloud migration.
window.OpsImportPrototype = async file => {
  if(OpsStore.mode!=='demo')throw new Error('Switch to the local demo before importing a prototype backup.');
  if(file.size>150*1024*1024)throw new Error('Backup exceeds the 150 MB prototype limit.');
  const data=JSON.parse(await file.text());
  if(data.format!=='phr-photos-v1'||!Array.isArray(data.projects)||!Array.isArray(data.photos))throw new Error('Choose a PHR Photo Management backup.');
  const projectIds=new Set(), photoIds=new Set(), records=[], files=[];
  const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
  for(const p of data.projects){
    if(!uuid(p.id)||typeof p.name!=='string'||projectIds.has(p.id))throw new Error('Invalid or duplicate project ID.');
    projectIds.add(p.id);const client=crypto.randomUUID();
    records.push({id:client,_table:'clients',owner_id:'demo-owner',name:'Contact pending — '+p.name});
    records.push({id:p.id,_table:'projects',owner_id:'demo-owner',client_id:client,name:p.name,address:'',status:'walkthrough',next_action:'Confirm client and property details',legacy_service:p.service,legacy_city:p.city,created_at:p.createdAt});
  }
  for(const p of data.photos){
    if(!uuid(p.id)||photoIds.has(p.id)||!projectIds.has(p.projectId)||!['unsorted','before','during','after'].includes(p.stage)||!/^data:image\/(jpeg|png|webp);base64,/.test(p.data))throw new Error('Invalid photo record.');
    photoIds.add(p.id);const raw=atob(p.data.split(',')[1]);if(raw.length>30*1024*1024)throw new Error('Photo exceeds original prototype limit.');
    const key=`${p.projectId}/${p.id}/original`;files.push([key,new Blob([Uint8Array.from(raw,c=>c.charCodeAt(0))],{type:p.data.slice(5,p.data.indexOf(';'))})]);
    records.push({id:p.id,_table:'photos',project_id:p.projectId,storage_path:key,name:p.name,stage:p.stage,website_public:false,legacy_visibility:p.visibility,created_at:p.createdAt});
  }
  const db=await new Promise((resolve,reject)=>{const r=indexedDB.open('tagims-operations-demo',1);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
  try {await new Promise((resolve,reject)=>{const tx=db.transaction(['rows','files'],'readwrite');const rows=tx.objectStore('rows');
    // add(), not put(): collision aborts the complete import without replacing existing work.
    for(const r of records)rows.add(r);for(const [key,blob] of files)tx.objectStore('files').add(blob,key);
    tx.oncomplete=resolve;tx.onabort=()=>reject(new Error('Import canceled: these project/photo IDs may already exist. Existing work was preserved.'));tx.onerror=()=>{};
  });}finally{db.close();}
  await OpsStore.reload();return {projects:data.projects.length,photos:data.photos.length};
};
