(function(root){
  const mounts=new Set(),S=root.OpsStore;
  function render(el){
    el.replaceChildren();
    const tasks=OpsWorkflow.tasks(S.data);
    if(!tasks.length)return;
    const heading=document.createElement('strong');heading.textContent='Client Processing';el.append(heading);
    for(const task of tasks){
      const row=document.createElement('div');row.className='ops-project-task';
      const text=document.createElement('div'),name=document.createElement('strong'),detail=document.createElement('small');
      name.textContent=task.title;detail.textContent=[task.client,task.project,task.due].filter(Boolean).join(' · ');text.append(name,detail);
      const action=document.createElement('button');action.type='button';action.textContent=task.fieldId?'Complete':'Open';action.setAttribute('aria-label',action.textContent+': '+task.title+' — '+task.project);
      action.onclick=async()=>{action.disabled=true;try{if(task.fieldId){const item=S.data.field_items.find(x=>x.id===task.fieldId&&x.project_id===task.projectId);if(!item)throw Error('This work item has changed.');await S.save('field_items',{...item,status:'done'});}else root.OpsWidgets.openProject(task.projectId,task.tool);}catch(error){detail.textContent=error.message;}finally{action.disabled=false;}};
      row.append(text,action);el.append(row);
    }
  }
  root.OpsProcessingTasks={mount(){const el=document.createElement('section');el.className='ops-project-tasks';el.setAttribute('aria-label','Project next actions');mounts.add(el);render(el);return el;}};
  S.on(()=>{for(const el of mounts)if(el.isConnected)render(el);else mounts.delete(el);});
})(globalThis);
