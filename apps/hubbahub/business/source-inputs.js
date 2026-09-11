// Optional input adapters. Nothing is saved or sent to AI without a separate action.
(() => {
  const MAX_NOTE=256*1024, MAX_SHARE=12000;
  let pendingNote='',pendingError='';
  function normalize(text){
    if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_NOTE)throw new Error('Choose a note under 256 KB.');
    const value=text.replace(/\r\n?/g,'\n').trim();
    if(!value||value.includes('\0'))throw new Error('Choose a non-empty text note.');
    return value;
  }
  function receive(){
    if(!location.hash.startsWith('#tagims-note='))return;
    const raw=location.hash.slice('#tagims-note='.length);
    pendingNote='';pendingError='';
    // The fragment is not sent in HTTP requests. Clear it before the rest of the app starts.
    history.replaceState(null,'',location.pathname+location.search);
    try{
      if(raw.length>MAX_SHARE)throw new Error('This note is too long for the Shortcut handoff. Import its text/Markdown file instead.');
      pendingNote=normalize(decodeURIComponent(raw));pendingError='';
    }catch(e){pendingError=e instanceof URIError?'The shared note link is malformed. Share it again.':e.message;}
    window.dispatchEvent(new Event('ops-note-received'));
  }
  receive();window.addEventListener('hashchange',receive);
  async function fileText(file){
    if(!file||!file.size||file.size>MAX_NOTE||!(/\.(txt|md|markdown)$/i).test(file.name))throw new Error('Choose a .txt or .md note up to 256 KB. PDFs and attachments are not imported here.');
    return normalize(new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer()));
  }
  async function stableId(value){
    const b=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
    b[6]=(b[6]&15)|80;b[8]=(b[8]&63)|128;
    const h=Array.from(b.slice(0,16),x=>x.toString(16).padStart(2,'0')).join('');
    return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');
  }
  window.OpsSources={normalize,fileText,stableId,get pendingNote(){return pendingNote;},get pendingError(){return pendingError;},clear(){pendingNote='';pendingError='';}};
})();
