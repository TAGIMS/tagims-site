// Google OAuth access tokens live only inside a single selection dialog.
// Disabled until a public OAuth client ID and use-case review are configured.
(() => {
  const API='https://photospicker.googleapis.com/v1',SCOPE='https://www.googleapis.com/auth/photospicker.mediaitems.readonly';
  let sdkPromise;
  function configured(){return !!OpsConfig.googlePhotosClientId&&OpsConfig.googlePhotosImportEnabled===true;}
  function sdk(){
    if(window.google?.accounts?.oauth2)return Promise.resolve();
    if(!sdkPromise)sdkPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;
      const timer=setTimeout(()=>{script.remove();sdkPromise=null;reject(new Error('Google sign-in could not load. Try again.'));},15000);
      script.onload=()=>{clearTimeout(timer);resolve();};
      script.onerror=()=>{clearTimeout(timer);script.remove();sdkPromise=null;reject(new Error('Google sign-in could not load.'));};
      document.head.append(script);
    });
    return sdkPromise;
  }
  async function readLimited(response,max){
    if(Number(response.headers.get('content-length'))>max){await response.body?.cancel();throw new Error('Selected file exceeds the import size limit.');}
    const reader=response.body?.getReader();if(!reader)throw new Error('Empty response.');
    const chunks=[];let size=0;
    try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('Selected file exceeds the import size limit.');chunks.push(value);}}
    catch(e){await reader.cancel();throw e;}
    return new Blob(chunks,{type:response.headers.get('content-type')?.split(';')[0]||'application/octet-stream'});
  }
  async function call(url,token,{method='GET',body,signal,max=2*1024*1024,blob=false}={}){
    const controller=new AbortController(),abort=()=>controller.abort();
    if(signal?.aborted)controller.abort();signal?.addEventListener('abort',abort,{once:true});
    const timer=setTimeout(abort,30000);
    try{
      const r=await fetch(url,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal,redirect:'error',credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer'});
      if(!r.ok){await r.body?.cancel();throw new Error(r.status===401?'Google access expired. Close this window and reconnect.':r.status===429?'Google is limiting requests. Try again later.':'Google Photos request failed ('+r.status+').');}
      if(r.status===204)return null;
      const data=await readLimited(r,max);return blob?data:JSON.parse(await data.text());
    }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
  }
  function selectionURL(raw){
    const url=new URL(raw);
    if(url.protocol!=='https:'||url.hostname!=='photos.google.com'||url.username||url.password||url.port)throw new Error('Google returned an unexpected selection link.');
    return url.href;
  }
  function imageURL(raw){
    const url=new URL(raw);
    if(url.protocol!=='https:'||!url.hostname.endsWith('.googleusercontent.com')||url.username||url.password||url.port||url.search||url.hash)throw new Error('Google returned an unexpected image location.');
    return url.href+'=d';
  }
  // This controller owns one token/session, never an entire Google library.
  function create(){
    let token='',session=null,expires=0;
    const aborter=new AbortController();
    const api=(path,opts={})=>{
      if(!token||Date.now()>=expires)throw new Error('Google access expired. Close this window and reconnect.');
      return call(API+path,token,{...opts,signal:aborter.signal});
    };
    return {
      authorize(){return new Promise((resolve,reject)=>{
        const client=google.accounts.oauth2.initTokenClient({client_id:OpsConfig.googlePhotosClientId,scope:SCOPE,include_granted_scopes:false,
          callback:r=>{if(aborter.signal.aborted){reject(new Error('Selection canceled.'));return;}if(r.error||!r.access_token||!google.accounts.oauth2.hasGrantedAllScopes(r,SCOPE)){reject(new Error('Google Photos permission was not granted.'));return;}token=r.access_token;expires=Date.now()+Number(r.expires_in||0)*1000;resolve();},
          error_callback:()=>reject(new Error('Google sign-in was canceled or blocked.'))});
        client.requestAccessToken();
      });},
      async begin(){session=await api('/sessions',{method:'POST',body:{pickingConfig:{maxItemCount:'100'}}});return {url:selectionURL(session.pickerUri)};},
      async list(){
        if(!session?.id)throw new Error('Connect to Google first.');
        const state=await api('/sessions/'+encodeURIComponent(session.id));
        if(!state.mediaItemsSet)return null;
        const items=[],seen=new Set();let pageToken='';
        do{
          if(seen.has(pageToken))throw new Error('Google returned repeated pagination. Please restart selection.');seen.add(pageToken);
          const q=new URLSearchParams({sessionId:session.id,pageSize:'100',...(pageToken?{pageToken}:{})});
          const page=await api('/mediaItems?'+q);
          items.push(...(page.mediaItems||[]));if(items.length>100)throw new Error('Select up to 100 photos per import.');
          pageToken=page.nextPageToken||'';
        }while(pageToken);
        return items;
      },
      async file(item){
        if(!token||Date.now()>=expires)throw new Error('Google access expired. Reconnect.');
        if(item.type!=='PHOTO'||!['image/jpeg','image/png','image/webp'].includes(item.mediaFile?.mimeType))throw new Error('Only JPEG, PNG, and WebP photos are supported. Convert HEIC first.');
        const blob=await call(imageURL(item.mediaFile.baseUrl),token,{signal:aborter.signal,max:20*1024*1024,blob:true});
        if(!['image/jpeg','image/png','image/webp'].includes(blob.type))throw new Error('Google returned an unsupported image format.');
        return new File([blob],item.mediaFile.filename||'Google photo',{type:blob.type});
      },
      async close(){
        aborter.abort();const oldToken=token,oldSession=session;token='';session=null;expires=0;
        if(oldToken&&oldSession?.id){try{await call(API+'/sessions/'+encodeURIComponent(oldSession.id),oldToken,{method:'DELETE'});}catch{/* A failed cleanup never turns a saved import into a failure. */}}
      }
    };
  }
  window.OpsGooglePhotos={configured,sdk,create};
})();
