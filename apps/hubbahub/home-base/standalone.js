(async()=>{
  const root=document.getElementById('home-base');
  root.append(HomeBase.mount({projectId:new URLSearchParams(location.search).get('project')||''}));
  try{await OpsStore.restore();if(OpsStore.mode==='signed-out')await OpsStore.demo();}
  catch(error){const status=root.querySelector('[data-home-status]');if(status)status.textContent=error.message;}
})();
