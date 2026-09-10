/* HUB GUIDE =================================================================
 * FILE: src/shell.js
 * Hub settings, theme colors, fonts, menus, and display preferences.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
/* HUB GUIDE ---------------------------------------------------------
 * STATE / REFERENCES: DETACHED FINANCE TYPES
 * Defines detached Finance Types for the surrounding section.
 * ------------------------------------------------------------------- */
const detachedFinanceTypes = new Set();
const removedWidgetTypes = new Set(['analytics','links','system','launcher','moon','radar']);

    /* HUB GUIDE ---------------------------------------------------------
     * HELPER: $
     * Defines $ for the surrounding section.
     * ------------------------------------------------------------------- */
    const $ = id => document.getElementById(id);
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ROOT
     * Defines root for the surrounding section.
     * ------------------------------------------------------------------- */
    const root = document.documentElement;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: APP ICON SHEET
     * Defines app Icon Sheet for the surrounding section.
     * ------------------------------------------------------------------- */
    const appIconSheet = '/apps/_hub/assets/app-icons.png';
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: APP ICON SHEET OBJECT URL
     * Defines app Icon Sheet Object URL for the surrounding section.
     * ------------------------------------------------------------------- */
    const appIconSheetObjectURL = appIconSheet;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: BACKGROUND
     * Defines background for the surrounding section.
     * ------------------------------------------------------------------- */
    const background = $('background');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PANEL
     * Defines panel for the surrounding section.
     * ------------------------------------------------------------------- */
    const panel = $('panel');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: OVERLAY
     * Defines overlay for the surrounding section.
     * ------------------------------------------------------------------- */
    const overlay = $('overlay');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PARALLAX
     * Defines parallax for the surrounding section.
     * ------------------------------------------------------------------- */
    let parallax = localStorage.getItem('hub-parallax') !== 'false';

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET MENU
     * Implementation of set Menu. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    let settingsPinned = false;
    function setMenu(open) {
      if (!open) settingsPinned = false;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TOPBAR
       * Defines topbar for the surrounding section.
       * ------------------------------------------------------------------- */
      const topbar = document.querySelector('.topbar');
      // The settings tab stays fixed; moving it during pointer entry closed the menu.
      panel.classList.toggle('open', open);
      overlay.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      panel.setAttribute('aria-hidden', String(!open));
      $('openMenu').setAttribute('aria-expanded', String(open));
      $('menuEdgeTrigger').setAttribute('aria-expanded', String(open));
      $('openMenu').setAttribute('aria-label', open ? 'Close settings' : 'Open settings');
      $('openMenu').setAttribute('title', open ? 'Close settings' : 'Open settings');
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('openMenu').onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('openMenu').onclick = event => { event.stopPropagation(); const close=settingsPinned && panel.classList.contains('open'); setMenu(!close); settingsPinned=!close; };
    $('openMenu').onpointerenter = event => { if(event.pointerType==='mouse'){clearTimeout(edgeMenuTimer);setMenu(true);} };
    $('openMenu').onpointerleave = () => panel.onpointerleave();
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: EDGE MENU TIMER
     * Defines edge Menu Timer for the surrounding section.
     * ------------------------------------------------------------------- */
    let edgeMenuTimer = 0;
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('menuEdgeTrigger').onpointerenter = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('menuEdgeTrigger').onpointerenter = event => {
      if(event.pointerType !== 'mouse') return;
      if (panel.classList.contains('open') || document.body.classList.contains('content-dragging') || $('addWidget')?.matches(':hover')) return;
      clearTimeout(edgeMenuTimer);
      setMenu(true);
    };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('menuEdgeTrigger').onpointerleave = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('menuEdgeTrigger').onpointerleave = () => panel.onpointerleave();
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * panel.onpointerenter = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    panel.onpointerenter = () => clearTimeout(edgeMenuTimer);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * panel.onpointerleave = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    panel.onpointerleave = () => {
      clearTimeout(edgeMenuTimer);
      edgeMenuTimer = setTimeout(() => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ACTIVE
         * Defines active for the surrounding section.
         * ------------------------------------------------------------------- */
        const active = document.activeElement;
        if (!settingsPinned && !panel.matches(':hover') && !$('menuEdgeTrigger').matches(':hover') && !$('openMenu').matches(':hover') && !active?.matches('input, select, textarea')) setMenu(false);
      }, 120);
    };
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ALL MENU SECTIONS
     * Defines all Menu Sections for the surrounding section.
     * ------------------------------------------------------------------- */
    const allMenuSections = [...panel.querySelectorAll('.settings-accordion, .style-subsection-accordion')];
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: TOGGLE ALL SECTIONS
     * Defines toggle All Sections for the surrounding section.
     * ------------------------------------------------------------------- */
    const toggleAllSections = $('toggleAllSections');
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SYNC SECTION CONTROL BUTTONS
     * Implementation of sync Section Control Buttons. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function syncSectionControlButtons() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: COLLAPSE
       * Defines collapse for the surrounding section.
       * ------------------------------------------------------------------- */
      const collapse = allMenuSections.some(section => section.open);
      toggleAllSections.classList.toggle('all-sections-open', collapse);
      toggleAllSections.setAttribute('aria-label', collapse ? 'Collapse all settings sections' : 'Expand all settings sections');
      toggleAllSections.setAttribute('title', collapse ? 'Collapse all' : 'Expand all');
    }
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * toggleAllSections.onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    toggleAllSections.onclick = () => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: EXPAND
       * Defines expand for the surrounding section.
       * ------------------------------------------------------------------- */
      const expand = !allMenuSections.some(section => section.open);
      allMenuSections.forEach(section => { section.open = expand; });
      syncSectionControlButtons();
    };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * allMenuSections.forEach(section  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    allMenuSections.forEach(section => section.addEventListener('toggle', syncSectionControlButtons));
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * overlay.onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    overlay.onclick = () => setMenu(false);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('keydown', event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('keydown', event => {
      if (event.key === 'Escape' && panel.classList.contains('open')) setMenu(false);
    });

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET BACKGROUND COLOR
     * Implementation of set Background Color. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setBackgroundColor(value) {
      root.style.setProperty('--bg', value);
      $('bgColor').value = value;
      localStorage.setItem('hub-bg-color', value);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET MENU COLOR
     * Implementation of set Menu Color. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setMenuColor(value) {
      root.style.setProperty('--menu', value);
      root.style.setProperty('--basic-widget', value);
      $('menuColor').value = value;
      localStorage.setItem('hub-menu-color', value);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET ACCENT
     * Implementation of set Accent. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setAccent(value) {
      root.style.setProperty('--accent', value);
      $('accentColor').value = value;
      localStorage.setItem('hub-accent', value);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET FONT FAMILY
     * Implementation of set Font Family. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setFontFamily(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SELECTOR
       * Defines selector for the surrounding section.
       * ------------------------------------------------------------------- */
      const selector = $('fontFamily');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ALLOWED
       * Defines allowed for the surrounding section.
       * ------------------------------------------------------------------- */
      const allowed = [...selector.options].map(option => option.value);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FAMILY
       * Defines family for the surrounding section.
       * ------------------------------------------------------------------- */
      const family = allowed.includes(value) ? value : allowed[0];
      root.style.setProperty('--hub-font', family);
      selector.value = family;
      localStorage.setItem('hub-font-family', family);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET FONT COLOR
     * Implementation of set Font Color. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setFontColor(value) {
      root.style.setProperty('--font-color', value);
      $('fontColor').value = value;
      localStorage.setItem('hub-font-color', value);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET FONT SIZE
     * Implementation of set Font Size. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setFontSize(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SIZE
       * Defines size for the surrounding section.
       * ------------------------------------------------------------------- */
      const size = Math.max(85, Math.min(120, Number(value) || 100));
      root.style.setProperty('--hub-font-size', `${16 * size / 100}px`);
      $('fontSize').value = size;
      $('fontSizeValue').textContent = `${size}%`;
      localStorage.setItem('hub-font-size', String(size));
    }

    setBackgroundColor(localStorage.getItem('hub-bg-color') || '#DA34C0');
    setMenuColor(localStorage.getItem('hub-menu-color') || '#9437ED');
    setAccent(localStorage.getItem('hub-accent') || '#50D7C8');
    setFontFamily(localStorage.getItem('hub-font-family') || "Manrope, 'Segoe UI', sans-serif");
    setFontColor(localStorage.getItem('hub-font-color') || '#F7F8FA');
    setFontSize(localStorage.getItem('hub-font-size') || '100');

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('bgColor').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('bgColor').oninput = event => setBackgroundColor(event.target.value);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('menuColor').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('menuColor').oninput = event => setMenuColor(event.target.value);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('accentColor').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('accentColor').oninput = event => setAccent(event.target.value);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('fontFamily').onchange = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('fontFamily').onchange = event => setFontFamily(event.target.value);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('fontColor').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('fontColor').oninput = event => setFontColor(event.target.value);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('fontSize').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('fontSize').oninput = event => setFontSize(event.target.value);

    // Direct color workbench: the custom wheel drives the existing color inputs,
    // preserving every established setter/localStorage binding as the single source of truth.
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR LAB
     * Defines color Lab for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorLab = $('colorLab');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR TARGETS
     * Defines color Targets for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorTargets = $('colorTargets');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR WHEEL
     * Defines color Wheel for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorWheel = $('colorWheel');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR VALUE
     * Defines color Value for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorValue = $('colorValue');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR VALUE READOUT
     * Defines color Value Readout for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorValueReadout = $('colorValueReadout');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR HEX
     * Defines color Hex for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorHex = $('colorHex');
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: COLOR TARGET DEFINITIONS
     * Defines color Target Definitions for the surrounding section.
     * ------------------------------------------------------------------- */
    const colorTargetDefinitions = [
      ['menuColor', 'Menu'], ['accentColor', 'Accent'], ['widgetBg', 'Widget 1'],
      ['widgetGradient', 'Widget 2'], ['fontColor', 'Font'], ['bgColor', 'Background'],
      ['bgGradientColor', 'Background 2'], ['widgetHeader', 'Header'],
      ['widgetBorder', 'Border'], ['widgetShadow', 'Shadow']
    ];
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE COLOR INPUT
     * Defines active Color Input for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeColorInput = null;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PICKER HUE, PICKER SAT, PICKER VAL
     * Defines picker Hue, picker Sat, picker Val for the surrounding section.
     * ------------------------------------------------------------------- */
    let pickerHue = 180, pickerSat = 62, pickerVal = 84;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: NORMALIZE HEX
     * Implementation of normalize Hex. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function normalizeHex(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RAW
       * Defines raw for the surrounding section.
       * ------------------------------------------------------------------- */
      const raw = String(value || '').trim();
      if (/^#[0-9a-f]{6}$/i.test(raw)) return raw.toUpperCase();
      if (/^#[0-9a-f]{3}$/i.test(raw)) return ('#' + [...raw.slice(1)].map(c => c + c).join('')).toUpperCase();
      return null;
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: HEX TO HSV
     * Implementation of hex To Hsv. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function hexToHsv(hex) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: N, R, G, B
       * Defines n, r, g, b for the surrounding section.
       * ------------------------------------------------------------------- */
      const n = parseInt(hex.slice(1), 16), r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MAX, MIN, D
       * Defines max, min, d for the surrounding section.
       * ------------------------------------------------------------------- */
      const max = Math.max(r,g,b), min = Math.min(r,g,b), d = max-min;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: H
       * Defines h for the surrounding section.
       * ------------------------------------------------------------------- */
      let h = 0;
      if (d) { if (max === r) h = 60 * (((g-b)/d) % 6); else if (max === g) h = 60 * ((b-r)/d + 2); else h = 60 * ((r-g)/d + 4); }
      if (h < 0) h += 360;
      return [h, max ? d/max*100 : 0, max*100];
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: HSV TO HEX
     * Implementation of hsv To Hex. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function hsvToHex(h,s,v) {
      s/=100; v/=100; const c=v*s, x=c*(1-Math.abs((h/60)%2-1)), m=v-c;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RP, GP, BP
       * Defines rp, gp, bp for the surrounding section.
       * ------------------------------------------------------------------- */
      let rp=0,gp=0,bp=0;
      if(h<60){rp=c;gp=x}else if(h<120){rp=x;gp=c}else if(h<180){gp=c;bp=x}else if(h<240){gp=x;bp=c}else if(h<300){rp=x;bp=c}else{rp=c;bp=x}
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: TO HEX
       * Defines to Hex for the surrounding section.
       * ------------------------------------------------------------------- */
      const toHex=n=>Math.round((n+m)*255).toString(16).padStart(2,'0');
      return ('#'+toHex(rp)+toHex(gp)+toHex(bp)).toUpperCase();
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: REFRESH COLOR TARGET SWATCHES
     * Implementation of refresh Color Target Swatches. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function refreshColorTargetSwatches() {
      colorTargets.querySelectorAll('.color-target').forEach(button => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INPUT
         * Defines input for the surrounding section.
         * ------------------------------------------------------------------- */
        const input = $(button.dataset.colorTarget);
        if (input) button.style.setProperty('--target-color', input.value);
      });
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: POSITION COLOR WHEEL CURSOR
     * Implementation of position Color Wheel Cursor. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function positionColorWheelCursor() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RADIUS
       * Defines radius for the surrounding section.
       * ------------------------------------------------------------------- */
      const radius = pickerSat / 100 * 50;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ANGLE
       * Defines angle for the surrounding section.
       * ------------------------------------------------------------------- */
      const angle = pickerHue * Math.PI / 180;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: X
       * Defines x for the surrounding section.
       * ------------------------------------------------------------------- */
      const x = 50 + Math.sin(angle) * radius;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: Y
       * Defines y for the surrounding section.
       * ------------------------------------------------------------------- */
      const y = 50 - Math.cos(angle) * radius;
      colorWheel.style.setProperty('--picker-x', `${x}%`);
      colorWheel.style.setProperty('--picker-y', `${y}%`);
      colorWheel.style.setProperty('--picker-value', String(pickerVal / 100));
      colorValue.style.setProperty('--active-picker-color', hsvToHex(pickerHue, pickerSat, 100));
      colorValueReadout.textContent = `${Math.round(pickerVal)}%`;
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SYNC COLOR LAB FROM INPUT
     * Implementation of sync Color Lab From Input. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function syncColorLabFromInput(input) {
      if (!input) return;
      activeColorInput = input;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HEX
       * Defines hex for the surrounding section.
       * ------------------------------------------------------------------- */
      const hex = normalizeHex(input.value) || '#FFFFFF';
      [pickerHue,pickerSat,pickerVal] = hexToHsv(hex);
      colorValue.value = Math.round(pickerVal);
      colorHex.value = hex;
      positionColorWheelCursor();
      colorTargets.querySelectorAll('.color-target').forEach(button => button.classList.toggle('active', button.dataset.colorTarget === input.id));
      refreshColorTargetSwatches();
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: APPLY COLOR LAB VALUE
     * Implementation of apply Color Lab Value. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function applyColorLabValue() {
      if (!activeColorInput) return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HEX
       * Defines hex for the surrounding section.
       * ------------------------------------------------------------------- */
      const hex = hsvToHex(pickerHue,pickerSat,pickerVal);
      activeColorInput.value = hex;
      activeColorInput.dispatchEvent(new Event('input', { bubbles: true }));
      colorHex.value = hex;
      colorValue.value = Math.round(pickerVal);
      positionColorWheelCursor();
      refreshColorTargetSwatches();
    }
    colorTargetDefinitions.forEach(([id,label]) => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: INPUT
       * Defines input for the surrounding section.
       * ------------------------------------------------------------------- */
      const input = $(id);
      if (!input) return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BUTTON
       * Defines button for the surrounding section.
       * ------------------------------------------------------------------- */
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'color-target'; button.dataset.colorTarget = id;
      button.innerHTML = `<span class="color-target-swatch"></span><span class="color-target-name"></span>`;
      button.querySelector('.color-target-name').textContent = label;
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * button.onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      button.onclick = () => syncColorLabFromInput(input);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * input.addEventListener('input', ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      input.addEventListener('input', () => { if (activeColorInput === input) syncColorLabFromInput(input); else refreshColorTargetSwatches(); });
      colorTargets.appendChild(button);
    });
    /* HUB GUIDE ---------------------------------------------------------
     * HELPER: SET WHEEL FROM POINTER
     * Defines set Wheel From Pointer for the surrounding section.
     * ------------------------------------------------------------------- */
    const setWheelFromPointer = event => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RECT
       * Defines rect for the surrounding section.
       * ------------------------------------------------------------------- */
      const rect = colorWheel.getBoundingClientRect();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CX, CY
       * Defines cx, cy for the surrounding section.
       * ------------------------------------------------------------------- */
      const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DX, DY
       * Defines dx, dy for the surrounding section.
       * ------------------------------------------------------------------- */
      let dx = event.clientX - cx, dy = event.clientY - cy;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MAX RADIUS
       * Defines max Radius for the surrounding section.
       * ------------------------------------------------------------------- */
      const maxRadius = rect.width / 2;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DISTANCE
       * Defines distance for the surrounding section.
       * ------------------------------------------------------------------- */
      const distance = Math.hypot(dx, dy);
      if (distance > maxRadius) { const scale = maxRadius / distance; dx *= scale; dy *= scale; }
      pickerSat = Math.min(100, Math.hypot(dx, dy) / maxRadius * 100);
      pickerHue = (Math.atan2(dx, -dy) * 180 / Math.PI + 360) % 360;
      applyColorLabValue();
    };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * colorWheel.onpointerdown = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    colorWheel.onpointerdown = event => {
      event.preventDefault();
      colorWheel.setPointerCapture(event.pointerId);
      setWheelFromPointer(event);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * colorWheel.onpointermove = setWheelFromPointer; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      colorWheel.onpointermove = setWheelFromPointer;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: FINISH
       * Defines finish for the surrounding section.
       * ------------------------------------------------------------------- */
      const finish = () => { colorWheel.onpointermove = null; colorWheel.onpointerup = null; colorWheel.onpointercancel = null; };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * colorWheel.onpointerup = finish; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      colorWheel.onpointerup = finish;
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * colorWheel.onpointercancel = finish; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      colorWheel.onpointercancel = finish;
    };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * colorValue.oninput = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    colorValue.oninput = () => { pickerVal = Number(colorValue.value); applyColorLabValue(); };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * colorHex.onchange = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    colorHex.onchange = () => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HEX
       * Defines hex for the surrounding section.
       * ------------------------------------------------------------------- */
      const hex = normalizeHex(colorHex.value);
      if (!hex) { colorHex.value = activeColorInput?.value || '#FFFFFF'; return; }
      activeColorInput.value = hex;
      activeColorInput.dispatchEvent(new Event('input', { bubbles:true }));
      syncColorLabFromInput(activeColorInput);
    };
    syncColorLabFromInput($('accentColor'));

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: LIST DENSITY ORDER
     * Defines list Density Order for the surrounding section.
     * ------------------------------------------------------------------- */
    const listDensityOrder = ['standard', 'semi', 'compact'];
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET LIST DENSITY
     * Implementation of set List Density. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setListDensity(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DENSITY
       * Defines density for the surrounding section.
       * ------------------------------------------------------------------- */
      const density = listDensityOrder.includes(value) ? value : 'standard';
      document.body.dataset.listDensity = density;
      document.querySelectorAll('[data-density]').forEach(button => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ACTIVE
         * Defines active for the surrounding section.
         * ------------------------------------------------------------------- */
        const active = button.dataset.density === density;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      localStorage.setItem('hub-list-density', density);
    }
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * document.querySelectorAll('[data-density]').forEach(button  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    document.querySelectorAll('[data-density]').forEach(button => button.onclick = () => setListDensity(button.dataset.density));
    setListDensity(localStorage.getItem('hub-list-density') || 'standard');

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * document.querySelectorAll('label.setting input[type="color"]').forEach(input  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    document.querySelectorAll('label.setting input[type="color"]').forEach(input => {
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * input.closest('label').addEventListener('click', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      input.closest('label').addEventListener('click', event => {
        if (event.target !== input) event.preventDefault();
      });
    });

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: MENU SECTIONS
     * Defines menu Sections for the surrounding section.
     * ------------------------------------------------------------------- */
    const menuSections = [...document.querySelectorAll('.settings-accordion')];
    menuSections.forEach(section => { if (!section.hasAttribute('open')) section.open = false; });
    document.querySelector('.colors-section').open = true;
    syncSectionControlButtons();

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: UPDATE PARALLAX
     * Implementation of update Parallax. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function updateParallax() {
      $('parallaxToggle').classList.toggle('on', parallax);
      $('parallaxToggle').setAttribute('aria-checked', String(parallax));
      background.classList.toggle('parallax', parallax);
      $('parallaxSpeed').closest('.setting').hidden = !parallax || $('parallaxToggle').closest('.setting').hidden;
      if (!parallax) background.style.transform = 'scale(1.25)';
      localStorage.setItem('hub-parallax', String(parallax));
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('parallaxToggle').onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('parallaxToggle').onclick = () => {
      parallax = !parallax;
      updateParallax();
    };

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET PARALLAX SPEED
     * Implementation of set Parallax Speed. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setParallaxSpeed(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SPEED
       * Defines speed for the surrounding section.
       * ------------------------------------------------------------------- */
      const speed = Math.min(10, Math.max(1, Number(value) || 6));
      $('parallaxSpeed').value = speed;
      $('speedValue').textContent = speed;
      root.style.setProperty('--parallax-speed', `${620 - speed * 58}ms`);
      localStorage.setItem('hub-parallax-speed', String(speed));
    }

    updateParallax();
    setParallaxSpeed(localStorage.getItem('hub-parallax-speed') || 6);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('parallaxSpeed').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('parallaxSpeed').oninput = event => setParallaxSpeed(event.target.value);

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: MANIPULATING WIDGET
     * Defines manipulating Widget for the surrounding section.
     * ------------------------------------------------------------------- */
    let manipulatingWidget = false;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PARALLAX FRAME
     * Defines parallax Frame for the surrounding section.
     * ------------------------------------------------------------------- */
    let parallaxFrame = 0;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PARALLAX POINTER
     * Defines parallax Pointer for the surrounding section.
     * ------------------------------------------------------------------- */
    let parallaxPointer = null;

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('pointermove', event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('pointermove', event => {
      if (!parallax || manipulatingWidget || backgroundMode !== 'image' || matchMedia('(pointer: coarse)').matches) return;
      parallaxPointer = { x: event.clientX, y: event.clientY };
      if (parallaxFrame) return;
      parallaxFrame = requestAnimationFrame(() => {
        parallaxFrame = 0;
        if (!parallaxPointer) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: X
         * Defines x for the surrounding section.
         * ------------------------------------------------------------------- */
        const x = (parallaxPointer.x / innerWidth - .5) * -180;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: Y
         * Defines y for the surrounding section.
         * ------------------------------------------------------------------- */
        const y = (parallaxPointer.y / innerHeight - .5) * -180;
        background.style.transform = `scale(1.25) translate(${x}px, ${y}px)`;
      });
    }, { passive: true });

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET WIDGET THEME
     * Implementation of set Widget Theme. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setWidgetTheme(theme) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BASIC
       * Defines basic for the surrounding section.
       * ------------------------------------------------------------------- */
      const basic = theme === 'basic';
      document.body.classList.toggle('widget-basic', basic);
      $('widgetThemeToggle').classList.toggle('on', !basic);
      $('widgetThemeToggle').setAttribute('aria-checked', String(!basic));
      localStorage.setItem('hub-widget-theme', theme);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('widgetThemeToggle').onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('widgetThemeToggle').onclick = () => setWidgetTheme(document.body.classList.contains('widget-basic') ? 'fancy' : 'basic');
    setWidgetTheme(localStorage.getItem('hub-widget-theme') || 'fancy');

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET CONTROLS
     * Defines widget Controls for the surrounding section.
     * ------------------------------------------------------------------- */
    const widgetControls = [...document.querySelectorAll('[data-widget-var]')];

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: DEFAULT MIGRATIONS
     * Defines default Migrations for the surrounding section.
     * ------------------------------------------------------------------- */
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: APPLY WIDGET CONTROL
     * Implementation of apply Widget Control. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function applyWidgetControl(control, value) {
      if (control.id === 'widgetRadius') {
        value = Math.max(0, Math.min(40, Number.isFinite(Number(value)) ? Number(value) : 18));
        localStorage.setItem('hub-widgetRadius', String(value));
      }
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: UNIT
       * Defines unit for the surrounding section.
       * ------------------------------------------------------------------- */
      const unit = control.dataset.unit || '';
      root.style.setProperty(control.dataset.widgetVar, `${value}${unit}`);
      control.value = value;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: OUTPUT
       * Defines output for the surrounding section.
       * ------------------------------------------------------------------- */
      const output = control.parentElement.querySelector('.range-value');
      if (output) output.textContent = value;
      if (control.id === 'widgetGradientAngle') {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ANGLE
         * Defines angle for the surrounding section.
         * ------------------------------------------------------------------- */
        const angle = ((Math.round(Number(value) / 5) * 5) % 360 + 360) % 360;
        $('widgetGradientDial').style.setProperty('--dial-angle', `${angle}deg`);
        $('widgetGradientDial').setAttribute('aria-valuenow', String(angle));
        $('widgetGradientAngleValue').textContent = `${angle}°`;
      }
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * widgetControls.forEach(control  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    widgetControls.forEach(control => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SAVED
       * Defines saved for the surrounding section.
       * ------------------------------------------------------------------- */
      const saved = localStorage.getItem(`hub-${control.id}`);
      applyWidgetControl(control, saved ?? control.defaultValue);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * control.addEventListener('input', ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      control.addEventListener('input', () => {
        applyWidgetControl(control, control.value);
        localStorage.setItem(`hub-${control.id}`, control.value);
      });
    });

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: BIND ANGLE DIAL
     * Implementation of bind Angle Dial. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function bindAngleDial(dial, input, onChange) {
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: SET FROM POINTER
       * Defines set From Pointer for the surrounding section.
       * ------------------------------------------------------------------- */
      const setFromPointer = event => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RECT
         * Defines rect for the surrounding section.
         * ------------------------------------------------------------------- */
        const rect = dial.getBoundingClientRect();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DEGREES
         * Defines degrees for the surrounding section.
         * ------------------------------------------------------------------- */
        const degrees = Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI + 90;
        onChange(degrees);
      };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * dial.onpointerdown = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      dial.onpointerdown = event => {
        event.preventDefault();
        dial.setPointerCapture(event.pointerId);
        setFromPointer(event);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * dial.onpointermove = setFromPointer; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        dial.onpointermove = setFromPointer;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: FINISH
         * Defines finish for the surrounding section.
         * ------------------------------------------------------------------- */
        const finish = () => { dial.onpointermove = null; dial.onpointerup = null; dial.onpointercancel = null; };
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * dial.onpointerup = finish; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        dial.onpointerup = finish;
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * dial.onpointercancel = finish; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        dial.onpointercancel = finish;
      };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * dial.onkeydown = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      dial.onkeydown = event => {
        if (!['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(event.key)) return;
        event.preventDefault();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DIRECTION
         * Defines direction for the surrounding section.
         * ------------------------------------------------------------------- */
        const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1;
        onChange(Number(input.value) + direction * (event.shiftKey ? 15 : 5));
      };
    }

    bindAngleDial($('widgetGradientDial'), $('widgetGradientAngle'), value => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ANGLE
       * Defines angle for the surrounding section.
       * ------------------------------------------------------------------- */
      const angle = ((Math.round(Number(value) / 5) * 5) % 360 + 360) % 360;
      applyWidgetControl($('widgetGradientAngle'), angle);
      localStorage.setItem('hub-widgetGradientAngle', String(angle));
    });

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('resetWidget').onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('resetWidget').onclick = () => {
      widgetControls.forEach(control => {
        localStorage.removeItem(`hub-${control.id}`);
        applyWidgetControl(control, control.defaultValue);
      });
    };

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: BASE WIDGET TEMPLATE
     * Defines base Widget Template for the surrounding section.
     * ------------------------------------------------------------------- */
    const baseWidgetTemplate = $('widget1').cloneNode(true);
