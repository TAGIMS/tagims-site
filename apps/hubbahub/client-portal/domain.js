(function(root,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  root.ClientPortalDomain=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const PHASES=Object.freeze([
    'Walkthrough','Estimate Approved','Project Scheduled','Planning & Logistics',
    'Materials Delivered','Tools & Materials Staged','Demo & Area Prep',
    'Project In Progress','Project Cleanup','Final Walkthrough','Project Completed'
  ]);
  const PAYMENT_METHODS=Object.freeze(['Cash App','Venmo','PayPal','Cash','Check']);
  const DOCUMENT_KINDS=Object.freeze(['walkthrough','estimate','change_order','invoice','receipt','punch_list','material_list']);
  const uuid=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():`cp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const now=()=>new Date().toISOString();
  const required=(value,label)=>{const text=String(value??'').trim();if(!text)throw new Error(`${label} is required.`);return text;};
  const integer=(value,label,{min=0,max=999999999999}={})=>{const number=Number(value);if(!Number.isSafeInteger(number)||number<min||number>max)throw new Error(`${label} must be a whole number from ${min} to ${max}.`);return number;};
  const moneyToCents=value=>{const text=String(value??'').trim();if(!/^\d+(?:\.\d{1,2})?$/.test(text))throw new Error('Enter a positive amount with at most two decimal places.');const [whole,fraction='']=text.split('.');return integer(Number(whole)*100+Number(fraction.padEnd(2,'0')),'Amount');};
  const centsToMoney=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(integer(value,'Amount')/100);
  const date=value=>{const text=required(value,'Date');if(!/^\d{4}-\d{2}-\d{2}$/.test(text)||new Date(`${text}T00:00:00Z`).toISOString().slice(0,10)!==text)throw new Error('Enter a valid date.');return text;};
  const phase=value=>{if(!PHASES.includes(value))throw new Error('Choose a valid project phase.');return value;};
  const stable=value=>{
    if(Array.isArray(value))return `[${value.map(stable).join(',')}]`;
    if(value&&typeof value==='object')return `{${Object.keys(value).sort().map(key=>`${JSON.stringify(key)}:${stable(value[key])}`).join(',')}}`;
    return JSON.stringify(value);
  };
  function checksum(value){
    const text=typeof value==='string'?value:stable(value);let h1=0x811c9dc5,h2=0x9e3779b9;
    for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);h1=Math.imul(h1^c,0x01000193);h2=Math.imul(h2^(c+i),0x85ebca6b);}
    return `${(h1>>>0).toString(16).padStart(8,'0')}${(h2>>>0).toString(16).padStart(8,'0')}`;
  }
  async function sha256(value){
    const bytes=value instanceof Uint8Array?value:new TextEncoder().encode(typeof value==='string'?value:stable(value));
    if(globalThis.crypto?.subtle){const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(digest)].map(v=>v.toString(16).padStart(2,'0')).join('');}
    return checksum([...bytes]);
  }
  function lineTotal(item){return integer(item.quantity_milli,'Quantity',{max:1000000000})*integer(item.unit_price_cents,'Unit price')/1000;}
  function estimateTotal(items){const total=items.reduce((sum,item)=>{const value=lineTotal(item);if(!Number.isSafeInteger(value))throw new Error('Line quantities must resolve to exact cents.');return sum+value;},0);return integer(total,'Estimate total');}
  function snapshotDocument(input){
    const body={kind:required(input.kind,'Document kind'),project_id:required(input.project_id,'Project'),version:integer(input.version,'Version',{min:1,max:10000}),title:required(input.title,'Title'),total_cents:integer(input.total_cents??0,'Document total'),content:input.content??{},created_at:input.created_at||now()};
    return {...body,id:input.id||uuid(),document_group_id:input.document_group_id||input.id||uuid(),status:input.status||'draft',content_checksum:checksum(body)};
  }
  function approveDocument(document,input){
    if(!['estimate','change_order'].includes(document.kind))throw new Error('Only estimates and change orders use client approval.');
    if(document.status!=='client_ready')throw new Error('This exact document version is not ready for client approval.');
    const signed_name=required(input.signed_name,'Typed signature');
    if(input.accepted!==true)throw new Error('The client must accept the approval statement.');
    return {id:uuid(),document_id:document.id,document_version:document.version,document_checksum:document.content_checksum,client_id:required(input.client_id,'Client'),project_id:document.project_id,signed_name,approved_at:input.approved_at||now(),approval_text:required(input.approval_text,'Approval statement'),status:'approved'};
  }
  function isApproved(document,approvals){return approvals.some(a=>a.document_id===document.id&&a.document_version===document.version&&a.document_checksum===document.content_checksum&&a.status==='approved');}
  function billableSources({documents,approvals,reimbursements=[],allocations=[]}){
    const billed=new Map();for(const row of allocations)billed.set(`${row.source_type}:${row.source_id}`,(billed.get(`${row.source_type}:${row.source_id}`)||0)+integer(row.amount_cents,'Allocation amount'));
    const sources=[];
    for(const document of documents){
      if(!['estimate','change_order'].includes(document.kind)||!isApproved(document,approvals))continue;
      const key=`${document.kind}:${document.id}`,used=billed.get(key)||0,available=document.total_cents-used;
      if(available>0)sources.push({source_type:document.kind,source_id:document.id,source_version:document.version,source_checksum:document.content_checksum,label:document.title,available_cents:available});
    }
    for(const reimbursement of reimbursements){const key=`material_reimbursement:${reimbursement.id}`,used=billed.get(key)||0,available=integer(reimbursement.amount_cents,'Reimbursement')-used;if(available>0)sources.push({source_type:'material_reimbursement',source_id:reimbursement.id,source_version:1,source_checksum:reimbursement.receipt_checksum||checksum(reimbursement),label:reimbursement.description||'Material reimbursement',available_cents:available});}
    return sources;
  }
  function issueInvoice(input){
    const sources=billableSources(input),requested=input.amount_cents==null?sources.reduce((sum,s)=>sum+s.available_cents,0):integer(input.amount_cents,'Invoice amount',{min:1});
    if(!sources.length)throw new Error('No approved, unbilled charges are available.');
    if(requested>sources.reduce((sum,s)=>sum+s.available_cents,0))throw new Error('Invoice amount exceeds approved unbilled charges.');
    let remaining=requested;const rows=[];
    for(const source of sources){if(!remaining)break;const amount=Math.min(source.available_cents,remaining);rows.push({...source,id:uuid(),amount_cents:amount});remaining-=amount;}
    const invoice={id:uuid(),project_id:required(input.project_id,'Project'),number:required(input.number,'Invoice number'),issued_on:date(input.issued_on),due_on:date(input.due_on),status:'issued',total_cents:requested,balance_cents:requested,created_at:now()};
    return {invoice,allocations:rows.map(row=>({...row,invoice_id:invoice.id}))};
  }
  function paymentKey(payment){return checksum([payment.invoice_id,payment.method,payment.reference.trim().toLowerCase(),payment.amount_cents,payment.received_on]);}
  function recordPayment(invoice,input,existingPayments=[]){
    if(!PAYMENT_METHODS.includes(input.method))throw new Error('Choose a supported manual payment method.');
    const amount_cents=integer(input.amount_cents,'Payment amount',{min:1});if(amount_cents>invoice.balance_cents)throw new Error('Payment exceeds the invoice balance.');
    const payment={id:uuid(),invoice_id:invoice.id,project_id:invoice.project_id,method:input.method,reference:required(input.reference,'Payment reference'),amount_cents,received_on:date(input.received_on),recorded_at:now()};payment.idempotency_key=paymentKey(payment);
    if(existingPayments.some(row=>row.idempotency_key===payment.idempotency_key))throw new Error('This payment is already recorded.');
    const updatedInvoice={...invoice,balance_cents:invoice.balance_cents-amount_cents,status:invoice.balance_cents===amount_cents?'paid':'partially_paid'};
    const receipt={id:uuid(),payment_id:payment.id,invoice_id:invoice.id,project_id:invoice.project_id,number:required(input.receipt_number,'Receipt number'),issued_at:now(),amount_cents,method:input.method,reference:payment.reference,sent_at:null,status:'recorded'};
    return {payment,receipt,invoice:updatedInvoice};
  }
  function projectFinancials(projectId,state){
    const invoices=state.invoices.filter(x=>x.project_id===projectId),payments=state.payments.filter(x=>x.project_id===projectId);
    return {invoiced_cents:invoices.reduce((s,x)=>s+x.total_cents,0),paid_cents:payments.reduce((s,x)=>s+x.amount_cents,0),outstanding_cents:invoices.reduce((s,x)=>s+x.balance_cents,0)};
  }
  function attentionItems(projectId,state,today=new Date().toISOString().slice(0,10),audience='owner'){
    const items=[];
    for(const document of state.documents.filter(x=>x.project_id===projectId&&x.status==='client_ready'))items.push({id:`document:${document.id}`,kind:'approval',label:`Approval needed: ${document.title}`,priority:'high'});
    for(const invoice of state.invoices.filter(x=>x.project_id===projectId&&x.balance_cents>0)){const overdue=invoice.due_on<today;items.push({id:`invoice:${invoice.id}`,kind:'payment',label:`${overdue?'Overdue':'Open'} invoice ${invoice.number}: ${centsToMoney(invoice.balance_cents)}`,priority:overdue?'high':'medium'});}
    for(const decision of (state.decisions||[]).filter(x=>x.project_id===projectId&&x.status==='open'))items.push({id:`decision:${decision.id}`,kind:'selection',label:`Selection needed: ${decision.title}${decision.due_on?` by ${decision.due_on}`:''}`,priority:decision.due_on&&decision.due_on<today?'high':'medium'});
    if(audience==='owner')for(const message of (state.conversations||[]).filter(x=>x.project_id===projectId&&x.sender_type==='client'&&!x.owner_read_at))items.push({id:`message:${message.id}`,kind:'message',label:'New client message',priority:'medium'});
    return items;
  }
  function visibleState(state,clientId){
    const projects=state.projects.filter(p=>p.client_id===clientId),ids=new Set(projects.map(p=>p.id)),filter=rows=>rows.filter(row=>ids.has(row.project_id));
    return {clients:state.clients.filter(c=>c.id===clientId).map(c=>({id:c.id,name:c.name})),projects,project_settings:filter(state.project_settings),documents:filter(state.documents).filter(d=>['client_ready','approved'].includes(d.status)),approvals:filter(state.approvals),invoices:filter(state.invoices).filter(i=>i.status!=='draft'),payments:filter(state.payments).map(p=>({id:p.id,project_id:p.project_id,invoice_id:p.invoice_id,amount_cents:p.amount_cents,received_on:p.received_on})),receipts:filter(state.receipts),photos:filter(state.photos).filter(p=>p.client_visible===true),showroom_items:filter(state.showroom_items).filter(p=>p.visible===true),contacts:filter(state.contacts||[]).filter(c=>c.client_visible!==false),timeline:filter(state.timeline||[]).filter(t=>t.client_visible!==false),conversations:filter(state.conversations||[]).filter(m=>m.client_visible!==false),decisions:filter(state.decisions||[]).filter(d=>d.client_visible!==false),closeout:filter(state.closeout||[])};
  }
  return Object.freeze({PHASES,PAYMENT_METHODS,DOCUMENT_KINDS,required,integer,moneyToCents,centsToMoney,date,phase,stable,checksum,sha256,estimateTotal,snapshotDocument,approveDocument,isApproved,billableSources,issueInvoice,paymentKey,recordPayment,projectFinancials,attentionItems,visibleState});
});
