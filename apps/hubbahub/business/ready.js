(()=>{
  const status=document.createElement('div');status.id='ops-status';status.className='ops-status';status.hidden=true;status.setAttribute('role','status');document.body.append(status);
  const account=document.createElement('button');account.id='ops-account';account.className='ops-account-control';account.type='button';account.title='Business account';account.setAttribute('aria-label','Business account');account.innerHTML='<svg class="ops-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></svg>';account.onclick=()=>OpsWidgets.account();document.body.append(account);
  OpsWidgets.start();
  const openNote=()=>{if(OpsSources.pendingNote||OpsSources.pendingError)OpsPopOut('opsEstimates');};
  window.addEventListener('ops-note-received',openNote);openNote();
})();
