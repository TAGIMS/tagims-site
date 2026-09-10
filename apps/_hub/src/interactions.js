/* HUB GUIDE =================================================================
 * FILE: src/interactions.js
 * Widget creation, closing, dragging, resizing, stacking, and the Add Widget picker.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET WIDGET CONTENT
     * Parks detached financial types; otherwise replaces content and initializes its controls.
     * ------------------------------------------------------------------- */
    function setWidgetContent(widget, type, save = true) {
      // Convert old Solar instances to the Solar page; the old renderer is retired.
      if(type === 'solar') {
        type='weather';
        localStorage.setItem(`hub-widget-content-${widget.id}`,type);
        localStorage.setItem(`hub-weather-page-${widget.id}`,'solar');
      }
      if (detachedFinanceTypes.has(type)) {
        widget.dataset.financeParked = type;
        widget.hidden = true;
        return;
      }
      delete widget.dataset.financeParked;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HOST
       * Defines host for the surrounding section.
       * ------------------------------------------------------------------- */
      const host = widget.querySelector('.widget-content');
      if (!host) return;
      widget._destroyWeather?.();
      widget._destroyWeather = null;
      widget._destroyPerformance?.();
      widget._destroyPerformance = null;
      clearInterval(widget._photoTimer);
      widget._photoTimer = null;
      host.replaceChildren();
      delete widget.dataset.contentType;
      if (type && contentRenderers[type]) {
        host.appendChild(contentRenderers[type]());
        widget.dataset.contentType = type;
        widget.setAttribute('aria-label', `${type[0].toUpperCase()}${type.slice(1)} widget window`);
        /* HUB GUIDE ---------------------------------------------------------
         * WIDGET-SPECIFIC BEHAVIOR: TYPE === 'PHOTOS'
         * Only this widget type uses the following branch.
         * ------------------------------------------------------------------- */
        if (type === 'photos') initializePhotos(widget);
        /* HUB GUIDE ---------------------------------------------------------
         * WIDGET-SPECIFIC BEHAVIOR: TYPE === 'PERFORMANCE'
         * Only this widget type uses the following branch.
         * ------------------------------------------------------------------- */
        if (type === 'performance') initializePerformance(widget);
        if (type === 'weather') HubWeather.init(widget);
        initializeListScrolling(widget);
        initializeUsabilityPass(widget, type);

      } else {
        widget.setAttribute('aria-label', 'Empty widget window');
      }
      syncWidgetWindowHeader(widget, type);
      configureWidgetAppSettings(widget, type);
      queueResponsiveState(widget);
      if (save) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: KEY
         * Defines key for the surrounding section.
         * ------------------------------------------------------------------- */
        const key = `hub-widget-content-${widget.id}`;
        type ? localStorage.setItem(key, type) : localStorage.removeItem(key);
        HubLayouts.markDirty();
      }
      updateClocks();
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CLEAR CONTENT DRAG STATE
     * Implementation of clear Content Drag State. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function clearContentDragState() {
      document.body.classList.remove('content-dragging');
      currentWidgets().forEach(widget => widget.classList.remove('widget-drop-ready', 'widget-drop-target'));
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * document.querySelectorAll('.widget-library-item[data-content-type]').forEach(item  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    document.querySelectorAll('.widget-library-item[data-content-type]').forEach(item => {
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * item.addEventListener('pointerdown', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      item.addEventListener('pointerdown', event => {
        if (event.button !== 0 && event.pointerType === 'mouse') return;
        event.preventDefault();
        item.setPointerCapture(event.pointerId);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TYPE
         * Defines type for the surrounding section.
         * ------------------------------------------------------------------- */
        const type = item.dataset.contentType;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: GHOST
         * Defines ghost for the surrounding section.
         * ------------------------------------------------------------------- */
        const ghost = item.cloneNode(true);
        ghost.className = 'widget-drag-ghost';
        ghost.removeAttribute('data-content-type');
        document.body.appendChild(ghost);
        document.body.classList.add('content-dragging');
        currentWidgets().filter(widget => !widget.hidden).forEach(widget => widget.classList.add('widget-drop-ready'));

        /* HUB GUIDE ---------------------------------------------------------
         * FUNCTION: MOVE GHOST
         * Implementation of move Ghost. Calls and local helpers below belong to this operation.
         * ------------------------------------------------------------------- */
        function moveGhost(pointerEvent) {
          ghost.style.left = `${pointerEvent.clientX}px`;
          ghost.style.top = `${pointerEvent.clientY}px`;
          currentWidgets().forEach(widget => widget.classList.remove('widget-drop-target'));
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TARGET
           * Defines target for the surrounding section.
           * ------------------------------------------------------------------- */
          const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.widget');
          if (target && !target.hidden) target.classList.add('widget-drop-target');
          return target;
        }

        moveGhost(event);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * item.onpointermove = moveGhost; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        item.onpointermove = moveGhost;

        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: FINISH
         * Defines finish for the surrounding section.
         * ------------------------------------------------------------------- */
        const finish = pointerEvent => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TARGET
           * Defines target for the surrounding section.
           * ------------------------------------------------------------------- */
          const target = moveGhost(pointerEvent);
          if (target && !target.hidden) {
            setWidgetContent(target, type);
            bringWidgetToFront(target);
          } else {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: PANEL RECT
             * Defines panel Rect for the surrounding section.
             * ------------------------------------------------------------------- */
            const panelRect = panel.getBoundingClientRect();
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: DROPPED IN PANEL
             * Defines dropped In Panel for the surrounding section.
             * ------------------------------------------------------------------- */
            const droppedInPanel = pointerEvent.clientX >= panelRect.left && pointerEvent.clientX <= panelRect.right && pointerEvent.clientY >= panelRect.top && pointerEvent.clientY <= panelRect.bottom;
            if (!droppedInPanel) createWidgetAt(type, pointerEvent.clientX, pointerEvent.clientY);
          }
          ghost.remove();
          clearContentDragState();
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * item.onpointermove = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          item.onpointermove = null;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * item.onpointerup = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          item.onpointerup = null;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * item.onpointercancel = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          item.onpointercancel = null;
        };

        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * item.onpointerup = finish; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        item.onpointerup = finish;
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * item.onpointercancel = ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        item.onpointercancel = () => {
          ghost.remove();
          clearContentDragState();
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * item.onpointermove = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          item.onpointermove = null;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * item.onpointerup = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          item.onpointerup = null;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * item.onpointercancel = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          item.onpointercancel = null;
        };
      });
    });

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: TOP WIDGET Z
     * Defines top Widget Z for the surrounding section.
     * ------------------------------------------------------------------- */
    let topWidgetZ = 100;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: BRING WIDGET TO FRONT
     * Implementation of bring Widget To Front. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function bringWidgetToFront(widget, persist = true) {
      currentWidgets().forEach(item => item.classList.toggle('active-widget', item === widget));
      widget.style.setProperty('--widget-z', ++topWidgetZ);
      if (persist) {
        localStorage.setItem(`hub-widget-z-${widget.id}`, String(topWidgetZ));
        HubLayouts.markDirty();
      }
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: HIDE SNAP GUIDES
     * Implementation of hide Snap Guides. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function hideSnapGuides() {
      $('verticalGuide').classList.remove('visible');
      $('horizontalGuide').classList.remove('visible');
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SHOW SNAP GUIDE
     * Implementation of show Snap Guide. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function showSnapGuide(axis,coordinate,label='') {
      if(!guidelinesEnabled)return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GUIDE
       * Defines guide for the surrounding section.
       * ------------------------------------------------------------------- */
      const guide=axis==='x'?$('verticalGuide'):$('horizontalGuide');
      guide.style[axis==='x'?'left':'top']=coordinate+'px';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BADGE
       * Defines badge for the surrounding section.
       * ------------------------------------------------------------------- */
      const badge=guide.querySelector('.snap-guide-label');badge.textContent=label||'align';guide.classList.add('visible');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BOX
       * Defines box for the surrounding section.
       * ------------------------------------------------------------------- */
      const box=activeSnapGeometry?.widget?.getBoundingClientRect();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: POINTER
       * Defines pointer for the surrounding section.
       * ------------------------------------------------------------------- */
      const pointer=activeSnapGeometry?.pointer||{x:box?.right||innerWidth/2,y:box?.bottom||innerHeight/2};
      // Fractional font metrics can exceed offsetWidth/offsetHeight by less
      // than a pixel. Clamp against the actual painted box at viewport edges.
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BADGE RECT
       * Defines badge Rect for the surrounding section.
       * ------------------------------------------------------------------- */
      const badgeRect=badge.getBoundingClientRect();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDTH, HEIGHT
       * Defines width, height for the surrounding section.
       * ------------------------------------------------------------------- */
      const width=badgeRect.width,height=badgeRect.height;
      if(axis==='x'){
        badge.style.top=Math.max(8,Math.min(innerHeight-height-8,pointer.y+16))+'px';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TARGET
         * Defines target for the surrounding section.
         * ------------------------------------------------------------------- */
        const target=coordinate+width+12>innerWidth?coordinate-width-10:coordinate+10;
        badge.style.left=(Math.max(8,Math.min(innerWidth-width-8,target))-coordinate)+'px';
      }else{
        badge.style.left=Math.max(8,Math.min(innerWidth-width-8,pointer.x+16))+'px';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TARGET
         * Defines target for the surrounding section.
         * ------------------------------------------------------------------- */
        const target=coordinate+height+12>innerHeight?coordinate-height-10:coordinate+10;
        badge.style.top=(Math.max(8,Math.min(innerHeight-height-8,target))-coordinate)+'px';
      }
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: RANGES OVERLAP
     * Implementation of ranges Overlap. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function rangesOverlap(a1, a2, b1, b2) {
      return Math.min(a2, b2) - Math.max(a1, b1) > 0;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: OVERLAP AMOUNT
     * Implementation of overlap Amount. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function overlapAmount(a1, a2, b1, b2) {
      return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SAME TRACK
     * Implementation of same Track. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function sameTrack(a, b, axis) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: OVERLAP
       * Defines overlap for the surrounding section.
       * ------------------------------------------------------------------- */
      const overlap = axis === 'x'
        ? overlapAmount(a.top, a.bottom, b.top, b.bottom)
        : overlapAmount(a.left, a.right, b.left, b.right);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SMALLER
       * Defines smaller for the surrounding section.
       * ------------------------------------------------------------------- */
      const smaller = axis === 'x' ? Math.min(a.height, b.height) : Math.min(a.width, b.width);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CENTER DELTA
       * Defines center Delta for the surrounding section.
       * ------------------------------------------------------------------- */
      const centerDelta = axis === 'x'
        ? Math.abs((a.top + a.bottom) / 2 - (b.top + b.bottom) / 2)
        : Math.abs((a.left + a.right) / 2 - (b.left + b.right) / 2);
      return overlap >= Math.min(24, smaller * .32) || centerDelta <= 18;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: BUILD SNAP GEOMETRY
     * Implementation of build Snap Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function buildSnapGeometry(widget) {
      return currentWidgets()
        .filter(item => item !== widget && !item.hidden && !item.classList.contains('focused'))
        .map(item => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: RECT
           * Defines rect for the surrounding section.
           * ------------------------------------------------------------------- */
          const rect = item.getBoundingClientRect();
          return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
        });
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: BEGIN SNAP GESTURE
     * Implementation of begin Snap Gesture. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function beginSnapGesture(widget) { activeSnapGeometry = { widget, rects: buildSnapGeometry(widget) }; }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: INVALIDATE SNAP GEOMETRY
     * Implementation of invalidate Snap Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function invalidateSnapGeometry() { activeSnapGeometry = null; }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SNAP GEOMETRY
     * Implementation of snap Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function snapGeometry(widget) { return activeSnapGeometry?.widget === widget ? activeSnapGeometry.rects : buildSnapGeometry(widget); }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: COLLECT TRACK GAPS
     * Implementation of collect Track Gaps. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function collectTrackGaps(widget, axis, proposedRect = null) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RECTS
       * Defines rects for the surrounding section.
       * ------------------------------------------------------------------- */
      const rects = snapGeometry(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RELEVANT
       * Defines relevant for the surrounding section.
       * ------------------------------------------------------------------- */
      const relevant = proposedRect ? rects.filter(rect => sameTrack(rect, proposedRect, axis)) : rects;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SOURCE
       * Defines source for the surrounding section.
       * ------------------------------------------------------------------- */
      const source = relevant.length >= 2 ? relevant : rects;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAPS
       * Defines gaps for the surrounding section.
       * ------------------------------------------------------------------- */
      const gaps = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SORTED
       * Defines sorted for the surrounding section.
       * ------------------------------------------------------------------- */
      const sorted = [...source].sort((a, b) => axis === 'x' ? a.left - b.left : a.top - b.top);
      for (let i = 0; i < sorted.length - 1; i++) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: A
         * Defines a for the surrounding section.
         * ------------------------------------------------------------------- */
        const a = sorted[i];
        for (let j = i + 1; j < sorted.length; j++) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: B
           * Defines b for the surrounding section.
           * ------------------------------------------------------------------- */
          const b = sorted[j];
          if (!sameTrack(a, b, axis)) continue;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: GAP
           * Defines gap for the surrounding section.
           * ------------------------------------------------------------------- */
          const gap = axis === 'x' ? b.left - a.right : b.top - a.bottom;
          if (gap >= 3 && gap <= 160) gaps.push(gap);
          if (gap >= 0) break;
        }
      }
      return gaps;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DETECTED WIDGET GAP
     * Implementation of detected Widget Gap. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function detectedWidgetGap(widget, axis, proposedRect = null) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAPS
       * Defines gaps for the surrounding section.
       * ------------------------------------------------------------------- */
      const gaps = collectTrackGaps(widget, axis, proposedRect);
      if (!gaps.length) return 20;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GROUPS
       * Defines groups for the surrounding section.
       * ------------------------------------------------------------------- */
      const groups = new Map();
      gaps.forEach(gap => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: BUCKET
         * Defines bucket for the surrounding section.
         * ------------------------------------------------------------------- */
        const bucket = Math.round(Math.round(gap) / 2) * 2;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ENTRY
         * Defines entry for the surrounding section.
         * ------------------------------------------------------------------- */
        const entry = groups.get(bucket) || { count: 0, sum: 0 };
        entry.count += 1;
        entry.sum += gap;
        groups.set(bucket, entry);
      });
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BEST
       * Defines best for the surrounding section.
       * ------------------------------------------------------------------- */
      const best = [...groups.entries()].sort((a, b) => b[1].count - a[1].count || Math.abs(a[0] - 20) - Math.abs(b[0] - 20))[0][1];
      return Math.round(best.sum / best.count);
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SMART SNAP POSITION
     * Implementation of smart Snap Position. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function smartSnapPosition(widget, x, y) {
      hideSnapGuides();
      if (!snapToGridEnabled && !guidelinesEnabled) return { x, y };
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SCALE
       * Defines scale for the surrounding section.
       * ------------------------------------------------------------------- */
      const scale = desktopInteractionScale();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DURABLE
       * Defines durable for the surrounding section.
       * ------------------------------------------------------------------- */
      const durable = durableWidgetGeometry(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RECT
       * Defines rect for the surrounding section.
       * ------------------------------------------------------------------- */
      const rect = { width: durable.width * scale, height: durable.height * scale };
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CENTER X
       * Defines center X for the surrounding section.
       * ------------------------------------------------------------------- */
      const centerX = innerWidth / 2 - scrollX;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CENTER Y
       * Defines center Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const centerY = innerHeight / 2 - scrollY;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED CENTER X
       * Defines proposed Center X for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedCenterX = centerX + x * scale;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED CENTER Y
       * Defines proposed Center Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedCenterY = centerY + y * scale;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED LEFT
       * Defines proposed Left for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedLeft = proposedCenterX - rect.width / 2;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED TOP
       * Defines proposed Top for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedTop = proposedCenterY - rect.height / 2;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED RECT
       * Defines proposed Rect for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedRect = { left: proposedLeft, right: proposedLeft + rect.width, top: proposedTop, bottom: proposedTop + rect.height, width: rect.width, height: rect.height };
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAP X
       * Defines gap X for the surrounding section.
       * ------------------------------------------------------------------- */
      const gapX = detectedWidgetGap(widget, 'x', proposedRect);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAP Y
       * Defines gap Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const gapY = detectedWidgetGap(widget, 'y', proposedRect);
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: TO DURABLE X
       * Defines to Durable X for the surrounding section.
       * ------------------------------------------------------------------- */
      const toDurableX = screenCenter => (screenCenter - centerX) / scale;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: TO DURABLE Y
       * Defines to Durable Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const toDurableY = screenCenter => (screenCenter - centerY) / scale;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: X CANDIDATES
       * Defines x Candidates for the surrounding section.
       * ------------------------------------------------------------------- */
      const xCandidates = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: Y CANDIDATES
       * Defines y Candidates for the surrounding section.
       * ------------------------------------------------------------------- */
      const yCandidates = [];

      snapGeometry(widget).forEach(other => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VERTICAL TRACK
         * Defines vertical Track for the surrounding section.
         * ------------------------------------------------------------------- */
        const verticalTrack = rangesOverlap(proposedTop, proposedRect.bottom, other.top, other.bottom);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HORIZONTAL TRACK
         * Defines horizontal Track for the surrounding section.
         * ------------------------------------------------------------------- */
        const horizontalTrack = rangesOverlap(proposedLeft, proposedRect.right, other.left, other.right);
        xCandidates.push(
          { value: toDurableX(other.left + rect.width / 2), guide: other.left, label: 'left', priority: verticalTrack ? 9 : 5 },
          { value: toDurableX(other.right - rect.width / 2), guide: other.right, label: 'right', priority: verticalTrack ? 9 : 5 },
          { value: toDurableX((other.left + other.right) / 2), guide: (other.left + other.right) / 2, label: 'center', priority: verticalTrack ? 8 : 4 }
        );
        yCandidates.push(
          { value: toDurableY(other.top + rect.height / 2), guide: other.top, label: 'top', priority: horizontalTrack ? 9 : 5 },
          { value: toDurableY(other.bottom - rect.height / 2), guide: other.bottom, label: 'bottom', priority: horizontalTrack ? 9 : 5 },
          { value: toDurableY((other.top + other.bottom) / 2), guide: (other.top + other.bottom) / 2, label: 'middle', priority: horizontalTrack ? 8 : 4 }
        );
        if (verticalTrack) {
          xCandidates.push(
            { value: toDurableX(other.right + gapX + rect.width / 2), guide: other.right + gapX, label: `gap ${Math.round(gapX)}px`, priority: 10 },
            { value: toDurableX(other.left - gapX - rect.width / 2), guide: other.left - gapX, label: `gap ${Math.round(gapX)}px`, priority: 10 }
          );
        }
        if (horizontalTrack) {
          yCandidates.push(
            { value: toDurableY(other.bottom + gapY + rect.height / 2), guide: other.bottom + gapY, label: `gap ${Math.round(gapY)}px`, priority: 10 },
            { value: toDurableY(other.top - gapY - rect.height / 2), guide: other.top - gapY, label: `gap ${Math.round(gapY)}px`, priority: 10 }
          );
        }
      });

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SNAP X
       * Defines snap X for the surrounding section.
       * ------------------------------------------------------------------- */
      const snapX = magneticSnap(x, xCandidates, 24 / scale);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SNAP Y
       * Defines snap Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const snapY = magneticSnap(y, yCandidates, 24 / scale);
      if (snapX) showSnapGuide('x', snapX.guide, snapX.label);
      if (snapY) showSnapGuide('y', snapY.guide, snapY.label);
      return snapToGridEnabled ? { x: snapX?.value ?? snapValue(x), y: snapY?.value ?? snapValue(y) } : {x,y};
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SMART SNAP SIZE
     * Implementation of smart Snap Size. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function smartSnapSize(widget, width, height, startRect, direction = 'se') {
      hideSnapGuides();
      if (!snapToGridEnabled && !guidelinesEnabled) return { width, height };
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SCALE
       * Defines scale for the surrounding section.
       * ------------------------------------------------------------------- */
      const scale = desktopInteractionScale();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CENTER X
       * Defines center X for the surrounding section.
       * ------------------------------------------------------------------- */
      const centerX = innerWidth / 2 - scrollX;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CENTER Y
       * Defines center Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const centerY = innerHeight / 2 - scrollY;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: TO SCREEN X
       * Defines to Screen X for the surrounding section.
       * ------------------------------------------------------------------- */
      const toScreenX = durableCoordinate => centerX + (durableCoordinate - centerX) * scale;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: TO SCREEN Y
       * Defines to Screen Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const toScreenY = durableCoordinate => centerY + (durableCoordinate - centerY) * scale;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FIXED LEFT
       * Defines fixed Left for the surrounding section.
       * ------------------------------------------------------------------- */
      const fixedLeft = direction.includes('w') ? startRect.right : startRect.left;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FIXED TOP
       * Defines fixed Top for the surrounding section.
       * ------------------------------------------------------------------- */
      const fixedTop = direction.includes('n') ? startRect.bottom : startRect.top;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED LEFT
       * Defines proposed Left for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedLeft = direction.includes('w') ? fixedLeft - width : fixedLeft;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED TOP
       * Defines proposed Top for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedTop = direction.includes('n') ? fixedTop - height : fixedTop;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED RIGHT
       * Defines proposed Right for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedRight = proposedLeft + width;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PROPOSED BOTTOM
       * Defines proposed Bottom for the surrounding section.
       * ------------------------------------------------------------------- */
      const proposedBottom = proposedTop + height;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PRESENTED RECT
       * Defines presented Rect for the surrounding section.
       * ------------------------------------------------------------------- */
      const presentedRect = {
        left: toScreenX(proposedLeft), right: toScreenX(proposedRight),
        top: toScreenY(proposedTop), bottom: toScreenY(proposedBottom),
        width: width * scale, height: height * scale
      };
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAP X
       * Defines gap X for the surrounding section.
       * ------------------------------------------------------------------- */
      const gapX = detectedWidgetGap(widget, 'x', presentedRect);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAP Y
       * Defines gap Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const gapY = detectedWidgetGap(widget, 'y', presentedRect);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FIXED SCREEN X
       * Defines fixed Screen X for the surrounding section.
       * ------------------------------------------------------------------- */
      const fixedScreenX = toScreenX(fixedLeft);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FIXED SCREEN Y
       * Defines fixed Screen Y for the surrounding section.
       * ------------------------------------------------------------------- */
      const fixedScreenY = toScreenY(fixedTop);
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: WIDTH EDGE
       * Defines width Edge for the surrounding section.
       * ------------------------------------------------------------------- */
      const widthEdge = value => direction.includes('w') ? fixedScreenX - value * scale : fixedScreenX + value * scale;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: HEIGHT EDGE
       * Defines height Edge for the surrounding section.
       * ------------------------------------------------------------------- */
      const heightEdge = value => direction.includes('n') ? fixedScreenY - value * scale : fixedScreenY + value * scale;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDTH CANDIDATES
       * Defines width Candidates for the surrounding section.
       * ------------------------------------------------------------------- */
      const widthCandidates = widgetSizeMagnets(widget).widths.map(item => ({ ...item, edge: widthEdge(item.value) }));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HEIGHT CANDIDATES
       * Defines height Candidates for the surrounding section.
       * ------------------------------------------------------------------- */
      const heightCandidates = widgetSizeMagnets(widget).heights.map(item => ({ ...item, edge: heightEdge(item.value) }));

      snapGeometry(widget).forEach(other => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VERTICAL TRACK
         * Defines vertical Track for the surrounding section.
         * ------------------------------------------------------------------- */
        const verticalTrack = rangesOverlap(presentedRect.top, presentedRect.bottom, other.top, other.bottom);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HORIZONTAL TRACK
         * Defines horizontal Track for the surrounding section.
         * ------------------------------------------------------------------- */
        const horizontalTrack = rangesOverlap(presentedRect.left, presentedRect.right, other.left, other.right);
        if (direction.includes('e') || direction.includes('w')) {
          widthCandidates.push({ value: other.width / scale, edge: widthEdge(other.width / scale), label: 'match width', priority: verticalTrack ? 12 : 7 });
          if (verticalTrack && direction.includes('e')) widthCandidates.push(
            { value: (other.left - fixedScreenX) / scale, edge: other.left, label: 'edge', priority: 9 },
            { value: (other.left - gapX - fixedScreenX) / scale, edge: other.left - gapX, label: `gap ${Math.round(gapX)}px`, priority: 10 },
            { value: (other.right - fixedScreenX) / scale, edge: other.right, label: 'edge', priority: 8 }
          );
          if (verticalTrack && direction.includes('w')) widthCandidates.push(
            { value: (fixedScreenX - other.right) / scale, edge: other.right, label: 'edge', priority: 9 },
            { value: (fixedScreenX - other.right - gapX) / scale, edge: other.right + gapX, label: `gap ${Math.round(gapX)}px`, priority: 10 },
            { value: (fixedScreenX - other.left) / scale, edge: other.left, label: 'edge', priority: 8 }
          );
        }
        if (direction.includes('s') || direction.includes('n')) {
          heightCandidates.push({ value: other.height / scale, edge: heightEdge(other.height / scale), label: 'match height', priority: horizontalTrack ? 12 : 7 });
          if (horizontalTrack && direction.includes('s')) heightCandidates.push(
            { value: (other.top - fixedScreenY) / scale, edge: other.top, label: 'edge', priority: 9 },
            { value: (other.top - gapY - fixedScreenY) / scale, edge: other.top - gapY, label: `gap ${Math.round(gapY)}px`, priority: 10 },
            { value: (other.bottom - fixedScreenY) / scale, edge: other.bottom, label: 'edge', priority: 8 }
          );
          if (horizontalTrack && direction.includes('n')) heightCandidates.push(
            { value: (fixedScreenY - other.bottom) / scale, edge: other.bottom, label: 'edge', priority: 9 },
            { value: (fixedScreenY - other.bottom - gapY) / scale, edge: other.bottom + gapY, label: `gap ${Math.round(gapY)}px`, priority: 10 },
            { value: (fixedScreenY - other.top) / scale, edge: other.top, label: 'edge', priority: 8 }
          );
        }
      });

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MINIMUM
       * Defines minimum for the surrounding section.
       * ------------------------------------------------------------------- */
      const minimum = widgetIconMinimum(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MAX WIDTH
       * Defines max Width for the surrounding section.
       * ------------------------------------------------------------------- */
      const maxWidth = activeLayoutMode === 'freeform' ? 4096 : Math.max(minimum.width, (innerWidth - 24) / scale);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MAX HEIGHT
       * Defines max Height for the surrounding section.
       * ------------------------------------------------------------------- */
      const maxHeight = activeLayoutMode === 'freeform' ? 4096 : Math.max(minimum.height, (innerHeight - 24) / scale);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: VALID WIDTHS
       * Defines valid Widths for the surrounding section.
       * ------------------------------------------------------------------- */
      const validWidths = widthCandidates.filter(candidate => candidate.value >= minimum.width && candidate.value <= maxWidth);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: VALID HEIGHTS
       * Defines valid Heights for the surrounding section.
       * ------------------------------------------------------------------- */
      const validHeights = heightCandidates.filter(candidate => candidate.value >= minimum.height && candidate.value <= maxHeight);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SNAP WIDTH
       * Defines snap Width for the surrounding section.
       * ------------------------------------------------------------------- */
      let snapWidth = (direction.includes('e') || direction.includes('w')) ? magneticSnap(width, validWidths, 28 / scale) : null;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SNAP HEIGHT
       * Defines snap Height for the surrounding section.
       * ------------------------------------------------------------------- */
      let snapHeight = (direction.includes('s') || direction.includes('n')) ? magneticSnap(height, validHeights, 28 / scale) : null;
      if (direction.length===2) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PAIR
         * Defines pair for the surrounding section.
         * ------------------------------------------------------------------- */
        const pair=HubCanonicalSizing.contract(widget).allowedStates.map(state=>HubCanonicalSizing.sizes[state])
          .filter(size=>size.width<=maxWidth&&size.height<=maxHeight&&Math.abs(size.width-width)<=24/scale&&Math.abs(size.height-height)<=24/scale)
          .sort((a,b)=>Math.abs(a.width-width)+Math.abs(a.height-height)-Math.abs(b.width-width)-Math.abs(b.height-height))[0];
        if(pair){snapWidth={value:pair.width,edge:widthEdge(pair.width),label:pair.label};snapHeight={value:pair.height,edge:heightEdge(pair.height),label:pair.label};}
      }
      if (snapWidth) showSnapGuide('x', snapWidth.edge, snapWidth.label);
      if (snapHeight) showSnapGuide('y', snapHeight.edge, snapHeight.label);
      return snapToGridEnabled ? { width: snapWidth?.value ?? width, height: snapHeight?.value ?? height } : {width,height};
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: PERSIST WIDGET IDS
     * Retains every widget ID, including parked financial windows, in browser storage.
     * ------------------------------------------------------------------- */
    function persistWidgetIds() {
      localStorage.setItem('hub-widget-ids', JSON.stringify([...document.querySelectorAll('.widget')].map(widget => widget.id)));
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CLOSE WIDGET SETTINGS
     * Implementation of close Widget Settings. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function closeWidgetSettings(widget) {
      widget.classList.remove('settings-open');
      widget._settingsPopover?.classList.remove('open');
      widget.querySelector('.widget-settings-button')?.setAttribute('aria-expanded', 'false');
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: MINIMIZED TOGGLE
     * Defines minimized Toggle for the surrounding section.
     * ------------------------------------------------------------------- */
    const minimizedToggle = $('minimizedToggle');

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET MINIMIZED TRAY
     * Implementation of set Minimized Tray. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setMinimizedTray(open) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TRAY
       * Defines tray for the surrounding section.
       * ------------------------------------------------------------------- */
      const tray = $('minimizedTray');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: AVAILABLE
       * Defines available for the surrounding section.
       * ------------------------------------------------------------------- */
      const available = currentWidgets().some(widget => widget.hidden);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NEXT
       * Defines next for the surrounding section.
       * ------------------------------------------------------------------- */
      const next = Boolean(open && available);
      tray.classList.toggle('open', next);
      tray.setAttribute('aria-hidden', String(!next));
      minimizedToggle.classList.toggle('active', next);
      minimizedToggle.setAttribute('aria-expanded', String(next));
      minimizedToggle.setAttribute('aria-label', next ? 'Close minimized windows' : 'Open minimized windows');
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: ANIMATE WINDOW FLIGHT
     * Implementation of animate Window Flight. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function animateWindowFlight(from, to, label, owner = null) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return Promise.resolve();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FLIGHT
       * Defines flight for the surrounding section.
       * ------------------------------------------------------------------- */
      const flight = document.createElement('div');
      flight.className = 'window-flight';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NAME
       * Defines name for the surrounding section.
       * ------------------------------------------------------------------- */
      const name = document.createElement('span');
      name.textContent = label;
      flight.appendChild(name);
      Object.assign(flight.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
      document.body.appendChild(flight);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ANIMATION
       * Defines animation for the surrounding section.
       * ------------------------------------------------------------------- */
      const animation = flight.animate([
        { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px`, opacity: 1 },
        { left: `${to.left}px`, top: `${to.top}px`, width: `${to.width}px`, height: `${to.height}px`, opacity: .22 }
      ], { duration: 460, easing: 'cubic-bezier(.22,.76,.24,1)', fill: 'forwards' });
      if (owner) owner._visibilityFlight = animation;
      return animation.finished.catch(() => {}).finally(() => {
        flight.remove();
        if (owner?._visibilityFlight === animation) owner._visibilityFlight = null;
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DELETE WIDGET PERMANENTLY
     * Implementation of delete Widget Permanently. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function deleteWidgetPermanently(widget) {
      cancelWidgetVisibilityTransition(widget);
      if (widget.classList.contains('focused')) setWidgetFocus(widget, false);
      widget._destroyWeather?.();
      widget._destroyWeather = null;
      widget._destroyPerformance?.();
      widget._destroyPerformance = null;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: POPOVER
       * Defines popover for the surrounding section.
       * ------------------------------------------------------------------- */
      const popover = widget._settingsPopover;
      popover?.querySelectorAll('[data-widget-local-var]').forEach(control => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VARIABLE
         * Defines variable for the surrounding section.
         * ------------------------------------------------------------------- */
        const variable = control.dataset.widgetLocalVar;
        localStorage.removeItem(`hub-${widget.id}-${variable}`);
        ['ultrawide', 'desktop', 'tablet', 'mobile'].forEach(profile => localStorage.removeItem(`hub-layout-${profile}-${widget.id}-${variable}`));
      });
      [`hub-${widget.id}-minimized`, `hub-widget-z-${widget.id}`, `hub-widget-content-${widget.id}`, `hub-widget-setting-${widget.id}-title`, `hub-widget-setting-${widget.id}-show-header`].forEach(key => localStorage.removeItem(key));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: APP PREFIX
       * Defines app Prefix for the surrounding section.
       * ------------------------------------------------------------------- */
      const appPrefix = `hub-widget-app-${widget.id}-`;
      Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(key => key?.startsWith(appPrefix)).forEach(key => localStorage.removeItem(key));
      clearInterval(widget._photoTimer);
      popover?.remove();
      sharedWidgetResizeObserver.unobserve(widget);
      pendingResponsiveWidgets.delete(widget);
      deferredResponsiveWidgets.delete(widget);
      widget.remove();
      responsiveFlowOrder = responsiveFlowOrder.filter(id => id !== widget.id);
      persistWidgetIds();
      HubLayouts.markDirty();
      updateMinimizedTray();
      evaluateHubLayoutPolicy(true);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CANCEL WIDGET VISIBILITY TRANSITION
     * Implementation of cancel Widget Visibility Transition. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function cancelWidgetVisibilityTransition(widget) {
      widget._visibilityRevision = (widget._visibilityRevision || 0) + 1;
      widget._visibilityFlight?.cancel();
      widget._visibilityFlight = null;
      delete widget.dataset.animating;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET WIDGET VISIBILITY STATE
     * Implementation of set Widget Visibility State. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setWidgetVisibilityState(widget, hidden, options = {}) {
      cancelWidgetVisibilityTransition(widget);
      const { persist = true, refresh = true, markDirty = true } = options;
      if (hidden && widget.classList.contains('focused')) setWidgetFocus(widget, false);
      if (hidden) {
        clearInterval(widget._photoTimer);
        widget._photoTimer = null;
      }
      widget.hidden = Boolean(hidden);
      widget.style.visibility = '';
      if (persist) {
        if (hidden) localStorage.setItem(`hub-${widget.id}-minimized`, 'true');
        else localStorage.removeItem(`hub-${widget.id}-minimized`);
      }
      if (!hidden) widget._restartPhotoSlideshow?.();
      if (markDirty) HubLayouts.markDirty();
      if (refresh) {
        updateMinimizedTray();
        evaluateHubLayoutPolicy(true);
        queueResponsiveState(widget);
      }
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: MINIMIZE WIDGET TO TRAY
     * Implementation of minimize Widget To Tray. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    async function minimizeWidgetToTray(widget) {
      if (widget.dataset.animating === 'true') return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: REVISION
       * Defines revision for the surrounding section.
       * ------------------------------------------------------------------- */
      const revision = widget._visibilityRevision = (widget._visibilityRevision || 0) + 1;
      widget.dataset.animating = 'true';
      if (widget.classList.contains('focused')) setWidgetFocus(widget, false);
      closeWidgetSettings(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FROM
       * Defines from for the surrounding section.
       * ------------------------------------------------------------------- */
      const from = widget.getBoundingClientRect();
      minimizedToggle.hidden = false;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TOGGLE BOX
       * Defines toggle Box for the surrounding section.
       * ------------------------------------------------------------------- */
      const toggleBox = minimizedToggle.getBoundingClientRect();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TO
       * Defines to for the surrounding section.
       * ------------------------------------------------------------------- */
      const to = { left: toggleBox.left + 7, top: toggleBox.top + 11, width: 32, height: 24 };
      widget.style.visibility = 'hidden';
      clearInterval(widget._photoTimer);
      widget._photoTimer = null;
      await animateWindowFlight(from, to, widget._widgetLabel, widget);
      if (!widget.isConnected || widget._visibilityRevision !== revision) return;
      setWidgetVisibilityState(widget, true);
      delete widget.dataset.animating;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: RESTORE WIDGET FROM TRAY
     * Implementation of restore Widget From Tray. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    async function restoreWidgetFromTray(widget, sourceButton) {
      if (widget.dataset.animating === 'true') return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: REVISION
       * Defines revision for the surrounding section.
       * ------------------------------------------------------------------- */
      const revision = widget._visibilityRevision = (widget._visibilityRevision || 0) + 1;
      widget.dataset.animating = 'true';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FROM BOX
       * Defines from Box for the surrounding section.
       * ------------------------------------------------------------------- */
      const fromBox = sourceButton.getBoundingClientRect();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FROM
       * Defines from for the surrounding section.
       * ------------------------------------------------------------------- */
      const from = { left: fromBox.left + fromBox.width / 2 - 31, top: fromBox.top + 12, width: 62, height: 39 };
      widget.hidden = false;
      widget.style.visibility = 'hidden';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TO
       * Defines to for the surrounding section.
       * ------------------------------------------------------------------- */
      const to = widget.getBoundingClientRect();
      await animateWindowFlight(from, to, widget._widgetLabel, widget);
      if (!widget.isConnected || widget._visibilityRevision !== revision) return;
      setWidgetVisibilityState(widget, false);
      delete widget.dataset.animating;
      bringWidgetToFront(widget);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: UPDATE MINIMIZED TRAY
     * Implementation of update Minimized Tray. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function updateMinimizedTray() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TRAY
       * Defines tray for the surrounding section.
       * ------------------------------------------------------------------- */
      const tray = $('minimizedTray');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MINIMIZED
       * Defines minimized for the surrounding section.
       * ------------------------------------------------------------------- */
      const minimized = currentWidgets().filter(widget => widget.hidden);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WAS OPEN
       * Defines was Open for the surrounding section.
       * ------------------------------------------------------------------- */
      const wasOpen = tray.classList.contains('open');
      tray.replaceChildren();
      minimizedToggle.hidden = minimized.length === 0;
      if (!minimized.length) {
        setMinimizedTray(false);
        return;
      }
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TITLE
       * Defines title for the surrounding section.
       * ------------------------------------------------------------------- */
      const title = document.createElement('div');
      title.className = 'minimized-tray-title';
      title.textContent = `Minimized windows · ${minimized.length}`;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GRID
       * Defines grid for the surrounding section.
       * ------------------------------------------------------------------- */
      const grid = document.createElement('div');
      grid.className = 'minimized-window-grid';
      minimized.forEach(widget => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ITEM
         * Defines item for the surrounding section.
         * ------------------------------------------------------------------- */
        const item = document.createElement('div');
        item.className = 'minimized-window-item';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: BUTTON
         * Defines button for the surrounding section.
         * ------------------------------------------------------------------- */
        const button = document.createElement('button');
        button.className = 'restore-widget-button';
        button.type = 'button';
        button.setAttribute('aria-label', `Restore ${widget._widgetLabel}`);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: GLYPH
         * Defines glyph for the surrounding section.
         * ------------------------------------------------------------------- */
        const glyph = document.createElement('span');
        glyph.className = 'mini-window-glyph';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NAME
         * Defines name for the surrounding section.
         * ------------------------------------------------------------------- */
        const name = document.createElement('span');
        name.className = 'restore-widget-name';
        name.textContent = widget._widgetLabel;
        button.append(glyph, name);
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * button.onclick = ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        button.onclick = () => restoreWidgetFromTray(widget, button);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DELETE BUTTON
         * Defines delete Button for the surrounding section.
         * ------------------------------------------------------------------- */
        const deleteButton = document.createElement('button');
        deleteButton.className = 'minimized-delete-button';
        deleteButton.type = 'button';
        deleteButton.setAttribute('aria-label', `Delete ${widget._widgetLabel}`);
        deleteButton.title = `Delete ${widget._widgetLabel}`;
        deleteButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 7h14M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></svg>';
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * deleteButton.onclick = event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        deleteButton.onclick = event => {
          event.stopPropagation();
          deleteWidgetPermanently(widget);
        };
        item.append(button, deleteButton);
        grid.appendChild(item);
      });
      tray.append(title, grid);
      setMinimizedTray(wasOpen);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * minimizedToggle.onclick = event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    minimizedToggle.onclick = event => {
      event.stopPropagation();
      setMinimizedTray(!$('minimizedTray').classList.contains('open'));
    };

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: FOCUSED WIDGET
     * Defines focused Widget for the surrounding section.
     * ------------------------------------------------------------------- */
    let focusedWidget = null;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET WIDGET FOCUS
     * Implementation of set Widget Focus. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setWidgetFocus(widget, focus) {
      if (!widget) return;
      cancelLayoutAnimation(widget);
      if (focus && focusedWidget && focusedWidget !== widget) setWidgetFocus(focusedWidget, false);
      widget.classList.toggle('focused', focus);
      document.body.classList.toggle('focus-mode', focus);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FOCUS BUTTON
       * Defines focus Button for the surrounding section.
       * ------------------------------------------------------------------- */
      const focusButton = widget.querySelector('.widget-focus-button');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: POPUP BUTTON
       * Defines popup Button for the surrounding section.
       * ------------------------------------------------------------------- */
      const popupButton = widget._settingsPopover?.querySelector('.focus-widget');
      focusButton?.setAttribute('aria-label', focus ? 'Exit Focus Mode' : 'Focus widget');
      focusButton?.setAttribute('title', focus ? 'Exit Focus Mode' : 'Focus widget');
      if (popupButton) popupButton.textContent = focus ? 'Exit Focus Mode' : 'Enter Focus Mode';
      focusedWidget = focus ? widget : null;
      if (focus) {
        closeWidgetSettings(widget);
        bringWidgetToFront(widget, false);
      }
      requestAnimationFrame(() => {queueResponsiveState(widget);evaluateHubLayoutPolicy(true);});
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SYNC ALL HEADER TOGGLES
     * Implementation of sync All Header Toggles. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function syncAllHeaderToggles() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDGETS
       * Defines widgets for the surrounding section.
       * ------------------------------------------------------------------- */
      const widgets = currentWidgets();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ALL VISIBLE
       * Defines all Visible for the surrounding section.
       * ------------------------------------------------------------------- */
      const allVisible = widgets.length > 0 && widgets.every(item => !item.classList.contains('no-window-header'));
      widgets.forEach(item => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TOGGLE
         * Defines toggle for the surrounding section.
         * ------------------------------------------------------------------- */
        const toggle = item._allHeadersToggle;
        if (!toggle) return;
        toggle.classList.toggle('on', allVisible);
        toggle.setAttribute('aria-checked', String(allVisible));
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET ALL WIDGET HEADERS
     * Implementation of set All Widget Headers. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setAllWidgetHeaders(show) {
      localStorage.setItem('hub-all-widget-headers', String(show));
      currentWidgets().forEach(item => item._setHeaderVisible?.(show, true, true));
      syncAllHeaderToggles();
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: INITIALIZE WIDGET
     * Implementation of initialize Widget. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function initializeWidget(widget) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SETTINGS BUTTON
       * Defines settings Button for the surrounding section.
       * ------------------------------------------------------------------- */
      const settingsButton = widget.querySelector('.widget-settings-button');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FOCUS BUTTON
       * Defines focus Button for the surrounding section.
       * ------------------------------------------------------------------- */
      const focusButton = widget.querySelector('.widget-focus-button');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: POPOVER
       * Defines popover for the surrounding section.
       * ------------------------------------------------------------------- */
      const popover = widget.querySelector('.widget-settings-popover');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LOCAL CONTROLS
       * Defines local Controls for the surrounding section.
       * ------------------------------------------------------------------- */
      const localControls = [...popover.querySelectorAll('[data-widget-local-var]')];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RESET LAYOUT
       * Defines reset Layout for the surrounding section.
       * ------------------------------------------------------------------- */
      const resetLayout = popover.querySelector('.reset-widget-layout');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DEFAULT LABEL
       * Defines default Label for the surrounding section.
       * ------------------------------------------------------------------- */
      const defaultLabel = 'New Widget';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TITLE CONTROL
       * Defines title Control for the surrounding section.
       * ------------------------------------------------------------------- */
      const titleControl = popover.querySelector('[data-widget-setting="title"]');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HEADER TOGGLE
       * Defines header Toggle for the surrounding section.
       * ------------------------------------------------------------------- */
      const headerToggle = popover.querySelector('[data-widget-setting="show-header"]');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ALL HEADERS TOGGLE
       * Defines all Headers Toggle for the surrounding section.
       * ------------------------------------------------------------------- */
      const allHeadersToggle = popover.querySelector('[data-widget-setting="show-all-headers"]');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TITLE ELEMENT
       * Defines title Element for the surrounding section.
       * ------------------------------------------------------------------- */
      const titleElement = widget.querySelector('.widget-window-title');
      const sizeLabel=document.createElement('label');
      sizeLabel.className='widget-size-preset'; sizeLabel.textContent='Widget size';
      const sizeSelect=document.createElement('select'); sizeSelect.setAttribute('aria-label','Widget size');
      sizeSelect.innerHTML='<option value="">Custom</option>'+HubCanonicalSizing.states.map(state=>{
        const size=HubCanonicalSizing.sizes[state];
        return `<option value="${state}">${size.label} · ${size.width} × ${size.height}</option>`;
      }).join('');
      sizeLabel.appendChild(sizeSelect); popover.querySelector('h3').after(sizeLabel);
      sizeSelect.onchange=()=>{
        const size=HubCanonicalSizing.geometry(sizeSelect.value); if(!size)return;
        widget._applyLocalValue('--widget-width',size.width,true);
        widget._applyLocalValue('--widget-height',size.height,true);
        invalidateSnapGeometry(); evaluateHubLayoutPolicy(true); queueResponsiveState(widget);HubLayouts.markDirty();
      };
      widget._allHeadersToggle = allHeadersToggle;
      widget._defaultWidgetLabel = defaultLabel;
      titleControl.defaultValue = defaultLabel;
      widget._setWindowTitle = (title, save = true) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RESOLVED
         * Defines resolved for the surrounding section.
         * ------------------------------------------------------------------- */
        const resolved = String(title || defaultLabel).trim() || defaultLabel;
        widget._widgetLabel = resolved;
        titleControl.value = resolved;
        titleElement.textContent = resolved;
        popover.querySelector('h3').textContent = resolved;
        if (save) localStorage.setItem(`hub-widget-setting-${widget.id}-title`, resolved);
        updateMinimizedTray();
      };
      widget._setHeaderVisible = (show, save = true, globalChange = false) => {
        widget.classList.toggle('no-window-header', !show);
        widget.classList.toggle('has-window-header', show);
        headerToggle.classList.toggle('on', show);
        headerToggle.setAttribute('aria-checked', String(show));
        if (save) {
          localStorage.setItem(`hub-widget-setting-${widget.id}-show-header`, String(show));
          if (!globalChange) localStorage.removeItem('hub-all-widget-headers');
        }
        syncAllHeaderToggles();
      };
      widget._setWindowTitle(localStorage.getItem(`hub-widget-setting-${widget.id}-title`) || defaultLabel, false);
      {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SAVED HEADER
         * Defines saved Header for the surrounding section.
         * ------------------------------------------------------------------- */
        const savedHeader = localStorage.getItem(`hub-widget-setting-${widget.id}-show-header`);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SAVED GLOBAL HEADERS
         * Defines saved Global Headers for the surrounding section.
         * ------------------------------------------------------------------- */
        const savedGlobalHeaders = localStorage.getItem('hub-all-widget-headers');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INITIAL TYPE
         * Defines initial Type for the surrounding section.
         * ------------------------------------------------------------------- */
        const initialType = widget.dataset.contentType || 'empty';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INITIAL HEADER VISIBLE
         * Defines initial Header Visible for the surrounding section.
         * ------------------------------------------------------------------- */
        const initialHeaderVisible = savedHeader === null
          ? (savedGlobalHeaders === null ? !headerlessWidgetTypes.has(initialType) : savedGlobalHeaders !== 'false')
          : savedHeader !== 'false';
        widget._setHeaderVisible(initialHeaderVisible, false);
      }
      document.body.appendChild(popover);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SAVED Z
       * Defines saved Z for the surrounding section.
       * ------------------------------------------------------------------- */
      const savedZ = Number(localStorage.getItem(`hub-widget-z-${widget.id}`));
      if (savedZ) {
        topWidgetZ = Math.max(topWidgetZ, savedZ);
        widget.style.setProperty('--widget-z', savedZ);
      } else {
        bringWidgetToFront(widget);
      }
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * widget.addEventListener('pointerdown', ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      widget.addEventListener('pointerdown', () => bringWidgetToFront(widget), true);

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * titleControl.addEventListener('input', ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      titleControl.addEventListener('input', () => widget._setWindowTitle(titleControl.value || defaultLabel));
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * headerToggle.onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      headerToggle.onclick = () => widget._setHeaderVisible(widget.classList.contains('no-window-header'));
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * allHeadersToggle.onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      allHeadersToggle.onclick = () => setAllWidgetHeaders(!currentWidgets().every(item => !item.classList.contains('no-window-header')));
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * focusButton.onclick = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      focusButton.onclick = event => {
        event.stopPropagation();
        setWidgetFocus(widget, !widget.classList.contains('focused'));
      };

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * widget.addEventListener('dragover', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      widget.addEventListener('dragover', event => {
        if (!document.body.classList.contains('content-dragging')) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        widget.classList.add('widget-drop-target');
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * widget.addEventListener('dragleave', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      widget.addEventListener('dragleave', event => {
        if (!widget.contains(event.relatedTarget)) widget.classList.remove('widget-drop-target');
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * widget.addEventListener('drop', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      widget.addEventListener('drop', event => {
        event.preventDefault();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TYPE
         * Defines type for the surrounding section.
         * ------------------------------------------------------------------- */
        const type = event.dataTransfer.getData('text/x-command-hub-widget') || event.dataTransfer.getData('text/plain');
        if (contentRenderers[type]) setWidgetContent(widget, type);
        clearContentDragState();
        bringWidgetToFront(widget);
      });

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: POSITION POPOVER
       * Implementation of position Popover. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function positionPopover() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: BUTTON BOX
         * Defines button Box for the surrounding section.
         * ------------------------------------------------------------------- */
        const buttonBox = settingsButton.getBoundingClientRect();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LEFT
         * Defines left for the surrounding section.
         * ------------------------------------------------------------------- */
        const left = Math.min(buttonBox.left, innerWidth - 302);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TOP
         * Defines top for the surrounding section.
         * ------------------------------------------------------------------- */
        const top = Math.min(buttonBox.bottom + 10, innerHeight - popover.offsetHeight - 12);
        popover.style.left = `${Math.max(12, left)}px`;
        popover.style.top = `${Math.max(12, top)}px`;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * settingsButton.onclick = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      settingsButton.onclick = event => {
        event.stopPropagation();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: OPEN
         * Defines open for the surrounding section.
         * ------------------------------------------------------------------- */
        const open = !widget.classList.contains('settings-open');
        currentWidgets().forEach(closeWidgetSettings);
        widget.classList.toggle('settings-open', open);
        popover.classList.toggle('open', open);
        settingsButton.setAttribute('aria-expanded', String(open));
        if (open) requestAnimationFrame(positionPopover);
      };

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CONTROL MAP
       * Defines control Map for the surrounding section.
       * ------------------------------------------------------------------- */
      const controlMap = new Map(localControls.map(control => [control.dataset.widgetLocalVar, control]));

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: APPLY LOCAL VALUE
       * Implementation of apply Local Value. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function applyLocalValue(variable, value, save = false) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CONTROL
         * Defines control for the surrounding section.
         * ------------------------------------------------------------------- */
        const control = controlMap.get(variable);
        if (!control) return;
        widget.style.setProperty(variable, `${value}${control.dataset.unit || ''}`);
        control.value = value;
        control.parentElement.querySelector('.range-value').textContent = Math.round(Number(value) * 100) / 100;
        if (save) localStorage.setItem(layoutStorageKey(widget, variable), String(value));
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: LOAD RESPONSIVE LAYOUT
       * Implementation of load Responsive Layout. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function loadResponsiveLayout() {
        localControls.forEach(control => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: VARIABLE
           * Defines variable for the surrounding section.
           * ------------------------------------------------------------------- */
          const variable = control.dataset.widgetLocalVar;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SAVED
           * Defines saved for the surrounding section.
           * ------------------------------------------------------------------- */
          const saved = localStorage.getItem(layoutStorageKey(widget, variable));
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: LEGACY
           * Defines legacy for the surrounding section.
           * ------------------------------------------------------------------- */
          const legacy = ['desktop', 'ultrawide'].includes(activeLayoutProfile) ? localStorage.getItem(`hub-${widget.id}-${variable}`) : null;
          applyLocalValue(variable, saved ?? legacy ?? control.defaultValue);
        });
      }

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * localControls.forEach(control  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      localControls.forEach(control => {
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * control.addEventListener('input', ()  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        control.addEventListener('input', () => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: VALUE
           * Defines value for the surrounding section.
           * ------------------------------------------------------------------- */
          const value = snapToGridEnabled && ['--widget-x','--widget-y'].includes(variable) ? snapValue(Number(control.value)) : control.value;
          applyLocalValue(control.dataset.widgetLocalVar, value, true);
          HubLayouts.markDirty();
          evaluateHubLayoutPolicy(true);
        });
      });

      widget._loadResponsiveLayout = loadResponsiveLayout;
      widget._applyLocalValue = applyLocalValue;
      loadResponsiveLayout();

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * resetLayout.onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      resetLayout.onclick = () => {
        localControls.forEach(control => {
          localStorage.removeItem(layoutStorageKey(widget, control.dataset.widgetLocalVar));
          applyLocalValue(control.dataset.widgetLocalVar, control.defaultValue);
        });
        HubLayouts.markDirty();
        evaluateHubLayoutPolicy(true);
      };

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DRAG HANDLE
       * Defines drag Handle for the surrounding section.
       * ------------------------------------------------------------------- */
      const dragHandle = widget.querySelector('.widget-drag-handle');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RESIZE HANDLES
       * Defines resize Handles for the surrounding section.
       * ------------------------------------------------------------------- */
      const resizeHandles = [...widget.querySelectorAll('.widget-resize-handle')];

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: NUMERIC VALUE
       * Implementation of numeric Value. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function numericValue(variable) {
        return Number.parseFloat(widget.style.getPropertyValue(variable)) || 0;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: BOUNDED POSITION
       * Implementation of bounded Position. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function boundedPosition(x, y, width = durableWidgetGeometry(widget).width, height = durableWidgetGeometry(widget).height) {
        if(activeLayoutMode === 'freeform') return {x,y};
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SCALE
         * Defines scale for the surrounding section.
         * ------------------------------------------------------------------- */
        const scale = desktopInteractionScale();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RANGE X
         * Defines range X for the surrounding section.
         * ------------------------------------------------------------------- */
        const rangeX = Math.max(0, (innerWidth / 2 - 12) / scale - width / 2);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RANGE Y
         * Defines range Y for the surrounding section.
         * ------------------------------------------------------------------- */
        const rangeY = Math.max(0, (innerHeight / 2 - 12) / scale - height / 2);
        return {
          x: Math.min(rangeX, Math.max(-rangeX, x)),
          y: Math.min(rangeY, Math.max(-rangeY, y))
        };
      }

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * dragHandle.onpointerdown = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      dragHandle.onpointerdown = event => {
        if (!isDesktopFreeform()) return;
        if (widget.classList.contains('focused')) return;
        if (!event.isPrimary) return;
        if (event.button !== 0 && event.pointerType === 'mouse') return;
        event.preventDefault();
        closeWidgetSettings(widget);
        prepareResponsiveGesture(widget,'drag');
        manipulatingWidget = true;
        widget.classList.add('is-dragging');
        beginSnapGesture(widget);
        activeSnapGeometry.pointer={x:event.clientX,y:event.clientY};
        dragHandle.setPointerCapture(event.pointerId);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: START X
         * Defines start X for the surrounding section.
         * ------------------------------------------------------------------- */
        const startX = numericValue('--widget-x');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: START Y
         * Defines start Y for the surrounding section.
         * ------------------------------------------------------------------- */
        const startY = numericValue('--widget-y');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: POINTER X
         * Defines pointer X for the surrounding section.
         * ------------------------------------------------------------------- */
        const pointerX = event.clientX;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: POINTER Y
         * Defines pointer Y for the surrounding section.
         * ------------------------------------------------------------------- */
        const pointerY = event.clientY;

        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DRAG FRAME
         * Defines drag Frame for the surrounding section.
         * ------------------------------------------------------------------- */
        let dragFrame = 0;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PENDING DRAG EVENT
         * Defines pending Drag Event for the surrounding section.
         * ------------------------------------------------------------------- */
        let pendingDragEvent = null;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: RENDER DRAG
         * Defines render Drag for the surrounding section.
         * ------------------------------------------------------------------- */
        const renderDrag = () => {
            dragFrame = 0;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: LATEST
             * Defines latest for the surrounding section.
             * ------------------------------------------------------------------- */
            const latest = pendingDragEvent;
            if(latest&&activeSnapGeometry)activeSnapGeometry.pointer={x:latest.clientX,y:latest.clientY};
            if (!latest || Math.hypot(latest.clientX-pointerX, latest.clientY-pointerY)<3) return;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: SCALE
             * Defines scale for the surrounding section.
             * ------------------------------------------------------------------- */
            const scale = desktopInteractionScale();
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: FREE POSITION
             * Defines free Position for the surrounding section.
             * ------------------------------------------------------------------- */
            const freePosition = boundedPosition(startX + (latest.clientX - pointerX) / scale, startY + (latest.clientY - pointerY) / scale);
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: SNAPPED POSITION
             * Defines snapped Position for the surrounding section.
             * ------------------------------------------------------------------- */
            const snappedPosition = latest.altKey ? freePosition : smartSnapPosition(widget, freePosition.x, freePosition.y);
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: POSITION
             * Defines position for the surrounding section.
             * ------------------------------------------------------------------- */
            const position = boundedPosition(snappedPosition.x, snappedPosition.y);
            applyLocalValue('--widget-x', position.x);
            applyLocalValue('--widget-y', position.y);
            syncWidgetDesktopPresentation(widget, scale);
        };
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * dragHandle.onpointermove = moveEvent  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        dragHandle.onpointermove = moveEvent => {
          pendingDragEvent=moveEvent;
          if(!dragFrame)dragFrame=requestAnimationFrame(renderDrag);
        };

        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: FINISH
         * Defines finish for the surrounding section.
         * ------------------------------------------------------------------- */
        const finish = event => {
          if (dragFrame) cancelAnimationFrame(dragFrame);
          /* HUB GUIDE ---------------------------------------------------------
           * WIDGET-SPECIFIC BEHAVIOR: EVENT?.TYPE==='POINTERUP'&&PENDINGDRAGEVENT
           * Only this widget type uses the following branch.
           * ------------------------------------------------------------------- */
          if(event?.type==='pointerup'&&pendingDragEvent){pendingDragEvent=event;renderDrag();}
          hideSnapGuides();
          manipulatingWidget = false;
          widget.classList.remove('is-dragging');
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: CHANGED
           * Defines changed for the surrounding section.
           * ------------------------------------------------------------------- */
          const changed=finishResponsiveGesture(widget,event?.type==='pointercancel');
          applyLocalValue('--widget-x', numericValue('--widget-x'), true);
          applyLocalValue('--widget-y', numericValue('--widget-y'), true);
          invalidateSnapGeometry();
          reconcileResponsiveAfterGesture(widget);
          if(changed)HubLayouts.markDirty();
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * dragHandle.onpointermove = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          dragHandle.onpointermove = null;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * dragHandle.onpointerup = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          dragHandle.onpointerup = null;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * dragHandle.onpointercancel = null; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          dragHandle.onpointercancel = null;
          dragHandle.onlostpointercapture = null;
        };
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * dragHandle.onpointerup = finish; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        dragHandle.onpointerup = finish;
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * dragHandle.onpointercancel = finish; — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        dragHandle.onpointercancel = finish;
        dragHandle.onlostpointercapture = finish;
      };

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * resizeHandles.forEach(resizeHandle  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      resizeHandles.forEach(resizeHandle => {
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * resizeHandle.onpointerdown = event  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        resizeHandle.onpointerdown = event => {
          if (!isDesktopFreeform() && widget.dataset.contentType !== 'financialdashboard') return;
          if (!event.isPrimary) return;
          if (event.button !== 0 && event.pointerType === 'mouse') return;
          event.preventDefault();
          event.stopPropagation();
          closeWidgetSettings(widget);
          prepareResponsiveGesture(widget,'resize');
          manipulatingWidget = true;
          widget.classList.add('is-resizing');
          beginSnapGesture(widget);
        activeSnapGeometry.pointer={x:event.clientX,y:event.clientY};
          resizeHandle.setPointerCapture(event.pointerId);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DIRECTION
           * Defines direction for the surrounding section.
           * ------------------------------------------------------------------- */
          const direction = resizeHandle.dataset.resize;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: START GEOMETRY
           * Defines start Geometry for the surrounding section.
           * ------------------------------------------------------------------- */
          const startGeometry = durableWidgetGeometry(widget);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: START RECT
           * Defines start Rect for the surrounding section.
           * ------------------------------------------------------------------- */
          const startRect = durableWidgetRect(widget, startGeometry);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: START X
           * Defines start X for the surrounding section.
           * ------------------------------------------------------------------- */
          const startX = startGeometry.x;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: START Y
           * Defines start Y for the surrounding section.
           * ------------------------------------------------------------------- */
          const startY = startGeometry.y;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: MINIMUM
           * Defines minimum for the surrounding section.
           * ------------------------------------------------------------------- */
          const minimum = widgetIconMinimum(widget);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: GESTURE SCALE
           * Defines gesture Scale for the surrounding section.
           * ------------------------------------------------------------------- */
          const gestureScale = desktopInteractionScale();
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: MAX WIDTH
           * Defines max Width for the surrounding section.
           * ------------------------------------------------------------------- */
          const maxWidth = activeLayoutMode === 'freeform' ? 4096 : Math.max(minimum.width, (innerWidth - 24) / gestureScale);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: MAX HEIGHT
           * Defines max Height for the surrounding section.
           * ------------------------------------------------------------------- */
          const maxHeight = activeLayoutMode === 'freeform' ? 4096 : Math.max(minimum.height, (innerHeight - 24) / gestureScale);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: POINTER X
           * Defines pointer X for the surrounding section.
           * ------------------------------------------------------------------- */
          const pointerX = event.clientX;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: POINTER Y
           * Defines pointer Y for the surrounding section.
           * ------------------------------------------------------------------- */
          const pointerY = event.clientY;

          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: RESIZE FRAME
           * Defines resize Frame for the surrounding section.
           * ------------------------------------------------------------------- */
          let resizeFrame = 0;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: PENDING RESIZE EVENT
           * Defines pending Resize Event for the surrounding section.
           * ------------------------------------------------------------------- */
          let pendingResizeEvent = null;
          /* HUB GUIDE ---------------------------------------------------------
           * HELPER: RENDER RESIZE
           * Defines render Resize for the surrounding section.
           * ------------------------------------------------------------------- */
          const renderResize = () => {
            resizeFrame = 0;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: LATEST
             * Defines latest for the surrounding section.
             * ------------------------------------------------------------------- */
            const latest = pendingResizeEvent;
            if(latest&&activeSnapGeometry)activeSnapGeometry.pointer={x:latest.clientX,y:latest.clientY};
            if (!latest || Math.hypot(latest.clientX-pointerX, latest.clientY-pointerY)<3) return;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: DELTA X
             * Defines delta X for the surrounding section.
             * ------------------------------------------------------------------- */
            const deltaX = (latest.clientX - pointerX) / gestureScale;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: DELTA Y
             * Defines delta Y for the surrounding section.
             * ------------------------------------------------------------------- */
            const deltaY = (latest.clientY - pointerY) / gestureScale;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: FREE WIDTH
             * Defines free Width for the surrounding section.
             * ------------------------------------------------------------------- */
            let freeWidth = startRect.width;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: FREE HEIGHT
             * Defines free Height for the surrounding section.
             * ------------------------------------------------------------------- */
            let freeHeight = startRect.height;
            if (direction.includes('e')) freeWidth += deltaX;
            if (direction.includes('w')) freeWidth -= deltaX;
            if (direction.includes('s')) freeHeight += deltaY;
            if (direction.includes('n')) freeHeight -= deltaY;
            freeWidth = Math.min(maxWidth, Math.max(minimum.width, freeWidth));
            freeHeight = Math.min(maxHeight, Math.max(minimum.height, freeHeight));
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: SMART SIZE
             * Defines smart Size for the surrounding section.
             * ------------------------------------------------------------------- */
            const smartSize = latest.altKey ? { width: freeWidth, height: freeHeight } : smartSnapSize(widget, freeWidth, freeHeight, startRect, direction);
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: WIDTH
             * Defines width for the surrounding section.
             * ------------------------------------------------------------------- */
            const width = Math.min(maxWidth, Math.max(minimum.width, smartSize.width));
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: HEIGHT
             * Defines height for the surrounding section.
             * ------------------------------------------------------------------- */
            const height = Math.min(maxHeight, Math.max(minimum.height, smartSize.height));
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: X
             * Defines x for the surrounding section.
             * ------------------------------------------------------------------- */
            let x = startX;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: Y
             * Defines y for the surrounding section.
             * ------------------------------------------------------------------- */
            let y = startY;
            if (direction.includes('e')) x += (width - startRect.width) / 2;
            if (direction.includes('w')) x -= (width - startRect.width) / 2;
            if (direction.includes('s')) y += (height - startRect.height) / 2;
            if (direction.includes('n')) y -= (height - startRect.height) / 2;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: POSITION
             * Defines position for the surrounding section.
             * ------------------------------------------------------------------- */
            const position = boundedPosition(x, y, width, height);
            applyLocalValue('--widget-width', width);
            applyLocalValue('--widget-height', height);
            applyLocalValue('--widget-x', position.x);
            applyLocalValue('--widget-y', position.y);
            syncWidgetDesktopPresentation(widget, gestureScale);
          };
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * resizeHandle.onpointermove = moveEvent  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          resizeHandle.onpointermove = moveEvent => {
            pendingResizeEvent=moveEvent;
            if(!resizeFrame)resizeFrame=requestAnimationFrame(renderResize);
          };

          /* HUB GUIDE ---------------------------------------------------------
           * HELPER: FINISH
           * Defines finish for the surrounding section.
           * ------------------------------------------------------------------- */
          const finish = event => {
            if (resizeFrame) cancelAnimationFrame(resizeFrame);
            /* HUB GUIDE ---------------------------------------------------------
             * WIDGET-SPECIFIC BEHAVIOR: EVENT?.TYPE==='POINTERUP'&&PENDINGRESIZEEVENT
             * Only this widget type uses the following branch.
             * ------------------------------------------------------------------- */
            if(event?.type==='pointerup'&&pendingResizeEvent){pendingResizeEvent=event;renderResize();}
            hideSnapGuides();
            manipulatingWidget = false;
            widget.classList.remove('is-resizing');
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: CHANGED
             * Defines changed for the surrounding section.
             * ------------------------------------------------------------------- */
            const changed=finishResponsiveGesture(widget,event?.type==='pointercancel');
            ['--widget-width', '--widget-height', '--widget-x', '--widget-y'].forEach(variable => applyLocalValue(variable, numericValue(variable), true));
            invalidateSnapGeometry();
            reconcileResponsiveAfterGesture(widget);
            if(changed)HubLayouts.markDirty();
            /* HUB GUIDE ---------------------------------------------------------
             * EVENT BINDING
             * resizeHandle.onpointermove = null; — connects the control or lifecycle event to its handler.
             * ------------------------------------------------------------------- */
            resizeHandle.onpointermove = null;
            /* HUB GUIDE ---------------------------------------------------------
             * EVENT BINDING
             * resizeHandle.onpointerup = null; — connects the control or lifecycle event to its handler.
             * ------------------------------------------------------------------- */
            resizeHandle.onpointerup = null;
            /* HUB GUIDE ---------------------------------------------------------
             * EVENT BINDING
             * resizeHandle.onpointercancel = null; — connects the control or lifecycle event to its handler.
             * ------------------------------------------------------------------- */
            resizeHandle.onpointercancel = null;
            resizeHandle.onlostpointercapture = null;
          };
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * resizeHandle.onpointerup = finish; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          resizeHandle.onpointerup = finish;
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * resizeHandle.onpointercancel = finish; — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          resizeHandle.onpointercancel = finish;
          resizeHandle.onlostpointercapture = finish;
        };
      });

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * widget.querySelector('.minimize-widget').onclick = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      widget.querySelector('.minimize-widget').onclick = event => {
        event.stopPropagation();
        minimizeWidgetToTray(widget);
      };

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * widget.querySelector('.delete-widget').onclick = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      widget.querySelector('.delete-widget').onclick = event => {
        event.stopPropagation();
        deleteWidgetPermanently(widget);
      };

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * popover.addEventListener('click', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      popover.addEventListener('click', event => event.stopPropagation());
      widget._positionSettingsPopover = positionPopover;

      widget._settingsPopover = popover;
      widget._appSettingsSection = popover.querySelector('.widget-app-settings');
      widget._appSettingsContent = popover.querySelector('.widget-app-settings-content');
      widget.hidden = localStorage.getItem(`hub-${widget.id}-minimized`) === 'true';
      setWidgetContent(widget, localStorage.getItem(`hub-widget-content-${widget.id}`), false);
      observeWidgetResponsiveState(widget);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CREATE WIDGET
     * Implementation of create Widget. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function createWidget(id, stagger = false) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDGET
       * Defines widget for the surrounding section.
       * ------------------------------------------------------------------- */
      const widget = baseWidgetTemplate.cloneNode(true);
      widget.id = id;
      if (stagger) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NUMBER
         * Defines number for the surrounding section.
         * ------------------------------------------------------------------- */
        const number = Number(id.replace(/\D/g, '')) || 1;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: OFFSET
         * Defines offset for the surrounding section.
         * ------------------------------------------------------------------- */
        const offset = ((number - 1) % 6) * 35;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: X CONTROL
         * Defines x Control for the surrounding section.
         * ------------------------------------------------------------------- */
        const xControl = widget.querySelector('[data-widget-local-var="--widget-x"]');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: Y CONTROL
         * Defines y Control for the surrounding section.
         * ------------------------------------------------------------------- */
        const yControl = widget.querySelector('[data-widget-local-var="--widget-y"]');
        xControl.defaultValue = String(offset);
        xControl.value = String(offset);
        yControl.defaultValue = String(offset);
        yControl.value = String(offset);
      }
      document.body.insertBefore(widget, $('overlay'));
      initializeWidget(widget);
      return widget;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CREATE WIDGET AT
     * Implementation of create Widget At. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function createWidgetAt(type, clientX, clientY) {
      if(removedWidgetTypes.has(type)) return null;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDGET
       * Defines widget for the surrounding section.
       * ------------------------------------------------------------------- */
      const widget = createWidget(`widget${nextWidgetNumber++}`);
      setWidgetContent(widget, type);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PREFERRED
       * Defines preferred for the surrounding section.
       * ------------------------------------------------------------------- */
      const preferred = isResponsiveFlowActive() ? preferredDesktopWidgetGeometry(type) : preferredWidgetGeometry(type);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DURABLE WIDTH
       * Defines durable Width for the surrounding section.
       * ------------------------------------------------------------------- */
      const durableWidth = preferred.width;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DURABLE HEIGHT
       * Defines durable Height for the surrounding section.
       * ------------------------------------------------------------------- */
      const durableHeight = preferred.height;
      widget._applyLocalValue('--widget-width', durableWidth, true);
      widget._applyLocalValue('--widget-height', durableHeight, true);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: X, Y
       * Defines x, y for the surrounding section.
       * ------------------------------------------------------------------- */
      let x, y;
      if (isResponsiveFlowActive()) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PLACEMENT
         * Defines placement for the surrounding section.
         * ------------------------------------------------------------------- */
        const placement = findDurableDesktopPlacementForNewWidget(widget, durableWidth, durableHeight);
        x = placement.x;
        y = placement.y;
      } else {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SCALE
         * Defines scale for the surrounding section.
         * ------------------------------------------------------------------- */
        const scale = desktopInteractionScale();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MAX X
         * Defines max X for the surrounding section.
         * ------------------------------------------------------------------- */
        const maxX = Math.max(0, (innerWidth / 2 - 12) / scale - durableWidth / 2);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MAX Y
         * Defines max Y for the surrounding section.
         * ------------------------------------------------------------------- */
        const maxY = Math.max(0, (innerHeight / 2 - 12) / scale - durableHeight / 2);
        x = Math.min(maxX, Math.max(-maxX, (clientX - innerWidth / 2) / scale));
        y = Math.min(maxY, Math.max(-maxY, (clientY - innerHeight / 2) / scale));
      }
      widget._applyLocalValue('--widget-x', snapToGridEnabled ? snapValue(x) : x, true);
      widget._applyLocalValue('--widget-y', snapToGridEnabled ? snapValue(y) : y, true);
      syncWidgetDesktopPresentation(widget);
      bringWidgetToFront(widget);
      evaluateHubLayoutPolicy(true);
      queueResponsiveState(widget);
      persistWidgetIds();
      HubLayouts.markDirty();
      return widget;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: SAVED WIDGET IDS
     * Defines saved Widget Ids for the surrounding section.
     * ------------------------------------------------------------------- */
    let savedWidgetIds;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: STORED WIDGET IDS
     * Defines stored Widget Ids for the surrounding section.
     * ------------------------------------------------------------------- */
    const storedWidgetIds = localStorage.getItem('hub-widget-ids');
    try { savedWidgetIds = storedWidgetIds === null ? ['widget1'] : JSON.parse(storedWidgetIds); }
    catch { savedWidgetIds = ['widget1']; }
    // Remove retired widget instances before startup creates any windows.
    savedWidgetIds = savedWidgetIds.filter(id => {
      if(!removedWidgetTypes.has(localStorage.getItem(`hub-widget-content-${id}`))) return true;
      const keys=Array.from({length:localStorage.length},(_,i)=>localStorage.key(i));
      keys.filter(key=>key && (key===`hub-widget-content-${id}` || key===`hub-widget-z-${id}` || key.startsWith(`hub-${id}-`) || key.startsWith(`hub-widget-app-${id}-`) || key.startsWith(`hub-widget-setting-${id}-`) || ['ultrawide','desktop','tablet','mobile'].some(profile=>key.startsWith(`hub-layout-${profile}-${id}-`)))).forEach(key=>localStorage.removeItem(key));
      return false;
    });
    if (savedWidgetIds.includes('widget1')) initializeWidget($('widget1'));
    else $('widget1').remove();
    savedWidgetIds.filter(id => id !== 'widget1').forEach(id => createWidget(id));
    setHubMode(activeHubMode);
    evaluateHubLayoutPolicy(true);
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: NEXT WIDGET NUMBER
     * Defines next Widget Number for the surrounding section.
     * ------------------------------------------------------------------- */
    let nextWidgetNumber = Math.max(1, ...savedWidgetIds.map(id => Number(id.replace(/\D/g, '')) || 0)) + 1;
    persistWidgetIds();
    updateMinimizedTray();
    HubLayouts.ready();
    updateClocks();
    setInterval(updateClocks, 1000);
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('visibilitychange', ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('visibilitychange', () => {
      if (document.hidden) {
        currentWidgets().forEach(widget => {
          clearInterval(widget._photoTimer);
          widget._photoTimer = null;
        });
        return;
      }
      updateClocks();
      currentWidgets().forEach(widget => widget._restartPhotoSlideshow?.());
    });

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: ENSURE WIDGET ADDER
     * Implementation of ensure Widget Adder. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function ensureWidgetAdder() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ADDER
       * Defines adder for the surrounding section.
       * ------------------------------------------------------------------- */
      let adder = $('widgetAdder');
      if (adder) return adder;
      adder = document.createElement('div');
      adder.className = 'widget-adder';
      adder.id = 'widgetAdder';
      adder.setAttribute('aria-label', 'Widget catalog');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CATEGORIES
       * Defines categories for the surrounding section.
       * ------------------------------------------------------------------- */
      const categories = ['All', ...new Set(widgetCatalogRegistry.map(entry => entry.category))];
      adder.innerHTML = '<div class="widget-adder-card"><div class="widget-adder-categories" aria-label="Widget categories"></div><div class="widget-adder-grid"></div></div>';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CATEGORY STRIP
       * Defines category Strip for the surrounding section.
       * ------------------------------------------------------------------- */
      const categoryStrip = adder.querySelector('.widget-adder-categories');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GRID
       * Defines grid for the surrounding section.
       * ------------------------------------------------------------------- */
      const grid = adder.querySelector('.widget-adder-grid');
      categories.forEach(category => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CHIP
         * Defines chip for the surrounding section.
         * ------------------------------------------------------------------- */
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `widget-adder-category${category === 'All' ? ' active' : ''}`;
        chip.dataset.widgetCategory = category;
        chip.textContent = category;
        categoryStrip.appendChild(chip);
      });
      widgetCatalogRegistry.forEach(entry => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: BUTTON
         * Defines button for the surrounding section.
         * ------------------------------------------------------------------- */
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'widget-library-item';
        button.dataset.contentType = entry.type;
        button.dataset.widgetCategory = entry.category;
        button.title = `Add ${entry.label}`;
        button.innerHTML = `${entry.icon}<span>${entry.label}</span>`;
        grid.appendChild(button);
      });
      document.querySelector('.add-widgets-section .accordion-content').replaceChildren(adder);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * adder.addEventListener('click', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      adder.addEventListener('click', event => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CLOSE
         * Defines close for the surrounding section.
         * ------------------------------------------------------------------- */
        const close = event.target.closest('.widget-adder-close');
        if (close) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CATEGORY BUTTON
         * Defines category Button for the surrounding section.
         * ------------------------------------------------------------------- */
        const categoryButton = event.target.closest('.widget-adder-category');
        if (categoryButton) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: CATEGORY
           * Defines category for the surrounding section.
           * ------------------------------------------------------------------- */
          const category = categoryButton.dataset.widgetCategory;
          categoryStrip.querySelectorAll('.widget-adder-category').forEach(button => button.classList.toggle('active', button === categoryButton));
          grid.querySelectorAll('.widget-library-item').forEach(button => { button.hidden = category !== 'All' && button.dataset.widgetCategory !== category; });
          return;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ITEM
         * Defines item for the surrounding section.
         * ------------------------------------------------------------------- */
        const item = event.target.closest('.widget-library-item[data-content-type]');
        if (!item) return;
        const panelWidth = panel.getBoundingClientRect().width;
        const availableWidth = innerWidth - panelWidth;
        createWidgetAt(item.dataset.contentType, availableWidth > 260 ? panelWidth + availableWidth / 2 : innerWidth / 2, innerHeight / 2);
        settingsPinned = true;
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * adder.addEventListener('pointerdown', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */

      return adder;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET WIDGET ADDER
     * Implementation of set Widget Adder. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    // The catalog lives in the Settings accordion; no separate popup or hover handlers.
    ensureWidgetAdder();

    let viewportResizeFrame = 0;
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('resize', ()  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('resize', () => {
      if (viewportResizeFrame) return;
      viewportResizeFrame = requestAnimationFrame(() => {
        viewportResizeFrame = 0;
        updateViewportEnvironment();
        currentWidgets().forEach(widget => {
          if (widget._settingsPopover?.classList.contains('open')) widget._positionSettingsPopover?.();
        });
      });
    });
    updateViewportEnvironment();
    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('focusout',() — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('focusout',()=>requestAnimationFrame(()=>{if(pendingHubLayoutEvaluation&&!layoutEditingActive())evaluateHubLayoutPolicy(true);}),true);

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('pointerdown' , event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('pointerdown' , event => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TRAY
       * Defines tray for the surrounding section.
       * ------------------------------------------------------------------- */
      const tray = $('minimizedTray');
      if (tray.classList.contains('open') && !tray.contains(event.target) && !minimizedToggle.contains(event.target)) setMinimizedTray(false);
      currentWidgets().forEach(widget => {
        if (widget._settingsPopover?.contains(event.target) || widget.querySelector('.widget-settings-button')?.contains(event.target)) return;
        closeWidgetSettings(widget);
      });
    }, true);

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * addEventListener('keydown', event  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;

      if (focusedWidget) setWidgetFocus(focusedWidget, false);
    });
