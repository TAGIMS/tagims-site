/* HUB GUIDE =================================================================
 * FILE: src/widgets.js
 * Markup and sample content for nonfinancial widgets. Edit individual renderers here.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: MAKE WIDGET
     * Implementation of make Widget. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function makeWidget(className, markup) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ELEMENT
       * Defines element for the surrounding section.
       * ------------------------------------------------------------------- */
      const element = document.createElement('div');
      element.className = `${className} hub-data-widget`;
      element.innerHTML = markup;
      return element;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: EXPAND MOCK DATA
     * Implementation of expand Mock Data. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function expandMockData(items, count) {
      return Array.from({ length: count }, (_, index) => items[index % items.length]);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: INITIALIZE LIST SCROLLING
     * Implementation of initialize List Scrolling. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function initializeListScrolling(widget) {
      widget.querySelectorAll('.todo-list, .mail-list, .notes-grid, .project-list, .drive-list, .reminder-list, .quick-links, .bill-list, .space-readings, .phase-list, .radar-alerts').forEach(list => {
        list.classList.add('scrollable-list');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: START Y
         * Defines start Y for the surrounding section.
         * ------------------------------------------------------------------- */
        let startY = 0;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: START SCROLL
         * Defines start Scroll for the surrounding section.
         * ------------------------------------------------------------------- */
        let startScroll = 0;
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list.addEventListener('pointerdown', event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list.addEventListener('pointerdown', event => {
          if (event.button !== 0) return;
          if (event.target.closest('.todo-item')) return;
          startY = event.clientY;
          startScroll = list.scrollTop;
          list.classList.add('dragging');
          list.setPointerCapture(event.pointerId);
        });
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list.addEventListener('pointermove', event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list.addEventListener('pointermove', event => {
          if (!list.classList.contains('dragging')) return;
          list.scrollTop = startScroll - (event.clientY - startY);
        });
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: STOP
         * Defines stop for the surrounding section.
         * ------------------------------------------------------------------- */
        const stop = event => {
          list.classList.remove('dragging');
          if (list.hasPointerCapture?.(event.pointerId)) list.releasePointerCapture(event.pointerId);
        };
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list.addEventListener('pointerup', stop); — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list.addEventListener('pointerup', stop);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list.addEventListener('pointercancel', stop); — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list.addEventListener('pointercancel', stop);
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: WEATHER ICON
     * Implementation of weather Icon. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function weatherIcon(kind, className = '') {
      if (kind === 'cloudy' || kind === 'storm' || kind === 'snow') return `<svg class="${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M9 30h29a8 8 0 0 0-2-16A13 13 0 0 0 11 19a6 6 0 0 0-2 11Z" fill="#d9edff"/>${kind==='storm'?'<path d="m25 25-7 12h7l-3 9 13-15h-9l5-6" fill="#ffdb68"/>':kind==='snow'?'<path d="M16 35v8m-4-4h8m12-4v8m-4-4h8" stroke="#c9f7ff" stroke-width="2"/>':''}</svg>`;
      if (kind === 'rain') return `<svg class="${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true"><ellipse cx="25" cy="31" rx="17" ry="5" fill="#101a38" opacity=".28"/><path d="M10 29h27a7 7 0 0 0 0-14h-2A13 13 0 0 0 11 20a7 7 0 0 0-1 9Z" fill="#d9edff"/><path d="M13 27h25a7 7 0 0 1-3 4H13Z" fill="#9fc4e8" opacity=".72"/><path d="m16 36-2 5m11-5-2 5m11-5-2 5m9-5-2 5" stroke="#61c8ff" stroke-width="3" stroke-linecap="round"/></svg>`;
      if (kind === 'partly') return `<svg class="${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="32" cy="15" r="10" fill="#ffd45a"/><circle cx="29" cy="12" r="5" fill="#fff2a6" opacity=".65"/><ellipse cx="24" cy="34" rx="17" ry="5" fill="#101a38" opacity=".25"/><path d="M7 32h29a7 7 0 0 0 0-14h-2A12 12 0 0 0 12 23a7 7 0 0 0-5 9Z" fill="#e2f2ff"/><path d="M9 29h30a7 7 0 0 1-4 5H11Z" fill="#a8cceb" opacity=".7"/></svg>`;
      return `<svg class="${className}" viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="25" r="14" fill="#ffca3f" opacity=".28"/><circle cx="24" cy="23" r="11" fill="#ffd85a"/><circle cx="20" cy="19" r="5" fill="#fff1a2" opacity=".62"/><path d="M24 2v6m0 30v6M3 23h6m30 0h6M9 8l4 4m22 22 4 4M39 8l-4 4M13 34l-4 4" stroke="#ffe47d" stroke-width="2.6" stroke-linecap="round"/></svg>`;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CALENDAR MARKUP
     * Implementation of calendar Markup. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function calendarMarkup() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NOW
       * Defines now for the surrounding section.
       * ------------------------------------------------------------------- */
      const now = new Date();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: YEAR
       * Defines year for the surrounding section.
       * ------------------------------------------------------------------- */
      const year = now.getFullYear();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MONTH
       * Defines month for the surrounding section.
       * ------------------------------------------------------------------- */
      const month = now.getMonth();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FIRST DAY
       * Defines first Day for the surrounding section.
       * ------------------------------------------------------------------- */
      const firstDay = new Date(year, month, 1).getDay();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DAYS
       * Defines days for the surrounding section.
       * ------------------------------------------------------------------- */
      const days = new Date(year, month + 1, 0).getDate();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PREVIOUS DAYS
       * Defines previous Days for the surrounding section.
       * ------------------------------------------------------------------- */
      const previousDays = new Date(year, month, 0).getDate();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CELLS
       * Defines cells for the surrounding section.
       * ------------------------------------------------------------------- */
      const cells = [];
      for (let index = 0; index < 42; index++) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DAY
         * Defines day for the surrounding section.
         * ------------------------------------------------------------------- */
        let day;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MUTED
         * Defines muted for the surrounding section.
         * ------------------------------------------------------------------- */
        let muted = false;
        if (index < firstDay) { day = previousDays - firstDay + index + 1; muted = true; }
        else if (index >= firstDay + days) { day = index - firstDay - days + 1; muted = true; }
        else day = index - firstDay + 1;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TODAY
         * Defines today for the surrounding section.
         * ------------------------------------------------------------------- */
        const today = !muted && day === now.getDate();
        cells.push(`<div class="calendar-day${muted ? ' muted' : ''}${today ? ' today' : ''}">${day}</div>`);
      }
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MONTH NAME
       * Defines month Name for the surrounding section.
       * ------------------------------------------------------------------- */
      const monthName = new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(now);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: EVENTS
       * Defines events for the surrounding section.
       * ------------------------------------------------------------------- */
      const events = [['Project walkthrough','Today · 10:30 AM'],['Send client estimate','Today · 2:00 PM'],['Pool league','Thursday · 7:30 PM'],['Crew planning','Friday · 8:00 AM'],['Material delivery','Friday · 11:30 AM'],['TAGIMS review','Saturday · 1:00 PM'],['Call with accountant','Monday · 9:00 AM'],['Donna backsplash','Tuesday · 8:30 AM'],['Dennis inspection','Tuesday · 1:00 PM'],['Estimate follow-ups','Wednesday · 9:00 AM'],['Command Hub review','Wednesday · 3:30 PM'],['Payroll review','Friday · 4:00 PM'],['Wendy deck check-in','Saturday · 9:00 AM'],['Website content review','Saturday · 11:30 AM'],['Cary fence follow-up','Monday · 10:00 AM'],['Jan project kickoff','Monday · 1:30 PM'],['QuickBooks reconciliation','Tuesday · 4:00 PM'],['Weekly planning','Wednesday · 8:00 AM']];
      return `<div class="calendar-month"><div class="calendar-month-name">${monthName}</div><div class="calendar-grid">${['S','M','T','W','T','F','S'].map(day => `<div class="calendar-day-name">${day}</div>`).join('')}${cells.join('')}</div></div><div class="calendar-agenda"><div class="calendar-agenda-title">Upcoming</div>${events.map(([title, time]) => `<div class="calendar-event"><strong>${title}</strong><span>${time}</span></div>`).join('')}</div>`;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: CONTENT RENDERERS
     * Defines content Renderers for the surrounding section.
     * ------------------------------------------------------------------- */
    // Live Weather: shared requests, independent views, no sample-data fallback.
    const HubWeather = (() => {
      const pages=[['today','Today'],['weather','Weather'],['rain','Rain & storms'],['radar','Radar'],['uv','UV'],['solar','Solar activity'],['details','Current conditions'],['air','Air quality'],['moon','Moon & daylight'],['tide','Tides']];
      const cache=new Map(),scripts=new Map();
      const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const num=(v,d=0)=>v==null||!Number.isFinite(Number(v))?'—':Number(v).toFixed(d);
      const localTime=t=>t?new Date(typeof t==='number'?t*1000:/Z$|[+-]\d\d:\d\d$/.test(t)?t:t+'Z').toLocaleString('en-US',{timeZone:'America/Chicago',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):'Time unavailable';
      const stale=(t,ms)=>!t||Date.now()-new Date(/Z$/.test(t)?t:t+'Z').getTime()>ms;
      const latest=(rows,key='time_tag')=>Array.isArray(rows)?rows.reduce((a,b)=>!a||String(b[key])>String(a[key])?b:a,null):null;
      function request(url,ttl=600000){
        const hit=cache.get(url);if(hit&&Date.now()-hit.at<ttl)return hit.promise;
        const promise=fetch(url,{signal:AbortSignal.timeout(15000)}).then(r=>{if(!r.ok)throw Error('Service unavailable');return r.json();}).catch(e=>{cache.delete(url);throw e;});
        cache.set(url,{at:Date.now(),promise});return promise;
      }
      function script(url,global){
        if(window[global])return Promise.resolve(window[global]);if(scripts.has(url))return scripts.get(url);
        const p=new Promise((resolve,reject)=>{const el=document.createElement('script');el.src=url;if(global==='L'){el.integrity='sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';el.crossOrigin='';}const timer=setTimeout(()=>{el.remove();reject(Error('Library timed out'));},15000);el.onload=()=>{clearTimeout(timer);resolve(window[global]);};el.onerror=()=>{clearTimeout(timer);el.remove();reject(Error('Library unavailable'));};document.head.append(el);}).catch(e=>{scripts.delete(url);throw e;});scripts.set(url,p);return p;
      }
      const kind=c=>c==null?'cloudy':c===0?'sunny':c<3?'partly':c<50?'fog':c>=95?'storm':c>=71&&c<80?'snow':'rain';
      const condition=c=>c==null?'Unavailable':c===0?'Clear':c<3?'Partly cloudy':c===3?'Overcast':c<50?'Fog':c>=95?'Thunderstorms':c>=71&&c<80?'Snow':'Rain / showers';
      const uvLabel=v=>v==null?'Unavailable':v<3?'Low':v<6?'Moderate':v<8?'High':v<11?'Very high':'Extreme';
      const art=(type,extra='')=>`<span class="wx-art ${extra}" data-art="${type}" aria-hidden="true"></span>`;
      const icon=name=>art(({Temperature:'thermometer','Feels like':'thermometer',Humidity:'drop','Dew point':'drop',Wind:'wind',Gusts:'wind',Pressure:'pressure',Visibility:'eye',Sunrise:'sunny',Sunset:'partly',Daylight:'sunny',Moonrise:'moon',Moonset:'moon',Illumination:'moon','Next high tide':'tide','Next low tide':'tide'})[name]||'air','wx-condition-icon');
      const forecastIcon=type=>art(type,'wx-weather-art');
      const controlIcon=name=>`<svg class="wx-control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${({prev:'m14 5-7 7 7 7',next:'m10 5 7 7-7 7',refresh:'M20 8a8 8 0 1 0 0 8M20 3v5h-5',play:'m8 5 11 7-11 7Z',pause:'M8 5v14M16 5v14'})[name]}"/></svg>`;
      const stat=(label,value)=>`<div class="wx-stat">${icon(label)}<span>${esc(label)}</span><strong>${value}</strong></div>`;
      const heading=(title,sub='')=>`<div class="wx-heading"><h3>${title}</h3></div>`;
      const unavailable=label=>`<p class="wx-empty">${label} unavailable. Use Refresh to try again.</p>`;
      function bars(times,values,unit,max=100){return `<div class="wx-bars">${times.map((t,i)=>`<div title="${esc(t)}: ${num(values[i],unit==='"'?2:0)}${unit}"><span>${num(values[i],unit==='"'?2:0)}${unit}</span><i style="--bar:${values[i]==null?0:Math.max(0,Math.min(100,values[i]/max*100))}%"></i><small>${new Date(t).toLocaleTimeString('en-US',{hour:'numeric'})}</small></div>`).join('')}</div>`;}
      function markup(){return `<header class="wx-toolbar"><button type="button" data-wx="back" hidden>← Forecast</button><nav class="wx-tabs" aria-label="Weather pages">${pages.map(([id,label])=>`<button type="button" data-wx-page="${id}">${label}</button>`).join('')}</nav><button type="button" data-wx="refresh" aria-label="Refresh weather">${controlIcon('refresh')}</button></header><div class="wx-pages">${pages.map(([id,label])=>`<section class="wx-page" data-page="${id}" aria-label="${label}">${heading(label)}<p class="wx-empty">Loading ${label.toLowerCase()}…</p></section>`).join('')}</div><button type="button" class="wx-nav wx-prev" data-wx="prev" aria-label="Previous weather page">${controlIcon('prev')}</button><button type="button" class="wx-nav wx-next" data-wx="next" aria-label="Next weather page">${controlIcon('next')}</button><div class="wx-icon-stage" aria-live="polite"></div><footer class="wx-status" aria-live="polite">Connecting to weather services…</footer>`;}
      function init(widget){
        const root=widget.querySelector('.wx-app');if(!root)return;
        const key=`hub-weather-page-${widget.id}`;
        let page=localStorage.getItem(key)||'weather',disposed=false,busy=false,map=null,radarLayer=null,frames=[],frameIndex=0,play=null,radarHost='',radarBusy=false,radarGeneration=0,frameLoading=false,frameTimeout=null,compact=false,initialized=false,positioned=false,currentUV=null,iconIndex=0;
        const status=root.querySelector('.wx-status');
        const section=id=>root.querySelector(`[data-page="${id}"]`);
        const scroller=root.querySelector('.wx-pages');
        function selectPage(next){page=pages.some(([id])=>id===next)?next:'weather';root.dataset.page=page;localStorage.setItem(key,page);root.querySelectorAll('[data-wx-page]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.wxPage===page)));root.querySelector('[data-wx=back]').hidden=page==='weather';}
        function setPage(next){if(next!==page)iconIndex=0;selectPage(next);renderIcon();if(page!=='radar')stopPlayback();const target=section(page);if(target){scroller.scrollTop=target.offsetTop;}loadRadar();setTimeout(()=>map?.invalidateSize(),30);}
        function iconCards(){
          const el=section(page),text=(selector)=>el?.querySelector(selector)?.textContent?.trim()||'';
          const card=(label,value,art='',extra='')=>`<article class="wx-icon-card"><span class="wx-icon-label">${esc(label)}</span>${art?'<div class="wx-icon-art">'+art+'</div>':''}<strong class="wx-icon-value">${esc(value)}</strong>${extra?'<span class="wx-icon-extra">'+esc(extra)+'</span>':''}</article>`;
          if(el?.querySelector('.wx-empty'))return [card(pages.find(p=>p[0]===page)[1],text('.wx-empty'))];
          if(page==='today')return [card('Pensacola',text('.wx-current-temp'),el.querySelector('.wx-today>.wx-art')?.outerHTML,text('.wx-current-condition')+'\n'+text('.wx-today-range'))];
          if(page==='weather')return Array.from(el.querySelectorAll('.wx-day')).map(day=>card(day.querySelector('span').textContent,day.querySelector('strong').textContent,day.querySelector('.wx-art').outerHTML));
          if(page==='details')return Array.from(el.querySelectorAll('.wx-stat')).map(item=>card(item.querySelector('span').textContent,item.querySelector('strong').textContent,item.querySelector('.wx-art').outerHTML));
          if(page==='rain')return Array.from(el.querySelectorAll('.wx-rain-outlook>div')).map(item=>card('Rain · '+item.querySelector('span').textContent,item.querySelector('strong').textContent,forecastIcon('rain')));
          if(page==='uv')return [card('UV',text('.wx-lead'),art('sunny'),text('p:last-child'))];
          if(page==='solar')return [card('Solar activity',text('.wx-lead').replace('No active flare reported','Calm').replace('Active solar flare','Active flare'),art('solar'),text('.wx-solar p:last-child'))];
          if(page==='air')return [card('Air quality',text('.wx-lead'),art('air'))];
          if(page==='moon')return [card('Moon',text('.wx-lead'),(el.querySelector('.wx-moon svg')?.outerHTML||'').replaceAll('wx-moon-lit-','wx-moon-icon-lit-'),text('.wx-moon-row p:last-child'))];
          if(page==='tide')return [card('Tide · predicted',text('.wx-lead'),art('tide'))];
          return [];
        }
        function renderIcon(){const stage=root.querySelector('.wx-icon-stage');if(!stage)return;const cards=iconCards();iconIndex=Math.max(0,Math.min(iconIndex,cards.length-1));stage.innerHTML=cards[iconIndex]||'';root.dataset.iconPage=page;}
        function navigate(direction){if(root.classList.contains('wx-icon')){const cards=iconCards();if(iconIndex+direction>=0&&iconIndex+direction<cards.length){iconIndex+=direction;renderIcon();return;}}const next=pages[(pages.findIndex(([id])=>id===page)+direction+pages.length)%pages.length][0];setPage(next);if(direction<0&&root.classList.contains('wx-icon')){iconIndex=Math.max(0,iconCards().length-1);renderIcon();}}
        function positionInitial(){if(positioned)return;positioned=true;setTimeout(()=>{if(!disposed)setPage(compact?(root.classList.contains('wx-icon')?'today':page):'today');},0);}
        function resizeWeather(r){const next=r.height<280;root.classList.toggle('wx-compact',next);root.classList.toggle('wx-icon',r.width<260&&next);root.style.setProperty('--wx-page-height',Math.max(100,r.height)+'px');root.style.setProperty('--wx-today-height',Math.max(170,Math.min(r.height<280?r.height:r.height*.58,440))+'px');if(initialized&&next!==compact){compact=next;setTimeout(()=>setPage(compact?(root.classList.contains('wx-icon')?'today':'weather'):'today'),0);}else compact=next;initialized=true;renderIcon();map?.invalidateSize();}
        const observer=new ResizeObserver(entries=>resizeWeather({width:root.clientWidth||entries[0].contentRect.width,height:root.clientHeight||entries[0].contentRect.height}));observer.observe(root);resizeWeather(root.getBoundingClientRect());
        scroller.addEventListener('scroll',()=>{if(root.classList.contains('wx-icon'))return;const top=scroller.scrollTop;const candidates=Array.from(root.querySelectorAll('.wx-page'));let nearest=candidates[0];for(const candidate of candidates){if(candidate.offsetTop<=top+scroller.clientHeight*.3)nearest=candidate;}if(nearest)selectPage(nearest.dataset.page);if(page!=='radar')stopPlayback();},{passive:true});
        root.addEventListener('pointerdown',e=>e.stopPropagation());
        root.addEventListener('click',e=>{const targetPage=e.target.closest('[data-wx-page]')?.dataset.wxPage;if(targetPage)setPage(targetPage);const a=e.target.closest('[data-wx]')?.dataset.wx;if(a==='next'||a==='prev')navigate(a==='next'?1:-1);if(a==='refresh'){cache.clear();refresh();loadRadar(true);}if(a==='radar')setPage('radar');if(a==='back')setPage('weather');if(a==='play'){if(play)stopPlayback();else{play=setInterval(()=>{if(document.hidden||widget.hidden||frameLoading)return;frameIndex=(frameIndex+1)%frames.length;showFrame();},900);root.querySelector('[data-wx="play"]').innerHTML=controlIcon('pause')+'<span>Pause</span>';}}if(a==='home')map?.setView([30.4213,-87.2169],7);if(a==='regional')map?.fitBounds([[27,-94],[34,-80]]);});
        let touch=null;root.addEventListener('touchstart',e=>{if(page==='radar'||e.target.closest('input,select,button,.wx-bars,.wx-days,.wx-map'))return;touch=e.touches[0];},{passive:true});root.addEventListener('touchend',e=>{if(!touch)return;const t=e.changedTouches[0],dx=t.clientX-touch.clientX,dy=t.clientY-touch.clientY;touch=null;if(Math.abs(dx)>65&&Math.abs(dx)>Math.abs(dy)*1.5)setPage(pages[(pages.findIndex(([id])=>id===page)+(dx<0?1:pages.length-1))%pages.length][0]);},{passive:true});
        function stopPlayback(){clearInterval(play);play=null;const b=root.querySelector('[data-wx="play"]');if(b)b.innerHTML=controlIcon('play')+'<span>Play</span>';}
        async function forecast(){
          const q=new URLSearchParams({latitude:'30.4213',longitude:'-87.2169',timezone:'America/Chicago',temperature_unit:'fahrenheit',wind_speed_unit:'mph',precipitation_unit:'inch',forecast_days:'7',current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,surface_pressure',hourly:'temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,visibility,uv_index,wind_speed_10m,wind_gusts_10m,surface_pressure',daily:'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max'});
          try{
            const d=await request('https://api.open-meteo.com/v1/forecast?'+q);if(disposed)return;if(!d.daily?.time?.length||!d.hourly?.time?.length)throw Error('No forecast');
            const c=d.current||{},h=d.hourly,day=d.daily,now=c.time||new Date(Date.now()+d.utc_offset_seconds*1000).toISOString().slice(0,16);let index=h.time.findIndex(t=>t>=now.slice(0,13)+':00');if(index<0)index=0;
            const times=h.time.slice(index,index+24),prob=h.precipitation_probability.slice(index,index+24),uv=h.uv_index.slice(index,index+24),rain=h.precipitation.slice(index,index+24);
            const modelAge=Date.now()-(Date.parse(now+'Z')-d.utc_offset_seconds*1000);const stamp=`Model forecast · ${now.replace('T',' ')} CT${modelAge>10800000?' · STALE':''}`;
            section('today').innerHTML=`<div class="wx-today">${forecastIcon(kind(c.weather_code))}<div><span class="wx-location">Pensacola</span><strong class="wx-current-temp">${num(c.temperature_2m)}°</strong><span class="wx-current-condition">${condition(c.weather_code)}</span><span class="wx-today-range">H ${num(day.temperature_2m_max[0])}° · L ${num(day.temperature_2m_min[0])}°</span></div></div>`;
            section('weather').innerHTML=`<div class="wx-days">${day.time.slice(0,7).map((date,i)=>`<div class="wx-day"><span>${i===0?'Today':new Date(date+'T12:00:00').toLocaleDateString('en-US',{weekday:'short'})}</span>${forecastIcon(kind(day.weather_code[i]))}<strong>${num(day.temperature_2m_max[i])}° <small>${num(day.temperature_2m_min[i])}°</small></strong></div>`).join('')}</div>`;
            positionInitial();
            const wet=prob.findIndex((p,i)=>p>=40||(rain[i]!=null&&rain[i]>=.01));const knownRain=rain.filter(v=>v!=null&&Number.isFinite(v));
            const peak=prob.some(v=>v!=null)?Math.max(...prob.filter(v=>v!=null)):null;
            const blocks=Array.from({length:4},(_,i)=>{const values=prob.slice(i*6,i*6+6).filter(v=>v!=null);return {time:times[i*6],value:values.length?Math.max(...values):null};});
            section('rain').innerHTML=heading('Rain & storms')+`${art('rain','wx-section-art')}<p class="wx-lead">${peak==null?'Rain forecast unavailable':wet<0?'Rain unlikely in the next 24 hours':`Rain possible around ${new Date(times[wet]).toLocaleTimeString('en-US',{hour:'numeric'})}`}</p><div class="wx-rain-outlook">${blocks.map(b=>`<div><strong>${num(b.value)}%</strong><i style="--bar:${b.value??0}%"></i><span>${b.time?new Date(b.time).toLocaleTimeString('en-US',{hour:'numeric'}):'—'}</span></div>`).join('')}</div><div class="wx-alerts"></div>`;
            section('uv').innerHTML=heading('UV')+`${art('sunny','wx-section-art')}<p class="wx-lead">${num(uv[0],1)} · ${uvLabel(uv[0])}</p><div class="wx-uv-track"><i style="left:${Math.max(0,Math.min(100,(uv[0]??0)/12*100))}%"></i></div><p>Today’s peak ${num(day.uv_index_max[0],1)}</p>`;
            section('details').innerHTML=heading('Current conditions',condition(c.weather_code))+`<div class="wx-stats">${stat('Temperature',num(c.temperature_2m)+'°F')}${stat('Feels like',num(c.apparent_temperature)+'°F')}${stat('Humidity',num(c.relative_humidity_2m)+'%')}${stat('Dew point',num(h.dew_point_2m[index])+'°F')}${stat('Wind',num(c.wind_speed_10m)+' mph')}${stat('Gusts',num(c.wind_gusts_10m)+' mph')}${stat('Pressure',num(c.surface_pressure,1)+' hPa')}${stat('Visibility',h.visibility[index]==null?'—':num(h.visibility[index]/1609.344,1)+' mi')}</div>`;
            if(modelAge>10800000)section('weather').insertAdjacentHTML('beforeend','<p class="wx-stale">Forecast out of date</p>');alerts();
          }catch(e){if(disposed)return;['today','weather','rain','uv','details'].forEach(id=>section(id).innerHTML=heading(pages.find(p=>p[0]===id)[1])+unavailable('Weather data'));}
        }
        async function alerts(){try{const d=await request('https://api.weather.gov/alerts/active?point=30.4213,-87.2169',300000);if(disposed)return;const el=root.querySelector('.wx-alerts');if(!el)return;if(!Array.isArray(d.features))throw Error();const relevant=d.features.filter(({properties:p})=>p.event!=='Marine Weather Statement');el.innerHTML=relevant.map(({properties:p})=>`<p class="wx-alert"><strong>${esc(p.event)}</strong></p>`).join('');}catch(e){const el=root.querySelector('.wx-alerts');if(el)el.textContent='Alerts unavailable';}}
        async function solar(){
          const urls=['https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json'];
          const results=await Promise.allSettled(urls.map(u=>request(u,60000)));if(disposed)return;
          const flare=results[0].status==='fulfilled'?latest(results[0].value):null;
          const strength=value=>!value?'Unknown':/^X/.test(value)?'Very strong':/^M/.test(value)?'Strong':/^C/.test(value)?'Small':'Low';
          const fresh=flare&&!stale(flare.time_tag,1800000);
          const begun=flare?.begin_time&&Date.parse(flare.begin_time)<=Date.parse(flare.time_tag);const ended=begun&&flare.end_time&&Date.parse(flare.end_time)>=Date.parse(flare.begin_time)&&Date.parse(flare.end_time)<=Date.parse(flare.time_tag);const active=fresh&&begun&&!ended;
          const flareSummary=!flare?'Flare readings unavailable':!fresh?'Flare readings are out of date':active?'Active solar flare':ended?'No active flare reported':'Current flare status unavailable';
          section('solar').innerHTML=heading('Solar activity','Space weather')+`<div class="wx-solar"><div class="wx-celestial wx-sun">${art('solar')}</div><div><p class="wx-lead">${flareSummary}</p><p>${active?'Strength: <strong>'+strength(flare.current_class)+'</strong> · '+esc(flare.current_class||'Unclassified'):''}</p></div></div>`;
        }
        async function air(){try{const d=await request('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=30.4213&longitude=-87.2169&current=us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide&timezone=America%2FChicago');if(disposed)return;const c=d.current;if(!c)throw Error();const aq=c.us_aqi,label=aq==null?'Unavailable':aq<=50?'Good':aq<=100?'Moderate':aq<=150?'Unhealthy for sensitive groups':aq<=200?'Unhealthy':aq<=300?'Very unhealthy':'Hazardous';section('air').innerHTML=heading('Air quality','Modeled US AQI')+`${art('air','wx-section-art')}<p class="wx-lead">${num(aq)} · ${label}</p>${aq==null?'':`<div class="wx-aqi" role="meter" aria-label="US air quality index" aria-valuemin="0" aria-valuemax="500" aria-valuenow="${Math.max(0,Math.min(500,aq))}" aria-valuetext="${num(aq)} — ${label}"><div class="wx-aqi-track"><i style="left:${Math.max(0,Math.min(100,aq<=200?aq/50*100/6:aq<=300?(4+(aq-200)/100)*100/6:(5+(aq-300)/200)*100/6))}%"></i></div><div class="wx-aqi-labels"><span>Good</span><span>Moderate</span><span>Sensitive</span><span>Unhealthy</span><span>Very unhealthy</span><span>Hazardous</span></div></div>`}<p>${aq==null?'Air quality is unknown.':aq<=50?'Air quality is good — a good day for outdoor activities.':aq<=100?'Acceptable for most people; unusually sensitive people may notice irritation.':aq<=150?'Sensitive groups should reduce prolonged outdoor exertion.':'Pollution is elevated. Reduce time spent doing strenuous activity outdoors.'}</p>`;}catch(e){if(!disposed)section('air').innerHTML=heading('Air quality')+unavailable('Air quality');}}
        async function moon(){try{const S=await script('https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.js','SunCalc');if(disposed)return;const date=new Date(),m=S.getMoonIllumination(date),sun=S.getTimes(date,30.4213,-87.2169);const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Chicago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const p=Object.fromEntries(parts.map(x=>[x.type,x.value]));const midnight=new Date(`${p.year}-${p.month}-${p.day}T00:00:00Z`);const offset=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chicago',timeZoneName:'shortOffset'}).formatToParts(date).find(x=>x.type==='timeZoneName').value;midnight.setUTCHours(-Number(offset.replace('GMT','')));const utcDay=new Date(Date.UTC(midnight.getUTCFullYear(),midnight.getUTCMonth(),midnight.getUTCDate()));const nextUTC=new Date(+utcDay+86400000);const m1=S.getMoonTimes(utcDay,30.4213,-87.2169,true),m2=S.getMoonTimes(nextUTC,30.4213,-87.2169,true);const inLocalDay=t=>t&&t>=midnight&&t<new Date(+midnight+86400000);const mt={rise:[m1.rise,m2.rise].find(inLocalDay),set:[m1.set,m2.set].find(inLocalDay)};const names=['New moon','Waxing crescent','First quarter','Waxing gibbous','Full moon','Waning gibbous','Last quarter','Waning crescent'],n=Math.round(m.phase*8)%8;section('moon').innerHTML=heading('Moon & daylight','Calculated for Pensacola')+`<div class="wx-moon-row"><div class="wx-celestial wx-moon" role="img" aria-label="${names[n]}, ${num(m.fraction*100)} percent illuminated"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><clipPath id="wx-moon-lit-${esc(widget.id)}"><path d="M100 26 A74 74 0 0 ${m.phase<.5?1:0} 100 174 A${Math.max(.001,Math.abs(1-2*m.fraction)*74)} 74 0 0 ${m.fraction<.5?(m.phase<.5?0:1):(m.phase<.5?1:0)} 100 26Z"/></clipPath></defs><foreignObject x="26" y="26" width="148" height="148"><div xmlns="http://www.w3.org/1999/xhtml" class="wx-moon-texture wx-moon-dark">${art('moon')}</div></foreignObject><g clip-path="url(#wx-moon-lit-${esc(widget.id)})"><foreignObject x="26" y="26" width="148" height="148"><div xmlns="http://www.w3.org/1999/xhtml" class="wx-moon-texture">${art('moon')}</div></foreignObject></g></svg></div><div><p class="wx-lead">${names[n]}</p><p>${num(m.fraction*100)}% illuminated</p></div></div><div class="wx-stats">${stat('Illumination',num(m.fraction*100)+'%')}${stat('Sunrise',localTime(sun.sunrise?.toISOString()))}${stat('Sunset',localTime(sun.sunset?.toISOString()))}${stat('Daylight',num((sun.sunset-sun.sunrise)/3600000,1)+' hours')}${stat('Moonrise',mt.rise?localTime(mt.rise.toISOString()):'No rise in interval')}${stat('Moonset',mt.set?localTime(mt.set.toISOString()):'No set in interval')}</div>`;}catch(e){if(!disposed)section('moon').innerHTML=heading('Moon & daylight')+unavailable('Astronomy calculations');}}
        async function tide(){
          try{
            const now=Date.now(),begin=new Date(now-3600000).toISOString().slice(0,10).replaceAll('-','');
            const q=new URLSearchParams({product:'predictions',application:'HubWeather',station:'8729840',begin_date:begin,range:'72',datum:'MLLW',units:'english',time_zone:'gmt',format:'json'});
            const [curve,extrema]=await Promise.all([request('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?'+q+'&interval=6'),request('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?'+q+'&interval=hilo')]);
            if(disposed)return;
            const parse=rows=>(rows||[]).map(r=>({t:Date.parse(r.t.replace(' ','T')+'Z'),v:Number(r.v),type:r.type})).filter(r=>Number.isFinite(r.t)&&Number.isFinite(r.v));
            const points=parse(curve.predictions).filter(r=>r.t>=now&&r.t<=now+86400000),events=parse(extrema.predictions).filter(r=>r.t>=now);
            if(points.length<20)throw Error();const lo=Math.min(...points.map(r=>r.v)),hi=Math.max(...points.map(r=>r.v)),range=Math.max(.1,hi-lo);
            const coords=points.map(r=>`${((r.t-now)/86400000*600).toFixed(1)},${(125-(r.v-lo)/range*100).toFixed(1)}`);
            const high=events.find(r=>r.type==='H'),low=events.find(r=>r.type==='L');
            section('tide').innerHTML=heading('Tides','Pensacola Bay · predicted')+`${art('tide','wx-section-art')}<p class="wx-lead">${points[1].v>points[0].v?'↑ Rising tide':points[1].v<points[0].v?'↓ Falling tide':'Turning tide'}</p><svg class="wx-tide-chart" viewBox="0 0 600 150" preserveAspectRatio="none" role="img" aria-label="Predicted tide height over the next 24 hours"><path d="M${coords.join(' L')} L600 150 L0 150Z" fill="#70cafa" opacity=".18"/><path d="M${coords.join(' L')}" fill="none" stroke="#88dbff" stroke-width="3" vector-effect="non-scaling-stroke"/></svg><div class="wx-tide-axis"><span>Now</span><span>+12 hours</span><span>+24 hours</span></div><div class="wx-stats">${stat('Next high tide',high?localTime(high.t/1000):'Unavailable')}${stat('Next low tide',low?localTime(low.t/1000):'Unavailable')}</div>`;
          }catch(e){if(!disposed)section('tide').innerHTML=heading('Tides')+unavailable('Tide predictions');}
        }
        async function loadRadar(force=false){
          if(disposed||radarBusy)return;if(map&&!force){map.invalidateSize();return;}radarBusy=true;
          try{
            if(!document.querySelector('link[data-wx-leaflet]')){const css=document.createElement('link');css.rel='stylesheet';css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';css.integrity='sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';css.crossOrigin='';css.dataset.wxLeaflet='true';document.head.append(css);}
            const [L,d]=await Promise.all([script('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js','L'),request('https://api.rainviewer.com/public/weather-maps.json',300000)]);if(disposed)return;
            frames=(d.radar?.past||[]).filter(f=>Number.isFinite(f.time)&&/^\/v2\/radar\/[\w-]+$/.test(f.path));if(!frames.length)throw Error();if(new URL(d.host).hostname!=='tilecache.rainviewer.com')throw Error();radarHost=d.host;frameIndex=frames.length-1;
            if(!map){section('radar').innerHTML=heading('Radar')+`<div class="wx-map" aria-label="Zoomable observed precipitation radar"></div><div class="wx-radar-controls"><button type="button" data-wx="back">← Forecast</button><button type="button" data-wx="play">${controlIcon('play')}<span>Play</span></button><div class="wx-radar-timeline"><input type="range" min="0" aria-label="Radar history frame"><div class="wx-radar-range"><span data-radar-start></span><span data-radar-end></span></div></div><button type="button" data-wx="home">Pensacola</button><button type="button" data-wx="regional">Gulf region</button></div><p class="wx-radar-time" aria-live="polite"></p><p class="wx-radar-error" role="status"></p>`;
              map=L.map(section('radar').querySelector('.wx-map'),{minZoom:3,maxZoom:7,scrollWheelZoom:false}).setView([30.4213,-87.2169],7);
              const basePane=map.createPane('wxDarkBase');basePane.style.zIndex='190';basePane.style.filter='invert(1) hue-rotate(180deg) brightness(.68) saturate(.65)';
              const base=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{pane:'wxDarkBase',maxZoom:7,attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);base.on('tileerror',()=>{if(!disposed)section('radar').querySelector('.wx-radar-error').textContent='Some map tiles could not load.';});
              L.circleMarker([30.4213,-87.2169],{radius:5,color:'#fff',weight:2,fillColor:'#5ce5ff',fillOpacity:1}).addTo(map).bindTooltip('Pensacola');
              section('radar').querySelector('input').oninput=e=>{stopPlayback();frameIndex=Number(e.target.value);showFrame();};
            }
            section('radar').querySelector('[data-radar-start]').textContent=localTime(frames[0].time);section('radar').querySelector('[data-radar-end]').textContent=localTime(frames[frames.length-1].time);section('radar').querySelector('input').max=frames.length-1;showFrame();setTimeout(()=>map?.invalidateSize(),50);
          }catch(e){if(!disposed){if(!map)section('radar').innerHTML=heading('Radar')+unavailable('Radar connection')+'<a href="https://radar.weather.gov/" target="_blank" rel="noopener">Open official NWS radar ↗</a>';else section('radar').querySelector('.wx-radar-error').textContent='Radar refresh failed; displayed frame may be stale.';}}finally{radarBusy=false;}
        }
        function showFrame(){
          if(!map||!frames.length)return;
          const generation=++radarGeneration,f=frames[frameIndex];frameLoading=true;clearTimeout(frameTimeout);
          section('radar').querySelector('input').value=frameIndex;
          section('radar').querySelector('.wx-radar-time').textContent=`${localTime(f.time)} · Loading…`;
          if(radarLayer)map.removeLayer(radarLayer);
          let failed=false;
          const layer=window.L.tileLayer(`${radarHost}${f.path}/256/{z}/{x}/{y}/2/1_1.png`,{opacity:.78,maxZoom:7,attribution:'Radar © <a href="https://www.rainviewer.com/">RainViewer</a>'});radarLayer=layer;
          section('radar').querySelector('.wx-radar-error').textContent='';
          frameTimeout=setTimeout(()=>{if(disposed||generation!==radarGeneration)return;frameLoading=false;stopPlayback();section('radar').querySelector('.wx-radar-error').textContent='Radar tiles timed out — use Refresh. An empty map does not confirm clear weather.';},15000);
          layer.on('tileerror',()=>{failed=true;if(!disposed&&generation===radarGeneration)section('radar').querySelector('.wx-radar-error').textContent='Radar tiles unavailable — an empty map does not confirm clear weather.';});
          layer.on('load',()=>{if(disposed||generation!==radarGeneration)return;clearTimeout(frameTimeout);frameLoading=false;section('radar').querySelector('.wx-radar-time').textContent=`${localTime(f.time)}${Date.now()/1000-f.time>1800?' · Out of date':''}`;});layer.addTo(map);
        }

        async function refresh(){if(disposed||busy)return;busy=true;status.textContent='Updating weather services…';await Promise.allSettled([forecast(),solar(),air(),moon(),tide()]);if(disposed)return;busy=false;status.textContent='Weather updated';renderIcon();positionInitial();}
        widget._weatherSetPage=setPage;
        widget._destroyWeather=()=>{disposed=true;clearInterval(timer);clearInterval(radarTimer);clearInterval(solarTimer);clearTimeout(frameTimeout);stopPlayback();observer.disconnect();map?.remove();map=null;delete widget._weatherSetPage;};
        const timer=setInterval(()=>{if(!root.isConnected){widget._destroyWeather?.();return;}if(!document.hidden&&!widget.hidden){refresh();}},600000);
        const solarTimer=setInterval(()=>{if(root.isConnected&&!document.hidden&&!widget.hidden)solar().then(()=>{if(!disposed)renderIcon();});},60000);
        const radarTimer=setInterval(()=>{if(root.isConnected&&!document.hidden&&!widget.hidden)loadRadar(true);},300000);
        selectPage(page);loadRadar();refresh();
      }
      return {markup,init,pages};
    })();

    const contentRenderers = {




      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: PERFORMANCE
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      performance() {
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: GAUGE NUMBERS
         * Defines gauge Numbers for the surrounding section.
         * ------------------------------------------------------------------- */
        const gaugeNumbers = values => values.map((value, index) => `<span class="performance-gauge-number n${index + 1}">${value}</span>`).join('');
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: GAUGE TICKS
         * Defines gauge Ticks for the surrounding section.
         * ------------------------------------------------------------------- */
        const gaugeTicks = () => Array.from({ length: 25 }, (_, index) => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ANGLE
           * Defines angle for the surrounding section.
           * ------------------------------------------------------------------- */
          const angle = -120 + index * 10;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SIZE
           * Defines size for the surrounding section.
           * ------------------------------------------------------------------- */
          const size = index % 4 === 0 ? ' is-major' : index % 2 === 0 ? ' is-medium' : '';
          return `<i class="performance-gauge-tick${size}" style="--tick-angle:${angle}deg"></i>`;
        }).join('');
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: GAUGE
         * Defines gauge for the surrounding section.
         * ------------------------------------------------------------------- */
        const gauge = (kind, label, perfKey, unit, values) => `<div class="performance-gauge performance-gauge--${kind}${kind === 'fps' ? ' is-active' : ''}" data-performance-gauge="${kind}" role="meter" aria-label="${label}"><i class="performance-gauge-ticks">${gaugeTicks()}</i>${gaugeNumbers(values)}<i class="performance-gauge-needle"></i><i class="performance-gauge-pin"></i><div class="performance-gauge-center"><span class="performance-gauge-label">${label}</span><span class="performance-gauge-readout"><strong class="performance-gauge-value" data-perf="${perfKey}">--</strong><span class="performance-gauge-unit">${unit}</span></span></div></div>`;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: MINI
         * Defines mini for the surrounding section.
         * ------------------------------------------------------------------- */
        const mini = (kind, label, perfKey, unit, hint) => `<div class="performance-mini" data-mini="${kind}"><span>${label}</span><strong data-perf="${perfKey}">--</strong><small>${unit}</small>${hint ? `<em>${hint}</em>` : ''}</div>`;
        return makeWidget('performance-widget', `<div class="performance-cockpit"><button class="performance-gauge-nav prev" type="button" aria-label="Previous gauge"></button>${gauge('fps','Frame rate','fps','FPS',['0','40','80','120','160','200','240'])}${gauge('frame','Frame time','frameP95','ms',['0','6','12','18','24','30','36'])}${gauge('interaction','Input lag','interaction','ms',['0','50','100','150','200','250','300'])}<button class="performance-gauge-nav next" type="button" aria-label="Next gauge"></button></div><div class="performance-telemetry"><span class="performance-telemetry-label">Frame activity</span><div class="performance-chart" aria-label="Recent frame-time activity"></div><span class="performance-telemetry-scale">Live</span></div><div class="performance-instruments">${mini('dropped','Dropped frames','dropped','frames','')}${mini('longTasks','Long tasks','longTasks','tasks','')}${mini('blocked','Blocked','blocked','%','')}${mini('dom','DOM elements','dom','elements','')}${mini('heap','JS heap','heap','MB','')}${mini('widgets','Widgets','widgets','visible','')}${mini('load','Page load','load','ms','')}${mini('timers','Timers','timers','known','')}</div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: CLOCK
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      clock() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CLOCK
         * Defines clock for the surrounding section.
         * ------------------------------------------------------------------- */
        const clock = document.createElement('div');
        clock.className = 'clock-widget';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TICKS
         * Defines ticks for the surrounding section.
         * ------------------------------------------------------------------- */
        const ticks = Array.from({length:12}, (_, index) => `<i class="clock-tick${index % 3 === 0 ? ' major' : ''}" style="--i:${index}"></i>`).join('');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DIGITAL
         * Defines digital for the surrounding section.
         * ------------------------------------------------------------------- */
        const digital = '<div class="clock-digital-face"><div class="clock-time"><span class="clock-hours"></span><span class="clock-seconds"></span><span class="clock-meridiem"></span></div><div class="clock-date"></div><div class="clock-extra">Next: Project walkthrough at 10:30 AM</div></div>';
        clock.innerHTML = `<div class="clock-stage">${digital}<div class="clock-analog-face">${ticks}<i class="clock-hand hour"></i><i class="clock-hand minute"></i><i class="clock-hand second"></i><i class="clock-pin"></i><span class="clock-complication"></span></div><div class="clock-flip-face"><span class="flip-panel flip-hour"></span><span class="flip-colon">:</span><span class="flip-panel flip-minute"></span></div><div class="clock-alarm-shell"><i class="clock-alarm-bridge"></i>${digital}<i class="clock-alarm-foot left"></i><i class="clock-alarm-foot right"></i></div></div>`;
        return clock;
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: WEATHER
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      weather() { return makeWidget('wx-app', HubWeather.markup()); },

      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: TODO
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      todo() {
        return makeWidget('todo-widget', `<div class="hub-widget-header"><div class="hub-widget-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 12 4 4L19 6"/></svg>Today</div><span class="todo-count" aria-live="polite">0 remaining</span></div><div class="hub-widget-title widget-inline-label">To Do</div><div class="todo-list" data-todo-list></div><form class="todo-add" data-todo-form><input type="text" data-todo-input maxlength="160" autocomplete="off" placeholder="Add a task…" aria-label="New task"><button type="submit">Add</button></form>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: NOTES
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      notes() {
        return makeWidget('notes-widget notes-pad-widget', `<div class="notes-pad-toolbar widget-inline-label"><div class="hub-widget-title">Notes</div></div><textarea class="notes-pad" data-notes-pad aria-label="Quick note" placeholder="Start typing…"></textarea><div class="notes-pad-status" data-notes-status>Ready</div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: GMAIL
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      gmail() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MESSAGES
         * Defines messages for the surrounding section.
         * ------------------------------------------------------------------- */
        const messages = expandMockData([['HC','Housecall Pro','New customer request received','Sep 5'],['CG','Chris G.','Tomorrow’s project schedule','Sep 5'],['TA','TAGIMS Alerts','Deployment completed successfully','Sep 5'],['L','Lowe’s Pro','Your order is ready for pickup','Sep 5'],['QB','QuickBooks','Invoice payment received','Sep 5'],['DC','Donna C.','Backsplash tile selection','Sep 5'],['JH','Jan H.','Re: Project agreement','Sep 4'],['GA','Google Analytics','Weekly performance summary','Sep 4'],['SG','Sherwin-Williams','September Pro savings','Sep 3'],['RG','Regions Bank','Your monthly statement is ready','Sep 3'],['PS','ProSource','Your tile order has shipped','Sep 3'],['CF','Cloudflare','Weekly security insights','Sep 2'],['VC','Vercel','Production deployment ready','Sep 2'],['TD','Todoist','Your weekly productivity report','Sep 1'],['WP','WordPress','Plugin updates available','Sep 1'],['SC','Search Console','New indexing report','Aug 31']], 96);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROWS
         * Defines rows for the surrounding section.
         * ------------------------------------------------------------------- */
        const rows = messages.map(([initials, sender, subject, date]) => `<div class="mail-item"><span class="mail-avatar">${initials}</span><div class="mail-copy"><div class="mail-sender">${sender}</div><div class="mail-subject">${subject}</div></div><span class="mail-date">${date}</span></div>`).join('');
        return makeWidget('gmail-widget', `<div class="hub-widget-header"><div class="hub-widget-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3.5 6.5 12 13l8.5-6.5"/><rect x="3.5" y="5" width="17" height="14" rx="2"/></svg>Gmail</div><span class="gmail-badge">54 unread</span></div><div class="mail-list">${rows}</div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: DRIVE
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      drive() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: FOLDERS
         * Defines folders for the surrounding section.
         * ------------------------------------------------------------------- */
        const folders = [
          ['PHR Projects','Updated 8 min ago'], ['TAGIMS','Updated 24 min ago'], ['Client Agreements','Updated today'],
          ['Estimates & Invoices','Updated today'], ['Project Photos','Updated yesterday'], ['Receipts & Expenses','Updated yesterday'],
          ['Marketing','Updated Monday'], ['Business Documents','Updated Monday'], ['Templates','Updated Aug 29'],
          ['Shared with Chris','Updated Aug 28'], ['Archive','Updated Aug 22'], ['Personal','Updated Aug 18']
        ];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ICON
         * Defines icon for the surrounding section.
         * ------------------------------------------------------------------- */
        const icon = '<span class="drive-folder"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v8A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5Z"/></svg></span>';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROWS
         * Defines rows for the surrounding section.
         * ------------------------------------------------------------------- */
        const rows = folders.map(([name, meta]) => `<div class="drive-row">${icon}<span class="drive-name">${name}</span><span class="drive-meta">${meta}</span></div>`).join('');
        return makeWidget('drive-widget', `<div class="hub-widget-header"><div class="hub-widget-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 3-5 9 3 5h10l3-5-5-9Z"/><path d="M4 12h16"/></svg>Google Drive</div><span class="hub-widget-muted">12 folders</span></div><div class="drive-list">${rows}</div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: MUSIC
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      music() {
        return makeWidget('music-widget', `<div class="hub-widget-header"><div class="hub-widget-title">Music</div><span class="hub-widget-muted">Playing</span></div><div class="music-body"><div class="album-art"></div><div class="music-copy"><div class="hub-widget-muted">NOW PLAYING</div><h3>Midnight City</h3><p>M83 · Hurry Up, We’re Dreaming</p><div class="music-progress"></div><div class="music-times"><span>1:42</span><span>4:03</span></div><div class="music-controls"><span class="music-control">◀</span><span class="music-control play">▶</span><span class="music-control">▶</span></div></div></div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: YOUTUBE
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      youtube() {
        return makeWidget('youtube-widget', `<iframe src="https://www.youtube.com/embed/TW4JtsNYuGs?rel=0&modestbranding=1" title="YouTube video player" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: PHOTOS
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      photos() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PHOTO URLS
         * Defines photo Urls for the surrounding section.
         * ------------------------------------------------------------------- */
        const photoUrls = ['assets/images/photo-1.webp','assets/images/photo-2.webp','assets/images/photo-3.webp','assets/images/photo-4.webp','assets/images/photo-5.webp','assets/images/photo-6.webp','assets/images/photo-7.webp','assets/images/photo-8.webp'];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PHOTOS
         * Defines photos for the surrounding section.
         * ------------------------------------------------------------------- */
        const photos = photoUrls.map(url => ({ ratio: '4-3', url }));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TILES
         * Defines tiles for the surrounding section.
         * ------------------------------------------------------------------- */
        const tiles = photos.map((photo, index) => `<button class="photo-tile" type="button" data-photo-index="${index}" data-photo-ratio="${photo.ratio}" data-photo-url="${photo.url}" aria-label="Open photo ${index + 1}" style="background-image:url('${photo.url}')"></button>`).join('');
        return makeWidget('photos-widget', `<div class="hub-widget-header"><div class="hub-widget-title">Photos</div></div><div class="photo-feature-stage"><div class="photo-feature"></div><div class="photo-feature-shade"></div><button class="photo-nav prev" type="button" aria-label="Previous photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m15 18-6-6 6-6"/></svg></button><button class="photo-nav next" type="button" aria-label="Next photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m9 18 6-6-6-6"/></svg></button><div class="photo-feature-meta"><span class="photo-mode-badge">Featured</span><span class="photo-counter">1 of ${photos.length}</span></div></div><div class="photo-grid">${tiles}</div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: TAGIM
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      tagim() {
        return makeWidget('tagim-widget', `<div class="hub-widget-header"><div class="hub-widget-title">Ai Assistant</div><span class="finance-up">Ready</span></div><div class="tagim-main"><img class="tagim-orb-image" src="assets/images/assistant-orb.webp" alt="TAGIM universe orb"></div><div class="tagim-composer"><span class="tagim-composer-button">⚙</span><span class="tagim-composer-text">Ask TAGIM anything…</span><span class="tagim-composer-button">◉</span><span class="tagim-composer-button tagim-send">Send</span></div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: SOLAR
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */

      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: REMINDERS
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      reminders() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: REMINDERS
         * Defines reminders for the surrounding section.
         * ------------------------------------------------------------------- */
        const reminders = expandMockData([['Crew check-in','In 20 min','#5debd3'],['Send Jan agreement','10:30 AM','#ffbd66'],['Pick up Lowe’s order','11:45 AM','#77a8ff'],['Donna tile confirmation','1:00 PM','#ef79bf'],['Dennis progress photos','3:30 PM','#71d88b'],['Invoice follow-up','Tomorrow','#ff8b8b'],['Pool league','Thu · 7:30 PM','#9f83ff'],['Payroll review','Fri · 4:00 PM','#5debd3'],['Wendy stain date','Sunday','#ffbd66'],['QuickBooks reconciliation','Monday','#77a8ff'],['TAGIMS roadmap review','Tuesday','#ef79bf'],['Back up project files','Wednesday','#71d88b']], 72);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROWS
         * Defines rows for the surrounding section.
         * ------------------------------------------------------------------- */
        const rows = reminders.map(([text, when, color]) => `<div class="reminder-row"><span class="reminder-dot" style="--reminder-color:${color}"></span><span class="reminder-copy">${text}</span><span class="reminder-when">${when}</span></div>`).join('');
        return makeWidget('reminders-widget', `<div class="hub-widget-header"><div class="hub-widget-title">Reminders</div><span class="todo-count">72</span></div><div class="hub-widget-title widget-inline-label">Reminders</div><div class="reminder-list">${rows}</div>`);
      },
      /* HUB GUIDE ---------------------------------------------------------
       * METHOD: CALENDAR
       * Behavior for this entry in the surrounding registry or service.
       * ------------------------------------------------------------------- */
      calendar() {
        return makeWidget('calendar-widget', calendarMarkup());
      }
    };

    /* HUB 11.0 canonical TAGIM financial core — sole financial authority */
