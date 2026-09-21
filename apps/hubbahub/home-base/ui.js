(function(root){
  'use strict';
  const S=root.OpsStore,mounts=new Set();
  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const label=value=>String(value||'').replaceAll('_',' ').replace(/\b\w/g,char=>char.toUpperCase());
  const date=value=>value?new Intl.DateTimeFormat('en-US',{weekday:'short',month:'short',day:'numeric'}).format(new Date(`${String(value).slice(0,10)}T12:00:00`)):'Not scheduled';
  const projectFor=(el,projects)=>projects.find(project=>project.id===el.dataset.projectId)||projects[0];
  function availableProjects(){
    const all=S.data.projects.filter(project=>!['archived','complete'].includes(project.status));
    if(S.mode!=='cloud'||!S.user?.id)return all;
    const assigned=S.data.project_members.filter(member=>member.user_id===S.user.id).map(member=>member.project_id);
    return assigned.length?all.filter(project=>assigned.includes(project.id)):all;
  }
  function latestEstimate(projectId){return S.data.estimates.filter(estimate=>estimate.project_id===projectId).sort((a,b)=>Number(b.version)-Number(a.version))[0];}
  function projectItems(projectId,kind){return S.data.field_items.filter(item=>item.project_id===projectId&&item.kind===kind);}
  function completion(items){return items.length?Math.round(items.filter(item=>item.status==='done').length/items.length*100):0;}
  function checklist(items,kind){
    if(!items.length)return `<p class="home-empty">No ${esc(kind)} items have been added yet.</p>`;
    return `<div class="home-checklist">${items.map(item=>`<label class="home-check"><input type="checkbox" data-home-complete="${esc(item.id)}" ${item.status==='done'?'checked':''}><span><strong>${esc(item.title)}</strong>${item.details?`<small>${esc(item.details)}</small>`:''}</span></label>`).join('')}</div>`;
  }
  function scheduleRows(projects){
    const rows=[];
    projects.forEach(project=>{
      if(project.next_action_due)rows.push({date:project.next_action_due,title:project.next_action||'Next project action',project:project.name});
      S.data.field_items.filter(item=>item.project_id===project.id&&item.due_date).forEach(item=>rows.push({date:item.due_date,title:item.title,project:project.name}));
    });
    rows.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    return rows.slice(0,6);
  }
  function section(id,title,body,open=true){return `<details class="fd-section home-section" id="home-${id}" data-home-section ${open?'open':''}><summary><h2>${esc(title)}</h2></summary><div class="fd-section-body">${body}</div></details>`;}
  function render(el){
    const projects=availableProjects();
    if(!projects.length){el.innerHTML=`<div class="home-root fd-root"><header class="home-header"><div><small>PCOLA HOME</small><h1>Home Base</h1></div></header><div class="home-scroll"><section class="fd-card"><h2>No assigned projects</h2><p>Your assigned jobs will appear here automatically.</p></section></div></div>`;return;}
    const project=projectFor(el,projects);el.dataset.projectId=project.id;
    const client=S.data.clients.find(client=>client.id===project.client_id),estimate=latestEstimate(project.id);
    const scope=estimate?S.data.estimate_items.filter(item=>item.estimate_id===estimate.id):[];
    const punch=projectItems(project.id,'punch'),materials=projectItems(project.id,'material'),supplies=projectItems(project.id,'supply'),tools=projectItems(project.id,'tool');
    const photos=S.data.photos.filter(photo=>photo.project_id===project.id&&!photo.deleted_at);
    const allTasks=[...punch,...materials,...supplies,...tools],progress=completion(allTasks);
    const schedule=scheduleRows(projects),maps=project.address?`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(project.address)}`:'';
    const overview=`<div class="home-hero"><div class="home-project"><small>Today at Home Base</small><h2>${esc(project.name)}</h2><p>${esc(client?.name||'Client pending')} · ${esc(project.address||'Address pending')}</p><div class="home-actions">${maps?`<a class="nf-btn nf-primary" href="${esc(maps)}" target="_blank" rel="noopener">Navigate</a>`:''}${client?.phone?`<a class="nf-btn" href="tel:${esc(client.phone.replace(/[^+\d]/g,''))}">Call client</a>`:''}<button class="nf-btn" type="button" data-home-action="photos">Add photos</button></div></div><div class="home-progress"><strong>${progress}%</strong><span>Job prep</span><div aria-label="${progress}% of project checklist complete"><i style="width:${progress}%"></i></div></div></div><div class="home-stats"><article><small>Next step</small><strong>${esc(project.next_action||'Not set')}</strong><span>${esc(date(project.next_action_due))}</span></article><article><small>Scope</small><strong>${scope.length} item${scope.length===1?'':'s'}</strong><span>Inherited from estimate v${esc(estimate?.version||'—')}</span></article><article><small>Project photos</small><strong>${photos.length}</strong><span>Private job record</span></article></div>`;
    const scheduleBody=schedule.length?`<div class="home-schedule">${schedule.map(row=>`<article><time>${esc(date(row.date))}</time><div><strong>${esc(row.title)}</strong><small>${esc(row.project)}</small></div></article>`).join('')}</div>`:'<p class="home-empty">No project dates are scheduled yet.</p>';
    const scopeBody=scope.length?`<p class="home-note">Scope comes directly from the latest estimate. Pricing is intentionally excluded.</p><ol class="home-scope">${scope.map(item=>`<li><strong>${esc(item.description)}</strong>${item.quantity!=null?`<small>${esc(item.quantity)} ${esc(item.unit||'')}</small>`:''}</li>`).join('')}</ol>`:'<p class="home-empty">The approved estimate scope will appear here without prices.</p>';
    const jobPack=`<div class="home-grid"><article class="home-panel"><header><div><small>Do</small><h3>Punch List</h3></div><span>${punch.filter(x=>x.status==='done').length}/${punch.length}</span></header>${checklist(punch,'punch-list')}</article><article class="home-panel"><header><div><small>Load</small><h3>Materials & Supplies</h3></div><span>${[...materials,...supplies].filter(x=>x.status==='done').length}/${materials.length+supplies.length}</span></header>${checklist([...materials,...supplies],'material')}</article></div>`;
    const toolbox=`<div class="home-panel home-toolbox"><header><div><small>Load for this job</small><h3>Toolbox</h3></div><span>${tools.filter(x=>x.status==='done').length}/${tools.length}</span></header>${checklist(tools,'tool')}<div class="home-coming"><strong>Tool custody</strong><span>Named checkout and return history will activate with the shared Home Base records.</span></div></div>`;
    const timeRequests=`<div class="home-grid home-connections"><article class="home-panel"><small>TIME</small><h3>Timesheet</h3><p>Clock in to the selected project and review today’s hours.</p><button class="nf-btn nf-primary" type="button" disabled>Clock in · connection pending</button></article><article class="home-panel"><small>EXPENSES</small><h3>Receipts & Reimbursements</h3><p>Upload a purchase receipt or request repayment for an out-of-pocket expense.</p><button class="nf-btn" type="button" disabled>New request · connection pending</button></article><article class="home-panel"><small>FIELD CHANGE</small><h3>Change Request</h3><p>Document added work for office review before it becomes an approved change order.</p><button class="nf-btn" type="button" disabled>Request change · connection pending</button></article></div>`;
    const nav=[['Overview','overview'],['Schedule','schedule'],['Scope','scope'],['Job Pack','job-pack'],['Toolbox','toolbox'],['Time & Requests','requests']];
    el.innerHTML=`<div class="home-root fd-root"><header class="home-header"><div><small>PCOLA HOME</small><h1>Home Base</h1></div><label><span>Assigned project</span><select data-home-project>${projects.map(item=>`<option value="${esc(item.id)}" ${item.id===project.id?'selected':''}>${esc(item.name)}</option>`).join('')}</select></label></header><nav class="fd-nav home-nav" aria-label="Home Base sections"><div class="fd-nav-links">${nav.map(([name,id])=>`<a href="#home-${id}" data-home-jump="${id}">${name}</a>`).join('')}</div><button type="button" class="fd-expand-all" data-home-action="toggle" aria-label="Collapse all sections" title="Collapse all sections"><span class="fd-menu-icon" aria-hidden="true"></span></button></nav><div class="home-scroll">${section('overview','Overview',overview)}${section('schedule','Schedule',scheduleBody)}${section('scope','Scope of Work',scopeBody)}${section('job-pack','Job Pack',jobPack)}${section('toolbox','Toolbox',toolbox)}${section('requests','Time & Requests',timeRequests)}<p class="home-status" data-home-status role="status">Home Base is connected to Business Center project records.</p></div></div>`;
  }
  function mount(options={}){
    const el=document.createElement('div');el.className='home-base-host hub-data-widget';if(options.projectId)el.dataset.projectId=options.projectId;mounts.add(el);
    el.onchange=async event=>{try{if(event.target.matches('[data-home-project]')){el.dataset.projectId=event.target.value;render(el);}if(event.target.matches('[data-home-complete]')){const item=S.data.field_items.find(item=>item.id===event.target.dataset.homeComplete);if(item)await S.save('field_items',{...item,status:event.target.checked?'done':'open'});}}catch(error){const status=el.querySelector('[data-home-status]');if(status)status.textContent=error.message;render(el);}};
    el.onclick=event=>{const jump=event.target.closest('[data-home-jump]');if(jump){event.preventDefault();const target=el.querySelector(`#home-${jump.dataset.homeJump}`),scroll=el.querySelector('.home-scroll');if(target&&scroll){target.open=true;scroll.scrollTo({top:scroll.scrollTop+target.getBoundingClientRect().top-scroll.getBoundingClientRect().top-12,behavior:'smooth'});}return;}const action=event.target.closest('[data-home-action]')?.dataset.homeAction;if(action==='photos')root.OpsPopOut?.('opsUpload');if(action==='toggle'){const sections=[...el.querySelectorAll('[data-home-section]')],expand=sections.some(section=>!section.open);sections.forEach(section=>section.open=expand);}};
    render(el);return el;
  }
  S.on(()=>{for(const el of mounts)el.isConnected?render(el):mounts.delete(el);});
  root.HomeBase={mount,render};
})(globalThis);
