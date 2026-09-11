(() => {
  const page = location.pathname.split('/')[2] || 'apps';
  window.OpsPage = page;
  const prefix = `tagims:hub:${page}:v1:`;
  const storage = window.localStorage;
  window.OpsLayoutStorage = {
    get length(){return Object.keys(storage).filter(k=>k.startsWith(prefix)).length;},
    key(i){return Object.keys(storage).filter(k=>k.startsWith(prefix))[i]?.slice(prefix.length) ?? null;},
    getItem(k){return storage.getItem(prefix+k);}, setItem(k,v){storage.setItem(prefix+k,v);}, removeItem(k){storage.removeItem(prefix+k);}
  };
  const s=window.OpsLayoutStorage;
  const presets={apps:['opsApps'],crm:['opsProjects','opsContact','opsNotes','opsField'],'photo-center':['opsProjects','opsUpload','opsPhotos','opsPublish'],estimates:['opsProjects','opsNotes','opsEstimate','opsReview']};
  if(s.getItem('hub-widget-ids')===null){
    const types=presets[page]||presets.apps;
    s.setItem('hub-widget-ids',JSON.stringify(types.map((_,i)=>'widget'+(i+1))));
    s.setItem('hub-background-mode','color');s.setItem('hub-bg-color','#111724');
    s.setItem('hub-background-style','solid');s.setItem('hub-arrangement-mode','freeform');
    const cols=innerWidth>=1000?2:1, width=Math.min(620, Math.floor((innerWidth-64)/cols)-16), height=Math.min(440,innerHeight-160);
    types.forEach((t,i)=>{
      const id='widget'+(i+1);s.setItem(`hub-widget-content-${id}`,t);s.setItem(`hub-widget-setting-${id}-title`,window.OpsWidgets.labels[t]);
      s.setItem(`hub-widget-setting-${id}-show-header`,'true');
      for(const profile of ['desktop','ultrawide','tablet','mobile']) for(const [prop,val] of Object.entries({width,height,x:cols===1?0:(i%2===0?-1:1)*(width+20)/2,y:types.length===1?0:(Math.floor(i/cols)*(height+20) + 130 + height/2 - innerHeight/2)})) s.setItem(`hub-layout-${profile}-${id}---widget-${prop}`,String(val));
    });
  }
  const library=document.querySelector('.widget-library');
  if(library) for(const [type,label] of Object.entries(window.OpsWidgets.labels)){
    const b=document.createElement('button');b.type='button';b.className='widget-library-item';b.dataset.contentType=type;b.title=label;
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 9v12"/></svg><span></span>';b.querySelector('span').textContent=label;library.append(b);
  }
  const nav=document.createElement('nav');nav.className='ops-navigation';nav.setAttribute('aria-label','Apps');
  for(const [href,label] of [['/apps/','Apps'],['/apps/photo-center/','Photo Center'],['/apps/estimates/','Estimates'],['/apps/crm/','CRM']]){const a=document.createElement('a');a.href=href;a.textContent=label;if(href===`/apps/${page==='apps'?'':page+'/'}`)a.setAttribute('aria-current','page');nav.append(a);}
  const status=document.createElement('button');status.id='ops-account';status.textContent='Sign in';status.onclick=()=>window.OpsWidgets.account();nav.append(status);document.body.append(nav);
  const note=document.createElement('div');note.id='ops-status';note.className='ops-status';note.setAttribute('role','status');document.body.append(note);
  window.OpsWidgets.start();
})();
