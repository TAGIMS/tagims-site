// Owner view of canonical Business Center records. No mirrored client/project store.
document.addEventListener('toggle',event=>{
  const root=event.target.closest?.('.pp-root');
  if(!root||!event.target.matches('details'))return;
  const control=root.querySelector('.pp-expand-all');
  if(!control)return;
  const expand=![...root.querySelectorAll('.pp-section')].some(section=>section.open);
  control.dataset.expand=String(expand);
  control.title=control.ariaLabel=expand?'Expand all sections':'Collapse all sections';
},true);
window.OpsProjectPortal=({S,D,esc,button,ledger,disclosure,notesView,fieldRows})=>{
  function render(p,focus='overview'){
    const c=S.data.clients.find(c=>c.id===p.client_id),e=OpsWorkflow.latest(S.data,p.id);
    const stages=['lead','walkthrough','estimating','review','active','complete'],index=Math.max(0,stages.indexOf(p.status)),percent=index/(stages.length-1)*100;
    const section=(id,title,body)=>`<details class="ops-work-section pp-section" data-section-key="${esc(p.id)}-${id}" data-pp-section="${id}" open><summary>${title}</summary><div class="ops-section-content">${body}</div></details>`;
    const estimates=S.data.estimates.filter(x=>x.project_id===p.id).sort((a,b)=>b.version-a.version);
    const estimateRows=estimates.map(x=>`<article class="pp-row"><div><strong>Estimate v${esc(x.version)}</strong><small>${esc(x.status.replaceAll('_',' '))}</small></div>${button(x.status==='draft'?'Continue estimate':'Review estimate','portalTool',(x.status==='draft'?'opsEstimate':'opsReview')+':'+p.id)}</article>`).join('');
    const duration=OpsWorkflow.duration(e?.notes),totals=ledger.totals(p.id);
    const estimateBody=`<p><strong>Estimated project timeline:</strong> ${esc(duration?.label||'Add duration in the estimate')}</p>`+estimateRows+(!e?button('Create estimate','newEstimate'):'')+'<div class="pp-editor" data-portal-editor="estimate"></div>';
    const checks=(window.GetHubProjectChecks?.(p.id)||[]).map(row=>`<article class="pp-row"><div><strong>${esc(row.milestone||'Expected check')}</strong><small>${esc(row.date||'Date not set')} · ${esc(row.status||'Status not set')}</small></div><strong>${row.amount===''?'Amount not set':D.display(Math.round(Number(row.amount||0)*100))}</strong></article>`).join('');
    const payments=S.data.payments.filter(x=>x.project_id===p.id);
    const paymentRows=payments.map(x=>`<article class="pp-row"><div><strong>${D.display(x.amount_cents)}</strong><small>${esc(x.date)} · ${esc(x.kind||'Payment')}</small></div><span>${esc(x.reference||'')}</span></article>`).join('');
    const receiptRows=payments.map(x=>disclosure(p.id+'-receipt-'+x.id,'Payment receipt · '+D.display(x.amount_cents)+' · '+x.date,`<p>${esc(c?.name||'Client')} · ${esc(p.name)}</p><p>${esc(x.kind||'Payment')} · ${esc(x.reference||'')}</p><small>Payment ID: ${esc(x.id)}</small><p class="ops-muted">Local payment record · not issued or sent to the client.</p>`)).join('');
    const notes=button('Add project note','newNote')+notesView([p])+disclosure(p.id+'-plan','Selections & work plan',fieldRows(S.data.field_items.filter(x=>x.project_id===p.id))+button('Add work item','field'),true)+'<div class="pp-editor" data-portal-editor="notes"></div>';
    const photos=S.data.photos.filter(x=>x.project_id===p.id&&!x.deleted_at);
    const estimateNumber=e?.estimate_number||e?.number;
    const projectDetails=`<header class="pp-header">
        <div class="pp-title"><div class="pp-controls"><label>Project<select data-portal-canonical-project>${S.data.projects.map(x=>`<option value="${esc(x.id)}" ${x.id===p.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select></label>${button('All projects','projectDirectory')}</div></div>
        <aside class="pp-client-info" aria-label="Client information"><strong>${esc(c?.name||'Client name not set')}</strong><span>${esc(p.name)}</span>${e?`<span>${estimateNumber?'Estimate #'+esc(estimateNumber):'Estimate v'+esc(e.version)}</span>`:''}<div class="pp-contact"><span>${esc(c?.phone||'Phone not set')}</span><span>${esc(c?.email||'Email not set')}</span><span>${esc(p.address||c?.address||'Address not set')}</span></div><details class="pp-client-actions"><summary>Edit project details</summary>${button('Edit project & client','contact')}${button('Manage crew access','team')}</details></aside>
      </header>
      <div class="pp-progress" role="progressbar" aria-label="Project stage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}" aria-valuetext="${esc(p.status)}"><ol class="pp-phase-rail" style="--pp-progress:${percent};--pp-stages:${stages.length}">${stages.map((s,i)=>`<li class="${i<index?'is-complete':i===index?'is-current':''}" ${i===index?'aria-current="step"':''}><i aria-hidden="true"></i><span>${esc(s)}</span></li>`).join('')}</ol></div>`;
    const sections=[
      ['overview','Project Details',projectDetails+ledger.metrics(p.id)+button('Edit budget / timeline','budget',p.id)],
      ['estimates','Estimates',estimateBody],
      ['invoices','Invoices','<p class="ops-muted">Invoice issuing and client delivery are not connected yet.</p>'],
      ['changes','Change Orders',button('＋ New change order','newChange',p.id)+ledger.orderCards(S.data.change_orders.filter(x=>x.project_id===p.id))],
      ['payments','Checks and Payments',`<p>Received: <strong>${D.display(totals.received)}</strong> · Deposit requested: <strong>${D.display(totals.deposit)}</strong></p>`+button('＋ Record payment','payment',p.id)+(paymentRows||'<p class="ops-muted">No individual payments recorded.</p>')+'<h3>Expected checks</h3>'+(checks||'<p class="ops-muted">Link forecast checks from Financial Dashboard → Checks. Expected checks are not recorded payments.</p>')],
      ['receipts','Receipts',receiptRows||'<p class="ops-muted">Receipt details appear when individual payments are recorded.</p>'],
      ['notes','Project Notes',notes],
      ['photos','Photos',`<p>${photos.length} project photos</p>${button('Open project photos','projectPhotos',p.id)}${button('Add photos','projectUpload',p.id)}`]
    ];
    return `<div class="pp-root" data-project-context-id="${esc(p.id)}"><h1 class="widget-fallback-title">Project Portal</h1>
      <nav class="pp-nav" aria-label="Project Portal sections"><div class="pp-nav-links">${sections.map(([id,name])=>`<button type="button" data-action="portalJump" data-id="${id}" ${id==='overview'?'aria-current="location"':''}>${name}</button>`).join('')}</div><button type="button" class="pp-expand-all" data-action="portalToggleAll" aria-label="Collapse all sections" title="Collapse all sections" data-expand="false"><span aria-hidden="true"></span></button></nav>
      <div class="pp-sections">${sections.map(([id,title,body])=>section(id,title,body)).join('')}</div>
    </div>`;
  }
  return {render};
};
