// Simulated DOM only: not a browser, layout engine, or real camera test.
const fs=require('fs'),path=require('path'),assert=require('assert');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const errors=[];
const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('navigation'))errors.push(e.message);});
const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'http://localhost:8765/HUB_Gestures/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window;
Object.defineProperty(w,'innerWidth',{value:Number(process.argv[2])||1280});
w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){},addListener(){}});
w.ResizeObserver=class{observe(){}unobserve(){}disconnect(){}};
w.IntersectionObserver=class{observe(){}disconnect(){}};
w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){},arc(){},fill(){}});
w.HTMLElement.prototype.scrollBy=function(){};
w.HTMLElement.prototype.scrollTo=function(){};
w.indexedDB={open(){
 const req={};
 setTimeout(()=>{
  req.result={transaction(){return {objectStore(){return {get(){const x={result:null};setTimeout(()=>x.onsuccess?.(),0);return x;}};}};},close(){}};
  req.onsuccess?.();
 },0);
 return req;
}};
w.localStorage.setItem('hub-widget-ids','["widget99"]');
w.localStorage.setItem('hub-accent','#123456');
try{
 w.eval(fs.readFileSync(path.join(root,'gestures-widget.js'),'utf8'));
 w.eval(fs.readFileSync(path.join(root,'hub.js'),'utf8'));
 const widgets=w.document.querySelectorAll('.widget');
 assert.equal(widgets.length,1);assert.equal(widgets[0].dataset.contentType,'gestures');
 assert.equal(w.document.querySelectorAll('.widget-library-item').length,1);
 assert.equal(w.localStorage.getItem('hub-widget-ids'),'["widget99"]');
 assert.equal(w.localStorage.getItem('hub-accent'),'#123456');
 assert.equal(w.document.querySelectorAll('iframe').length,0);
 w.document.querySelector('.widget-focus-button').click();
 assert(w.document.querySelector('.widget').classList.contains('focused'));
 w.document.querySelector('.widget-focus-button').click();
 assert.equal(w.document.querySelectorAll("[data-g-card]").length,0);
 assert.equal(w.document.querySelector(".gestures-app summary").textContent,"Tracking settings");
 for(const name of ['capture','timing','benchmark','results'])assert.equal(w.document.querySelector('[data-g="'+name+'"]').closest('details'),null,'Diagnostics must remain visible with settings closed');
 w.document.querySelector('[data-g="start"]').click();
 assert.match(w.document.querySelector('[data-g="status"]').textContent,/HTTPS or localhost/);
 setTimeout(()=>{try{assert.deepEqual(errors,[]);console.log('PASS at width '+w.innerWidth+': native single-widget startup, focus toggle, tracking-only controls, no iframe, isolated storage, unsupported-camera message. Simulated DOM only.');}catch(e){console.error(e);process.exitCode=1;}finally{w.close();}},1100);
}catch(e){console.error(e);w.close();process.exitCode=1;}
