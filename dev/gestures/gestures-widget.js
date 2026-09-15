/* Native HUB widget. No iframe, accounts, recording, or system mouse injection.
 * Port contract: render() -> Element; mount(widget) -> cleanup function.
 * Camera preview and hand landmarks only; no gesture commands.
 */
window.GesturesWidget = (() => {
 const VERSION='0.10.32';
 // iOS device tests failed on both worker and DOM-canvas GPU paths.
 // Use CPU inference until GPU behavior can be validated on-device.
 const ios=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
 // Local file pages cannot fetch neighboring file:// model bytes. Use the
 // public, versioned model for double-click launches; frames stay on-device.
 const modelAssetPath='https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';
 let libraryPromise;
 // A classic Blob worker also supports direct file launches. Dynamic import
 // loads the pinned library; WASM's importScripts remains available here.
 function trackerWorker(){
  let tracker;
  self.onmessage=async({data})=>{
   const {id,type}=data;
   try{
    let value;
    if(type==='init'){
     const lib=await import(data.moduleURL);
     const files=await lib.FilesetResolver.forVisionTasks(data.wasmURL);
     const opts=data.options;let delegate='GPU';
     try{tracker=await lib.HandLandmarker.createFromOptions(files,{...opts,canvas:new OffscreenCanvas(1,1)});}
     catch{delegate='CPU';opts.baseOptions.delegate='CPU';tracker=await lib.HandLandmarker.createFromOptions(files,opts);}
     value={delegate};
    }else if(type==='detect'){
     const began=performance.now();
     try{value={hand:tracker.detectForVideo(data.bitmap,data.timestamp).landmarks?.[0],ms:performance.now()-began};}
     finally{data.bitmap.close();}
    }else if(type==='settings'){await tracker.setOptions(data.options);}
    self.postMessage({id,value});
   }catch(e){self.postMessage({id,error:e.message||String(e)});}
  };
 }
 function workerClient(){
  const url=URL.createObjectURL(new Blob(['('+trackerWorker.toString()+')()'],{type:'text/javascript'}));
  let worker;try{worker=new Worker(url);}finally{URL.revokeObjectURL(url);}
  let serial=0,closed=false;const pending=new Map();
  const fail=error=>{for(const p of pending.values()){clearTimeout(p.timer);p.reject(error);}pending.clear();};
  worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);clearTimeout(p.timer);data.error?p.reject(new Error(data.error)):p.resolve(data.value);};
  worker.onerror=e=>{e.preventDefault?.();closed=true;worker.terminate();fail(new Error(e.message||'Tracking worker failed'));};
  return {
   request(type,data={},transfer=[]){return new Promise((resolve,reject)=>{
    if(closed){reject(new Error('Tracker closed'));return;}
    const id=++serial,timer=setTimeout(()=>{closed=true;worker.terminate();fail(new Error('Tracking worker timed out'));},type==='init'?60000:15000);
    pending.set(id,{resolve,reject,timer});
    try{worker.postMessage({id,type,...data},transfer);}catch(e){pending.delete(id);clearTimeout(timer);reject(e);}
   });},
   close(){closed=true;worker.terminate();fail(new Error('Tracker closed'));}
  };
 }
 const edges=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],[13,17],[0,17],[17,18],[18,19],[19,20]];
 const render=()=>{
  const root=document.createElement('div');root.className='gestures-app hub-data-widget';
  root.innerHTML=`<div class="g-bar"><div class="g-title"><span class="g-eyebrow">FRONT CAMERA</span><strong>Gestures<span class="g-title-dot">.</span></strong></div><span data-g="privacy">Camera off</span></div>
   <div class="g-camera"><video data-g="video" playsinline muted autoplay></video><canvas data-g="canvas"></canvas><p data-g="empty">Front camera · on-device tracking</p></div>
   <div class="g-controls"><button data-g="start">Start camera</button><button data-g="pause" disabled>Pause</button><button data-g="stop" disabled>Stop camera</button></div>
   <p data-g="status" role="status">Ready. Camera starts only when you tap Start.</p>
   <section class="g-diagnostics" aria-label="Live tracking diagnostics">
   <div class="g-diagnostics-heading">Live performance <span>ON DEVICE</span></div>
   <div class="g-readings"><span data-g="pose">No hand</span><span data-g="rate">— fps</span><span data-g="engine">Tracker off</span></div>
   <p data-g="progress" role="status">Tracker: waiting to start</p>
   <p data-g="view">Camera view: full frame</p>
   <p data-g="capture">Camera delivery: — fps</p>
   <p data-g="startup">Preparing tracker · camera off</p>
   <p data-g="timing" title="Delay starts at browser frame observation, not sensor exposure. Worker round trip includes MediaPipe processing.">Prep — ms · Worker round trip — ms · Observed frame delay — ms</p>
   <p data-g="benchmark">Live measurements appear automatically when the camera starts.</p>
   <div data-g="results" class="g-benchmark-results"></div>
   </section>
   <details><summary>Tracking settings</summary><label>Confidence <input data-g="confidence" type="range" min="30" max="90" value="50"></label><label>Detection rate <select data-g="limit"><option value="24">24 fps · responsive</option><option value="20">20 fps</option><option value="15">15 fps · balanced</option><option value="10">10 fps · lighter</option></select></label><button data-g="optimize" disabled>Optimize for this device</button><p>Keep your hand visible and move gently during optimization. Detection retention is not landmark accuracy.</p></details>`;
  return root;
 };
 function mount(widget){
  const root=widget.querySelector('.gestures-app');
  const get=n=>root.querySelector('[data-g="'+n+'"]');
  const nodes=new Map();for(const node of root.querySelectorAll('[data-g]'))nodes.set(node.dataset.g,node);
  const text=(name,value)=>{const node=nodes.get(name);if(node.textContent!==value)node.textContent=value;};
  const video=get('video'),canvas=get('canvas'),ctx=canvas.getContext('2d');
  const input=document.createElement('canvas'),inputContext=input.getContext('2d',{alpha:false});
  let client,inFlight=false,epoch=0,inputWidth=480,engine='',imagePath='canvas',delegate='GPU';
  let benchmark=null,sample=null,prepTotal=0,roundTotal=0,ageTotal=0;
  let videoCallback=0,wake=0,latestTime=-1,observedAt=0,cameraFrames=0,cameraAt=0,presented=0;
  // iOS uses the animation loop with currentTime deduplication, independent of video callbacks.
  const useVideoCallback=!ios&&typeof video.requestVideoFrameCallback==='function';
  let statsAt=0,statsFrames=0,inferenceTotal=0;
  let stream,model,raf=0,generation=0,disposed=false,paused=false,busy=false;
  let lastVideo=-1,lastRun=0,lastUI=0;
  const status=s=>text('status',s);
  let phase='waiting to start',phaseAt=performance.now(),completedFrames=0;
  const showProgress=()=>text('progress','Tracker: '+phase+' · '+Math.floor((performance.now()-phaseAt)/1000)+' s · '+completedFrames+' frames processed');
  const setPhase=value=>{phase=value;phaseAt=performance.now();showProgress();};
  const progressTimer=setInterval(showProgress,1000);
  let preparedTracker=null,startClicked=0,awaitingFirst=false,cameraReadyMs=0;
  function releasePrepared(){
   const previous=preparedTracker;preparedTracker=null;
   if(previous){previous.cancelled=true;previous.client?.close();previous.model?.close();}
  }
  function prepareTracker(){
   if(preparedTracker)return preparedTracker.promise;
   const entry={cancelled:false,client:null,model:null,engine:''};preparedTracker=entry;
   entry.promise=(async()=>{
    const valid=()=>{if(entry.cancelled||disposed)throw new Error('Preparation cancelled');};
    const opts={baseOptions:{modelAssetPath:new URL(modelAssetPath,location.href).href,delegate:ios?'CPU':'GPU'},runningMode:'VIDEO',numHands:1,minHandDetectionConfidence:Number(get('confidence').value)/100,minHandPresenceConfidence:.5,minTrackingConfidence:.5};
    const moduleURL='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+VERSION+'/vision_bundle.mjs',wasmURL='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@'+VERSION+'/wasm';
    if(!ios&&window.Worker&&window.OffscreenCanvas&&window.createImageBitmap){
     try{entry.client=workerClient();const info=await entry.client.request('init',{moduleURL,wasmURL,options:opts});valid();entry.engine=info.delegate+' · worker';}
     catch(e){valid();entry.client?.close();entry.client=null;}
    }
    if(!entry.client){
     setPhase('loading tracking library');
     libraryPromise ||= import(moduleURL).catch(e=>{libraryPromise=null;throw e;});
     const lib=await libraryPromise;valid();setPhase('preparing runtime');const files=await lib.FilesetResolver.forVisionTasks(wasmURL);valid();setPhase('loading model and initializing tracker');
     // Use a dedicated DOM canvas for iOS GPU processing, separate from preview.
     opts.canvas=document.createElement('canvas');
     let tracker;
     try{tracker=await lib.HandLandmarker.createFromOptions(files,opts);entry.engine=opts.baseOptions.delegate+' · compatibility';}
     catch(e){valid();if(opts.baseOptions.delegate==='CPU')throw e;opts.baseOptions.delegate='CPU';tracker=await lib.HandLandmarker.createFromOptions(files,opts);entry.engine='CPU · compatibility';}
     if(entry.cancelled||disposed){tracker.close();valid();}entry.model=tracker;
    }
    valid();setPhase('tracker ready');return entry;
   })().catch(e=>{entry.client?.close();entry.model?.close();if(preparedTracker===entry)preparedTracker=null;throw e;});
   entry.promise.catch(()=>{});return entry.promise;
  }
  function reset(){epoch++;lastVideo=-1;lastRun=0;lastUI=0;statsAt=performance.now();statsFrames=0;inferenceTotal=0;prepTotal=0;roundTotal=0;ageTotal=0;}
  function controls(){get('start').disabled=busy||!!stream;get('pause').disabled=busy||!stream||!!benchmark;get('confidence').disabled=busy||!!benchmark;get('limit').disabled=!!benchmark;get('optimize').disabled=!stream||busy||paused;get('optimize').textContent=benchmark?'Cancel optimization':'Optimize for this device';get('stop').disabled=!busy&&!stream;get('pause').textContent=paused?'Resume':'Pause';}
  function kick(){
   if(!useVideoCallback||!stream||busy||paused||inFlight||latestTime===lastVideo)return;
   clearTimeout(wake);wake=setTimeout(()=>frame(performance.now()),Math.max(0,1000/Number(get('limit').value)-(performance.now()-lastRun)));
  }
  function observeVideo(now,metadata){
   if(!stream||disposed)return;
   latestTime=metadata.mediaTime;observedAt=now;
   if(cameraAt){cameraFrames+=Math.max(0,metadata.presentedFrames-presented);if(now-cameraAt>=1000){text('capture','Camera delivery: '+(cameraFrames*1000/(now-cameraAt)).toFixed(1)+' fps · '+video.videoWidth+'×'+video.videoHeight);cameraFrames=0;cameraAt=now;}}
   else cameraAt=now;
   presented=metadata.presentedFrames;videoCallback=video.requestVideoFrameCallback(observeVideo);kick();
  }
  function stop(message='Camera stopped.',keepWarm=false){
   setPhase(message);
   const retain=keepWarm&&!busy&&!inFlight&&!benchmark&&!!(client||model);
   if(retain&&preparedTracker)preparedTracker.engine=engine;
   if(!retain)releasePrepared();
   generation++;awaitingFirst=false;if(benchmark)benchmark.cancelled=true;sample?.finish();sample=null;benchmark=null;busy=false;paused=false;inFlight=false;clearTimeout(wake);if(useVideoCallback)video.cancelVideoFrameCallback(videoCallback);client=null;cancelAnimationFrame(raf);stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;
   model=null;reset();ctx.clearRect(0,0,canvas.width,canvas.height);get('empty').hidden=false;get('privacy').textContent='Camera off';get('pose').textContent='No hand';get('rate').textContent='— fps';text('engine',retain?'Tracker ready · camera off':'Tracker off');controls();status(message);
  }
  function pause(){if(!stream)return;paused=true;reset();ctx.clearRect(0,0,canvas.width,canvas.height);get('pose').textContent='Paused';get('rate').textContent='— fps';controls();status('Tracking paused. Tap Resume. Camera preview is still active.');}
  async function widenCamera(track,token){
   const current=()=>token===generation&&!disposed&&!!stream;
   try{
    const zoom=track.getCapabilities?.().zoom;
    if(!zoom||!Number.isFinite(zoom.min)||!track.applyConstraints){if(current())text('view','Full frame · camera zoom unavailable');return;}
    await track.applyConstraints({advanced:[{zoom:zoom.min}]});
    if(!current())return;
    const actual=track.getSettings?.().zoom;
    text('view',Number.isFinite(actual)&&Math.abs(actual-zoom.min)<.01?'Full frame · widest available zoom':'Full frame · widest zoom requested');
   }catch{if(current())text('view','Full frame · default camera zoom');}
  }
  async function start(){
   if(busy||stream||disposed)return;
   if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){status('Camera needs HTTPS or localhost. Drive preview and ordinary local-network HTTP cannot provide phone camera access.');return;}
   busy=true;controls();const token=++generation;status('Allow front-camera access…');
   completedFrames=0;startClicked=performance.now();awaitingFirst=true;const preparation=prepareTracker();
   text('benchmark','Live measurements update automatically. Optimization is optional.');get('results').replaceChildren();
   text('timing','Measuring frame preparation and processing…');
   try{
    // Request front camera strictly on phones; desktop hardware may omit facingMode.
    const phone=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.maxTouchPoints>1&&/Mac/.test(navigator.platform));
    const acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:phone?{exact:'user'}:{ideal:'user'},width:{ideal:640},height:{ideal:480},frameRate:{ideal:30}}});
    if(token!==generation||disposed){acquired.getTracks().forEach(t=>t.stop());return;}
    stream=acquired;video.srcObject=stream;await video.play();if(token!==generation)return;
    cameraReadyMs=performance.now()-startClicked;
    void widenCamera(stream.getVideoTracks()[0],token);
    get('empty').hidden=true;get('privacy').textContent='Camera active · local processing';status('Loading hand tracker…');
    status('Loading hand model…');
    const ready=await preparation;
    if(token!==generation||disposed)return;
    client=ready.client;model=ready.model;engine=ready.engine;
    delegate=engine.startsWith('CPU')?'CPU':'GPU';inputWidth=ios?320:480;imagePath='canvas';busy=false;paused=false;reset();text('engine',engine);controls();status('Looking for a hand…');
    const settings=stream.getVideoTracks()[0].getSettings?.()||{};
    text('capture','Camera settings: '+(settings.width||video.videoWidth)+'×'+(settings.height||video.videoHeight)+' · '+(settings.frameRate?.toFixed(1)||'unknown')+' fps negotiated'+(useVideoCallback?'':' · live delivery measurement unavailable'));
    stream.getVideoTracks()[0].addEventListener('ended',()=>stop('Camera disconnected. Tap Start to reconnect.'),{once:true});
    setPhase('waiting for first video frame');lastRun=0;latestTime=-1;cameraAt=0;cameraFrames=0;presented=0;if(useVideoCallback)videoCallback=video.requestVideoFrameCallback(observeVideo);else raf=requestAnimationFrame(frame);
   }catch(e){if(token!==generation||disposed)return;const reason={NotAllowedError:'Camera permission denied. Allow this site to use the camera, then try again.',NotFoundError:'No front camera is available.',OverconstrainedError:'A front-facing camera was not available. Rear-camera fallback is disabled.',NotReadableError:'Camera is busy. Close other camera apps and try again.'}[e.name]||'Tracker could not start: '+e.message;stop(reason);}
  }
  async function frame(now){
   if(disposed||!stream)return;if(!useVideoCallback)raf=requestAnimationFrame(frame);
   const frameTime=useVideoCallback?latestTime:video.currentTime;
   if(paused||busy||inFlight||document.hidden||video.readyState<2||!video.videoWidth||!video.videoHeight||(!model&&!client)||frameTime===lastVideo||now-lastRun<1000/Number(get('limit').value)){kick();return;}
   lastRun=now;lastVideo=frameTime;inFlight=true;const token=generation,frameEpoch=epoch,started=performance.now(),frameObserved=useVideoCallback?observedAt:started;
   try{
    const scale=Math.min(1,inputWidth/(ios?Math.max(video.videoWidth,video.videoHeight):video.videoWidth));
    const width=Math.max(1,Math.round(video.videoWidth*scale)),height=Math.max(1,Math.round(video.videoHeight*scale));
    if(input.width!==width||input.height!==height){input.width=width;input.height=height;}
    let hand,ms,prepared,returned;
    if(completedFrames===0)setPhase('processing first frame');
    if(client){
     let bitmap;
     if(imagePath==='direct')bitmap=await createImageBitmap(video,{resizeWidth:width,resizeHeight:height,resizeQuality:'low'});
     else{inputContext.drawImage(video,0,0,width,height);bitmap=await createImageBitmap(input);}
     prepared=performance.now();
     if(token!==generation||frameEpoch!==epoch||paused){bitmap.close();return;}
     let result;try{result=await client.request('detect',{bitmap,timestamp:now},[bitmap]);}finally{bitmap.close();}
     hand=result.hand;ms=result.ms;
    }else{inputContext.drawImage(video,0,0,width,height);prepared=performance.now();hand=model.detectForVideo(input,now).landmarks?.[0];ms=performance.now()-prepared;}
    returned=performance.now();
    if(token!==generation||frameEpoch!==epoch||paused)return;
    completedFrames++;if(completedFrames===1){setPhase('processing video');text('rate',Math.round(ms)+' ms MediaPipe · first frame completed');}
    if(awaitingFirst){awaitingFirst=false;text('startup','Startup: '+((returned-startClicked)/1000).toFixed(1)+' s to first tracking result · '+((returned-startClicked-cameraReadyMs)/1000).toFixed(1)+' s after camera preview');}
    const prep=prepared-started,round=returned-prepared,age=returned-frameObserved;
    if(sample){sample.seen++;if(sample.seen>5){sample.times.push(returned-started);sample.hits+=hand?1:0;}if(sample.times.length>=20&&returned-sample.started>=4000)sample.finish();}
    if(canvas.width!==video.videoWidth||canvas.height!==video.videoHeight){canvas.width=video.videoWidth;canvas.height=video.videoHeight;}
    ctx.clearRect(0,0,canvas.width,canvas.height);
    statsFrames++;inferenceTotal+=ms;prepTotal+=prep;roundTotal+=round;ageTotal+=age;const completed=performance.now(),elapsed=completed-statsAt;
    if(elapsed>=1000){text('rate',(statsFrames*1000/elapsed).toFixed(1)+' tracking fps · '+Math.round(inferenceTotal/statsFrames)+' ms MediaPipe');text('engine',engine+' · '+width+'×'+height+' · '+imagePath);text('timing','Prep '+(prepTotal/statsFrames).toFixed(1)+' ms · '+(client?'Worker round trip ':'Processing ')+(roundTotal/statsFrames).toFixed(1)+' ms · '+(useVideoCallback?'Observed frame delay ':'Sample-to-result ')+(ageTotal/statsFrames).toFixed(1)+' ms');statsAt=completed;statsFrames=0;inferenceTotal=0;prepTotal=0;roundTotal=0;ageTotal=0;}
    text('pose',hand?'Hand detected':'No hand');
    status(hand?'Tracking hand.':'Looking for a hand…');
    if(!hand)return;
    ctx.strokeStyle='#50d7c8';ctx.fillStyle='#fff';ctx.lineWidth=2;
    ctx.beginPath();for(const [a,b]of edges){ctx.moveTo(hand[a].x*canvas.width,hand[a].y*canvas.height);ctx.lineTo(hand[b].x*canvas.width,hand[b].y*canvas.height);}ctx.stroke();
    ctx.beginPath();for(const p of hand){ctx.moveTo(p.x*canvas.width+3,p.y*canvas.height);ctx.arc(p.x*canvas.width,p.y*canvas.height,3,0,Math.PI*2);}ctx.fill();
   }catch(e){if(token===generation){if(sample){sample.error=e.message;sample.finish();}else stop('Tracking stopped: '+e.message);}}
   finally{if(token===generation){inFlight=false;kick();}}
  }
  async function configure(config,token){
   busy=true;controls();
   while(inFlight&&token===generation)await new Promise(resolve=>setTimeout(resolve,8));
   if(token!==generation)throw new Error('Camera stopped');
   if(config.delegate!==delegate){
    const options={baseOptions:{delegate:config.delegate}};
    if(client)await client.request('settings',{options});else await model.setOptions(options);
    if(token!==generation)throw new Error('Camera stopped');
    delegate=config.delegate;
   }
   inputWidth=config.width;imagePath=config.path;engine=delegate+' · '+(client?'worker':'compatibility');
   reset();busy=false;controls();kick();
  }
  async function optimize(){
   if(benchmark){benchmark.cancelled=true;sample?.finish();return;}
   if(!stream||busy||paused)return;
   const token=generation,original={delegate,width:inputWidth,path:imagePath};
   const run={cancelled:false};benchmark=run;controls();
   const results=[],variants=[];
   for(const backend of (ios?['CPU']:[delegate,delegate==='GPU'?'CPU':'GPU']))for(const width of [480,320])for(const path of (client?['canvas','direct']:['canvas']))variants.push({delegate:backend,width,path});
   let selected=original,summary='Optimization cancelled; original settings restored.';
   try{
    for(const [i,variant] of variants.entries()){
     if(run.cancelled||token!==generation)break;
     text('benchmark','Test '+(i+1)+'/'+variants.length+': '+variant.delegate+' · '+variant.width+' px · '+variant.path+'. Keep your hand visible and move gently.');
     try{
      await configure(variant,token);
      if(run.cancelled||token!==generation)break;
      const data=await new Promise(resolve=>{
       const value={seen:0,hits:0,times:[],started:performance.now(),error:null};
       const timer=setTimeout(()=>value.finish(),12000);
       value.finish=()=>{clearTimeout(timer);if(sample===value)sample=null;resolve(value);};sample=value;
      });
      if(data.error)throw new Error(data.error);
      const sorted=data.times.slice().sort((a,b)=>a-b);
      results.push({...variant,samples:sorted.length,retention:sorted.length?data.hits/sorted.length:0,p90:sorted.length?sorted[Math.min(sorted.length-1,Math.floor(sorted.length*.9))]:Infinity});
     }catch(e){results.push({...variant,error:e.message});}
    }
    if(!run.cancelled&&token===generation){
     const valid=results.filter(r=>!r.error&&r.samples>=20),bestRetention=Math.max(0,...valid.map(r=>r.retention));
     const eligible=valid.filter(r=>r.retention>=Math.max(.85,bestRetention-.05)).sort((a,b)=>a.p90-b.p90);
     if(eligible.length){selected=eligible[0];summary='Selected '+selected.delegate+' · '+selected.width+' px · '+selected.path+' ('+Math.round(selected.retention*100)+'% hand detection, '+Math.round(selected.p90)+' ms p90 processing cycle). Settings apply until camera restart.';}
     else summary='No reliable winner: keep your hand visible and retry. Original settings restored.';
    }
   }finally{
    if(token===generation){
     try{await configure(selected,token);}
     catch(e){stop('Could not restore tracker: '+e.message);return;}
     benchmark=null;controls();kick();
     text('benchmark',summary);
     get('results').replaceChildren(...results.map(r=>{const cell=document.createElement('p');cell.textContent=r.delegate+'/'+r.width+'/'+r.path+' · '+(r.error?'failed':Math.round(r.retention*100)+'% · '+(Number.isFinite(r.p90)?Math.round(r.p90)+' ms p90':'no samples'));return cell;}));
    }
   }
  }
  get('optimize').onclick=optimize;
  get('limit').onchange=kick;
  get('start').onclick=start;get('stop').onclick=()=>stop('Camera stopped.',true);get('pause').onclick=()=>{if(paused){paused=false;reset();controls();status('Looking for a hand…');kick();}else pause();};
  get('confidence').onchange=async()=>{
   if(!stream){releasePrepared();text('startup','Tracker will prepare on Start.');return;}
   if((!model&&!client)||busy)return;
   const token=generation;busy=true;controls();
   try{const options={minHandDetectionConfidence:Number(get('confidence').value)/100};if(client)await client.request('settings',{options});else await model.setOptions(options);}
   catch(e){if(token===generation)status('Could not update confidence: '+e.message);}
   finally{if(token===generation){busy=false;controls();kick();}}
  };
  const visibility=()=>{if(document.hidden)stop('Camera stopped while the page was backgrounded. Tap Start to resume.');};
  const pagehide=()=>stop('Camera stopped.');
  document.addEventListener('visibilitychange',visibility);window.addEventListener('pagehide',pagehide);
  const observer=new MutationObserver(()=>{if(!widget.isConnected){cleanup();return;}if(widget.hidden&&(stream||busy||preparedTracker))stop('Camera stopped because the widget was minimized.');});
  observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
  const cleanup=()=>{clearInterval(progressTimer);disposed=true;stop();observer.disconnect();document.removeEventListener('visibilitychange',visibility);window.removeEventListener('pagehide',pagehide);};
  if(window.isSecureContext&&window.Worker&&window.OffscreenCanvas&&window.createImageBitmap&&!document.hidden){
   prepareTracker().then(()=>{if(!disposed&&!stream&&!busy&&preparedTracker)text('startup','Tracker ready · camera starts on tap');}).catch(()=>{if(!disposed&&!stream&&!busy)text('startup','Tracker will retry on Start.');});
  }else text('startup','Tracker prepares on Start.');
  return cleanup;
 }
 return {render,mount};
})();
