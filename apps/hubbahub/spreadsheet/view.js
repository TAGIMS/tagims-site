/* Embeddable view: create({model, storageKey, onChange}) returns a DOM element.
 * Storage is optional; all event handlers belong to the returned element. */
(function () {
  'use strict';
  const api=window.HubSpreadsheet;
  let selectedView=null;
  document.addEventListener('pointerdown',event=>{
    if(selectedView && (!selectedView.contains(event.target)||!event.target.closest('.ss-grid,.ss-grow,.ss-formula,.ss-toolbar,.ss-format-toolbar,.ss-color-popup'))){selectedView.classList.remove('ss-table-selected');selectedView.querySelector('.ss-color-popup')?.setAttribute('hidden','');selectedView=null;}
  });
  api.create=function ({model,storageKey,onChange}={}) {
    let initial, storageWarning='';
    if(storageKey) try { const raw=localStorage.getItem(storageKey); if(raw) { initial=JSON.parse(raw); if(![1,2].includes(initial.version)) throw new Error('version'); } }
    catch (_) { initial=undefined;storageWarning='Saved sheet could not be loaded. Changes are not saved until you reload or use a different sheet.'; }
    let sheet=model || new api.Sheet(initial), active={r:0,c:0}, editor=null, undo=[],redo=[];
    let anchor={r:0,c:0},selectionMode='cell',headerDrag=null,dragOriginal=null;
    const root=document.createElement('section');
    root.className='ss-root hub-data-widget';
    root.setAttribute('aria-label','Spreadsheet');
    function reveal(){if(selectedView!==root)selectedView?.classList.remove('ss-table-selected');selectedView=root;root.classList.add('ss-table-selected');}
    root.addEventListener('pointerdown',event=>{if(event.target.closest('.ss-grid,.ss-grow'))reveal();});
    root.addEventListener('focusin',event=>{if(event.target.closest('.ss-grid,.ss-grow'))reveal();});
    root.addEventListener('focusout',event=>{if(event.relatedTarget&&!root.contains(event.relatedTarget)){root.classList.remove('ss-table-selected');if(selectedView===root)selectedView=null;}});
    root.innerHTML='<div class="ss-toolbar"><strong>Spreadsheet</strong><button type="button" data-action="undo" title="Undo (Ctrl+Z)">Undo</button><button type="button" data-action="redo" title="Redo (Ctrl+Shift+Z)">Redo</button></div><div class="ss-formula"><output class="ss-address">A1</output><span aria-hidden="true">ƒx</span><input class="ss-formula-input" aria-label="Cell value or formula" spellcheck="false" maxlength="2000" placeholder="Value or formula, e.g. =SUM(A1:A10)"></div><div class="ss-scroll"><table class="ss-grid" role="grid" aria-label="Spreadsheet cells"></table></div><div class="ss-footer"><span class="ss-status" role="status" aria-live="polite"></span><span>Type to replace · F2 to edit · Enter ↓ · Tab → · Esc cancels</span></div>';
    const grid=root.querySelector('.ss-grid'),scroller=root.querySelector('.ss-scroll'),bar=root.querySelector('.ss-formula-input'),status=root.querySelector('.ss-status');
    const formulaPopup=root.querySelector('.ss-formula');formulaPopup.hidden=true;formulaPopup.setAttribute('role','dialog');formulaPopup.setAttribute('aria-label','Edit cell formula');
    formulaPopup.insertAdjacentHTML('beforeend','<button type="button" data-formula="save" aria-label="Save formula">✓</button><button type="button" data-formula="cancel" aria-label="Cancel formula">×</button>');
    formulaPopup.querySelectorAll('button').forEach(button=>{button.addEventListener('pointerdown',e=>e.preventDefault());button.addEventListener('click',()=>{commit(button.dataset.formula==='cancel');select(active.r,active.c);});});

    const stage=document.createElement('div');stage.className='ss-stage';scroller.append(stage);stage.append(grid);
    const growth={};
    for(const axis of ['row','column']) {const button=document.createElement('button');button.type='button';button.className='ss-grow ss-grow-'+axis;button.dataset.grow=axis;button.textContent='⠿';button.title=`Drag ${axis==='row'?'down':'right'} to add ${axis}s`;button.setAttribute('aria-label',`Add ${axis}s: drag ${axis==='row'?'down':'right'} or press ${axis==='row'?'Arrow Down':'Arrow Right'}`);stage.append(button);growth[axis]=button;}
    const growthPreview=document.createElement('output');growthPreview.className='ss-growth-preview';growthPreview.hidden=true;stage.append(growthPreview);
    const deleteButtons={};
    for(const axis of ['row','column']) {const button=document.createElement('button');button.type='button';button.className='ss-delete-axis';button.dataset.action='delete-'+axis;button.textContent='×';button.draggable=false;button.hidden=true;button.title=`Delete selected ${axis}s`;button.setAttribute('aria-label',`Delete selected ${axis}s`);deleteButtons[axis]=button;}
    const controls=document.createElement('div');controls.className='ss-format-toolbar';
    controls.innerHTML='<label>Fill <input type="color" data-color="background" value="#365b80" aria-label="Selection fill color"></label><button type="button" data-action="fill">Apply fill</button><label>Text <input type="color" data-color="color" value="#ffffff" aria-label="Selection text color"></label><button type="button" data-action="text">Apply text</button><button type="button" data-action="clear-colors">Reset colors</button>';
    root.querySelector('.ss-toolbar').after(controls);
    controls.querySelectorAll('[data-action="fill"],[data-action="text"]').forEach(button=>button.remove());
    const toolbar=root.querySelector('.ss-toolbar');controls.prepend(toolbar.querySelector('strong'));controls.append(...toolbar.querySelectorAll('button'));toolbar.remove();
    controls.querySelector('strong').after(controls.querySelector('[data-action="undo"]'),controls.querySelector('[data-action="redo"]'));
    const toolbarGrip=document.createElement('button');toolbarGrip.type='button';toolbarGrip.className='ss-toolbar-grip';toolbarGrip.textContent='⠿';toolbarGrip.title='Drag formatting toolbar out of the way';toolbarGrip.setAttribute('aria-label','Move formatting toolbar');controls.prepend(toolbarGrip);
    toolbarGrip.addEventListener('pointerdown',event=>{event.preventDefault();event.stopPropagation();const box=controls.getBoundingClientRect(),host=root.getBoundingClientRect(),x=event.clientX,y=event.clientY;toolbarGrip.setPointerCapture(event.pointerId);
      const move=e=>{controls.classList.add('ss-toolbar-moved');controls.style.setProperty('--ss-toolbar-x',Math.max(4,Math.min(root.clientWidth-controls.offsetWidth-4,box.left-host.left+e.clientX-x))+'px');controls.style.setProperty('--ss-toolbar-y',Math.max(4,Math.min(root.clientHeight-controls.offsetHeight-4,box.top-host.top+e.clientY-y))+'px');positionColorPopup();};
      const stop=()=>{toolbarGrip.removeEventListener('pointermove',move);toolbarGrip.removeEventListener('pointerup',stop);toolbarGrip.removeEventListener('pointercancel',stop);};toolbarGrip.addEventListener('pointermove',move);toolbarGrip.addEventListener('pointerup',stop);toolbarGrip.addEventListener('pointercancel',stop);
    });
    const controlIcons={undo:'<path d="m8 5-5 5 5 5"/><path d="M3 10h10a7 7 0 0 1 7 7v2"/>',redo:'<path d="m16 5 5 5-5 5"/><path d="M21 10H11a7 7 0 0 0-7 7v2"/>','clear-colors':'<path d="m14 3 7 7-10 10H6l-4-4L14 3Z"/><path d="m8 10 7 7M11 20h10"/>'};
    for(const [action,paths] of Object.entries(controlIcons)){const button=controls.querySelector(`[data-action="${action}"]`);button.classList.add('ss-icon-control');button.setAttribute('aria-label',action==='clear-colors'?'Reset selection colors':action==='undo'?'Undo':'Redo');if(action==='clear-colors')button.title='Reset selection colors';button.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;}
    controls.querySelectorAll('label').forEach(label=>{label.classList.add('ss-color-control');label.title=label.querySelector('input').getAttribute('aria-label');label.insertAdjacentHTML('beforeend','<svg class="ss-color-chevron" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="m3 4.5 3 3 3-3"/></svg>');});
    const colorPopup=document.createElement('div');colorPopup.className='ss-color-popup';colorPopup.hidden=true;colorPopup.setAttribute('role','dialog');colorPopup.setAttribute('aria-label','Selection color');
    colorPopup.innerHTML='<div class="color-wheel" tabindex="0" role="slider" aria-label="Hue and saturation" aria-valuemin="0" aria-valuemax="360"><span class="color-wheel-cursor"></span></div><label>Light <input type="range" min="0" max="100" value="100" aria-label="Color brightness"></label><label>Hex <input class="ss-hex" maxlength="7" aria-label="Hex color"></label><button type="button" aria-label="Close color picker">×</button>';
    root.append(colorPopup);let colorInput=null,colorHue=0,colorSat=0,colorValue=1,colorUndoSaved=false;
    function positionColorPopup(){
      if(colorPopup.hidden)return;
      const host=root.getBoundingClientRect(),barBox=controls.getBoundingClientRect(),scaleX=host.width/root.clientWidth||1,scaleY=host.height/root.clientHeight||1;
      const x=(barBox.left-host.left)/scaleX,y=(barBox.top-host.top)/scaleY,bottom=y+controls.offsetHeight,gap=6;
      const below=Math.max(0,root.clientHeight-bottom-gap-4),above=Math.max(0,y-gap-4);
      colorPopup.style.maxHeight=Math.max(32,Math.max(below,above))+'px';
      const height=colorPopup.offsetHeight,placeBelow=below>=height||below>=above;
      colorPopup.style.left=Math.max(4,Math.min(x,root.clientWidth-colorPopup.offsetWidth-4))+'px';
      colorPopup.style.right='auto';colorPopup.style.top=(placeBelow?bottom+gap:Math.max(4,y-gap-height))+'px';
    }
    const pickerLayoutObserver=new ResizeObserver(positionColorPopup);pickerLayoutObserver.observe(root);pickerLayoutObserver.observe(controls);
    const wheel=colorPopup.querySelector('.color-wheel'),light=colorPopup.querySelector('input[type="range"]'),hex=colorPopup.querySelector('.ss-hex');
    function showColor(value){
      const channels=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16)/255),max=Math.max(...channels),min=Math.min(...channels),d=max-min,[r,g,b]=channels;
      colorValue=max;colorSat=max?d/max:0;colorHue=!d?0:max===r?((g-b)/d+6)%6*60:max===g?((b-r)/d+2)*60:((r-g)/d+4)*60;
      light.value=Math.round(max*100);hex.value=value;paintWheel();
    }
    function paintWheel(){wheel.style.setProperty('--picker-value',colorValue);const cursor=wheel.querySelector('span'),angle=colorHue*Math.PI/180;cursor.style.left=(50+Math.sin(angle)*colorSat*50)+'%';cursor.style.top=(50-Math.cos(angle)*colorSat*50)+'%';wheel.setAttribute('aria-valuenow',Math.round(colorHue));wheel.setAttribute('aria-valuetext',`${Math.round(colorHue)} degrees, ${Math.round(colorSat*100)}% saturation`);}
    function applyWheel(){const f=n=>{const k=(n+colorHue/60)%6;return Math.round((colorValue-colorValue*colorSat*Math.max(0,Math.min(k,4-k,1)))*255).toString(16).padStart(2,'0');};const value='#'+f(5)+f(3)+f(1);hex.value=value;colorInput.value=value;colorInput.dispatchEvent(new Event('change',{bubbles:true}));paintWheel();}
    controls.querySelectorAll('[data-color]').forEach(input=>input.addEventListener('click',event=>{event.preventDefault();reveal();colorInput=input;colorUndoSaved=false;colorPopup.hidden=false;showColor(input.value);positionColorPopup();}));
    colorPopup.querySelector('button').onclick=()=>{colorPopup.hidden=true;colorInput?.focus();};
    root.addEventListener('pointerdown',event=>{if(!event.target.closest('.ss-color-popup,[data-color]'))colorPopup.hidden=true;});
    light.addEventListener('input',()=>{colorValue=+light.value/100;applyWheel();});
    hex.addEventListener('input',()=>{if(/^#[\da-f]{6}$/i.test(hex.value)){const value=hex.value;showColor(value);colorInput.value=value;colorInput.dispatchEvent(new Event('change',{bubbles:true}));}});
    wheel.addEventListener('keydown',event=>{if(!event.key.startsWith('Arrow'))return;event.preventDefault();if(event.key==='ArrowLeft')colorHue=(colorHue+355)%360;if(event.key==='ArrowRight')colorHue=(colorHue+5)%360;if(event.key==='ArrowUp')colorSat=Math.min(1,colorSat+.05);if(event.key==='ArrowDown')colorSat=Math.max(0,colorSat-.05);applyWheel();});
    wheel.addEventListener('pointerdown',event=>{event.preventDefault();wheel.focus();wheel.setPointerCapture(event.pointerId);const pick=e=>{const b=wheel.getBoundingClientRect(),x=(e.clientX-b.x-b.width/2)/(b.width/2),y=(e.clientY-b.y-b.height/2)/(b.height/2);colorHue=(Math.atan2(x,-y)*180/Math.PI+360)%360;colorSat=Math.min(1,Math.hypot(x,y));applyWheel();};const stop=()=>{wheel.removeEventListener('pointermove',pick);wheel.removeEventListener('pointerup',stop);wheel.removeEventListener('pointercancel',stop);};wheel.addEventListener('pointermove',pick);wheel.addEventListener('pointerup',stop);wheel.addEventListener('pointercancel',stop);pick(event);});
    colorPopup.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();colorPopup.hidden=true;colorInput?.focus();}});

    grid.setAttribute('aria-multiselectable','true');
    root.querySelector('.ss-footer>span:last-child').textContent='Drag edge grips to add · Select row/column headers for × delete · Drag headers to move';
    let cells=[];
    const announce=message=>{status.textContent=message;};
    const remember=()=>{undo.push(sheet.snapshot());if(undo.length>50)undo.shift();redo=[];};
    function save() {
      if(storageWarning) announce(storageWarning);
      else if(storageKey) {
        try { localStorage.setItem(storageKey,JSON.stringify(sheet.snapshot())); announce('Saved on this device'); }
        catch (_) { announce('Not saved — browser storage is unavailable or full. Keep this window open.'); }
      } else announce('Updated');
      onChange?.(sheet.snapshot());
      root.querySelector('[data-action="undo"]').disabled=!undo.length;
      root.querySelector('[data-action="redo"]').disabled=!redo.length;
    }
    function display(value) { return typeof value==='boolean'?(value?'TRUE':'FALSE'):String(value); }
    function refresh() {
      for(let r=0;r<sheet.rows;r++) for(let c=0;c<sheet.cols;c++) {
        const td=cells[r][c],value=display(sheet.value(r,c));
        td.firstChild.textContent=value;
        td.classList.toggle('ss-error',value.startsWith('#') && sheet.raw(r,c).startsWith('='));
        td.classList.toggle('ss-number',typeof sheet.value(r,c)==='number');
        td.title=sheet.raw(r,c).startsWith('=')?sheet.raw(r,c):value;
        td.setAttribute('aria-label',`${api.address(r,c)}: ${value || 'blank'}`);
        const style=sheet.styles[api.address(r,c)] || {};td.style.backgroundColor=style.background || '';td.style.color=style.color || '';
      }
      if(editor!==bar) bar.value=sheet.raw(active.r,active.c);
    }
    function range() {
      return {r1:selectionMode==='column'||selectionMode==='all'?0:Math.min(anchor.r,active.r),r2:selectionMode==='column'||selectionMode==='all'?sheet.rows-1:Math.max(anchor.r,active.r),c1:selectionMode==='row'||selectionMode==='all'?0:Math.min(anchor.c,active.c),c2:selectionMode==='row'||selectionMode==='all'?sheet.cols-1:Math.max(anchor.c,active.c)};
    }
    function paintSelection() {
      const box=range();
      for(let r=0;r<sheet.rows;r++)for(let c=0;c<sheet.cols;c++) {const td=cells[r][c];td.tabIndex=r===active.r&&c===active.c?0:-1;td.setAttribute('aria-selected',r>=box.r1&&r<=box.r2&&c>=box.c1&&c<=box.c2?'true':'false');td.classList.toggle('ss-active',r===active.r&&c===active.c);}
      grid.querySelectorAll('[data-header]').forEach(th=>{const n=+th.dataset.index;th.classList.toggle('ss-header-selected',th.dataset.header==='row'?box.c1===0&&box.c2===sheet.cols-1&&n>=box.r1&&n<=box.r2:box.r1===0&&box.r2===sheet.rows-1&&n>=box.c1&&n<=box.c2);});
      root.querySelector('.ss-address').textContent=box.r1===box.r2&&box.c1===box.c2?api.address(active.r,active.c):`${api.address(box.r1,box.c1)}:${api.address(box.r2,box.c2)}`;
      for(const axis of ['row','column']) {
        const button=deleteButtons[axis],index=axis==='row'?active.r:active.c;
        button.hidden=selectionMode!==axis;
        button.disabled=axis==='row'?box.r2-box.r1+1>=sheet.rows:box.c2-box.c1+1>=sheet.cols;
        grid.querySelector(`[data-header="${axis}"][data-index="${index}"]`).append(button);
      }
    }
    function select(r,c,focus=true,extend=false,mode='cell') {
      commit();
      active={r:Math.max(0,Math.min(sheet.rows-1,r)),c:Math.max(0,Math.min(sheet.cols-1,c))};
      if(!extend||mode!==selectionMode)anchor={...active};selectionMode=mode;
      const td=cells[active.r][active.c];paintSelection();
      bar.value=sheet.raw(active.r,active.c);
      if(focus) {td.focus({preventScroll:true});td.scrollIntoView({block:'nearest',inline:'nearest'});}
    }
    function size() {
      root.style.setProperty('--ss-header-height',sheet.heights[0]+'px');
      grid.style.width=`calc(var(--ss-index-width) + ${sheet.widths.reduce((a,b)=>a+b,0)}px)`;
      stage.style.width=(60+sheet.widths.reduce((a,b)=>a+b,0))+'px';
      grid.querySelectorAll('col').forEach((col,i)=>col.style.width=i?sheet.widths[i-1]+'px':'var(--ss-index-width)');
      grid.querySelectorAll('tbody tr').forEach((tr,r)=>{tr.style.height=sheet.heights[r]+'px';});
      let labelX=0,labelY=0;
      grid.querySelectorAll('[data-header="column"]').forEach((th,c)=>{th.style.left=labelX+'px';th.style.width=sheet.widths[c]+'px';labelX+=sheet.widths[c];});
      grid.querySelectorAll('[data-header="row"]').forEach((th,r)=>{th.style.top=labelY+'px';th.style.height=sheet.heights[r]+'px';labelY+=sheet.heights[r];});
      grid.querySelectorAll('[data-resize]').forEach(handle=>{ const axis=handle.dataset.resize,index=+handle.dataset.index;handle.setAttribute('aria-valuenow',(axis==='column'?sheet.widths:sheet.heights)[index]); });
    }
    function handle(axis,index) {
      const el=document.createElement('span');el.className='ss-resize ss-resize-'+axis;
      Object.assign(el.dataset,{resize:axis,index});
      el.tabIndex=-1;el.setAttribute('role','separator');el.setAttribute('aria-label',`Resize ${axis} ${axis==='column'?api.column(index):index+1}`);
      el.setAttribute('aria-orientation',axis==='column'?'vertical':'horizontal');
      el.setAttribute('aria-valuemin',axis==='column'?56:24);el.setAttribute('aria-valuemax',axis==='column'?600:300);
      return el;
    }
    function build() {
      grid.replaceChildren();cells=[];
      grid.setAttribute('aria-rowcount',sheet.rows+1);grid.setAttribute('aria-colcount',sheet.cols+1);
      const cols=document.createElement('colgroup');
      for(let c=0;c<=sheet.cols;c++) cols.append(document.createElement('col'));
      grid.append(cols);
      const head=grid.createTHead().insertRow();const corner=document.createElement('th');corner.textContent='▦';corner.dataset.selectAll='true';corner.title='Select all cells';head.append(corner);
      for(let c=0;c<sheet.cols;c++) {const th=document.createElement('th');th.scope='col';th.textContent=api.column(c);th.dataset.header='column';th.dataset.index=c;th.draggable=true;th.title='Click to select column; drag to move';th.append(handle('column',c));head.append(th);}
      const body=grid.createTBody();
      for(let r=0;r<sheet.rows;r++) {
        const tr=body.insertRow(),th=document.createElement('th');th.scope='row';th.textContent=r+1;th.dataset.header='row';th.dataset.index=r;th.draggable=true;th.title='Click to select row; drag to move';th.append(handle('row',r));tr.append(th);cells[r]=[];
        for(let c=0;c<sheet.cols;c++) {const td=tr.insertCell();td.setAttribute('role','gridcell');td.setAttribute('aria-selected','false');td.tabIndex=-1;td.dataset.row=r;td.dataset.col=c;td.classList.toggle('ss-table-header-row',r===0);td.classList.toggle('ss-table-header-column',c===0);td.append(document.createElement('span'));cells[r][c]=td;}
      }
      size();refresh();select(active.r,active.c,false);
      // Grips remain available at the maximum size so inward deletion still works.
      root.querySelector('[data-action="undo"]').disabled=!undo.length;
      root.querySelector('[data-action="redo"]').disabled=!redo.length;
    }
    function start(value) {
      if(editor) return;
      const td=cells[active.r][active.c],input=document.createElement('input');
      input.className='ss-editor';input.setAttribute('aria-label',`Edit ${api.address(active.r,active.c)}`);input.spellcheck=false;input.maxLength=2000;
      input.value=value===undefined?sheet.raw(active.r,active.c):value;editor=input;
      td.append(input);input.focus();input.setSelectionRange(input.value.length,input.value.length);
    }
    function commit(cancel=false) {
      if(!editor) return;
      const input=editor;editor=null;
      if(!cancel && input.value!==sheet.raw(active.r,active.c)) {remember();sheet.set(active.r,active.c,input.value);save();}
      if(input!==bar) input.remove();
      formulaPopup.hidden=true;
      refresh();
    }
    function openFormula() {
      const draft=editor?.value || sheet.raw(active.r,active.c),previous=editor;editor=null;
      if(previous&&previous!==bar)previous.remove();
      formulaPopup.hidden=false;bar.value=draft.startsWith('=')?draft:'=';editor=bar;
      bar.focus();bar.setSelectionRange(bar.value.length,bar.value.length);
    }
    function move(key,shift) {
      let {r,c}=active;
      if(key==='Tab') {const next=r*sheet.cols+c+(shift?-1:1);if(next<0 || next>=sheet.rows*sheet.cols)return false;r=Math.floor(next/sheet.cols);c=next%sheet.cols;}
      else if(key==='Enter') r+=shift?-1:1;
      else if(key==='ArrowDown') r++;
      else if(key==='ArrowUp') r--;
      else if(key==='ArrowLeft') c--;
      else if(key==='ArrowRight') c++;
      else return false;
      select(r,c,true,shift&&key.startsWith('Arrow'));return true;
    }
    function history(back) {
      commit();const from=back?undo:redo,to=back?redo:undo;if(!from.length)return;
      to.push(sheet.snapshot());sheet=new api.Sheet(from.pop());active.r=Math.min(active.r,sheet.rows-1);active.c=Math.min(active.c,sheet.cols-1);build();save();select(active.r,active.c);
    }
    root.addEventListener('click',event=>{
      const action=event.target.closest('[data-action]')?.dataset.action;
      if(action==='undo'||action==='redo')history(action==='undo');
      if(action==='delete-row'||action==='delete-column') {
        commit();const box=range(),axis=action==='delete-row'?'row':'column';if(selectionMode!==axis)return;remember();
        try {if(!sheet.deleteAxis(axis,axis==='row'?box.r1:box.c1,axis==='row'?box.r2:box.c2)){undo.pop();return;}active={r:Math.min(box.r1,sheet.rows-1),c:Math.min(box.c1,sheet.cols-1)};build();save();select(active.r,active.c);}
        catch (_) {undo.pop();announce('This change would exceed formula limits. No rows or columns changed.');}
      }
      if(['fill','text','clear-colors'].includes(action)) {commit();remember();sheet.format(range(),action==='clear-colors'?{background:null,color:null}:action==='fill'?{background:root.querySelector('[data-color="background"]').value}:{color:root.querySelector('[data-color="color"]').value});refresh();save();}
    });
    controls.addEventListener('change',event=>{const field=event.target.dataset.color;if(field){commit();if(colorPopup.hidden||!colorUndoSaved)remember();colorUndoSaved=true;sheet.format(range(),{[field]:event.target.value});refresh();save();}});
    grid.addEventListener('dblclick',event=>{if((event.target.closest('[data-row]')||document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-row]'))&&!event.target.closest('[data-header]'))start();});
    grid.addEventListener('focusin',event=>{const td=event.target.closest('[data-row]');if(td && event.target===td && (+td.dataset.row!==active.r || +td.dataset.col!==active.c))select(+td.dataset.row,+td.dataset.col,false);});
    root.addEventListener('focusout',event=>{if(event.target===editor)commit();});
    root.addEventListener('input',event=>{if(event.target===editor && editor!==bar)bar.value=editor.value;});
    root.addEventListener('keydown',event=>{
      event.stopPropagation();
      if(event.isComposing)return;
      const resize=event.target.closest('[data-resize]');
      if(resize && ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
        event.preventDefault();remember();const axis=resize.dataset.resize,index=+resize.dataset.index,list=axis==='column'?sheet.widths:sheet.heights;
        sheet.resize(axis,index,list[index]+(['ArrowRight','ArrowDown'].includes(event.key)?8:-8));size();save();return;
      }
      const inCell=event.target.closest('[data-row]');
      if(!inCell && event.target!==bar)return;
      if(editor) {
        if(event.key==='='&&editor!==bar){event.preventDefault();openFormula();return;}
        if(event.key==='Escape'){event.preventDefault();commit(true);select(active.r,active.c);return;}
        if(['Enter','Tab','ArrowUp','ArrowDown'].includes(event.key)) {commit();if(move(event.key,event.shiftKey))event.preventDefault();}
        return; // Left/right and native text editing shortcuts keep their normal behavior.
      }
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();history(!event.shiftKey);return;}
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='a'){event.preventDefault();select(active.r,active.c,true,false,'all');return;}
      if(event.code==='Space'&&(event.ctrlKey||event.metaKey||event.shiftKey)){event.preventDefault();select(active.r,active.c,true,false,event.shiftKey?'row':'column');return;}
      if(event.ctrlKey||event.metaKey||event.altKey)return;
      if(move(event.key,event.shiftKey)){event.preventDefault();return;}
      if(event.key==='F2'){event.preventDefault();start();}
      else if(event.key==='Backspace'||event.key==='Delete'){event.preventDefault();remember();const box=range();for(let r=box.r1;r<=box.r2;r++)for(let c=box.c1;c<=box.c2;c++)sheet.set(r,c,'');refresh();save();}
      else if(event.key.length===1){event.preventDefault();start(event.key);}
    });
    grid.addEventListener('copy',event=>{if(editor)return;event.preventDefault();const box=range(),rows=[];for(let r=box.r1;r<=box.r2;r++){const values=[];for(let c=box.c1;c<=box.c2;c++)values.push(sheet.raw(r,c));rows.push(values.join('\t'));}event.clipboardData.setData('text/plain',rows.join('\n'));});
    grid.addEventListener('paste',event=>{
      if(editor)return;event.preventDefault();
      const text=event.clipboardData.getData('text/plain');
      const rows=text.replace(/\r\n?/g,'\n').replace(/\n$/,'').split('\n').map(row=>row.split('\t'));
      const box=range();active={r:box.r1,c:box.c1};
      const height=active.r+rows.length,width=active.c+Math.max(...rows.map(row=>row.length));
      if(height>api.MAX_ROWS||width>api.MAX_COLS||rows.some(row=>row.some(value=>value.length>2000))){announce('Paste exceeds sheet or cell limits. No cells changed.');return;}
      remember();while(sheet.rows<height)sheet.addRow();while(sheet.cols<width)sheet.addColumn();
      rows.forEach((row,r)=>row.forEach((value,c)=>sheet.set(active.r+r,active.c+c,value)));build();save();select(active.r,active.c);
    });
    // Cell dragging selects a rectangle; headers use native drag/drop for reordering.
    grid.addEventListener('pointerdown',event=>{
      if(event.button!==0||event.target.closest('[data-resize],[data-action]')||event.target===editor)return;
      const header=event.target.closest('[data-header]');
      if(header){const axis=header.dataset.header,index=+header.dataset.index;select(axis==='row'?index:active.r,axis==='column'?index:active.c,true,event.shiftKey,axis);return;}
      if(event.target.closest('[data-select-all]')){event.preventDefault();select(active.r,active.c,true,false,'all');return;}
      const td=event.target.closest('[data-row]');if(!td)return;
      event.preventDefault();select(+td.dataset.row,+td.dataset.col,true,event.shiftKey);grid.setPointerCapture(event.pointerId);
      const drag=e=>{
        const bounds=scroller.getBoundingClientRect();
        if(e.clientY>bounds.bottom-15)scroller.scrollTop+=20;if(e.clientY<bounds.top+35)scroller.scrollTop-=20;
        if(e.clientX>bounds.right-15)scroller.scrollLeft+=20;if(e.clientX<bounds.left+50)scroller.scrollLeft-=20;
        const next=document.elementFromPoint(Math.max(bounds.left+46,Math.min(bounds.right-3,e.clientX)),Math.max(bounds.top+32,Math.min(bounds.bottom-3,e.clientY)))?.closest('[data-row]');
        if(next&&grid.contains(next))select(+next.dataset.row,+next.dataset.col,false,true);
      };
      const end=()=>{grid.removeEventListener('pointermove',drag);grid.removeEventListener('pointerup',end);grid.removeEventListener('pointercancel',end);grid.removeEventListener('lostpointercapture',end);if(grid.hasPointerCapture(event.pointerId))grid.releasePointerCapture(event.pointerId);cells[active.r][active.c].focus({preventScroll:true});};
      grid.addEventListener('pointermove',drag);grid.addEventListener('pointerup',end);grid.addEventListener('pointercancel',end);grid.addEventListener('lostpointercapture',end);
    });
    const clearDrop=()=>grid.querySelectorAll('.ss-drop-before,.ss-drop-after').forEach(th=>th.classList.remove('ss-drop-before','ss-drop-after'));
    grid.addEventListener('dragstart',event=>{const th=event.target.closest('[data-header]');if(!th)return;event.stopPropagation();headerDrag={axis:th.dataset.header,from:+th.dataset.index};event.dataTransfer.setData('application/x-hub-sheet-axis',JSON.stringify(headerDrag));event.dataTransfer.effectAllowed='move';});
    function dropPosition(event){const th=event.target.closest('[data-header]');if(!headerDrag||!th||th.dataset.header!==headerDrag.axis)return null;const b=th.getBoundingClientRect(),after=headerDrag.axis==='row'?event.clientY>b.y+b.height/2:event.clientX>b.x+b.width/2;return {th,after,boundary:+th.dataset.index+(after?1:0)};}
    grid.addEventListener('dragover',event=>{const drop=dropPosition(event);if(!drop)return;event.preventDefault();event.stopPropagation();event.dataTransfer.dropEffect='move';clearDrop();drop.th.classList.add(drop.after?'ss-drop-after':'ss-drop-before');});
    grid.addEventListener('drop',event=>{const drop=dropPosition(event);if(!drop)return;event.preventDefault();event.stopPropagation();const {axis,from}=headerDrag,to=drop.boundary-(from<drop.boundary?1:0);clearDrop();headerDrag=null;if(from===to)return;commit();remember();try{sheet.moveAxis(axis,from,to);active={r:axis==='row'?to:active.r,c:axis==='column'?to:active.c};build();save();select(active.r,active.c,true,false,axis);}catch(_){undo.pop();announce('Move exceeds formula limits. No cells moved.');}});
    grid.addEventListener('dragend',()=>{headerDrag=null;clearDrop();});
    grid.addEventListener('pointerdown',event=>{
      const target=event.target.closest('[data-resize]');if(!target||event.button!==0)return;
      event.preventDefault();event.stopPropagation();commit();target.focus({preventScroll:true});
      const axis=target.dataset.resize,index=+target.dataset.index,start=axis==='column'?event.clientX:event.clientY,original=(axis==='column'?sheet.widths:sheet.heights)[index];
      let changed=false;target.setPointerCapture(event.pointerId);
      const drag=e=>{if(!changed){remember();changed=true;}sheet.resize(axis,index,original+(axis==='column'?e.clientX:e.clientY)-start);size();};
      const end=()=>{target.removeEventListener('pointermove',drag);target.removeEventListener('pointerup',end);target.removeEventListener('pointercancel',end);target.removeEventListener('lostpointercapture',end);if(target.hasPointerCapture(event.pointerId))target.releasePointerCapture(event.pointerId);if(changed)save();};
      target.addEventListener('pointermove',drag);target.addEventListener('pointerup',end);target.addEventListener('pointercancel',end);target.addEventListener('lostpointercapture',end);
    });
    function grow(axis,count) {
      const remaining=axis==='row'?api.MAX_ROWS-sheet.rows:api.MAX_COLS-sheet.cols;count=Math.min(count,remaining);if(count<1)return;
      commit();remember();for(let i=0;i<count;i++)axis==='row'?sheet.addRow():sheet.addColumn();build();save();select(axis==='row'?sheet.rows-1:active.r,axis==='column'?sheet.cols-1:active.c);
    }
    for(const axis of ['row','column']) {
      const button=growth[axis];
      button.addEventListener('keydown',event=>{if(['Enter',' ',axis==='row'?'ArrowDown':'ArrowRight'].includes(event.key)){event.preventDefault();event.stopPropagation();if(dragOriginal)return;grow(axis,1);button.focus();}});
      button.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;event.preventDefault();event.stopPropagation();commit();button.focus({preventScroll:true});
        const start=axis==='row'?event.clientY:event.clientX,original=sheet,originalActive={...active},snapshot=sheet.snapshot(),length=axis==='row'?sheet.rows:sheet.cols,dimensions=axis==='row'?sheet.heights:sheet.widths;
        let delta=0,removed=0,added=false,preview=null,finished=false,lastSignature='';dragOriginal=original;
        button.setPointerCapture(event.pointerId);growthPreview.hidden=false;growthPreview.className='ss-growth-preview ss-growth-preview-'+axis;root.classList.add('ss-edge-dragging');
        const drag=e=>{
          delta=Math.round((axis==='row'?e.clientY:e.clientX)-start);removed=0;added=false;
          if(delta<-6){let consumed=0;for(let i=length-1;i>0;i--){if(-delta<consumed+dimensions[i]/2)break;consumed+=dimensions[i];removed++;}}
          const dimension=Math.max(axis==='row'?24:56,Math.min(axis==='row'?300:600,delta));
          added=delta>=6&&length<(axis==='row'?api.MAX_ROWS:api.MAX_COLS);
          const signature=added?'add'+dimension:'remove'+removed;if(signature!==lastSignature){
            lastSignature=signature;preview=new api.Sheet(snapshot);
            try {if(added){axis==='row'?preview.addRow():preview.addColumn();preview.resize(axis,length,dimension);}else if(removed)preview.deleteAxis(axis,length-removed,length-1);}
            catch(_){preview=new api.Sheet(snapshot);removed=0;lastSignature='';}
            sheet=preview;active={r:Math.min(originalActive.r,sheet.rows-1),c:Math.min(originalActive.c,sheet.cols-1)};build();
            if(added)grid.querySelectorAll(axis==='row'?`tbody tr:last-child td`:`[data-col="${length}"]`).forEach(cell=>cell.classList.add('ss-new-preview'));
            if(added)button.scrollIntoView({block:'nearest',inline:'nearest'});
          }
          root.classList.toggle('ss-shrink-preview',removed>0);
          growthPreview.textContent=added?`New ${axis} · ${dimension}px` : removed?`Remove ${removed} ${axis}${removed===1?'':'s'} · confirm on release` : 'Drag outward to add · inward to remove';
        };drag(event);
        const finish=e=>{
          if(finished)return;finished=true;
          button.removeEventListener('pointermove',drag);button.removeEventListener('pointerup',finish);button.removeEventListener('pointercancel',finish);button.removeEventListener('lostpointercapture',finish);button.removeEventListener('keydown',cancel);
          growthPreview.hidden=true;root.classList.remove('ss-edge-dragging','ss-shrink-preview');if(button.hasPointerCapture(event.pointerId))button.releasePointerCapture(event.pointerId);
          sheet=original;dragOriginal=null;active=originalActive;build();
          if(e.type!=='pointerup'){announce('Drag canceled');return;}
          if(added){remember();sheet=preview;build();save();select(axis==='row'?sheet.rows-1:active.r,axis==='column'?sheet.cols-1:active.c);}
          else if(removed){
            const populated=Object.entries(original.cells).filter(([ref,value])=>value!==''&&api.coordinates(ref)[axis==='row'?0:1]>=length-removed).length;
            if(!window.confirm(`Delete the last ${removed} ${axis}${removed===1?'':'s'}?\n\n${populated} nonempty cell${populated===1?'':'s'} will be removed, including any formulas. This can be undone.`)){announce('Deletion canceled — all cells kept');return;}
            remember();try{sheet.deleteAxis(axis,length-removed,length-1);active={r:Math.min(active.r,sheet.rows-1),c:Math.min(active.c,sheet.cols-1)};build();save();select(active.r,active.c);}catch(_){undo.pop();announce('Deletion exceeds formula limits. No cells deleted.');}
          }
        };
        const cancel=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finish(e);}};
        button.addEventListener('pointermove',drag);button.addEventListener('pointerup',finish);button.addEventListener('pointercancel',finish);button.addEventListener('lostpointercapture',finish);button.addEventListener('keydown',cancel);
      });
    }
    // The caller can snapshot or refresh externally supplied data without coupling to Hub windows.
    root.spreadsheet={get model(){return dragOriginal||sheet;},snapshot:()=>(dragOriginal||sheet).snapshot(),refresh,select,get selection(){return range();}};
    build();announce(storageWarning || (storageKey?'Saved locally · '+sheet.rows+' rows × '+sheet.cols+' columns':'Ready'));
    return root;
  };
})();
