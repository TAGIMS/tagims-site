// Simulated startup regression; actual camera/model inference is not emulated.
const fs=require('fs'),path=require('path'),assert=require('assert');
const {JSDOM}=require('jsdom');
const source=fs.readFileSync(path.resolve(__dirname,'../gestures-widget.js'),'utf8');
async function check(url,expected,workerMode=false){
 const dom=new JSDOM('<body><section class="widget"></section></body>',{url,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;let stopped=0,options,nextFrame,detected=0,visible=true,actions=0,cameraRequests=0,modelLoads=0;
 const scheduler=workerMode==='scheduler';let clock=0,nextVideo,presentedFrames=0;
 if(scheduler){Object.defineProperty(w.performance,'now',{value:()=>clock});w.HTMLVideoElement.prototype.requestVideoFrameCallback=fn=>{nextVideo=fn;return 1;};w.HTMLVideoElement.prototype.cancelVideoFrameCallback=()=>{nextVideo=null;};}
 w.requestAnimationFrame=fn=>{nextFrame=fn;return 1;};w.cancelAnimationFrame=()=>{nextFrame=null;};
 w.document.addEventListener('gestures:action',()=>actions++);
 Object.defineProperty(w,'isSecureContext',{value:true});
 w.HTMLCanvasElement.prototype.getContext=()=>({drawImage(){},clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){}});
 w.HTMLMediaElement.prototype.play=async()=>{};
 const track={stop(){stopped++;},addEventListener(){}};
 Object.defineProperty(w.navigator,'mediaDevices',{value:{getUserMedia:async()=>{cameraRequests++;return {getTracks:()=>[track],getVideoTracks:()=>[track]};}}});
 w.__load=async()=>({FilesetResolver:{forVisionTasks:async()=>({})},HandLandmarker:{createFromOptions:async(files,opts)=>{options=opts;if(workerMode==='cpu'&&opts.baseOptions.delegate==='GPU')throw new Error('GPU unavailable');return {close(){},setOptions:async o=>{if(o.baseOptions)options.baseOptions={...options.baseOptions,...o.baseOptions};},detectForVideo(image){detected++;if(scheduler)clock+=options.baseOptions.delegate==='CPU'?4:8;return {landmarks:visible&&(!scheduler||image.width!==320)?[Array.from({length:21},(_,i)=>({x:.2+i*.02,y:.4}))]:[]};}};}}});
 let workerFrames=0,active=0,maxActive=0;
 if(workerMode){
  // Execute the actual embedded worker message handler with mocked model APIs.
  const vm=require('vm');let blobSource;
  w.Blob=class{constructor(parts){blobSource=parts.join('');}};
  w.URL.createObjectURL=()=> 'blob:test';w.URL.revokeObjectURL=()=>{};
  w.OffscreenCanvas=class{};
  w.createImageBitmap=async(src,opts)=>({width:opts?.resizeWidth||src.width,close(){}});
  w.Worker=class{
   constructor(){
    if(workerMode==='failed')throw new Error('Worker unavailable');
    const self={postMessage:data=>{if(data.value?.hand!==undefined||data.value?.ms!==undefined)active--;if(!this.dead)this.onmessage?.({data});}};
    this.scope=self;
    vm.runInNewContext(blobSource,{self,window:w,OffscreenCanvas:w.OffscreenCanvas,performance:w.performance});
   }
   postMessage(data){if(data.type==='detect'){workerFrames++;active++;maxActive=Math.max(maxActive,active);}setTimeout(()=>{if(!this.dead)this.scope.onmessage({data});},1);}
   terminate(){this.dead=true;}
  };
 }
 try{
  w.eval(source.replaceAll('import(', 'window.__load('));
  const widget=w.document.querySelector('.widget');widget.append(w.GesturesWidget.render());
  const cleanup=w.GesturesWidget.mount(widget);
  await new Promise(resolve=>setTimeout(resolve,20));assert.equal(cameraRequests,0,'Prewarming cannot request camera access');
  if(workerMode)assert(options,'Model preparation should begin before Start');
  widget.querySelector('[data-g=start]').click();
  await new Promise(resolve=>setTimeout(resolve,20));
  assert.equal(options.baseOptions.modelAssetPath,expected);
  assert.equal(stopped,0,'Successful initialization must keep the camera running');
  assert.match(widget.querySelector('[data-g=status]').textContent,/Looking for a hand/);
  const video=widget.querySelector('video'),pause=widget.querySelector('[data-g=pause]');
  Object.defineProperties(video,{readyState:{value:4},videoWidth:{value:640},videoHeight:{value:480}});
  assert.equal(widget.querySelector('[data-g=limit]').value,'24');
  const frame=async t=>{video.currentTime=t/1000;if(scheduler){clock=t;assert(nextVideo);nextVideo(t,{mediaTime:t/1000,presentedFrames:++presentedFrames});await new Promise(r=>setTimeout(r,6));}else{assert(nextFrame);await nextFrame(t);}};
  for(let t=100;t<=10000;t+=100)await frame(t);
  assert.equal(detected,100);assert.equal(pause.textContent,'Pause');assert.equal(stopped,0);assert.equal(actions,0);
  visible=false;await frame(10100);assert.equal(widget.querySelector('[data-g=pose]').textContent,'No hand');
  visible=true;await frame(10200);assert.equal(widget.querySelector('[data-g=pose]').textContent,'Hand detected');
  await widget.querySelector('[data-g=confidence]').onchange();await frame(10300);assert.equal(pause.textContent,'Pause');
  pause.click();const before=detected;await frame(10400);assert.equal(detected,before);
  pause.click();await frame(10500);assert.equal(detected,before+1);assert.equal(stopped,0);
  if(scheduler){
   assert.match(widget.querySelector('[data-g=startup]').textContent,/after camera preview/);
   const originalOptions=options;widget.querySelector('[data-g=stop]').click();
   assert.equal(stopped,1);widget.querySelector('[data-g=start]').click();await new Promise(r=>setTimeout(r,20));
   assert.strictEqual(options,originalOptions,'Warm restart should reuse initialized model');await frame(10700);await frame(11800);
   assert.match(widget.querySelector('[data-g=capture]').textContent,/Camera delivery/);
   assert.match(widget.querySelector('[data-g=timing]').textContent,/Worker round trip/);
   const button=widget.querySelector('[data-g=optimize]');let t=12000;
   async function completeBenchmark(){let done=false;const task=button.onclick().then(()=>done=true);for(let i=0;i<500&&!done;i++){await frame(t);t+=200;}assert(done,'Benchmark must finish');await task;}
   await completeBenchmark();assert.match(widget.querySelector('[data-g=benchmark]').textContent,/Selected CPU · 480 px/,'Reject faster low-retention input');
   visible=false;await completeBenchmark();assert.match(widget.querySelector('[data-g=benchmark]').textContent,/No reliable winner/);
   const cancelled=button.onclick();await button.onclick();await cancelled;assert.match(widget.querySelector('[data-g=benchmark]').textContent,/cancelled/);
   visible=true;await frame(t+200);assert.equal(pause.textContent,'Pause');assert.equal(maxActive,1);
   const stopping=button.onclick();widget.querySelector('[data-g=stop]').click();await stopping;assert.equal(stopped,2);
   cleanup();console.log('PASS: video-frame scheduling, timings, 24 FPS default, benchmark winner/retention filtering, no-hand rejection, cancel and Stop. Simulated only.');return;
  }
  if(workerMode&&workerMode!=='failed'){
   assert.match(widget.querySelector('[data-g=engine]').textContent,/worker/);
   if(workerMode==='cpu')assert.match(widget.querySelector('[data-g=engine]').textContent,/CPU/);
   const pending=frame(10600);await frame(10700);pause.click();await pending;
   assert.equal(widget.querySelector('[data-g=pose]').textContent,'Paused','Late results cannot undo manual pause');
   pause.click();await frame(10800);assert(workerFrames>100);assert.equal(maxActive,1,'Never queue inference frames');
   const late=frame(10900);widget.querySelector('[data-g=stop]').click();await late;
   assert.equal(widget.querySelector('[data-g=pose]').textContent,'No hand');
  }
  if(!workerMode||workerMode==='failed')widget.querySelector('[data-g=stop]').click();assert.equal(stopped,1);
  cleanup();console.log('PASS: '+new URL(url).protocol+' worker='+workerMode+' startup, continuous tracking, reacquisition, manual pause/resume, and Stop (mocked dependencies).');
 }finally{w.close();}
}
(async()=>{for(const worker of [false,true,'cpu','failed']){await check('file:///G:/PROJECT_Gestures/HUB_Gestures/index.html','https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',worker);await check('http://localhost:8765/HUB_Gestures/','http://localhost:8765/hand_landmarker.task',worker);}await check('http://localhost:8765/HUB_Gestures/','http://localhost:8765/hand_landmarker.task','scheduler');})().catch(e=>{console.error(e);process.exitCode=1;});
