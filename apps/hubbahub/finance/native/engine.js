/* Pure monetary projections. No DOM, storage, network, or financial writes. */
(function(root){
'use strict';
const cents=x=>{const n=Number(x);if(!Number.isFinite(n))throw Error('Invalid money');return Math.round(n*100)},money=x=>x/100;
const buckets=['payroll','business_bills','materials','personal_bills','living','tax','debt_extra'];
const names={payroll:'Payroll',business_bills:'Business bills',materials:'Next-job materials',personal_bills:'Personal bills',living:'Living expenses',tax:'Taxes / reserves',debt_extra:'Extra debt payments',income:'Expected check'};
const day=d=>new Date(d+'T12:00:00Z'),iso=d=>d.toISOString().slice(0,10);
const today=()=>{let d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
function addDays(d,n){let x=day(d);x.setUTCDate(x.getUTCDate()+n);return iso(x)}
function nextDate(d,repeat,anchor=Number(d.slice(8))){if(repeat==='weekly')return addDays(d,7);const m={monthly:1,quarterly:3,yearly:12}[repeat];if(!m)return null;let x=day(d);x.setUTCDate(1);x.setUTCMonth(x.getUTCMonth()+m);x.setUTCDate(Math.min(anchor,new Date(Date.UTC(x.getUTCFullYear(),x.getUTCMonth()+1,0)).getUTCDate()));return iso(x)}
const sum=(rows,key)=>money(rows.reduce((n,r)=>n+cents(r[key]??0),0));
const personal=i=>['personal_bills','living'].includes(i.bucket);
const open=db=>db.items.filter(i=>!i.cancelled&&Number(i.remaining)>0);
function occurrences(items,start,end){const out=[];for(const i of items.filter(i=>!i.cancelled&&Number(i.remaining)>0)){
 let d=i.due_date,amount=Number(i.remaining),n=0;const anchor=i.recurrence_anchor||Number(d.slice(8));
 while(d&&d<=end&&n<2000){out.push({...i,source_id:i.id,id:n?i.id+':'+d:i.id,due_date:d,event_date:d<start?start:d,remaining:amount,projected:n>0});d=nextDate(d,i.recurrence,anchor);amount=Number(i.amount);n++}
}return out.sort((a,b)=>a.event_date.localeCompare(b.event_date))}
function forecast(accounts,items,start=today(),horizon=90,delay=0,extra=0,extraDate=start,scope='business',confirmedOnly=false){
 const selected=accounts.filter(a=>a.active&&a.scope===scope);if(!selected.length)return {known:false,days:[],minimum:null,shortfall:null,closing:null};
 let balance=cents(sum(selected,'balance')),minimum=balance,shortfall=balance<0?start:null;const end=addDays(start,horizon),events=new Map();
 for(const i of occurrences(items,start,end).filter(i=>scope==='personal'?personal(i):!personal(i))){if(confirmedOnly&&i.direction==='in'&&i.certainty!=='confirmed')continue;let d=i.direction==='in'?addDays(i.due_date,delay):i.due_date;d=d<start?start:d;if(d>end)continue;let e=events.get(d)||{incoming:0,outgoing:0};e[i.direction==='in'?'incoming':'outgoing']+=cents(i.remaining);events.set(d,e)}
 let ed=extraDate<start?start:extraDate;if(extra>0&&ed<=end){const e=events.get(ed)||{incoming:0,outgoing:0};e.outgoing+=cents(extra);events.set(ed,e)}
 const days=[];for(let date=start;date<=end;date=addDays(date,1)){const e=events.get(date)||{incoming:0,outgoing:0};balance+=e.incoming-e.outgoing;minimum=Math.min(minimum,balance);if(balance<0&&!shortfall)shortfall=date;days.push({date,balance:money(balance),incoming:money(e.incoming),outgoing:money(e.outgoing)})}
 return {known:true,days,minimum:money(minimum),shortfall,closing:money(balance)};
}
function allocate(items,available,through,existing=[],personalCash=0){let left=Math.max(0,cents(available)),p=Math.max(0,cents(personalCash));const reservations=new Map();existing.forEach(r=>reservations.set(r.item_id,(reservations.get(r.item_id)||0)+cents(r.amount)));
const rows=items.filter(i=>i.direction==='out'&&!i.cancelled&&Number(i.remaining)>0&&i.due_date<=through).sort((a,b)=>buckets.indexOf(a.bucket)-buckets.indexOf(b.bucket)||a.due_date.localeCompare(b.due_date)||a.id.localeCompare(b.id)).map(i=>{let need=Math.max(0,cents(i.remaining)-(reservations.get(i.id)||0));let covered=personal(i)?Math.min(p,need):0;p-=covered;need-=covered;const funded=Math.min(left,need);left-=funded;return {...i,coveredElsewhere:money(covered),funded:money(funded),short:money(need-funded)}});
return {rows,left:money(left),short:sum(rows,'short'),transfer:sum(rows.filter(personal),'funded')};}
function overview(db,date=today(),horizon=30){const biz=db.accounts.filter(a=>a.active&&a.scope==='business'),pers=db.accounts.filter(a=>a.active&&a.scope==='personal'),items=open(db),end=addDays(date,horizon),due=occurrences(items,date,end),out=due.filter(i=>i.direction==='out'&&!personal(i)),incoming=due.filter(i=>i.direction==='in'),personalDue=sum(due.filter(i=>i.direction==='out'&&personal(i)),'remaining'),pc=pers.length?sum(pers,'balance'):null,cash=biz.length?sum(biz,'balance'):null,reserved=sum(biz,'reserved'),gap=pc===null?null:Math.max(0,personalDue-pc);
// Reservations overlap dated obligations: subtract only reservations outside this horizon in addition.
const outIds=new Set(out.map(i=>i.source_id));const extraReservations=sum(db.allocations.filter(r=>biz.some(a=>a.id===r.account_id)&&!outIds.has(r.item_id)),'amount');
const free=cash===null||gap===null?null:money(cents(cash)-cents(sum(out,'remaining'))-cents(gap)-cents(extraReservations));const f=forecast(db.accounts,items,date,90);
return {cash,personalCash:pc,reserved,incoming:sum(incoming,'remaining'),outgoing:sum(out,'remaining'),payroll:sum(out.filter(i=>i.bucket==='payroll'),'remaining'),gap,free,forecast:f,due,late:items.filter(i=>i.direction==='out'&&i.due_date<date),end};}
function project(db,p){const payments=db.payments.filter(x=>x.project_id===p.id&&!x.voided_at&&!x.reversal_of&&x.item_id),collected=sum(payments.filter(x=>x.amount>0),'amount'),paid=-sum(payments.filter(x=>x.amount<0),'amount'),items=open(db).filter(i=>i.project_id===p.id),scheduled=sum(items.filter(i=>i.direction==='in'),'remaining');const costs=items.filter(i=>i.direction==='out');const actualLabor=-sum(payments.filter(x=>x.amount<0&&db.items.find(i=>i.id===x.item_id)?.bucket==='payroll'),'amount');const actualMaterials=-sum(payments.filter(x=>x.amount<0&&db.items.find(i=>i.id===x.item_id)?.bucket==='materials'),'amount');const labor=Math.max(Number(p.labor_budget),actualLabor+sum(costs.filter(i=>i.bucket==='payroll'),'remaining')),materials=Math.max(Number(p.materials_budget),actualMaterials+sum(costs.filter(i=>i.bucket==='materials'),'remaining'));const other=paid-actualLabor-actualMaterials+sum(costs.filter(i=>!['payroll','materials'].includes(i.bucket)),'remaining');return {collected,paid,remaining:Number(p.contract_total)-collected,scheduled,openCosts:sum(costs,'remaining'),projectedCost:labor+materials+other,margin:Number(p.contract_total)-labor-materials-other};}
function linkedItem(db,asset){let id=asset.item_id;if(!id)return null;let row=db.items.find(i=>i.id===id),n=0;while(row&&Number(row.remaining)<=0&&n++<2000){const child=db.items.find(i=>i.parent_item_id===row.id&&!i.cancelled);if(!child)break;row=child}return row&&!row.cancelled?row:null}
const api={cents,money,buckets,names,today,addDays,nextDate,sum,personal,open,occurrences,forecast,allocate,overview,project,linkedItem};root.HubFinanceEngine=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
