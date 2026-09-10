/* HUB GUIDE =================================================================
 * FILE: src/telemetry.js
 * Performance measurements, photo presentation, widget titles, and supporting display helpers.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PERFORMANCE TELEMETRY
     * Defines performance Telemetry for the surrounding section.
     * ------------------------------------------------------------------- */
    const performanceTelemetry = (() => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SUBSCRIBERS
       * Defines subscribers for the surrounding section.
       * ------------------------------------------------------------------- */
      const subscribers = new Set();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STARTED AT
       * Defines started At for the surrounding section.
       * ------------------------------------------------------------------- */
      let startedAt = performance.now();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STARTED ISO
       * Defines started ISO for the surrounding section.
       * ------------------------------------------------------------------- */
      let startedISO = new Date().toISOString();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FRAME TIMES
       * Defines frame Times for the surrounding section.
       * ------------------------------------------------------------------- */
      const frameTimes = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LONG TASKS
       * Defines long Tasks for the surrounding section.
       * ------------------------------------------------------------------- */
      const longTasks = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: INTERACTIONS
       * Defines interactions for the surrounding section.
       * ------------------------------------------------------------------- */
      const interactions = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: INTEGRATION TIMINGS
       * Defines integration Timings for the surrounding section.
       * ------------------------------------------------------------------- */
      const integrationTimings = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SAMPLES
       * Defines samples for the surrounding section.
       * ------------------------------------------------------------------- */
      const samples = [];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DROPPED FRAMES
       * Defines dropped Frames for the surrounding section.
       * ------------------------------------------------------------------- */
      let droppedFrames = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LAST FRAME
       * Defines last Frame for the surrounding section.
       * ------------------------------------------------------------------- */
      let lastFrame = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ANIMATION FRAME
       * Defines animation Frame for the surrounding section.
       * ------------------------------------------------------------------- */
      let animationFrame = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SAMPLE TIMER
       * Defines sample Timer for the surrounding section.
       * ------------------------------------------------------------------- */
      let sampleTimer = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LAST LOGGED AT
       * Defines last Logged At for the surrounding section.
       * ------------------------------------------------------------------- */
      let lastLoggedAt = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LAST DOM COUNT AT
       * Defines last Dom Count At for the surrounding section.
       * ------------------------------------------------------------------- */
      let lastDomCountAt = -Infinity;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CACHED DOM ELEMENTS
       * Defines cached Dom Elements for the surrounding section.
       * ------------------------------------------------------------------- */
      let cachedDomElements = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LONG TASK OBSERVER
       * Defines long Task Observer for the surrounding section.
       * ------------------------------------------------------------------- */
      let longTaskObserver = null;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: INTERACTION OBSERVER
       * Defines interaction Observer for the surrounding section.
       * ------------------------------------------------------------------- */
      let interactionObserver = null;

      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: PERCENTILE
       * Defines percentile for the surrounding section.
       * ------------------------------------------------------------------- */
      const percentile = (values, value) => {
        if (!values.length) return null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SORTED
         * Defines sorted for the surrounding section.
         * ------------------------------------------------------------------- */
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * value) - 1)];
      };
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ROUND
       * Defines round for the surrounding section.
       * ------------------------------------------------------------------- */
      const round = (value, digits = 1) => value == null ? null : Number(value.toFixed(digits));
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: BYTES LABEL
       * Defines bytes Label for the surrounding section.
       * ------------------------------------------------------------------- */
      const bytesLabel = bytes => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ELAPSED LABEL
       * Defines elapsed Label for the surrounding section.
       * ------------------------------------------------------------------- */
      const elapsedLabel = milliseconds => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TOTAL
         * Defines total for the surrounding section.
         * ------------------------------------------------------------------- */
        const total = Math.floor(milliseconds / 1000);
        return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
      };

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: FRAME
       * Implementation of frame. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function frame(now) {
        if (lastFrame) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DURATION
           * Defines duration for the surrounding section.
           * ------------------------------------------------------------------- */
          const duration = now - lastFrame;
          if (document.hidden || duration > 1000) {
            lastFrame = now;
            animationFrame = requestAnimationFrame(frame);
            return;
          }
          frameTimes.push({ time: now, duration });
          while (frameTimes.length && frameTimes[0].time < now - 10000) frameTimes.shift();
          if (duration > 25) droppedFrames += Math.max(1, Math.round(duration / 16.667) - 1);
        }
        lastFrame = now;
        animationFrame = requestAnimationFrame(frame);
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: OBSERVE
       * Implementation of observe. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function observe() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SUPPORTED
         * Defines supported for the surrounding section.
         * ------------------------------------------------------------------- */
        const supported = PerformanceObserver.supportedEntryTypes || [];
        if (supported.includes('longtask')) {
          longTaskObserver = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
              if (entry.startTime < startedAt) return;
              longTasks.push({ time: entry.startTime + entry.duration, startTime: round(entry.startTime - startedAt), duration: round(entry.duration) });
            });
          });
          longTaskObserver.observe({ type: 'longtask' });
        }
        if (supported.includes('event')) {
          interactionObserver = new PerformanceObserver(list => {
            list.getEntries().forEach(entry => {
              if (!entry.interactionId) return;
              if (entry.startTime < startedAt) return;
              interactions.push({ time: entry.startTime + entry.duration, name: entry.name, duration: round(entry.duration), interactionId: entry.interactionId });
            });
          });
          try { interactionObserver.observe({ type: 'event', durationThreshold: 16 }); } catch {}
        }
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: SNAPSHOT
       * Implementation of snapshot. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function snapshot() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NOW
         * Defines now for the surrounding section.
         * ------------------------------------------------------------------- */
        const now = performance.now();
        if (now - lastDomCountAt >= 5000) {
          cachedDomElements = document.getElementsByTagName('*').length;
          lastDomCountAt = now;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RECENT FRAMES
         * Defines recent Frames for the surrounding section.
         * ------------------------------------------------------------------- */
        const recentFrames = frameTimes.filter(item => item.time >= now - 1000).map(item => item.duration);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RECENT LONG TASKS
         * Defines recent Long Tasks for the surrounding section.
         * ------------------------------------------------------------------- */
        const recentLongTasks = longTasks.filter(item => item.time >= now - 10000);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RECENT INTERACTIONS
         * Defines recent Interactions for the surrounding section.
         * ------------------------------------------------------------------- */
        const recentInteractions = interactions.filter(item => item.time >= now - 60000).map(item => item.duration);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: AVG FRAME
         * Defines avg Frame for the surrounding section.
         * ------------------------------------------------------------------- */
        const avgFrame = recentFrames.length ? recentFrames.reduce((sum, value) => sum + value, 0) / recentFrames.length : null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RESOURCES
         * Defines resources for the surrounding section.
         * ------------------------------------------------------------------- */
        const resources = performance.getEntriesByType('resource');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TRANSFERRED
         * Defines transferred for the surrounding section.
         * ------------------------------------------------------------------- */
        const transferred = resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NAVIGATION
         * Defines navigation for the surrounding section.
         * ------------------------------------------------------------------- */
        const navigation = performance.getEntriesByType('navigation')[0];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDGETS
         * Defines widgets for the surrounding section.
         * ------------------------------------------------------------------- */
        const widgets = currentWidgets();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VISIBLE WIDGETS
         * Defines visible Widgets for the surrounding section.
         * ------------------------------------------------------------------- */
        const visibleWidgets = widgets.filter(widget => !widget.hidden).length;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PHOTO TIMERS
         * Defines photo Timers for the surrounding section.
         * ------------------------------------------------------------------- */
        const photoTimers = widgets.filter(widget => widget._photoTimer).length;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HEAP
         * Defines heap for the surrounding section.
         * ------------------------------------------------------------------- */
        const heap = performance.memory ? {
          usedMB: round(performance.memory.usedJSHeapSize / 1048576),
          totalMB: round(performance.memory.totalJSHeapSize / 1048576),
          limitMB: round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DATA
         * Defines data for the surrounding section.
         * ------------------------------------------------------------------- */
        const data = {
          timestamp: new Date().toISOString(),
          elapsedMs: Math.round(now - startedAt),
          fps: avgFrame ? round(1000 / avgFrame) : null,
          frameAverageMs: round(avgFrame),
          frameP95Ms: round(percentile(recentFrames, .95)),
          frameMaxMs: round(recentFrames.length ? Math.max(...recentFrames) : null),
          droppedFrames,
          longTaskCount: longTasks.length,
          longTaskCountLast10s: recentLongTasks.length,
          blockedMsLast10s: round(recentLongTasks.reduce((sum, item) => sum + item.duration, 0)),
          blockedPercentLast10s: round(recentLongTasks.reduce((sum, item) => sum + item.duration, 0) / 100),
          interactionP95Ms: round(percentile(recentInteractions, .95)),
          interactionMaxMs: round(recentInteractions.length ? Math.max(...recentInteractions) : null),
          domElements: cachedDomElements,
          heap,
          widgets: { visible: visibleWidgets, total: widgets.length, minimized: widgets.length - visibleWidgets },
          resources: { count: resources.length, transferredBytes: transferred },
          pageLoadMs: navigation?.loadEventEnd ? round(navigation.loadEventEnd - navigation.startTime) : null,
          domContentLoadedMs: navigation?.domContentLoadedEventEnd ? round(navigation.domContentLoadedEventEnd - navigation.startTime) : null,
          knownTimers: 1 + photoTimers + (subscribers.size ? 1 : 0),
          activePhotoSlideshows: photoTimers,
          integrationTimings: integrationTimings.length
        };
        data.lowMotionTest = document.body.classList.contains('performance-low-motion');
        data.appEffects = !document.body.classList.contains('performance-app-fx-off');
        data.status = data.fps != null && data.fps < 45 || data.frameP95Ms != null && data.frameP95Ms > 33 || data.blockedPercentLast10s > 10 ? 'Critical'
          : data.fps != null && data.fps < 55 || data.frameP95Ms != null && data.frameP95Ms > 20 || data.blockedPercentLast10s > 3 ? 'Watch'
          : 'Healthy';
        return data;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: RENDER
       * Implementation of render. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function render(widget, data) {
        if (!widget.isConnected || widget.hidden) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ROOT
         * Defines root for the surrounding section.
         * ------------------------------------------------------------------- */
        const root = widget.querySelector('.performance-widget');
        if (!root) return;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SET
         * Defines set for the surrounding section.
         * ------------------------------------------------------------------- */
        const set = (name, value) => { const target = root.querySelector(`[data-perf="${name}"]`); if (target) target.textContent = value; };
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SET GAUGE
         * Defines set Gauge for the surrounding section.
         * ------------------------------------------------------------------- */
        const setGauge = (name, value, max) => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: GAUGE
           * Defines gauge for the surrounding section.
           * ------------------------------------------------------------------- */
          const gauge = root.querySelector(`[data-performance-gauge="${name}"]`);
          if (!gauge) return;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: NUMERIC
           * Defines numeric for the surrounding section.
           * ------------------------------------------------------------------- */
          const numeric = Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: PRIOR
           * Defines prior for the surrounding section.
           * ------------------------------------------------------------------- */
          const prior = Number.parseFloat(gauge.dataset.smoothValue);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SMOOTH
           * Defines smooth for the surrounding section.
           * ------------------------------------------------------------------- */
          const smooth = Number.isFinite(prior) ? prior + (numeric - prior) * 0.18 : numeric;
          gauge.dataset.smoothValue = String(smooth);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ANGLE
           * Defines angle for the surrounding section.
           * ------------------------------------------------------------------- */
          const angle = -120 + (smooth / max) * 240;
          gauge.style.setProperty('--gauge-angle', `${angle}deg`);
          gauge.setAttribute('aria-valuemin', '0');
          gauge.setAttribute('aria-valuemax', String(max));
          gauge.setAttribute('aria-valuenow', Number.isFinite(value) ? String(value) : '0');
        };
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SET MINI
         * Defines set Mini for the surrounding section.
         * ------------------------------------------------------------------- */
        const setMini = (name, value, max) => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: MINI
           * Defines mini for the surrounding section.
           * ------------------------------------------------------------------- */
          const mini = root.querySelector(`[data-mini="${name}"]`);
          if (!mini) return;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: NUMERIC
           * Defines numeric for the surrounding section.
           * ------------------------------------------------------------------- */
          const numeric = Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
          mini.style.setProperty('--mini-level', `${Math.max(3, numeric / Math.max(1, max) * 240)}deg`);
        };
        set('fps', data.fps == null ? '--' : data.fps);
        set('frameP95', data.frameP95Ms == null ? '--' : data.frameP95Ms);
        set('dropped', data.droppedFrames.toLocaleString());
        set('longTasks', data.longTaskCount.toLocaleString());
        set('blocked', `${data.blockedPercentLast10s}%`);
        set('interaction', data.interactionP95Ms == null ? '--' : data.interactionP95Ms);
        set('dom', data.domElements.toLocaleString());
        set('heap', data.heap ? `${data.heap.usedMB} MB` : 'N/A');
        set('widgets', `${data.widgets.visible} / ${data.widgets.total}`);
        set('resources', data.resources.count.toLocaleString());
        set('load', data.pageLoadMs == null ? '--' : `${data.pageLoadMs} ms`);
        set('timers', data.knownTimers);
        setGauge('fps', data.fps, 240);
        setGauge('frame', data.frameP95Ms, 36);
        setGauge('interaction', data.interactionP95Ms, 300);
        setMini('dropped', data.droppedFrames, 300);
        setMini('longTasks', data.longTaskCount, 20);
        setMini('blocked', data.blockedPercentLast10s, 20);
        setMini('dom', data.domElements, 5000);
        setMini('heap', data.heap?.usedMB ?? 0, Math.max(32, data.heap?.totalMB ?? 32));
        setMini('widgets', data.widgets.visible, Math.max(1, data.widgets.total));
        setMini('load', data.pageLoadMs ?? 0, 1500);
        setMini('timers', data.knownTimers, 12);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SCORE
         * Defines score for the surrounding section.
         * ------------------------------------------------------------------- */
        const score = root.querySelector('.performance-score');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STATUS COLOR
         * Defines status Color for the surrounding section.
         * ------------------------------------------------------------------- */
        const statusColor = data.status === 'Critical' ? '#ff7f89' : data.status === 'Watch' ? '#ffcf71' : '#75edd2';
        root.style.setProperty('--perf-status', statusColor);
        if (score) {
          score.textContent = data.status;
          score.style.setProperty('--perf-status', statusColor);
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CHART
         * Defines chart for the surrounding section.
         * ------------------------------------------------------------------- */
        const chart = root.querySelector('.performance-chart');
        if (!chart) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SVG
         * Defines svg for the surrounding section.
         * ------------------------------------------------------------------- */
        let svg = chart.querySelector('svg');
        if (!svg) {
          svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', '0 0 100 100');
          svg.setAttribute('preserveAspectRatio', 'none');
          svg.innerHTML = '<path class="performance-wave-fill"></path><path class="performance-wave-line"></path>';
          chart.appendChild(svg);
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HISTORY
         * Defines history for the surrounding section.
         * ------------------------------------------------------------------- */
        let history = frameTimes.slice(-72);
        if (history.length < 18) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: FILL
           * Defines fill for the surrounding section.
           * ------------------------------------------------------------------- */
          const fill = Array.from({ length: 18 - history.length }, () => ({ duration: 7.2 }));
          history = fill.concat(history);
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PHASE
         * Defines phase for the surrounding section.
         * ------------------------------------------------------------------- */
        const phase = data.elapsedMs / 520;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: POINTS
         * Defines points for the surrounding section.
         * ------------------------------------------------------------------- */
        const points = history.map((item, index) => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: X
           * Defines x for the surrounding section.
           * ------------------------------------------------------------------- */
          const x = history.length < 2 ? 0 : index / (history.length - 1) * 100;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ACTUAL
           * Defines actual for the surrounding section.
           * ------------------------------------------------------------------- */
          const actual = Math.max(0, Number(item.duration) - 5.5);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: IDLE WAVE
           * Defines idle Wave for the surrounding section.
           * ------------------------------------------------------------------- */
          const idleWave = 5.5
            + Math.abs(Math.sin(index * 1.18 + phase)) * 4.4
            + Math.abs(Math.sin(index * .43 + phase * .72)) * 3.2;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: BUMP1
           * Defines bump1 for the surrounding section.
           * ------------------------------------------------------------------- */
          const bump1 = Math.max(0, 11 - Math.abs(((index - (phase * 3.4)) % 23 + 23) % 23 - 11.5) * 3.5);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: BUMP2
           * Defines bump2 for the surrounding section.
           * ------------------------------------------------------------------- */
          const bump2 = Math.max(0, 8 - Math.abs(((index - (phase * 2.2 + 8)) % 17 + 17) % 17 - 8.5) * 3.1);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: BUMP3
           * Defines bump3 for the surrounding section.
           * ------------------------------------------------------------------- */
          const bump3 = Math.max(0, 6 - Math.abs(((index - (phase * 1.6 + 3)) % 13 + 13) % 13 - 6.5) * 2.8);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SPIKE
           * Defines spike for the surrounding section.
           * ------------------------------------------------------------------- */
          const spike = Math.min(72, actual * 4.5);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: AMPLITUDE
           * Defines amplitude for the surrounding section.
           * ------------------------------------------------------------------- */
          const amplitude = Math.min(78, idleWave + bump1 + bump2 + bump3 + spike);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: Y
           * Defines y for the surrounding section.
           * ------------------------------------------------------------------- */
          const y = 88 - amplitude;
          return [x, y];
        });
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SMOOTH PATH
         * Defines smooth Path for the surrounding section.
         * ------------------------------------------------------------------- */
        const smoothPath = pts => {
          if (!pts.length) return '';
          if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: D
           * Defines d for the surrounding section.
           * ------------------------------------------------------------------- */
          let d = `M ${pts[0][0]} ${pts[0][1]}`;
          for (let i = 1; i < pts.length - 1; i++) {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: MX
             * Defines mx for the surrounding section.
             * ------------------------------------------------------------------- */
            const mx = (pts[i][0] + pts[i + 1][0]) / 2;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: MY
             * Defines my for the surrounding section.
             * ------------------------------------------------------------------- */
            const my = (pts[i][1] + pts[i + 1][1]) / 2;
            d += ` Q ${pts[i][0]} ${pts[i][1]} ${mx} ${my}`;
          }
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: LAST
           * Defines last for the surrounding section.
           * ------------------------------------------------------------------- */
          const last = pts[pts.length - 1];
          d += ` T ${last[0]} ${last[1]}`;
          return d;
        };
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PREVIOUS
         * Defines previous for the surrounding section.
         * ------------------------------------------------------------------- */
        const previous = Array.isArray(chart._perfWavePoints) && chart._perfWavePoints.length === points.length ? chart._perfWavePoints : points.map(point => [...point]);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STARTED
         * Defines started for the surrounding section.
         * ------------------------------------------------------------------- */
        const started = performance.now();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DURATION
         * Defines duration for the surrounding section.
         * ------------------------------------------------------------------- */
        const duration = 920;
        cancelAnimationFrame(chart._perfWaveRaf || 0);
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: ANIMATE WAVE
         * Defines animate Wave for the surrounding section.
         * ------------------------------------------------------------------- */
        const animateWave = now => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: T
           * Defines t for the surrounding section.
           * ------------------------------------------------------------------- */
          const t = Math.min(1, (now - started) / duration);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: EASED
           * Defines eased for the surrounding section.
           * ------------------------------------------------------------------- */
          const eased = t * t * (3 - 2 * t);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TWEENED
           * Defines tweened for the surrounding section.
           * ------------------------------------------------------------------- */
          const tweened = points.map((point, index) => [point[0], previous[index][1] + (point[1] - previous[index][1]) * eased]);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: LINE PATH
           * Defines line Path for the surrounding section.
           * ------------------------------------------------------------------- */
          const linePath = smoothPath(tweened);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: FILL PATH
           * Defines fill Path for the surrounding section.
           * ------------------------------------------------------------------- */
          const fillPath = tweened.length ? `${linePath} L 100 96 L 0 96 Z` : '';
          svg.querySelector('.performance-wave-line').setAttribute('d', linePath);
          svg.querySelector('.performance-wave-fill').setAttribute('d', fillPath);
          if (t < 1) chart._perfWaveRaf = requestAnimationFrame(animateWave);
          else { chart._perfWavePoints = points.map(point => [...point]); chart._perfWaveRaf = 0; }
        };
        chart._perfWaveRaf = requestAnimationFrame(animateWave);
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: TICK
       * Implementation of tick. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function tick() {
        if (document.hidden) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DATA
         * Defines data for the surrounding section.
         * ------------------------------------------------------------------- */
        const data = snapshot();
        subscribers.forEach(widget => render(widget, data));
        if (performance.now() - lastLoggedAt >= 2000) {
          samples.push(data);
          if (samples.length > 10800) samples.shift();
          lastLoggedAt = performance.now();
        }
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: START
       * Implementation of start. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function start() {
        if (sampleTimer) return;
        observe();
        lastFrame = 0;
        animationFrame = requestAnimationFrame(frame);
        sampleTimer = setInterval(tick, 1000);
        tick();
      }
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: STOP
       * Implementation of stop. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function stop() {
        if (subscribers.size) return;
        clearInterval(sampleTimer); sampleTimer = 0;
        cancelAnimationFrame(animationFrame); animationFrame = 0;
        longTaskObserver?.disconnect(); longTaskObserver = null;
        interactionObserver?.disconnect(); interactionObserver = null;
      }
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: RESET
       * Implementation of reset. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function reset() {
        samples.length = 0; longTasks.length = 0; interactions.length = 0; integrationTimings.length = 0; frameTimes.length = 0;
        droppedFrames = 0; lastLoggedAt = 0; lastFrame = 0; lastDomCountAt = -Infinity;
        startedAt = performance.now();
        startedISO = new Date().toISOString();
        tick();
      }
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: DOWNLOAD
       * Implementation of download. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function download(format) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ENDING
         * Defines ending for the surrounding section.
         * ------------------------------------------------------------------- */
        const ending = new Date().toISOString().replace(/[:.]/g, '-');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SUMMARY
         * Defines summary for the surrounding section.
         * ------------------------------------------------------------------- */
        const summary = snapshot();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: BODY, TYPE, EXTENSION
         * Defines body, type, extension for the surrounding section.
         * ------------------------------------------------------------------- */
        let body, type, extension;
        if (format === 'csv') {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: HEADERS
           * Defines headers for the surrounding section.
           * ------------------------------------------------------------------- */
          const headers = ['timestamp','elapsedMs','status','appEffects','lowMotionTest','fps','frameAverageMs','frameP95Ms','frameMaxMs','droppedFrames','longTaskCount','longTaskCountLast10s','blockedMsLast10s','blockedPercentLast10s','interactionP95Ms','interactionMaxMs','domElements','heapUsedMB','heapTotalMB','widgetsVisible','widgetsTotal','widgetsMinimized','resourceCount','transferredBytes','pageLoadMs','domContentLoadedMs','knownTimers','activePhotoSlideshows'];
          body = [headers.join(','), ...samples.map(row => headers.map(key => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: VALUES
             * Defines values for the surrounding section.
             * ------------------------------------------------------------------- */
            const values = { ...row, heapUsedMB: row.heap?.usedMB ?? '', heapTotalMB: row.heap?.totalMB ?? '', widgetsVisible: row.widgets.visible, widgetsTotal: row.widgets.total, widgetsMinimized: row.widgets.minimized, resourceCount: row.resources.count, transferredBytes: row.resources.transferredBytes };
            return JSON.stringify(values[key] ?? '');
          }).join(','))].join('\n');
          type = 'text/csv'; extension = 'csv';
        } else {
          body = JSON.stringify({ schemaVersion: 1, sessionStarted: startedISO, exportedAt: new Date().toISOString(), sampleIntervalMs: 2000, summary, samples, longTasks, interactions, integrationTimings, limitations: ['CPU and GPU utilization require browser or operating-system tooling.', 'Complete event-listener enumeration is not exposed by standard webpage APIs.', 'JavaScript heap is Chromium-specific and may be unavailable.'] }, null, 2);
          type = 'application/json'; extension = 'json';
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LINK
         * Defines link for the surrounding section.
         * ------------------------------------------------------------------- */
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([body], { type }));
        link.download = `Performance Log ${ending}.${extension}`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      }
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: MEASURE ASYNC
       * Implementation of measure Async. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      async function measureAsync(label, operation) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: START
         * Defines start for the surrounding section.
         * ------------------------------------------------------------------- */
        const start = performance.now();
        try { return await (typeof operation === 'function' ? operation() : operation); }
        finally { integrationTimings.push({ label, timestamp: new Date().toISOString(), durationMs: round(performance.now() - start) }); }
      }
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: ATTACH
       * Implementation of attach. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function attach(widget) {
        subscribers.add(widget); start(); tick();
        return () => { subscribers.delete(widget); stop(); };
      }
      return { attach, reset, download, snapshot, measureAsync, mark: label => performance.mark(label) };
    })();
    window.hubPerformance = performanceTelemetry;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: INITIALIZE PERFORMANCE
     * Implementation of initialize Performance. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function initializePerformance(widget) {
      widget._destroyPerformance?.();
      widget._destroyPerformance = performanceTelemetry.attach(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ROOT
       * Defines root for the surrounding section.
       * ------------------------------------------------------------------- */
      const root = widget.querySelector('.performance-widget');
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * root?.querySelectorAll('[data-performance-export]').forEach(button  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      root?.querySelectorAll('[data-performance-export]').forEach(button => button.onclick = event => {
        event.stopPropagation();
        performanceTelemetry.download(button.dataset.performanceExport);
      });

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DEFAULTS
       * Defines defaults for the surrounding section.
       * ------------------------------------------------------------------- */
      const defaults = { fps: '#69efd0', frame: '#67c7ff', interaction: '#a88bff' };
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: COLOR KEY
       * Defines color Key for the surrounding section.
       * ------------------------------------------------------------------- */
      const colorKey = name => `hub-widget-app-${widget.id}-performance-${name}Color`;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: COLORS
       * Defines colors for the surrounding section.
       * ------------------------------------------------------------------- */
      const colors = {
        fps: localStorage.getItem(colorKey('fps')) || defaults.fps,
        frame: localStorage.getItem(colorKey('frame')) || defaults.frame,
        interaction: localStorage.getItem(colorKey('interaction')) || defaults.interaction
      };
      root?.style.setProperty('--perf-fps', colors.fps);
      root?.style.setProperty('--perf-frame', colors.frame);
      root?.style.setProperty('--perf-interaction', colors.interaction);

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAUGES
       * Defines gauges for the surrounding section.
       * ------------------------------------------------------------------- */
      const gauges = [...(root?.querySelectorAll('.performance-gauge') || [])];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAUGE INDEX
       * Defines gauge Index for the surrounding section.
       * ------------------------------------------------------------------- */
      let gaugeIndex = Math.max(0, gauges.findIndex(gauge => gauge.classList.contains('is-active')));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAUGE ANIMATING
       * Defines gauge Animating for the surrounding section.
       * ------------------------------------------------------------------- */
      let gaugeAnimating = false;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: SELECT GAUGE
       * Defines select Gauge for the surrounding section.
       * ------------------------------------------------------------------- */
      const selectGauge = (nextIndex, direction = 1) => {
        if (!gauges.length || gaugeAnimating) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PREVIOUS INDEX
         * Defines previous Index for the surrounding section.
         * ------------------------------------------------------------------- */
        const previousIndex = gaugeIndex;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RESOLVED INDEX
         * Defines resolved Index for the surrounding section.
         * ------------------------------------------------------------------- */
        const resolvedIndex = (nextIndex + gauges.length) % gauges.length;
        if (resolvedIndex === previousIndex) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: OUTGOING
         * Defines outgoing for the surrounding section.
         * ------------------------------------------------------------------- */
        const outgoing = gauges[previousIndex];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INCOMING
         * Defines incoming for the surrounding section.
         * ------------------------------------------------------------------- */
        const incoming = gauges[resolvedIndex];
        if (!outgoing || !incoming) return;

        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: REDUCED MOTION
         * Defines reduced Motion for the surrounding section.
         * ------------------------------------------------------------------- */
        const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TRAVEL
         * Defines travel for the surrounding section.
         * ------------------------------------------------------------------- */
        const travel = direction > 0 ? 72 : -72;
        gauges.forEach(gauge => {
          gauge.getAnimations?.().forEach(animation => animation.cancel());
          gauge.classList.remove('slide-out-left','slide-out-right','slide-in-left','slide-in-right');
        });

        incoming.classList.add('is-active');
        incoming.style.zIndex = '3';
        outgoing.style.zIndex = '2';
        gaugeIndex = resolvedIndex;

        if (reducedMotion || typeof outgoing.animate !== 'function') {
          outgoing.classList.remove('is-active');
          outgoing.style.zIndex = '';
          incoming.style.zIndex = '';
          return;
        }

        gaugeAnimating = true;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TIMING
         * Defines timing for the surrounding section.
         * ------------------------------------------------------------------- */
        const timing = { duration: 360, easing: 'cubic-bezier(.2,.72,.22,1)', fill: 'both' };
        try {
          /* The gauge's centering transform is intentionally !important in CSS.
             Animate the independent CSS translate property instead of transform so
             the carousel motion cannot be masked by that centering rule. */
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: OUTGOING ANIMATION
           * Defines outgoing Animation for the surrounding section.
           * ------------------------------------------------------------------- */
          const outgoingAnimation = outgoing.animate([
            { opacity: 1, translate: '0px 0px' },
            { opacity: 0, translate: `${-travel}px 0px` }
          ], timing);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: INCOMING ANIMATION
           * Defines incoming Animation for the surrounding section.
           * ------------------------------------------------------------------- */
          const incomingAnimation = incoming.animate([
            { opacity: 0, translate: `${travel}px 0px` },
            { opacity: 1, translate: '0px 0px' }
          ], timing);
          Promise.allSettled([outgoingAnimation.finished, incomingAnimation.finished]).then(() => {
            outgoing.classList.remove('is-active');
            outgoing.style.zIndex = '';
            incoming.style.zIndex = '';
            outgoingAnimation.cancel();
            incomingAnimation.cancel();
            gaugeAnimating = false;
          });
        } catch (_) {
          outgoing.classList.remove('is-active');
          outgoing.style.zIndex = '';
          incoming.style.zIndex = '';
          gaugeAnimating = false;
        }
      };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * root?.querySelector('.performance-gauge-nav.prev')?.addEventListener('click', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      root?.querySelector('.performance-gauge-nav.prev')?.addEventListener('click', event => {
        event.stopPropagation();
        selectGauge(gaugeIndex - 1, -1);
        event.currentTarget.blur();
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * root?.querySelector('.performance-gauge-nav.next')?.addEventListener('click', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      root?.querySelector('.performance-gauge-nav.next')?.addEventListener('click', event => {
        event.stopPropagation();
        selectGauge(gaugeIndex + 1, 1);
        event.currentTarget.blur();
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: INITIALIZE PHOTOS
     * Implementation of initialize Photos. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function initializePhotos(widget) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ROOT
       * Defines root for the surrounding section.
       * ------------------------------------------------------------------- */
      const root = widget.querySelector('.photos-widget');
      if (!root) return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TILES
       * Defines tiles for the surrounding section.
       * ------------------------------------------------------------------- */
      const tiles = [...root.querySelectorAll('.photo-tile')];
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FEATURE
       * Defines feature for the surrounding section.
       * ------------------------------------------------------------------- */
      const feature = root.querySelector('.photo-feature');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: COUNTER
       * Defines counter for the surrounding section.
       * ------------------------------------------------------------------- */
      const counter = root.querySelector('.photo-counter');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BADGE
       * Defines badge for the surrounding section.
       * ------------------------------------------------------------------- */
      const badge = root.querySelector('.photo-mode-badge');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SELECTED
       * Defines selected for the surrounding section.
       * ------------------------------------------------------------------- */
      let selected = Math.min(Number(widget.dataset.photoIndex) || 0, tiles.length - 1);
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: SHOW
       * Defines show for the surrounding section.
       * ------------------------------------------------------------------- */
      const show = index => {
        selected = (index + tiles.length) % tiles.length;
        widget.dataset.photoIndex = String(selected);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TILE
         * Defines tile for the surrounding section.
         * ------------------------------------------------------------------- */
        const tile = tiles[selected];
        feature.style.backgroundImage = `url('${tile.dataset.photoUrl}')`;
        counter.textContent = `${selected + 1} of ${tiles.length}`;
        tiles.forEach((item, itemIndex) => item.classList.toggle('active', itemIndex === selected));
        if (widget.dataset.photoView === 'filmstrip') tile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      };
      widget._showPhoto = show;
      widget._restartPhotoSlideshow = () => {
        clearInterval(widget._photoTimer);
        widget._photoTimer = null;
        if (widget.dataset.photoView !== 'slideshow' || widget.hidden || document.hidden) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SECONDS
         * Defines seconds for the surrounding section.
         * ------------------------------------------------------------------- */
        const seconds = Math.max(2, Number(widget.dataset.photoInterval) || 5);
        widget._photoTimer = setInterval(() => show(selected + 1), seconds * 1000);
      };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * root.querySelector('.photo-nav.prev').onclick = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      root.querySelector('.photo-nav.prev').onclick = event => { event.stopPropagation(); show(selected - 1); widget._restartPhotoSlideshow(); };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * root.querySelector('.photo-nav.next').onclick = event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      root.querySelector('.photo-nav.next').onclick = event => { event.stopPropagation(); show(selected + 1); widget._restartPhotoSlideshow(); };
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * tiles.forEach((tile, index)  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      tiles.forEach((tile, index) => tile.onclick = () => show(index));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GRID
       * Defines grid for the surrounding section.
       * ------------------------------------------------------------------- */
      const grid = root.querySelector('.photo-grid');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DRAG START X
       * Defines drag Start X for the surrounding section.
       * ------------------------------------------------------------------- */
      let dragStartX = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DRAG START SCROLL
       * Defines drag Start Scroll for the surrounding section.
       * ------------------------------------------------------------------- */
      let dragStartScroll = 0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DRAGGED
       * Defines dragged for the surrounding section.
       * ------------------------------------------------------------------- */
      let dragged = false;
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * grid.addEventListener('pointerdown', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      grid.addEventListener('pointerdown', event => {
        if (widget.dataset.photoView !== 'carousel' || event.pointerType === 'touch') return;
        dragStartX = event.clientX;
        dragStartScroll = grid.scrollLeft;
        dragged = false;
        grid.setPointerCapture(event.pointerId);
        grid.classList.add('is-scrolling');
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * grid.addEventListener('pointermove', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      grid.addEventListener('pointermove', event => {
        if (!grid.hasPointerCapture(event.pointerId)) return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DISTANCE
         * Defines distance for the surrounding section.
         * ------------------------------------------------------------------- */
        const distance = event.clientX - dragStartX;
        if (Math.abs(distance) > 4) dragged = true;
        grid.scrollLeft = dragStartScroll - distance;
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * grid.addEventListener('pointerup', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      grid.addEventListener('pointerup', event => {
        if (grid.hasPointerCapture(event.pointerId)) grid.releasePointerCapture(event.pointerId);
        grid.classList.remove('is-scrolling');
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * grid.addEventListener('click', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      grid.addEventListener('click', event => { if (dragged) { event.preventDefault(); event.stopPropagation(); dragged = false; } }, true);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * grid.addEventListener('wheel', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      grid.addEventListener('wheel', event => {
        if (widget.dataset.photoView !== 'carousel' || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        event.preventDefault();
        grid.scrollLeft += event.deltaY;
      }, { passive: false });
      widget._setPhotoBadge = value => { badge.textContent = value === 'slideshow' ? 'Playing' : value === 'filmstrip' ? 'Filmstrip' : 'Featured'; };
      show(selected);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: UPDATE CLOCKS
     * Implementation of update Clocks. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function updateClocks() {
      if (document.hidden) return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NOW
       * Defines now for the surrounding section.
       * ------------------------------------------------------------------- */
      const now = new Date();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ZONES
       * Defines zones for the surrounding section.
       * ------------------------------------------------------------------- */
      const zones = { local: undefined, eastern: 'America/New_York', central: 'America/Chicago', mountain: 'America/Denver', pacific: 'America/Los_Angeles', utc: 'UTC' };
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ZONE NAMES
       * Defines zone Names for the surrounding section.
       * ------------------------------------------------------------------- */
      const zoneNames = { local: 'Local time', eastern: 'Eastern Time', central: 'Central Time', mountain: 'Mountain Time', pacific: 'Pacific Time', utc: 'UTC' };
      document.querySelectorAll('.clock-widget').forEach(clock => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDGET
         * Defines widget for the surrounding section.
         * ------------------------------------------------------------------- */
        const widget = clock.closest('.widget');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ZONE KEY
         * Defines zone Key for the surrounding section.
         * ------------------------------------------------------------------- */
        const zoneKey = widget?.dataset.clockTimezone || 'local';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TIME ZONE
         * Defines time Zone for the surrounding section.
         * ------------------------------------------------------------------- */
        const timeZone = zones[zoneKey];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DATE STYLE
         * Defines date Style for the surrounding section.
         * ------------------------------------------------------------------- */
        const dateStyle = widget?.dataset.clockDateStyle || 'full';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DATE OPTIONS
         * Defines date Options for the surrounding section.
         * ------------------------------------------------------------------- */
        const dateOptions = dateStyle === 'short' ? { weekday: 'short', month: 'short', day: 'numeric' } : dateStyle === 'numeric' ? { year: 'numeric', month: '2-digit', day: '2-digit' } : { weekday: 'long', month: 'long', day: 'numeric' };
        if (timeZone) dateOptions.timeZone = timeZone;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TIME OPTIONS
         * Defines time Options for the surrounding section.
         * ------------------------------------------------------------------- */
        const timeOptions = { hour: widget?.dataset.clockLeadingZero === 'true' ? '2-digit' : 'numeric', minute: '2-digit', hour12: widget?.dataset.clockFormat !== '24' };
        if (timeZone) timeOptions.timeZone = timeZone;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TIME PARTS
         * Defines time Parts for the surrounding section.
         * ------------------------------------------------------------------- */
        const timeParts = new Intl.DateTimeFormat(undefined, timeOptions).formatToParts(now);
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: PART
         * Defines part for the surrounding section.
         * ------------------------------------------------------------------- */
        const part = type => timeParts.find(item => item.type === type)?.value || '';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TIME
         * Defines time for the surrounding section.
         * ------------------------------------------------------------------- */
        const time = `${part('hour')}:${part('minute')}`;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MERIDIEM
         * Defines meridiem for the surrounding section.
         * ------------------------------------------------------------------- */
        const meridiem = part('dayPeriod');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SECONDS OPTIONS
         * Defines seconds Options for the surrounding section.
         * ------------------------------------------------------------------- */
        const secondsOptions = { second: '2-digit' };
        if (timeZone) secondsOptions.timeZone = timeZone;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SECONDS
         * Defines seconds for the surrounding section.
         * ------------------------------------------------------------------- */
        const seconds = new Intl.DateTimeFormat(undefined, secondsOptions).format(now).padStart(2, '0');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DATE
         * Defines date for the surrounding section.
         * ------------------------------------------------------------------- */
        const date = new Intl.DateTimeFormat(undefined, dateOptions).format(now);
        clock.querySelectorAll('.clock-hours').forEach(element => { element.textContent = time; });
        clock.querySelectorAll('.clock-seconds').forEach(element => { element.textContent = `:${seconds}`; });
        clock.querySelectorAll('.clock-meridiem').forEach(element => { element.textContent = meridiem; });
        clock.querySelectorAll('.clock-date').forEach(element => { element.textContent = date; });
        clock.querySelectorAll('.clock-extra').forEach(element => { element.textContent = `${zoneNames[zoneKey]} · Next: Project walkthrough at 10:30 AM`; });
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DIGITAL TIME
         * Defines digital Time for the surrounding section.
         * ------------------------------------------------------------------- */
        const digitalTime = clock.querySelector('.clock-time');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DIGITAL FACE
         * Defines digital Face for the surrounding section.
         * ------------------------------------------------------------------- */
        const digitalFace = clock.querySelector('.clock-digital-face');
        if (digitalTime && digitalFace && widget?.dataset.clockFace === 'modular') {
          digitalTime.style.removeProperty('font-size');
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: AVAILABLE WIDTH
           * Defines available Width for the surrounding section.
           * ------------------------------------------------------------------- */
          const availableWidth = Math.max(0, digitalFace.clientWidth - 8);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: NATURAL WIDTH
           * Defines natural Width for the surrounding section.
           * ------------------------------------------------------------------- */
          const naturalWidth = digitalTime.scrollWidth;
          if (availableWidth && naturalWidth > availableWidth) {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: NATURAL SIZE
             * Defines natural Size for the surrounding section.
             * ------------------------------------------------------------------- */
            const naturalSize = Number.parseFloat(getComputedStyle(digitalTime).fontSize);
            digitalTime.style.fontSize = `${naturalSize * availableWidth / naturalWidth * .96}px`;
          }
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ANALOG OPTIONS
         * Defines analog Options for the surrounding section.
         * ------------------------------------------------------------------- */
        const analogOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' };
        if (timeZone) analogOptions.timeZone = timeZone;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ANALOG PARTS
         * Defines analog Parts for the surrounding section.
         * ------------------------------------------------------------------- */
        const analogParts = Object.fromEntries(new Intl.DateTimeFormat('en-US', analogOptions).formatToParts(now).filter(item => item.type !== 'literal').map(item => [item.type, Number(item.value)]));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SECOND VALUE
         * Defines second Value for the surrounding section.
         * ------------------------------------------------------------------- */
        const secondValue = analogParts.second || 0;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MINUTE VALUE
         * Defines minute Value for the surrounding section.
         * ------------------------------------------------------------------- */
        const minuteValue = (analogParts.minute || 0) + secondValue / 60;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HOUR VALUE
         * Defines hour Value for the surrounding section.
         * ------------------------------------------------------------------- */
        const hourValue = (analogParts.hour || 0) % 12 + minuteValue / 60;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: SET HAND
         * Defines set Hand for the surrounding section.
         * ------------------------------------------------------------------- */
        const setHand = (selector, rotation) => { const hand = clock.querySelector(selector); if (hand) hand.style.setProperty('--rotation', `${rotation}deg`); };
        setHand('.clock-hand.hour', hourValue * 30);
        setHand('.clock-hand.minute', minuteValue * 6);
        setHand('.clock-hand.second', secondValue * 6);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: COMPLICATION
         * Defines complication for the surrounding section.
         * ------------------------------------------------------------------- */
        const complication = clock.querySelector('.clock-complication');
        if (complication) complication.textContent = dateStyle === 'hidden' ? zoneNames[zoneKey] : date;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HOUR PANEL
         * Defines hour Panel for the surrounding section.
         * ------------------------------------------------------------------- */
        const hourPanel = clock.querySelector('.flip-hour');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MINUTE PANEL
         * Defines minute Panel for the surrounding section.
         * ------------------------------------------------------------------- */
        const minutePanel = clock.querySelector('.flip-minute');
        if (hourPanel) hourPanel.textContent = part('hour').padStart(2, '0');
        if (minutePanel) minutePanel.textContent = part('minute');
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET TYPE LABELS
     * Defines widget Type Labels for the surrounding section.
     * ------------------------------------------------------------------- */
    const widgetTypeLabels = {
      financialdashboard:'Financial Dashboard',
      checkallocator: 'Next Check', financeaccounts: 'Accounts & Transfers', financesandbox: 'Forecast Sandbox', clock: 'Clock', weather: 'Weather', financial: 'Financial Overview', todo: 'To-Do', notes: 'Notes', gmail: 'Gmail', drive: 'Google Drive',
      calendar: 'Calendar', launcher: 'Apps', system: 'System Performance', performance: 'Hub Performance', projects: 'Projects', analytics: 'Analytics',
      links: 'Quick Links', music: 'Music', youtube: 'YouTube', photos: 'Photos', tagim: 'TAGIM', reminders: 'Reminders',
      solar: 'Solar', moon: 'Moon Phases', radar: 'MyRadar', cashflow: 'Cash Flow', billcenter: 'Bill Center', payroll: 'Payroll', operations: 'Operations',
      financialoverview: 'Financial Overview', latebills: 'Late Bills', equipment: 'Equipment', insurance: 'Insurance', creditaccounts: 'Credit Accounts', financialactionplan: 'Financial Action Plan', operatingcosts: 'Operating Costs'
    };
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HEADERLESS WIDGET TYPES
     * Defines headerless Widget Types for the surrounding section.
     * ------------------------------------------------------------------- */
    const headerlessWidgetTypes = new Set(['clock', 'weather', 'music', 'photos']);

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SYNC WIDGET WINDOW HEADER
     * Implementation of sync Widget Window Header. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function syncWidgetWindowHeader(widget, type) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: EXPLICIT TITLE
       * Defines explicit Title for the surrounding section.
       * ------------------------------------------------------------------- */
      const explicitTitle = localStorage.getItem(`hub-widget-setting-${widget.id}-title`);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FALLBACK
       * Defines fallback for the surrounding section.
       * ------------------------------------------------------------------- */
      const fallback = widgetTypeLabels[type] || widget._defaultWidgetLabel || 'Widget Window';
      widget._setWindowTitle?.(explicitTitle || fallback, false);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: HEADER PREFERENCE
       * Defines header Preference for the surrounding section.
       * ------------------------------------------------------------------- */
      const headerPreference = localStorage.getItem(`hub-widget-setting-${widget.id}-show-header`);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GLOBAL PREFERENCE
       * Defines global Preference for the surrounding section.
       * ------------------------------------------------------------------- */
      const globalPreference = localStorage.getItem('hub-all-widget-headers');
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SHOW HEADER
       * Defines show Header for the surrounding section.
       * ------------------------------------------------------------------- */
      const showHeader = headerPreference === null
        ? (globalPreference === null ? !headerlessWidgetTypes.has(type) : globalPreference !== 'false')
        : headerPreference !== 'false';
      widget._setHeaderVisible?.(showHeader, false);
    }
