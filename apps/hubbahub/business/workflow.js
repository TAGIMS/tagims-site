(function(root){
  'use strict';
  function latest(data,id){return data.estimates.filter(e=>e.project_id===id).sort((a,b)=>Number(b.version)-Number(a.version))[0];}
  function next(data,p){
    if(['complete','completed','archived'].includes(p.status))return null;
    const e=latest(data,p.id),hasNotes=data.walkthroughs.some(n=>n.project_id===p.id);
    let title,tool;
    if(p.status==='active'){
      const item=data.field_items.find(i=>i.project_id===p.id&&i.kind==='punch'&&i.status!=='done');
      title=item?item.title:p.next_action||'Review project completion';tool='notes';
      return {id:p.id+':'+(item?.id||'active'),projectId:p.id,title,tool,fieldId:item?.id||null,due:item?.due_date||p.next_action_due||null};
    }
    if(!hasNotes&&!e){title=p.next_action_due?'Capture walkthrough':'Schedule walkthrough';tool=p.next_action_due?'opsNotes':'schedule';}
    else if(!e){title='Create estimate';tool='opsEstimate';}
    else if(e.status==='draft'){title='Continue estimate';tool='opsEstimate';}
    else if(e.status==='client_ready'){title='Review sending and client approval';tool='opsReview';}
    else{title='Complete estimate review';tool='opsReview';}
    return {id:p.id+':'+tool+':'+(e?.id||''),projectId:p.id,title,tool,due:p.next_action_due||null};
  }
  function tasks(data){return data.projects.map(p=>{const task=next(data,p);return task?{...task,project:p.name,client:data.clients.find(c=>c.id===p.client_id)?.name||'',active:p.status==='active'}:null;}).filter(Boolean).sort((a,b)=>Number(b.active)-Number(a.active)||String(a.due||'9999').localeCompare(String(b.due||'9999'))||a.project.localeCompare(b.project));}
  function duration(notes){
    const match=String(notes||'').match(/^Estimated duration:\s*(\d+(?:\.\d+)?)(?:\s*[-–]\s*(\d+(?:\.\d+)?))?\s*(days?|weeks?)\s*$/im);
    if(!match)return null;
    const upper=Number(match[2]||match[1]),days=Math.ceil(upper*(match[3].toLowerCase().startsWith('week')?5:1));
    if(days<=0||days>3650)return null;
    return {days:days>2?Math.ceil(days/5)*5:days,label:days>2?`${Math.ceil(days/5)} week${Math.ceil(days/5)===1?'':'s'}`:`${days} day${days===1?'':'s'}`,source:match[0]};
  }
  function withDuration(notes,value){
    const clean=String(notes||'').replace(/^Estimated duration:.*(?:\r?\n|$)/gim,'').trim();
    if(!String(value||'').trim())return clean;
    const line='Estimated duration: '+String(value).trim(),parsed=duration(line);
    if(!parsed)throw Error('Enter a duration such as 1 week, 3 weeks, or 4–5 days.');
    return [clean,'Estimated duration: '+parsed.label].filter(Boolean).join('\n\n');
  }
  root.OpsWorkflow={latest,next,tasks,duration,withDuration};
  if(typeof module!=='undefined')module.exports=root.OpsWorkflow;
})(globalThis);
