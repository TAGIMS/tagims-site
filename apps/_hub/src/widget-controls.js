/* HUB GUIDE =================================================================
 * FILE: src/widget-controls.js
 * Per-widget settings, list editing, notes, and content interaction handlers.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CONFIGURE WIDGET APP SETTINGS
     * Implementation of configure Widget App Settings. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function configureWidgetAppSettings(widget, type) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SECTION
       * Defines section for the surrounding section.
       * ------------------------------------------------------------------- */
      const section = widget._appSettingsSection;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CONTENT
       * Defines content for the surrounding section.
       * ------------------------------------------------------------------- */
      const content = widget._appSettingsContent;
      if (!section || !content) return;
      section.hidden = true;
      content.replaceChildren();
      delete widget.dataset.weatherMode;
      delete widget.dataset.clockFormat;
      delete widget.dataset.clockSeconds;
      delete widget.dataset.clockFace;
      delete widget.dataset.clockTimezone;
      delete widget.dataset.clockDateStyle;
      delete widget.dataset.clockAlign;
      delete widget.dataset.clockSize;
      delete widget.dataset.clockLeadingZero;
      delete widget.dataset.clockExtra;
      delete widget.dataset.clockPulse;
      delete widget.dataset.clockNumerals;
      delete widget.dataset.clockHands;
      delete widget.dataset.clockComplication;
      delete widget.dataset.photoView;
      delete widget.dataset.photoInterval;
      delete widget.dataset.billFilter;
      widget.classList.remove('hide-date', 'hide-times', 'hide-previews', 'hide-progress', 'hide-chart', 'hide-details', 'hide-labels', 'hide-art', 'hide-composer', 'hide-dots', 'hide-upcoming', 'hide-completed', 'hide-avatars', 'hide-status', 'hide-muted', 'hide-paid-bills', 'hide-space-readings', 'hide-phases', 'hide-radar-alerts', 'notes-list', 'large-icons', 'show-holdings', 'show-analytics-sources', 'photos-uniform', 'photos-reverse', 'photos-contain', 'clock-glow');
      if (!type || !widgetTypeLabels[type]) return;
      section.hidden = false;
      if(type==='financialdashboard'){mountFDColors(content);return;}

      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: APP KEY
       * Defines app Key for the surrounding section.
       * ------------------------------------------------------------------- */
      const appKey = name => `hub-widget-app-${widget.id}-${type}-${name}`;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ADD TOGGLE
       * Defines add Toggle for the surrounding section.
       * ------------------------------------------------------------------- */
      const addToggle = (labelText, name, defaultValue, apply) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROW
         * Defines row for the surrounding section.
         * ------------------------------------------------------------------- */
        const row = document.createElement('div');
        row.className = 'setting';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LABEL
         * Defines label for the surrounding section.
         * ------------------------------------------------------------------- */
        const label = document.createElement('span');
        label.textContent = labelText;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: BUTTON
         * Defines button for the surrounding section.
         * ------------------------------------------------------------------- */
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'switch';
        button.setAttribute('role', 'switch');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SAVED
         * Defines saved for the surrounding section.
         * ------------------------------------------------------------------- */
        const saved = localStorage.getItem(appKey(name));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VALUE
         * Defines value for the surrounding section.
         * ------------------------------------------------------------------- */
        let value = saved === null ? defaultValue : saved === 'true';
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: UPDATE
         * Defines update for the surrounding section.
         * ------------------------------------------------------------------- */
        const update = () => {
          button.classList.toggle('on', value);
          button.setAttribute('aria-checked', String(value));
          apply(value);
        };
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * button.onclick = ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        button.onclick = () => { value = !value; localStorage.setItem(appKey(name), String(value)); update(); };
        row.append(label, button);
        content.appendChild(row);
        update();
        return row;
      };
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ADD SELECT
       * Defines add Select for the surrounding section.
       * ------------------------------------------------------------------- */
      const addSelect = (labelText, name, options, defaultValue, apply) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROW
         * Defines row for the surrounding section.
         * ------------------------------------------------------------------- */
        const row = document.createElement('label');
        row.className = 'setting';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LABEL
         * Defines label for the surrounding section.
         * ------------------------------------------------------------------- */
        const label = document.createElement('span');
        label.textContent = labelText;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SELECT
         * Defines select for the surrounding section.
         * ------------------------------------------------------------------- */
        const select = document.createElement('select');
        select.className = 'widget-select';
        options.forEach(([value, text]) => select.add(new Option(text, value)));
        select.value = localStorage.getItem(appKey(name)) || defaultValue;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: UPDATE
         * Defines update for the surrounding section.
         * ------------------------------------------------------------------- */
        const update = () => apply(select.value);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * select.onchange = ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        select.onchange = () => { localStorage.setItem(appKey(name), select.value); update(); };
        row.append(label, select);
        content.appendChild(row);
        update();
        return row;
      };
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ADD TEXT
       * Defines add Text for the surrounding section.
       * ------------------------------------------------------------------- */
      const addText = (labelText, name, defaultValue, apply) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROW
         * Defines row for the surrounding section.
         * ------------------------------------------------------------------- */
        const row = document.createElement('label');
        row.className = 'setting';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LABEL
         * Defines label for the surrounding section.
         * ------------------------------------------------------------------- */
        const label = document.createElement('span');
        label.textContent = labelText;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INPUT
         * Defines input for the surrounding section.
         * ------------------------------------------------------------------- */
        const input = document.createElement('input');
        input.className = 'widget-text-input';
        input.type = 'text';
        input.maxLength = 48;
        input.value = localStorage.getItem(appKey(name)) || defaultValue;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: UPDATE
         * Defines update for the surrounding section.
         * ------------------------------------------------------------------- */
        const update = () => apply(input.value.trim() || defaultValue);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * input.oninput = ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        input.oninput = () => { localStorage.setItem(appKey(name), input.value); update(); };
        row.append(label, input);
        content.appendChild(row);
        update();
        return row;
      };
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ADD COLOR
       * Defines add Color for the surrounding section.
       * ------------------------------------------------------------------- */
      const addColor = (labelText, name, defaultValue, apply) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROW
         * Defines row for the surrounding section.
         * ------------------------------------------------------------------- */
        const row = document.createElement('div');
        row.className = 'setting';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LABEL
         * Defines label for the surrounding section.
         * ------------------------------------------------------------------- */
        const label = document.createElement('span');
        label.textContent = labelText;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INPUT
         * Defines input for the surrounding section.
         * ------------------------------------------------------------------- */
        const input = document.createElement('input');
        input.type = 'color';
        input.setAttribute('aria-label', labelText);
        input.value = localStorage.getItem(appKey(name)) || defaultValue;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: UPDATE
         * Defines update for the surrounding section.
         * ------------------------------------------------------------------- */
        const update = () => apply(input.value);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * input.oninput = ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        input.oninput = () => { localStorage.setItem(appKey(name), input.value); update(); };
        row.append(label, input);
        content.appendChild(row);
        update();
        return row;
      };
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: TOGGLE CLASS
       * Defines toggle Class for the surrounding section.
       * ------------------------------------------------------------------- */
      const toggleClass = className => value => widget.classList.toggle(className, !value);

      switch (type) {
        case 'clock':
          const clockDefaultsMarker = `hub-widget-app-${widget.id}-clock-defaults-v2`;
          if (!localStorage.getItem(clockDefaultsMarker)) {
            localStorage.setItem(appKey('face'), 'analog-color');
            localStorage.setItem(appKey('analog'), 'true');
            localStorage.setItem(appKey('size'), 'huge');
            localStorage.setItem(appKey('seconds'), 'true');
            localStorage.setItem(appKey('complication'), 'false');
            localStorage.setItem(clockDefaultsMarker, 'applied');
          }
          const savedFace = localStorage.getItem(appKey('face'));
          const analogLegacyFaces = new Set(['analog-classic', 'analog-color', 'chronograph']);
          const migratedFace = savedFace === 'modular' ? 'modular' : 'analog-color';
          if (!['modular', 'analog-color'].includes(savedFace)) localStorage.setItem(appKey('face'), migratedFace);
          const addGroup = title => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: HEADING
             * Defines heading for the surrounding section.
             * ------------------------------------------------------------------- */
            const heading = document.createElement('div');
            heading.className = 'clock-settings-group';
            heading.textContent = title;
            content.appendChild(heading);
            return heading;
          };
          let syncClockSettings = () => {};
          addGroup('Clock Type');
          addToggle('Analog / Digital', 'analog', migratedFace === 'analog-color', value => {
            widget.dataset.clockFace = value ? 'analog-color' : 'modular';
            localStorage.setItem(appKey('face'), widget.dataset.clockFace);
            syncClockSettings();
          });
          const basicsHeading = addGroup('Time');
          addSelect('Time zone', 'timezone', [['local','My local time'],['eastern','Eastern'],['central','Central'],['mountain','Mountain'],['pacific','Pacific'],['utc','UTC']], 'local', value => { widget.dataset.clockTimezone = value; updateClocks(); });
          addSelect('Size', 'size', [['small','Compact'],['medium','Standard'],['large','Large'],['huge','Full width']], 'huge', value => { widget.dataset.clockSize = value; });
          const digitalHeading = addGroup('Digital Options');
          const formatRow = addSelect('Format', 'format', [['12','12-hour'],['24','24-hour']], '12', value => { widget.dataset.clockFormat = value; updateClocks(); });
          const dateRow = addSelect('Date', 'dateStyle', [['hidden','Off'],['short','Short'],['full','Full']], 'hidden', value => { widget.dataset.clockDateStyle = value; updateClocks(); });
          const secondsRow = addToggle('Show seconds', 'seconds', true, value => { widget.dataset.clockSeconds = String(value); });
          const analogHeading = addGroup('Clock Face');
          const marksRow = addSelect('Hour marks', 'numerals', [['marks','Visible'],['none','Minimal']], 'marks', value => { widget.dataset.clockNumerals = value; });
          const handsRow = addSelect('Hands', 'hands', [['classic','Classic'],['bold','Bold'],['needle','Slim']], 'classic', value => { widget.dataset.clockHands = value; });
          const faceColorRow = addColor('Clock face', 'faceColor', '#18243a', value => widget.style.setProperty('--clock-face-color', value));
          widget.dataset.clockComplication = 'false';
          localStorage.setItem(appKey('complication'), 'false');
          const appearanceHeading = addGroup('Colors');
          addColor('Hands / time', 'color', '#ffffff', value => widget.style.setProperty('--clock-color', value));
          addColor('Accent', 'accentColor', '#7fffe7', value => widget.style.setProperty('--clock-accent', value));
          addToggle('Glow', 'glow', false, value => { widget.classList.toggle('clock-glow', value); });
          addColor('Glow color', 'glowColor', '#7fffe7', value => widget.style.setProperty('--clock-glow', value));
          const digitalRows = [formatRow, dateRow, secondsRow];
          const analogRows = [marksRow, handsRow, faceColorRow];
          syncClockSettings = () => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: ANALOG
             * Defines analog for the surrounding section.
             * ------------------------------------------------------------------- */
            const analog = widget.dataset.clockFace === 'analog-color';
            digitalHeading.hidden = analog;
            analogHeading.hidden = !analog;
            digitalRows.forEach(row => { row.hidden = analog; });
            analogRows.forEach(row => { row.hidden = !analog; });
          };
          syncClockSettings();
          break;
        case 'weather': {
          const hint=document.createElement('p');
          hint.innerHTML='Scroll through the weather or use the navigation buttons. Forecast location: Pensacola, Florida. Tide predictions: Pensacola Bay.<br><br>Weather data: <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo / CAMS</a>, NOAA. Astronomy: SunCalc.';
          content.append(hint);
          break;
        }
        case 'financial':
          addToggle('Show chart', 'chart', true, toggleClass('hide-chart'));
          addToggle('Market details', 'details', true, toggleClass('hide-details'));
          addToggle('Holdings list', 'holdings', false, value => widget.classList.toggle('show-holdings', value));
          break;
        case 'todo':
          addToggle('Completed tasks', 'completed', true, toggleClass('hide-completed'));
          break;
        case 'notes':
          addToggle('Writing lines', 'lines', true, value => widget.classList.toggle('notes-no-lines', !value));
          break;
        case 'gmail':
          addToggle('Message previews', 'previews', true, toggleClass('hide-previews'));
          addToggle('Show dates', 'times', true, toggleClass('hide-times'));
          addToggle('Sender avatars', 'avatars', true, toggleClass('hide-avatars'));
          break;
        case 'calendar':
          addToggle('Upcoming panel', 'upcoming', true, toggleClass('hide-upcoming'));
          addToggle('Adjacent month days', 'muted', true, toggleClass('hide-muted'));
          break;
        case 'launcher':
          addToggle('App labels', 'labels', true, toggleClass('hide-labels'));
          addToggle('Large icons', 'large', false, value => widget.classList.toggle('large-icons', value));
          break;
        case 'system':
          addToggle('Usage bars', 'bars', true, toggleClass('hide-progress'));
          addToggle('Hardware details', 'details', true, toggleClass('hide-previews'));
          break;
        case 'performance': {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DIAL DEFAULTS
           * Defines dial Defaults for the surrounding section.
           * ------------------------------------------------------------------- */
          const dialDefaults = { fps:'#69efd0', frame:'#67c7ff', interaction:'#a88bff' };
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DIAL NAMES
           * Defines dial Names for the surrounding section.
           * ------------------------------------------------------------------- */
          const dialNames = { fps:'Frame rate', frame:'Frame time', interaction:'Interaction' };
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SELECTED DIAL
           * Defines selected Dial for the surrounding section.
           * ------------------------------------------------------------------- */
          let selectedDial = localStorage.getItem(appKey('dialTarget')) || 'fps';
          if (!dialDefaults[selectedDial]) selectedDial = 'fps';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ROW
           * Defines row for the surrounding section.
           * ------------------------------------------------------------------- */
          const row = document.createElement('div');
          row.className = 'setting performance-color-setting';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: LABEL
           * Defines label for the surrounding section.
           * ------------------------------------------------------------------- */
          const label = document.createElement('span');
          label.textContent = 'Dial color';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: CONTROLS
           * Defines controls for the surrounding section.
           * ------------------------------------------------------------------- */
          const controls = document.createElement('span');
          controls.style.display = 'flex';
          controls.style.alignItems = 'center';
          controls.style.gap = '6px';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SELECT
           * Defines select for the surrounding section.
           * ------------------------------------------------------------------- */
          const select = document.createElement('select');
          select.className = 'widget-select';
          Object.entries(dialNames).forEach(([value,text]) => select.add(new Option(text,value)));
          select.value = selectedDial;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: PICKER
           * Defines picker for the surrounding section.
           * ------------------------------------------------------------------- */
          const picker = document.createElement('input');
          picker.type = 'color';
          picker.setAttribute('aria-label','Selected dial color');
          /* HUB GUIDE ---------------------------------------------------------
           * HELPER: COLOR KEY
           * Defines color Key for the surrounding section.
           * ------------------------------------------------------------------- */
          const colorKey = dial => appKey(`${dial}Color`);
          /* HUB GUIDE ---------------------------------------------------------
           * HELPER: READ COLOR
           * Defines read Color for the surrounding section.
           * ------------------------------------------------------------------- */
          const readColor = dial => localStorage.getItem(colorKey(dial)) || dialDefaults[dial];
          /* HUB GUIDE ---------------------------------------------------------
           * HELPER: APPLY DIAL COLOR
           * Defines apply Dial Color for the surrounding section.
           * ------------------------------------------------------------------- */
          const applyDialColor = (dial, value) => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: ROOT
             * Defines root for the surrounding section.
             * ------------------------------------------------------------------- */
            const root = widget.querySelector('.performance-widget');
            if (root) root.style.setProperty(`--perf-${dial}`, value);
          };
          /* HUB GUIDE ---------------------------------------------------------
           * HELPER: SYNC
           * Defines sync for the surrounding section.
           * ------------------------------------------------------------------- */
          const sync = () => { picker.value = readColor(selectedDial); };
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * select.onchange = ()  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          select.onchange = () => { selectedDial = select.value; localStorage.setItem(appKey('dialTarget'), selectedDial); sync(); };
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * picker.oninput = ()  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          picker.oninput = () => { localStorage.setItem(colorKey(selectedDial), picker.value); applyDialColor(selectedDial, picker.value); };
          controls.append(select,picker); row.append(label,controls); content.appendChild(row);
          Object.keys(dialDefaults).forEach(dial => applyDialColor(dial, readColor(dial)));
          sync();

          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: EXPORT ROW
           * Defines export Row for the surrounding section.
           * ------------------------------------------------------------------- */
          const exportRow = document.createElement('div');
          exportRow.className = 'setting performance-export-setting';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: EXPORT LABEL
           * Defines export Label for the surrounding section.
           * ------------------------------------------------------------------- */
          const exportLabel = document.createElement('span');
          exportLabel.textContent = 'Performance log';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: EXPORT BUTTON
           * Defines export Button for the surrounding section.
           * ------------------------------------------------------------------- */
          const exportButton = document.createElement('button');
          exportButton.type = 'button';
          exportButton.className = 'settings-button settings-button--secondary';
          exportButton.textContent = 'Download CSV';
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * exportButton.addEventListener('click', event  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          exportButton.addEventListener('click', event => {
            event.stopPropagation();
            performanceTelemetry.download('csv');
          });
          exportRow.append(exportLabel, exportButton);
          content.appendChild(exportRow);
          break;
        }
        case 'projects':
          addToggle('Project status', 'status', true, toggleClass('hide-status'));
          break;
        case 'analytics':
          addToggle('Performance chart', 'chart', true, toggleClass('hide-chart'));
          addToggle('Traffic sources', 'sources', false, value => widget.classList.toggle('show-analytics-sources', value));
          break;
        case 'links':
          addToggle('Link labels', 'labels', true, toggleClass('hide-labels'));
          break;
        case 'music':
          addToggle('Album artwork', 'art', true, toggleClass('hide-art'));
          addToggle('Playback progress', 'progress', true, toggleClass('hide-progress'));
          break;
        case 'photos':
          let syncPhotoSettings = () => {};
          addSelect('View', 'view', [['library','Photo Library'],['carousel','Swipe Carousel'],['featured','Featured Photo'],['filmstrip','Photo + Filmstrip'],['slideshow','Automatic Slideshow']], 'library', value => {
            widget.dataset.photoView = value;
            widget._setPhotoBadge?.(value);
            widget._restartPhotoSlideshow?.();
            syncPhotoSettings();
          });
          const slideshowSpeedRow = addSelect('Slideshow speed', 'interval', [['3','3 seconds'],['5','5 seconds'],['8','8 seconds'],['12','12 seconds']], '5', value => {
            widget.dataset.photoInterval = value;
            widget._restartPhotoSlideshow?.();
          });
          addSelect('Photo fit', 'fit', [['cover','Fill frame'],['contain','Show entire photo']], 'cover', value => widget.classList.toggle('photos-contain', value === 'contain'));
          addSelect('Photo order', 'order', [['original','Newest first'],['reverse','Oldest first']], 'original', value => widget.classList.toggle('photos-reverse', value === 'reverse'));
          addSelect('Thumbnail shape', 'shape', [['natural','Phone photo mix'],['square','Square grid']], 'natural', value => widget.classList.toggle('photos-uniform', value === 'square'));
          syncPhotoSettings = () => { slideshowSpeedRow.hidden = widget.dataset.photoView !== 'slideshow'; };
          syncPhotoSettings();
          break;
        case 'tagim':
          addToggle('Composer', 'composer', true, toggleClass('hide-composer'));
          break;
        case 'reminders':
          addToggle('Show times', 'times', true, toggleClass('hide-times'));
          addToggle('Color indicators', 'dots', true, toggleClass('hide-dots'));
          break;
      }
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RESET
       * Defines reset for the surrounding section.
       * ------------------------------------------------------------------- */
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'settings-button settings-button--secondary reset-button';
      reset.textContent = 'Reset app settings';
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * reset.onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      reset.onclick = () => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PREFIX
         * Defines prefix for the surrounding section.
         * ------------------------------------------------------------------- */
        const prefix = `hub-widget-app-${widget.id}-${type}-`;
        Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(key => key?.startsWith(prefix)).forEach(key => localStorage.removeItem(key));
        configureWidgetAppSettings(widget, type);
        updateClocks();
      };
      content.appendChild(reset);
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: INITIALIZE USABILITY PASS
     * Implementation of initialize Usability Pass. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function initializeUsabilityPass(widget, type) {
      /* HUB GUIDE ---------------------------------------------------------
       * WIDGET-SPECIFIC BEHAVIOR: TYPE === 'TODO'
       * Only this widget type uses the following branch.
       * ------------------------------------------------------------------- */
      if (type === 'todo') {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: FORM
         * Defines form for the surrounding section.
         * ------------------------------------------------------------------- */
        const form = widget.querySelector('[data-todo-form]');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INPUT
         * Defines input for the surrounding section.
         * ------------------------------------------------------------------- */
        const input = widget.querySelector('[data-todo-input]');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LIST
         * Defines list for the surrounding section.
         * ------------------------------------------------------------------- */
        const list = widget.querySelector('[data-todo-list]');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: COUNT
         * Defines count for the surrounding section.
         * ------------------------------------------------------------------- */
        const count = widget.querySelector('.todo-count');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: KEY
         * Defines key for the surrounding section.
         * ------------------------------------------------------------------- */
        const key = `hub-todo-items-v1-${widget.id}`;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TASKS
         * Defines tasks for the surrounding section.
         * ------------------------------------------------------------------- */
        let tasks = [];
        try {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SAVED
           * Defines saved for the surrounding section.
           * ------------------------------------------------------------------- */
          const saved = JSON.parse(localStorage.getItem(key) || '[]');
          if (Array.isArray(saved)) tasks = saved.filter(task => task && typeof task.text === 'string').map(task => ({ id: String(task.id || ''), text: task.text.slice(0, 160), done: Boolean(task.done) }));
        } catch (_) {}
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SAVE
         * Defines save for the surrounding section.
         * ------------------------------------------------------------------- */
        const save = () => localStorage.setItem(key, JSON.stringify(tasks));
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: RENDER
         * Defines render for the surrounding section.
         * ------------------------------------------------------------------- */
        const render = () => {
          if (!list) return;
          list.replaceChildren();
          tasks.forEach(task => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: ROW
             * Defines row for the surrounding section.
             * ------------------------------------------------------------------- */
            const row = document.createElement('div');
            row.className = `todo-item${task.done ? ' done' : ''}`;
            row.dataset.todoId = task.id;
            row.draggable = true;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: CHECK LABEL
             * Defines check Label for the surrounding section.
             * ------------------------------------------------------------------- */
            const checkLabel = document.createElement('label');
            checkLabel.className = 'todo-check';
            checkLabel.title = task.done ? 'Mark incomplete' : 'Mark complete';
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: CHECKBOX
             * Defines checkbox for the surrounding section.
             * ------------------------------------------------------------------- */
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.done;
            checkbox.setAttribute('aria-label', `${task.done ? 'Mark incomplete' : 'Mark complete'}: ${task.text}`);
            /* HUB GUIDE ---------------------------------------------------------
             * EVENT BINDING
             * checkbox.addEventListener('change', ()  — connects the control or lifecycle event to its handler.
             * ------------------------------------------------------------------- */
            checkbox.addEventListener('change', () => {
              task.done = checkbox.checked;
              save();
              render();
            });
            checkLabel.appendChild(checkbox);
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: TEXT
             * Defines text for the surrounding section.
             * ------------------------------------------------------------------- */
            const text = document.createElement('span');
            text.className = 'todo-text';
            text.textContent = task.text;
            text.title = task.text;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: REMOVE
             * Defines remove for the surrounding section.
             * ------------------------------------------------------------------- */
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.className = 'todo-delete';
            remove.textContent = '×';
            remove.setAttribute('aria-label', `Delete task: ${task.text}`);
            /* HUB GUIDE ---------------------------------------------------------
             * EVENT BINDING
             * remove.addEventListener('click', ()  — connects the control or lifecycle event to its handler.
             * ------------------------------------------------------------------- */
            remove.addEventListener('click', () => {
              tasks = tasks.filter(item => item.id !== task.id);
              save();
              render();
            });
            row.append(checkLabel, text, remove);
            list.appendChild(row);
          });
          if (!tasks.length) {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: EMPTY
             * Defines empty for the surrounding section.
             * ------------------------------------------------------------------- */
            const empty = document.createElement('div');
            empty.className = 'todo-empty';
            empty.textContent = 'No tasks yet.';
            list.appendChild(empty);
          }
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: REMAINING
           * Defines remaining for the surrounding section.
           * ------------------------------------------------------------------- */
          const remaining = tasks.filter(task => !task.done).length;
          if (count) count.textContent = `${remaining} remaining`;
        };
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DRAGGED ID
         * Defines dragged Id for the surrounding section.
         * ------------------------------------------------------------------- */
        let draggedId = '';
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SAVE RENDERED ORDER
         * Defines save Rendered Order for the surrounding section.
         * ------------------------------------------------------------------- */
        const saveRenderedOrder = () => {
          if (!list || !draggedId) return;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TASK BY ID
           * Defines task By Id for the surrounding section.
           * ------------------------------------------------------------------- */
          const taskById = new Map(tasks.map(task => [task.id, task]));
          tasks = [...list.querySelectorAll('.todo-item')].map(row => taskById.get(row.dataset.todoId)).filter(Boolean);
          list.querySelectorAll('.todo-dragging').forEach(row => row.classList.remove('todo-dragging'));
          draggedId = '';
          save();
        };
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list?.addEventListener('dragstart', event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list?.addEventListener('dragstart', event => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ROW
           * Defines row for the surrounding section.
           * ------------------------------------------------------------------- */
          const row = event.target.closest('.todo-item');
          if (!row || event.target.closest('.todo-check, .todo-delete')) { event.preventDefault(); return; }
          draggedId = row.dataset.todoId || '';
          row.classList.add('todo-dragging');
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', draggedId);
          }
        });
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list?.addEventListener('dragover', event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list?.addEventListener('dragover', event => {
          if (!draggedId || !list) return;
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DRAGGED
           * Defines dragged for the surrounding section.
           * ------------------------------------------------------------------- */
          const dragged = list.querySelector(`.todo-item[data-todo-id="${CSS.escape(draggedId)}"]`);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TARGET
           * Defines target for the surrounding section.
           * ------------------------------------------------------------------- */
          const target = event.target.closest('.todo-item');
          if (!dragged || !target || dragged === target) return;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: BOUNDS
           * Defines bounds for the surrounding section.
           * ------------------------------------------------------------------- */
          const bounds = target.getBoundingClientRect();
          list.insertBefore(dragged, event.clientY < bounds.top + bounds.height / 2 ? target : target.nextSibling);
        });
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list?.addEventListener('drop', event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list?.addEventListener('drop', event => { event.preventDefault(); saveRenderedOrder(); });
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * list?.addEventListener('dragend', saveRenderedOrder); — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        list?.addEventListener('dragend', saveRenderedOrder);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * form?.addEventListener('submit', event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        form?.addEventListener('submit', event => {
          event.preventDefault();
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TEXT
           * Defines text for the surrounding section.
           * ------------------------------------------------------------------- */
          const text = input?.value.trim();
          if (!text) { input?.focus(); return; }
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ID
           * Defines id for the surrounding section.
           * ------------------------------------------------------------------- */
          const id = globalThis.crypto?.randomUUID?.() || `todo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
          tasks.push({ id, text: text.slice(0, 160), done: false });
          save();
          render();
          input.value = '';
          input.focus();
        });
        render();
      }
      /* HUB GUIDE ---------------------------------------------------------
       * WIDGET-SPECIFIC BEHAVIOR: TYPE === 'NOTES'
       * Only this widget type uses the following branch.
       * ------------------------------------------------------------------- */
      if (type === 'notes') {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PAD
         * Defines pad for the surrounding section.
         * ------------------------------------------------------------------- */
        const pad = widget.querySelector('[data-notes-pad]');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STATUS
         * Defines status for the surrounding section.
         * ------------------------------------------------------------------- */
        const status = widget.querySelector('[data-notes-status]');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: KEY
         * Defines key for the surrounding section.
         * ------------------------------------------------------------------- */
        const key = `hub-quick-note-${widget.id}`;
        if (pad) {
          pad.value = localStorage.getItem(key) || '';
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TIMER
           * Defines timer for the surrounding section.
           * ------------------------------------------------------------------- */
          let timer = 0;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * pad.addEventListener('input', ()  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          pad.addEventListener('input', () => {
            localStorage.setItem(key, pad.value);
            if (status) status.textContent = 'Saved locally';
            clearTimeout(timer);
            timer = setTimeout(() => { if (status) status.textContent = 'Ready'; }, 900);
          });
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * widget.querySelector('[data-notes-new]')?.addEventListener('click', ()  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          widget.querySelector('[data-notes-new]')?.addEventListener('click', () => { pad.value=''; localStorage.setItem(key,''); pad.focus(); if(status) status.textContent='New note'; });
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * widget.querySelector('[data-notes-open]')?.addEventListener('click', ()  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          widget.querySelector('[data-notes-open]')?.addEventListener('click', () => { if(status) status.textContent='Saved notes · iCloud integration pending'; pad.focus(); });
        }
      }
      /* HUB GUIDE ---------------------------------------------------------
       * WIDGET-SPECIFIC BEHAVIOR: TYPE === 'ANALYTICS'
       * Only this widget type uses the following branch.
       * ------------------------------------------------------------------- */
      if (type === 'analytics') {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HEAD
         * Defines head for the surrounding section.
         * ------------------------------------------------------------------- */
        const head = widget.querySelector('.hub-widget-header');
        if (head && !head.querySelector('.analytics-timeframes')) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: GROUP
           * Defines group for the surrounding section.
           * ------------------------------------------------------------------- */
          const group = document.createElement('div');
          group.className = 'analytics-timeframes';
          ['7D','30D','90D','1Y'].forEach((label, index) => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: BUTTON
             * Defines button for the surrounding section.
             * ------------------------------------------------------------------- */
            const button = document.createElement('button');
            button.type='button'; button.className='analytics-timeframe' + (index===1?' active':''); button.textContent=label;
            /* HUB GUIDE ---------------------------------------------------------
             * EVENT BINDING
             * button.onclick = ()  — connects the control or lifecycle event to its handler.
             * ------------------------------------------------------------------- */
            button.onclick = () => { group.querySelectorAll('button').forEach(b=>b.classList.remove('active')); button.classList.add('active'); };
            group.appendChild(button);
          });
          head.appendChild(group);
        }
      }
    }
