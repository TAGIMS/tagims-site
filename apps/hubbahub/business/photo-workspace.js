/* Shared, keyed photo surfaces. Originals are never duplicated for albums. */
window.OpsPhotoWorkspace=({S,esc,dialog,input,options,button,status,projectId})=>{
  const surfaces=new Set();
  const act=(text,key)=>`<button type="button" data-photo-command="${key}">${text}</button>`;
  const active=()=>S.data.photos.filter(p=>!p.deleted_at);
  function visible(el){
    const q=el._photoState;let photos=S.data.photos.filter(p=>q.filter==='trash'?!!p.deleted_at:!p.deleted_at);
    if(q.filter!=='trash'){
      if(el.dataset.opsType==='opsPhotos')photos=photos.filter(p=>!p.project_id&&!p.albums?.length&&!p.gallery);
      if(el.dataset.opsType==='opsGallery')photos=photos.filter(p=>!!p.gallery&&!p.project_id&&!p.albums?.length);
      if(el.dataset.opsType==='opsAlbums')photos=photos.filter(p=>p.project_id||p.albums?.length);
      if(q.filter==='projects')photos=photos.filter(p=>!!p.project_id);
      if(q.filter==='other')photos=photos.filter(p=>!p.project_id&&p.albums?.length);
      if(el.dataset.opsType==='opsPublish')photos=photos.filter(p=>p.project_id===projectId()&&p.website_public);
      if(q.filter.startsWith('project:'))photos=photos.filter(p=>p.project_id===q.filter.slice(8));
      if(q.filter.startsWith('album:'))photos=photos.filter(p=>!p.project_id&&(p.albums||[]).includes(q.filter.slice(6)));
    }
    const search=q.search.toLowerCase();photos=photos.filter(p=>[p.name,p.caption,p.room,S.data.projects.find(x=>x.id===p.project_id)?.name,...(p.albums||[])].join(' ').toLowerCase().includes(search));
    return photos.sort((a,b)=>q.sort==='name'?String(a.name).localeCompare(String(b.name)):q.sort==='oldest'?String(a.created_at).localeCompare(String(b.created_at)):String(b.created_at).localeCompare(String(a.created_at)));
  }
  function updateAll(){for(const el of surfaces)if(el.isConnected)render(el);else dispose(el);}
  function dispose(el){el?._photoObserver?.disconnect();el?._photoCards?.forEach(card=>{if(card._url?.startsWith('blob:'))URL.revokeObjectURL(card._url);});surfaces.delete(el);if(el)el._photoCards=null;}
  function render(el){
    surfaces.add(el);
    if(!el._photoCards){
      el._photoState={filter:el.dataset.opsType==='opsTrash'?'trash':'all',search:'',sort:'newest',page:0,selection:new Set()};el._photoCards=new Map();
      const gallery=el.dataset.opsType==='opsGallery',publish=el.dataset.opsType==='opsPublish';
      el.innerHTML=`<div class="ops-heading"><h2>${gallery?'Photo Gallery':publish?'Publish':'Photo Inbox'}</h2><span data-photo-count></span></div><h3 class="ops-section-title">${gallery?'Explore your library':'Organize photos'}</h3><div class="ops-photo-filters"></div><div class="ops-gallery-tools"><label class="ops-search">Search photos<input type="search" data-photo-search placeholder="Name, room, project…"></label><label>Sort<select data-photo-sort><option value="newest">Newest added</option><option value="oldest">Oldest added</option><option value="name">Name A–Z</option></select></label></div>${publish?button('Export website gallery','exportGallery')+'<p class="ops-muted">Only approved photos export. Revocation does not remove copies already published elsewhere.</p>':''}<div class="ops-bulk-bar"></div><label class="ops-thumbnail-control"><span>Thumbnail size</span><input type="range" min="80" max="320" step="10" data-thumbnail-size aria-label="Thumbnail size"><output data-thumbnail-value></output></label><div class="ops-photo-grid"></div><p data-photo-empty class="ops-empty" hidden>No photos here yet.</p>`;
      if(el.dataset.opsType==='opsPhotos'){el.querySelector('.ops-heading').insertAdjacentHTML('beforeend',button('＋ Add photos','launchWidget','opsUpload'));}
      const title={opsPhotos:'Photo Inbox',opsGallery:'Photo Gallery',opsAlbums:'Albums',opsTrash:'Trash',opsPublish:'Publish'}[el.dataset.opsType];el.querySelector('.ops-heading h2').textContent=title;
      el.querySelector('.ops-section-title').textContent={opsPhotos:'Incoming photos',opsGallery:'Unsorted photos',opsAlbums:'Sorted photos',opsTrash:'Restore deleted photos',opsPublish:'Website-approved photos'}[el.dataset.opsType];
      if(!el._photoBound){el._photoBound=true;
      el.addEventListener('toggle',ev=>{const menu=ev.target;if(!menu.matches('.ops-photo-settings')||!menu.open)return;const panel=menu.querySelector('.ops-photo-settings-panel');panel.style.transform='';const bounds=panel.getBoundingClientRect(),area=el.getBoundingClientRect();const shift=Math.max(area.left+8-bounds.left,Math.min(0,area.right-8-bounds.right));panel.style.transform=`translateX(${shift}px)`;},true);
      el.addEventListener('input',ev=>{if(ev.target.matches('[data-photo-search]')){el._photoState.search=ev.target.value;el._photoState.page=0;render(el);}});
      el.addEventListener('change',ev=>{const t=ev.target,q=el._photoState;if(t.matches('[data-photo-sort]')){q.sort=t.value;q.page=0;render(el);}if(t.matches('[data-pick-photo]')){t.checked?q.selection.add(t.dataset.pickPhoto):q.selection.delete(t.dataset.pickPhoto);updateSelection(el);}if(t.matches('[data-pick-all]')){visible(el).forEach(p=>t.checked?q.selection.add(p.id):q.selection.delete(p.id));updateSelection(el);}});
      el.addEventListener('click',ev=>{const page=ev.target.closest('[data-photo-page]');if(page){el._photoState.page+=Number(page.dataset.photoPage);render(el);el.scrollTop=0;return;}const f=ev.target.closest('[data-photo-filter]');if(f){el._photoState.page=0;el._photoState.filter=f.dataset.photoFilter;el._photoState.selection.clear();render(el);return;}const b=ev.target.closest('[data-photo-command]');if(b)command(el,b.dataset.photoCommand,b.closest('[data-photo-id]')?.dataset.photoId).catch(e=>status(e.message,true));});
      }
    }
    const q=el._photoState,photos=visible(el),allIds=new Set(photos.map(p=>p.id));
    q.page=Math.min(q.page||0,Math.max(0,Math.ceil(photos.length/72)-1));const pagePhotos=photos.slice(q.page*72,(q.page+1)*72),ids=new Set(pagePhotos.map(p=>p.id));
    q.selection.forEach(id=>{if(!allIds.has(id))q.selection.delete(id);});
    const albums=el.dataset.opsType==='opsAlbums',trash=el.dataset.opsType==='opsTrash';
    const filters=trash?[['trash','Trash']]:albums?[['all','All sorted photos'],['projects','Project albums'],['other','Other albums'],...S.data.projects.filter(p=>active().some(x=>x.project_id===p.id)).map(p=>['project:'+p.id,'Project · '+p.name]),...[...new Set(active().filter(p=>!p.project_id).flatMap(p=>p.albums||[]))].sort().map(a=>['album:'+a,'Album · '+a])]:[['all',el.dataset.opsType==='opsGallery'?'All unsorted photos':el.dataset.opsType==='opsPublish'?'Approved photos':'Inbox']];
    if(!filters.some(([v])=>v===q.filter)){q.filter='all';return render(el);}
    el.querySelector('.ops-photo-filters').innerHTML=filters.map(([v,l])=>`<button type="button" data-photo-filter="${esc(v)}" aria-pressed="${q.filter===v}">${esc(l)}</button>`).join('');
    const grid=el.querySelector('.ops-photo-grid');
    for(const [id,card] of el._photoCards){if(!ids.has(id)){el._photoObserver?.unobserve(card);card.remove();if(card._url?.startsWith('blob:'))URL.revokeObjectURL(card._url);el._photoCards.delete(id);}}
    pagePhotos.forEach((p,index)=>{
      let card=el._photoCards.get(p.id);
      if(!card){card=document.createElement('article');card.className='ops-gallery-card';card.dataset.photoId=p.id;card.innerHTML=`<label class="ops-check ops-photo-select"><input type="checkbox" data-pick-photo="${p.id}"></label><button type="button" class="ops-photo-preview" data-photo-command="preview"><img loading="lazy"></button><details class="ops-photo-settings"><summary title="Photo settings" aria-label="Photo settings">⋯</summary><div class="ops-photo-settings-panel"></div></details><div class="ops-photo-caption"><strong></strong><small></small></div>`;el._photoCards.set(p.id,card);
        card._loadPhoto=()=>S.thumbnail(p).then(url=>{if(el._photoCards?.get(p.id)!==card){if(url.startsWith('blob:'))URL.revokeObjectURL(url);return;}card._url=url;card.querySelector('img').src=url;}).catch(e=>{card.querySelector('img').alt='Image unavailable';status(e.message,true);});
        el._photoObserver??=new IntersectionObserver(entries=>{for(const item of entries)if(item.isIntersecting){el._photoObserver.unobserve(item.target);item.target._loadPhoto?.();}},{root:el,rootMargin:'160px'});
        el._photoObserver.observe(card);
      }
      if(grid.children[index]!==card)grid.insertBefore(card,grid.children[index]||null);
      card.querySelector('img').alt=p.caption||p.name||'Photo';card.querySelector('[data-pick-photo]').setAttribute('aria-label','Select '+(p.name||'photo'));
      card.querySelector('.ops-photo-caption strong').textContent=p.name||'Untitled photo';card.querySelector('.ops-photo-caption strong').title=p.name||'';
      card.querySelector('.ops-photo-caption small').textContent=[p.room,S.data.projects.find(x=>x.id===p.project_id)?.name,p.stage!=='unsorted'?p.stage:''].filter(Boolean).join(' · ')||'Unassigned';
      const menu=p.deleted_at?act('↶ Restore','restore'):act('✎ Rename','rename')+act('Edit details','edit')+(el.dataset.opsType==='opsPhotos'?act('▧ Move to Photo Gallery','gallery'):'')+act('▱ Add to album','album')+(!p.project_id?act('↗ Assign to project','assign'):'')+(p.project_id?button(p.website_public?'Revoke approval':'Approve for website','approvePhoto',p.id):'')+act('⌫ Move to Trash','delete');
      const panel=card.querySelector('.ops-photo-settings-panel');if(el.dataset.opsType==='opsGallery')card.querySelector('.ops-photo-settings')?.remove();else if(panel&&panel.innerHTML!==menu)panel.innerHTML=menu;
    });
    let paging=el.querySelector('.ops-photo-paging');if(!paging){paging=document.createElement('nav');paging.className='ops-photo-paging';paging.setAttribute('aria-label','Photo pages');grid.after(paging);}
    paging.hidden=photos.length<=72;paging.innerHTML=`<button type="button" data-photo-page="-1" ${q.page===0?'disabled':''}>← Previous</button><span>${q.page+1} / ${Math.max(1,Math.ceil(photos.length/72))}</span><button type="button" data-photo-page="1" ${(q.page+1)*72>=photos.length?'disabled':''}>Next →</button>`;
    el.querySelector('[data-photo-count]').textContent=`${photos.length} photo${photos.length===1?'':'s'}`;el.querySelector('[data-photo-empty]').hidden=photos.length>0;
    const size=parseInt(document.documentElement.style.getPropertyValue('--ops-thumbnail-size'))||160;el.querySelector('[data-thumbnail-size]').value=size;el.querySelector('[data-thumbnail-value]').textContent=size+'px';updateSelection(el);
  }
  function updateSelection(el){const q=el._photoState,photos=visible(el),n=q.selection.size;
    el._photoCards.forEach((card,id)=>{card.classList.toggle('ops-photo-selected',q.selection.has(id));card.querySelector('[data-pick-photo]').checked=q.selection.has(id);});
    el.querySelector('.ops-bulk-bar').innerHTML=`<label class="ops-check"><input type="checkbox" data-pick-all ${photos.length&&n===photos.length?'checked':''} ${!photos.length?'disabled':''}> Select all matching</label><span>${n?n+' selected':''}</span>${n?(q.filter==='trash'?act('↶ Restore','restore'):el.dataset.opsType==='opsGallery'?act('▱ Add to album','album'):act('✎ Rename','rename')+act('Edit','edit')+(el.dataset.opsType==='opsPhotos'?act('▧ Move to Photo Gallery','gallery'):'')+act('▱ Album','album')+(photos.filter(p=>q.selection.has(p.id)).every(p=>!p.project_id)?act('↗ Assign','assign'):'')+act('⌫ Delete','delete'))+act('Clear','clear'):''}`;
    el.querySelector('[data-pick-all]').indeterminate=n>0&&n<photos.length;
  }
  async function command(el,key,id){
    if(el.dataset.opsType==='opsGallery'&&!['clear','preview','album'].includes(key))return;
    const q=el._photoState,ids=id?[id]:[...q.selection],photos=ids.map(id=>S.data.photos.find(p=>p.id===id)).filter(Boolean);
    if(key==='clear'){q.selection.clear();updateSelection(el);return;}if(key==='preview'){lightbox(el,id);return;}
    if(!photos.length)return;
    if(key==='assign'){dialog(`Assign ${photos.length} photo(s)`,`<p>These originals will become accessible to the chosen project’s team. Website approval will not change.</p><label>Project<select name="project" required><option value="">Choose project</option>${options(S.data.projects.map(p=>[p.id,p.name]))}</select></label>`,async f=>{const failed=[];for(const p of photos){try{await S.assignPhoto(p.id,f.project);q.selection.delete(p.id);}catch(e){failed.push(e.message);}}updateAll();if(failed.length)throw new Error(failed.join('; '));},'Confirm assignment');return;}
    if(S.mode!=='demo'&&['gallery','album','delete','restore'].includes(key))throw new Error('This new feature is local-demo only until cloud integration is ready.');
    const apply=async patch=>{await S.organizePhotos(ids,patch);q.selection.clear();updateAll();};
    if(key==='delete'){dialog(`Move ${photos.length} photo(s) to Trash?`,'<p>Removed from Inbox, Photo Gallery, and project photo views. Originals stay in local Trash and can be restored. Previously exported website copies are not removed.</p>',()=>apply({deleted_at:new Date().toISOString()}),'Move to Trash');return;}
    if(key==='restore'){await apply({deleted_at:null});status('Photos restored.');return;}
    if(key==='gallery'){await apply({gallery:true});status('Added to Photo Gallery. No originals duplicated.');return;}
    if(key==='album'){dialog('Add to album',input('album','Album name','','text',true)+'<p>Use an existing name or create a new album. Photos can belong to multiple albums.</p>',f=>{const name=f.album.trim();if(!name)throw new Error('Enter an album name.');return apply(p=>({gallery:true,albums:[...new Set([...(p.albums||[]),name])]}));});return;}
    if(key==='rename'){dialog(photos.length===1?'Rename photo':`Rename ${photos.length} photos`,input('name',photos.length===1?'Photo name':'Shared name',photos.length===1?photos[0].name:'','text',true)+(photos.length>1?'<p>Numbering follows the current selection: Name 01, Name 02… Original file extensions are preserved.</p>':''),async f=>{const base=f.name.trim();if(!base)throw new Error('Enter a name.');const patch=(p,i)=>({name:photos.length===1?base:base+' '+String(i+1).padStart(2,'0')+(p.name?.match(/\.[a-z0-9]{2,5}$/i)?.[0]||'')});if(S.mode==='demo')await apply(patch);else for(let i=0;i<photos.length;i++)await S.save('photos',{...photos[i],...patch(photos[i],i)});});return;}
    if(key==='edit'){dialog(`Edit ${photos.length} photo(s)`,`<label>Stage<select name="stage"><option value="">Keep current</option>${options(['unsorted','before','during','after'].map(s=>[s,s]))}</select></label><label class="ops-check"><input type="checkbox" name="set_room"> Replace room</label>${input('room','Room / work area')}<label class="ops-check"><input type="checkbox" name="set_caption"> Replace caption</label>${input('caption','Caption')}`,async f=>{const patch={...(f.stage?{stage:f.stage}:{}),...(f.set_room?{room:f.room}:{}),...(f.set_caption?{caption:f.caption}:{})};if(!Object.keys(patch).length)throw new Error('Choose a field to edit.');if(S.mode==='demo')await apply(patch);else for(const p of photos)await S.save('photos',{...p,...patch});});}
  }
  function lightbox(el,id){
    const photos=visible(el);let index=Math.max(0,photos.findIndex(p=>p.id===id)),timer=null,url=null,run=0;
    const box=document.createElement('dialog');box.className='ops-dialog ops-lightbox';box.innerHTML='<header><strong></strong><button type="button" data-close aria-label="Close preview">✕</button></header><div class="ops-lightbox-stage"><img alt=""></div><footer><button type="button" data-prev>← Previous</button><button type="button" data-play>▶ Slideshow</button><button type="button" data-next>Next →</button></footer><p></p>';document.body.append(box);
    async function show(){const seq=++run,p=photos[index];box.querySelector('strong').textContent=p.name||'Photo';box.querySelector('p').textContent=`${index+1} / ${photos.length} · ${p.caption||p.room||''}`;try{const next=await S.image(p);if(seq!==run||!box.isConnected){if(next.startsWith('blob:'))URL.revokeObjectURL(next);return;}if(url?.startsWith('blob:'))URL.revokeObjectURL(url);url=next;box.querySelector('img').src=url;box.querySelector('img').alt=p.caption||p.name||'Photo';}catch(e){box.querySelector('p').textContent=e.message;}}
    const move=delta=>{index=(index+delta+photos.length)%photos.length;show();};
    box.querySelector('[data-close]').onclick=()=>box.close();box.querySelector('[data-prev]').onclick=()=>move(-1);box.querySelector('[data-next]').onclick=()=>move(1);
    box.querySelector('[data-play]').onclick=e=>{if(timer){clearInterval(timer);timer=null;e.target.textContent='▶ Slideshow';}else{timer=setInterval(()=>move(1),4000);e.target.textContent='Ⅱ Pause';}};
    box.onkeydown=e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}};
    box.onclose=()=>{run++;clearInterval(timer);if(url?.startsWith('blob:'))URL.revokeObjectURL(url);box.remove();};box.showModal();show();
  }
  return {render,dispose};
};
