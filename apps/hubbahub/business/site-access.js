/* Owner tools for the development website portals; never stores passwords. */
window.OpsSiteAccess={mount({projectId}={}){
 const S=OpsStore,el=document.createElement('section');el.className='ops-site-access';
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const owned=S.data.projects.filter(p=>p.owner_id===S.user?.id),projects=S.mode==='demo'?S.data.projects:owned;
 let chosen=projects.find(p=>p.id===projectId)?.id||projects[0]?.id,record={accounts:[],access:[],documents:[]},busy=false;
 const status=(message,error=false)=>{const out=el.querySelector('[data-access-status]');if(out){out.textContent=message;out.style.color=error?'#ffb6a5':'';}};
 function draw(){
  el.innerHTML=`<div class="ops-heading"><h2>Website Portals</h2></div><p>Share documents and manage Client Portal / Home Base access.</p><label>Project<select data-access-project>${projects.map(p=>`<option value="${esc(p.id)}" ${p.id===chosen?'selected':''}>${esc(p.name)}</option>`).join('')}</select></label><p data-access-status role="status"></p><div data-access-content></div>`;
  if(!chosen){status('Choose or create a project you own first.');return;}
  if(S.mode!=='cloud'){status('Sign in to the shared workspace to manage website accounts.');return;}
  el.querySelector('[data-access-content]').innerHTML=`<button type="button" data-access-refresh>Refresh</button><details open><summary>Project access</summary><p>Test username: last name + house number. Use a separate password.</p><form data-access-create><label>Name<input name="name" required maxlength="120"></label><label>Username<input name="username" required pattern="[a-z0-9][a-z0-9._-]{2,63}" maxlength="64" autocapitalize="none" autocomplete="off" placeholder="smith1234"></label><label>Portal<select name="role"><option value="client">Client Portal</option><option value="crew">Home Base</option></select></label><label>Initial password<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password"></label><button>Create account & assign</button></form><form data-access-assign><label>Existing account<select name="userId" required><option value="">Choose account</option>${record.accounts.map(a=>`<option value="${esc(a.user_id)}">${esc(a.display_name)} · ${esc(a.username)}</option>`).join('')}</select></label><label>Portal<select name="role"><option value="client">Client Portal</option><option value="crew">Home Base</option></select></label><button>Assign to project</button></form><form data-access-reset><label>Reset password for<select name="userId" required><option value="">Choose account</option>${record.accounts.map(a=>`<option value="${esc(a.user_id)}">${esc(a.display_name)}</option>`).join('')}</select></label><label>New password<input name="password" type="password" required minlength="12" maxlength="128" autocomplete="new-password"></label><button>Reset password</button></form><div>${record.access.map(a=>{const person=record.accounts.find(p=>p.user_id===a.user_id);return `<p>${esc(person?.display_name||'Account')} · ${a.role==='crew'?'Home Base':'Client Portal'} · ${a.active?'Active':'Disabled'} <button type="button" data-access-user="${esc(a.user_id)}" data-access-role="${esc(a.role)}" data-access-active="${!a.active}">${a.active?'Disable':'Enable'}</button></p>`;}).join('')}</div></details><details open><summary>Shared documents</summary><form data-access-upload><label>Document title<input name="title" required maxlength="160"></label><label>Visible to<select name="audience"><option value="client">Client Portal</option><option value="crew">Home Base</option><option value="both">Both</option></select></label><label>PDF · up to 10 MB<input name="file" type="file" accept="application/pdf,.pdf" required></label><button>Upload & share</button></form>${record.documents.map(d=>`<p>${esc(d.title)} · ${esc(d.audience)} · ${d.shared?'Shared':'Hidden'} <button type="button" data-access-document="${esc(d.id)}" data-access-shared="${!d.shared}">${d.shared?'Stop sharing':'Share'}</button></p>`).join('')||'<p>No documents shared yet.</p>'}</details>`;
 }
 async function reload(){if(!chosen||S.mode!=='cloud')return;try{record=await S.portalRequest({action:'manage',projectId:chosen});if(!el.isConnected)return;draw();}catch(error){status('Portal backend is not connected yet. '+error.message,true);}}
 el.addEventListener('change',event=>{if(event.target.matches('[data-access-project]')){chosen=event.target.value;record={accounts:[],access:[],documents:[]};draw();void reload();}});
 el.addEventListener('submit',async event=>{
  event.preventDefault();if(busy)return;const form=event.target,fields=new FormData(form);let body;
  if(form.matches('[data-access-create]'))body={action:'createAccount',name:fields.get('name'),username:fields.get('username'),password:fields.get('password'),role:fields.get('role')};
  else if(form.matches('[data-access-assign]'))body={action:'assign',userId:fields.get('userId'),role:fields.get('role'),active:true};
  else if(form.matches('[data-access-reset]'))body={action:'resetPassword',userId:fields.get('userId'),password:fields.get('password')};
  else if(form.matches('[data-access-upload]')){
   const file=fields.get('file');if(!file?.size||file.size>10485760){status('Choose a PDF of 10 MB or less.',true);return;}
   const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));body={action:'upload',title:fields.get('title'),audience:fields.get('audience'),pdf:btoa(binary)};
  }
  if(!body)return;busy=true;const button=form.querySelector('button');button.disabled=true;status('Saving…');
  try{await S.portalRequest({...body,projectId:chosen});form.reset();await reload();status(body.action==='upload'?'Shared. The website portal will update automatically.':'Account access saved.');}catch(error){status(error.message,true);}finally{if(body.password)body.password='';busy=false;button.disabled=false;}
 });
 el.addEventListener('click',async event=>{
  const b=event.target.closest('button');if(!b||busy)return;
  if(b.hasAttribute('data-access-refresh')){await reload();return;}
  let body;if(b.dataset.accessUser)body={action:'assign',userId:b.dataset.accessUser,role:b.dataset.accessRole,active:b.dataset.accessActive==='true'};
  if(b.dataset.accessDocument)body={action:'sharing',documentId:b.dataset.accessDocument,shared:b.dataset.accessShared==='true'};
  if(body){busy=true;b.disabled=true;try{await S.portalRequest({...body,projectId:chosen});await reload();status('Saved.');}catch(error){status(error.message,true);}finally{busy=false;b.disabled=false;}}
 });
 draw();queueMicrotask(()=>void reload());return el;
}};
