/* HUB GUIDE =================================================================
 * FILE: src/background.js
 * Background selection and persistence, image URL loading, and startup completion.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: OPEN DB
     * Implementation of open DB. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function openDB() {
      return new Promise((resolve, reject) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: REQUEST
         * Defines request for the surrounding section.
         * ------------------------------------------------------------------- */
        const request = indexedDB.open('tagims-app-background-' + window.OpsPage, 1);
        request.onupgradeneeded = () => request.result.createObjectStore('settings');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SAVE IMAGE
     * Writes or removes the background record and waits for the IndexedDB transaction to finish.
     * ------------------------------------------------------------------- */
    async function saveImage(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DB
       * Defines db for the surrounding section.
       * ------------------------------------------------------------------- */
      const db = await openDB();
      try { await new Promise((resolve,reject)=>{
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TRANSACTION
         * Defines transaction for the surrounding section.
         * ------------------------------------------------------------------- */
        const transaction=db.transaction('settings','readwrite');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STORE
         * Defines store for the surrounding section.
         * ------------------------------------------------------------------- */
        const store=transaction.objectStore('settings');
        if(value) store.put(value,'background'); else store.delete('background');
        transaction.oncomplete=resolve;
        transaction.onerror=()=>reject(transaction.error || new Error('Image could not be saved'));
        transaction.onabort=()=>reject(transaction.error || new Error('Image save cancelled'));
      }); } finally { db.close(); }
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: SAVED BACKGROUND IMAGE
     * Defines saved Background Image for the surrounding section.
     * ------------------------------------------------------------------- */
    let savedBackgroundImage = null;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: BACKGROUND MODE
     * Defines background Mode for the surrounding section.
     * ------------------------------------------------------------------- */
    let backgroundMode = localStorage.getItem('hub-background-mode') || 'image';
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: BACKGROUND STYLE
     * Defines background Style for the surrounding section.
     * ------------------------------------------------------------------- */
    let backgroundStyle = localStorage.getItem('hub-background-style') || 'solid';

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: APPLY COLOR BACKGROUND
     * Implementation of apply Color Background. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function applyColorBackground() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PRIMARY
       * Defines primary for the surrounding section.
       * ------------------------------------------------------------------- */
      const primary = localStorage.getItem('hub-bg-color') || '#DA34C0';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SECONDARY
       * Defines secondary for the surrounding section.
       * ------------------------------------------------------------------- */
      const secondary = localStorage.getItem('hub-bg-gradient-color') || '#321A83';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SAVED ANGLE
       * Defines saved Angle for the surrounding section.
       * ------------------------------------------------------------------- */
      const savedAngle = localStorage.getItem('hub-bg-gradient-angle');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ANGLE
       * Defines angle for the surrounding section.
       * ------------------------------------------------------------------- */
      const angle = savedAngle === null ? 135 : Number(savedAngle);
      root.style.setProperty('--bg', primary);
      background.style.backgroundImage = backgroundStyle === 'gradient' ? `linear-gradient(${angle}deg, ${primary}, ${secondary})` : 'none';
      $('bgColor').value = primary;
      $('bgGradientColor').value = secondary;
      $('bgGradientAngle').value = angle;
      $('bgGradientAngleValue').textContent = `${angle}°`;
      $('bgGradientDial').style.setProperty('--dial-angle', `${angle}deg`);
      $('bgGradientDial').setAttribute('aria-valuenow', String(angle));
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: APPLY IMAGE BACKGROUND
     * Implementation of apply Image Background. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function applyImageBackground() {
      if (savedBackgroundImage) background.style.backgroundImage = `url(${JSON.stringify(savedBackgroundImage)})`;
      else if (localStorage.getItem('hub-background-image-disabled') === 'true') background.style.backgroundImage = 'none';
      else background.style.backgroundImage = 'none';
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET BACKGROUND STYLE
     * Implementation of set Background Style. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setBackgroundStyle(value, save = true) {
      backgroundStyle = value === 'gradient' ? 'gradient' : 'solid';
      document.querySelectorAll('[data-background-style]').forEach(button => button.classList.toggle('active', button.dataset.backgroundStyle === backgroundStyle));
      document.querySelectorAll('.gradient-background-setting').forEach(setting => setting.hidden = backgroundStyle !== 'gradient');
      if (save) localStorage.setItem('hub-background-style', backgroundStyle);
      if (backgroundMode === 'color') applyColorBackground();
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET BACKGROUND MODE
     * Implementation of set Background Mode. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setBackgroundMode(value, save = true) {
      backgroundMode = value === 'color' ? 'color' : 'image';
      $('backgroundModeToggle').classList.toggle('on', backgroundMode === 'image');
      $('backgroundModeToggle').setAttribute('aria-checked', String(backgroundMode === 'image'));
      $('backgroundImageControls').hidden = backgroundMode !== 'image';
      $('backgroundColorControls').hidden = backgroundMode !== 'color';
      if (save) localStorage.setItem('hub-background-mode', backgroundMode);
      backgroundMode === 'image' ? applyImageBackground() : applyColorBackground();
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: LOAD IMAGE
     * Restores the background record and reapplies it when image mode is selected.
     * ------------------------------------------------------------------- */
    async function loadImage() {
      try {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DB
         * Defines db for the surrounding section.
         * ------------------------------------------------------------------- */
        const db = await openDB();
        savedBackgroundImage = await new Promise(resolve => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: REQUEST
           * Defines request for the surrounding section.
           * ------------------------------------------------------------------- */
          const request = db.transaction('settings', 'readonly').objectStore('settings').get('background');
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        });
      } catch {
        savedBackgroundImage = null;
      }
      if (backgroundMode === 'image') applyImageBackground();
      return savedBackgroundImage;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('backgroundModeToggle').onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('backgroundModeToggle').onclick = () => setBackgroundMode(backgroundMode === 'image' ? 'color' : 'image');
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * document.querySelectorAll('[data-background-style]').forEach(button  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    document.querySelectorAll('[data-background-style]').forEach(button => button.onclick = () => setBackgroundStyle(button.dataset.backgroundStyle));
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('bgColor').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('bgColor').oninput = event => { setBackgroundColor(event.target.value); if (backgroundMode === 'color') applyColorBackground(); };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('bgGradientColor').oninput = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('bgGradientColor').oninput = event => { localStorage.setItem('hub-bg-gradient-color', event.target.value); if (backgroundMode === 'color') applyColorBackground(); };
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET GRADIENT ANGLE
     * Implementation of set Gradient Angle. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setGradientAngle(value) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ANGLE
       * Defines angle for the surrounding section.
       * ------------------------------------------------------------------- */
      const angle = ((Math.round(Number(value) / 5) * 5) % 360 + 360) % 360;
      $('bgGradientAngle').value = angle;
      $('bgGradientAngleValue').textContent = `${angle}°`;
      $('bgGradientDial').style.setProperty('--dial-angle', `${angle}deg`);
      $('bgGradientDial').setAttribute('aria-valuenow', String(angle));
      localStorage.setItem('hub-bg-gradient-angle', String(angle));
      if (backgroundMode === 'color') applyColorBackground();
    }
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: GRADIENT DIAL
     * Defines gradient Dial for the surrounding section.
     * ------------------------------------------------------------------- */
    const gradientDial = $('bgGradientDial');
    /* HUB GUIDE ---------------------------------------------------------
     * HELPER: ANGLE FROM POINTER
     * Defines angle From Pointer for the surrounding section.
     * ------------------------------------------------------------------- */
    const angleFromPointer = event => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RECT
       * Defines rect for the surrounding section.
       * ------------------------------------------------------------------- */
      const rect = gradientDial.getBoundingClientRect();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DEGREES
       * Defines degrees for the surrounding section.
       * ------------------------------------------------------------------- */
      const degrees = Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180 / Math.PI + 90;
      setGradientAngle(degrees);
    };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * gradientDial.onpointerdown = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    gradientDial.onpointerdown = event => {
      event.preventDefault();
      gradientDial.setPointerCapture(event.pointerId);
      angleFromPointer(event);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * gradientDial.onpointermove = angleFromPointer; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      gradientDial.onpointermove = angleFromPointer;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: FINISH
       * Defines finish for the surrounding section.
       * ------------------------------------------------------------------- */
      const finish = () => { gradientDial.onpointermove = null; gradientDial.onpointerup = null; gradientDial.onpointercancel = null; };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * gradientDial.onpointerup = finish; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      gradientDial.onpointerup = finish;
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * gradientDial.onpointercancel = finish; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      gradientDial.onpointercancel = finish;
    };
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * gradientDial.onkeydown = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    gradientDial.onkeydown = event => {
      if (!['ArrowLeft', 'ArrowDown', 'ArrowRight', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DIRECTION
       * Defines direction for the surrounding section.
       * ------------------------------------------------------------------- */
      const direction = ['ArrowRight', 'ArrowUp'].includes(event.key) ? 1 : -1;
      setGradientAngle(Number($('bgGradientAngle').value) + direction * (event.shiftKey ? 15 : 5));
    };


    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('applyBackgroundURL').onclick = async ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('applyBackgroundURL').onclick = async () => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: VALUE, STATUS
       * Defines value, status for the surrounding section.
       * ------------------------------------------------------------------- */
      const value=$('backgroundURL').value.trim(), status=$('backgroundStatus');
      if(!value){status.textContent='Enter an image URL or relative path.';return;}
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: URL
       * Defines url for the surrounding section.
       * ------------------------------------------------------------------- */
      let url;
      try { url=new URL(value,document.baseURI); if(!['https:','http:','file:'].includes(url.protocol))throw new Error(); }
      catch {status.textContent='Use an image URL or relative file path.';return;}
      status.textContent='Loading image…';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROBE
       * Defines probe for the surrounding section.
       * ------------------------------------------------------------------- */
      const probe=new Image();
      probe.onload=async()=>{
        try {await saveImage(value); savedBackgroundImage=value;localStorage.removeItem('hub-background-image-disabled');setBackgroundMode('image');status.textContent='Image saved.';}
        catch(error){status.textContent=error.message;}
      };
      probe.onerror=()=>{status.textContent='Image could not be loaded. Check the URL or path.';};
      probe.src=url.href;
    };

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('backgroundUpload').onchange = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('backgroundUpload').onchange = event => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FILE
       * Defines file for the surrounding section.
       * ------------------------------------------------------------------- */
      const file = event.target.files[0];
      if (!file) return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: READER
       * Defines reader for the surrounding section.
       * ------------------------------------------------------------------- */
      const reader = new FileReader();
      reader.onload = () => {
        savedBackgroundImage = reader.result;
        localStorage.removeItem('hub-background-image-disabled');
        setBackgroundMode('image');
        saveImage(reader.result).catch(error => $('backgroundStatus').textContent = error.message);
      };
      reader.readAsDataURL(file);
      event.target.value = '';
    };

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * $('removeBackground').onclick = ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    $('removeBackground').onclick = () => {
      savedBackgroundImage = null;
      localStorage.setItem('hub-background-image-disabled', 'true');
      setBackgroundMode('color');
      saveImage(null).catch(error => $('backgroundStatus').textContent = error.message);
    };

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: STARTUP BOOT STARTED AT
     * Defines startup Boot Started At for the surrounding section.
     * ------------------------------------------------------------------- */
    const startupBootStartedAt = performance.now();
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: STARTUP MIN VISIBLE MS
     * Defines STARTUP MIN VISIBLE MS for the surrounding section.
     * ------------------------------------------------------------------- */
    const STARTUP_MIN_VISIBLE_MS = 900;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: STARTUP BACKGROUND FAILSAFE MS
     * Defines STARTUP BACKGROUND FAILSAFE MS for the surrounding section.
     * ------------------------------------------------------------------- */
    const STARTUP_BACKGROUND_FAILSAFE_MS = 4000;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: FINISH STARTUP BOOT
     * Implementation of finish Startup Boot. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function finishStartupBoot() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LOADER
       * Defines loader for the surrounding section.
       * ------------------------------------------------------------------- */
      const loader = $('startupLoader');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: REMAINING
       * Defines remaining for the surrounding section.
       * ------------------------------------------------------------------- */
      const remaining = Math.max(0, STARTUP_MIN_VISIBLE_MS - (performance.now() - startupBootStartedAt));
      setTimeout(() => {
        requestAnimationFrame(() => requestAnimationFrame(() => {
          document.body.classList.remove('hub-booting');
          if (!loader) return;
          loader.classList.add('is-exiting');
          loader.setAttribute('aria-hidden', 'true');
          loader.style.animation = 'none';
          // Reduced motion and interrupted transitions must not leave an overlay on the app.
          setTimeout(() => loader.remove(), 500);
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * loader.addEventListener('transitionend', ()  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          loader.addEventListener('transitionend', () => loader.remove(), { once: true });
        }));
      }, remaining);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: BOOT COMMAND CENTER
     * Implementation of boot Command Center. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    async function bootCommandCenter() {
      setBackgroundStyle(backgroundStyle, false);
      if (backgroundMode === 'image') {
        await Promise.race([
          loadImage(),
          new Promise(resolve => setTimeout(resolve, STARTUP_BACKGROUND_FAILSAFE_MS))
        ]);
      } else {
        loadImage();
      }
      setBackgroundMode(backgroundMode, false);
      finishStartupBoot();
    }

    bootCommandCenter();
