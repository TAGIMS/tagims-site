/* HUB GUIDE =================================================================
 * FILE: src/layout.js
 * Canonical widget sizes, automatic packing, responsive presentation, and saved layout management.
 * Navigation: search for FUNCTION, METHOD, EVENT BINDING, or STATE / REFERENCES.
 * =========================================================================== */
    /* HUB 14.4.16 — canonical widget contracts and geometry.
       One canonical state owner, one shared ResizeObserver, transient pressure
       geometry only. Defaults apply to new widgets; saved pixels retain identity.
       Renderer preparation is implemented below. Final Edge review is pending. */

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HUB CANONICAL SIZING
     * Defines Hub Canonical Sizing for the surrounding section.
     * ------------------------------------------------------------------- */
    const HubCanonicalSizing = (() => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: REVISION
       * Defines revision for the surrounding section.
       * ------------------------------------------------------------------- */
      const revision = '15.0-responsive';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SCHEMA VERSION
       * Defines schema Version for the surrounding section.
       * ------------------------------------------------------------------- */
      const schemaVersion = 1;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GRID
       * Defines grid for the surrounding section.
       * ------------------------------------------------------------------- */
      const grid = Object.freeze({ module: 200, gap: 20 });
      // Full is 4 x 4 modules; Half-Full is 4 x 2. The central gap accounts
      // for the difference between Half-Full height and exactly half of Full.
      // Presets derive from the 200px icon; manual resizing retains a smaller safety minimum.
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FOOTPRINTS
       * Defines footprints for the surrounding section.
       * ------------------------------------------------------------------- */
      const footprints = Object.freeze({
        icon: Object.freeze({ label: 'Icon', columns: 1, rows: 1 }),
        'sub-compact': Object.freeze({ label: 'Sub-Compact', columns: 2, rows: 1 }),
        compact: Object.freeze({ label: 'Compact', columns: 2, rows: 2 }),
        mobile: Object.freeze({ label: 'Mobile', columns: 2, rows: 3 }),
        wide: Object.freeze({ label: 'Three-column', columns: 3, rows: 3 }),
        'half-full': Object.freeze({ label: 'Half-Full', columns: 4, rows: 2 }),
        full: Object.freeze({ label: 'Full', columns: 4, rows: 4 })
      });
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STATES
       * Defines states for the surrounding section.
       * ------------------------------------------------------------------- */
      const states = Object.freeze(Object.keys(footprints));
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: OWNS
       * Defines owns for the surrounding section.
       * ------------------------------------------------------------------- */
      const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: GEOMETRY
       * Implementation of geometry. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function geometry(state, dimensions = grid) {
        if (!owns(footprints, state) || !dimensions) return null;
        const { module, gap } = dimensions;
        if (!Number.isFinite(module) || module <= 0 || !Number.isFinite(gap) || gap < 0) return null;
        const { columns, rows } = footprints[state];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDTH
         * Defines width for the surrounding section.
         * ------------------------------------------------------------------- */
        const width = columns * module + (columns - 1) * gap;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HEIGHT
         * Defines height for the surrounding section.
         * ------------------------------------------------------------------- */
        const height = rows * module + (rows - 1) * gap;
        if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
        return Object.freeze({ width, height });
      }

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SIZES
       * Defines sizes for the surrounding section.
       * ------------------------------------------------------------------- */
      const sizes = Object.freeze(Object.fromEntries(states.map(state => [state,
        Object.freeze({ ...footprints[state], ...geometry(state) })
      ])));

      // Each row: opening default, ordered supported states, decision status.
      // States in this table are a preparation contract, NOT proof that the
      // previous renderer supported them. preparedStates records implemented presentations, not browser certification.
      // Ordered states are not a monotonic width/height scale: Mobile is taller
      // and narrower than Half-Full. A future packer must evaluate both axes.
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: DEFINITIONS
       * Defines definitions for the surrounding section.
       * ------------------------------------------------------------------- */
      const definitions = {
        ...Object.fromEntries(Object.keys(window.OpsWidgets.labels).map(type=>[type,['mobile',['compact','mobile','wide','half-full','full'],'confirmed']])),
        financialdashboard: ['full', ['compact','mobile','half-full','full'], 'confirmed'],
        clock: ['icon', ['icon','sub-compact','compact'], 'confirmed'],
        weather: ['half-full', ['icon','sub-compact','compact','mobile','wide','half-full','full'], 'confirmed'],
        calendar: ['icon', ['icon','sub-compact','compact','mobile','wide','half-full','full'], 'confirmed'],
        performance: ['half-full', ['icon','sub-compact','compact','half-full','full'], 'confirmed'],
        solar: ['sub-compact', ['icon','sub-compact','compact'], 'confirmed'],
        moon: ['sub-compact', ['icon','sub-compact','compact'], 'confirmed'],
        radar: ['sub-compact', ['sub-compact','compact','mobile','wide','half-full','full'], 'confirmed'],
        drive: ['compact', ['sub-compact','compact','mobile','wide','half-full','full'], 'confirmed'],
        photos: ['compact', ['sub-compact','compact','mobile','wide','half-full'], 'confirmed'],
        todo: ['mobile', ['sub-compact','compact','mobile','wide','half-full','full'], 'confirmed'],
        reminders: ['mobile', ['sub-compact','compact','mobile','wide','half-full','full'], 'confirmed'],
        notes: ['mobile', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        gmail: ['mobile', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        projects: ['mobile', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        billcenter: ['full', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        cashflow: ['full', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        financialoverview: ['half-full', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        payroll: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        latebills: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        equipment: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        insurance: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        creditaccounts: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        financialactionplan: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        operations: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        operatingcosts: ['compact', ['compact','mobile','wide','half-full','full'], 'confirmed'],
        financial: ['compact', ['compact','mobile','wide','half-full','full'], 'proposed'],
        music: ['sub-compact', ['sub-compact','compact','mobile'], 'proposed'],
        youtube: ['sub-compact', ['sub-compact','compact','mobile','wide','half-full','full'], 'proposed'],
        analytics: ['compact', ['compact','mobile','wide','half-full','full'], 'proposed'],
        system: ['compact', ['icon','sub-compact','compact','half-full','full'], 'proposed'],
        launcher: ['compact', ['icon','sub-compact','compact','mobile'], 'proposed'],
        links: ['compact', ['icon','sub-compact','compact','mobile'], 'proposed'],
        tagim: ['mobile', ['compact','mobile','wide','half-full','full'], 'proposed']
      };

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: MAKE CONTRACT
       * Implementation of make Contract. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function makeContract(type, definition) {
        const [defaultState, allowed, defaultStatus] = definition;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: OPENING INDEX
         * Defines opening Index for the surrounding section.
         * ------------------------------------------------------------------- */
        const openingIndex = allowed.indexOf(defaultState);
        return Object.freeze({
          type, defaultState, defaultStatus,
          minimumState: allowed[0] || null,
          allowedStates: Object.freeze([...allowed]),
          shrinkSequence: Object.freeze(allowed.slice(0, openingIndex + 1).reverse()),
          expansionSequence: Object.freeze(allowed.slice(openingIndex)),
          // Restoring space walks back toward durable user intent, not always
          // toward the opening default or the largest supported footprint.
          growthOrder: Object.freeze([...allowed]),
          shrinkOrder: Object.freeze([...allowed].reverse()),
          preparedStates: Object.freeze([...allowed]),
          validation: 'Code checked; final Edge visual review pending',
          autoShrinkEnabled: true
        });
      }

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CONTRACTS
       * Defines contracts for the surrounding section.
       * ------------------------------------------------------------------- */
      const contracts = Object.freeze(Object.fromEntries(Object.entries(definitions)
        .map(([type, definition]) => [type, makeContract(type, definition)])));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: UNKNOWN CONTRACT
       * Defines unknown Contract for the surrounding section.
       * ------------------------------------------------------------------- */
      const unknownContract = makeContract('empty', [null, [], 'unassigned']);
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: CONTRACT
       * Implementation of contract. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function contract(widgetOrType) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TYPE
         * Defines type for the surrounding section.
         * ------------------------------------------------------------------- */
        const type = typeof widgetOrType === 'string' ? widgetOrType : widgetOrType?.dataset?.contentType;
        return owns(contracts, type) ? contracts[type] : unknownContract;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: MATCH FOOTPRINT
       * Implementation of match Footprint. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function matchFootprint(width, height, tolerance = 1) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0 ||
            !Number.isFinite(tolerance) || tolerance < 0 || tolerance > 2) return null;
        return states.find(state => Math.abs(width - sizes[state].width) <= tolerance &&
          Math.abs(height - sizes[state].height) <= tolerance) || null;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: CAN AUTO SHRINK
       * Implementation of can Auto Shrink. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function canAutoShrink(widgetOrType, state) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SPEC
         * Defines spec for the surrounding section.
         * ------------------------------------------------------------------- */
        const spec = contract(widgetOrType);
        return spec.autoShrinkEnabled && spec.allowedStates.includes(state) && spec.preparedStates.includes(state);
      }

      // Read-only import compatibility for older vocabulary. The active engine
      // uses stateForGeometry(); this helper never drives presentation.
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: LEGACY STATE FOR GEOMETRY
       * Implementation of legacy State For Geometry. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function legacyStateForGeometry(width, height) {
        if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) return null;
        return width >= 520 && height >= 300 ? 'desktop' : width >= 340 && height >= 220 ? 'mobile' : width >= 220 && height >= 140 ? 'compact' : 'icon';
      }

      // Developer-only, on-demand inspection: no DOM writes or persistence.
      // The distinction prevents a CSS transform from being mistaken for a
      // smaller layout box during the later responsive engine migration.
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: INSPECT
       * Implementation of inspect. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function inspect(widget) {
        if (!widget?.isConnected || !widget.classList?.contains('widget')) return null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LAYOUT
         * Defines layout for the surrounding section.
         * ------------------------------------------------------------------- */
        const layout = { width: widget.offsetWidth, height: widget.offsetHeight };
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RECT
         * Defines rect for the surrounding section.
         * ------------------------------------------------------------------- */
        const rect = widget.getBoundingClientRect();
        return {
          revision, phase: 'canonical', type: widget.dataset.contentType || 'empty',
          contract: contract(widget),
          durable: durableWidgetGeometry(widget),
          layout,
          presented: { width: rect.width, height: rect.height },
          footprint: widget.hidden ? null : matchFootprint(layout.width, layout.height),
          legacyState: widget.dataset.responsiveState || null,
          layoutPolicy: activeHubLayoutPolicy,
          activeStateOwner: 'canonical'
        };
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: STATE FOR GEOMETRY
       * Chooses a supported presentation state from the widget dimensions with shrink hysteresis.
       * ------------------------------------------------------------------- */
      function stateForGeometry(width, height, widgetOrType, previous = null) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SPEC
         * Defines spec for the surrounding section.
         * ------------------------------------------------------------------- */
        const spec = contract(widgetOrType);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ALLOWED
         * Defines allowed for the surrounding section.
         * ------------------------------------------------------------------- */
        const allowed = spec.allowedStates.length ? spec.allowedStates : states;
        if (!Number.isFinite(width) || !Number.isFinite(height)) return spec.minimumState || 'icon';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: FITTING
         * Defines fitting for the surrounding section.
         * ------------------------------------------------------------------- */
        const fitting = allowed.filter(state => state !== 'wide').filter(state => sizes[state].width <= width + 2 && sizes[state].height <= height + 2)
          .sort((a,b) => sizes[b].width * sizes[b].height - sizes[a].width * sizes[a].height);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NEXT
         * Defines next for the surrounding section.
         * ------------------------------------------------------------------- */
        const next = fitting[0] || spec.minimumState || 'icon';
        if (previous && allowed.includes(previous) && next !== previous) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: CURRENT, TARGET
           * Defines current, target for the surrounding section.
           * ------------------------------------------------------------------- */
          const current = sizes[previous], target = sizes[next];
          if (target.width * target.height < current.width * current.height &&
              width >= current.width - 18 && height >= current.height - 14) return previous;
          // Growth must recover as soon as a supported footprint fits. Requiring
          // extra space on both axes permanently trapped one-axis resize gestures.
        }
        return next;
      }

      return Object.freeze({ revision, schemaVersion, phase: 'canonical',
        grid, states, sizes, contracts, contract, geometry, matchFootprint,
        canAutoShrink, legacyStateForGeometry, stateForGeometry, inspect });
    })();


    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: RESPONSIVE STATES
     * Defines RESPONSIVE STATES for the surrounding section.
     * ------------------------------------------------------------------- */
    const RESPONSIVE_STATES = HubCanonicalSizing.states;

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET ICON MIN
     * Defines WIDGET ICON MIN for the surrounding section.
     * ------------------------------------------------------------------- */
    const WIDGET_ICON_MIN = Object.freeze({ width: 168, height: 112 });
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET MIN SIZE
     * Defines WIDGET MIN SIZE for the surrounding section.
     * ------------------------------------------------------------------- */
    const WIDGET_MIN_SIZE = WIDGET_ICON_MIN;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DETECT LAYOUT PROFILE
     * Implementation of detect Layout Profile. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function detectLayoutProfile(width = innerWidth, height = innerHeight) {
      if (width < 420 || height < 360) return 'icon';
      if (width < 680 || height < 500) return 'compact';
      if (width < 760) return 'mobile';
      return 'desktop';
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE LAYOUT PROFILE
     * Defines active Layout Profile for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeLayoutProfile = 'desktop'; // Durable geometry profile remains stable; presentation state is derived.
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE VIEWPORT PROFILE
     * Defines active Viewport Profile for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeViewportProfile = detectLayoutProfile();
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE LAYOUT MODE
     * Defines active Layout Mode for the surrounding section.
     * ------------------------------------------------------------------- */
    // Layout assistance, snapping, and visible guides have independent ownership.
    let activeLayoutMode = localStorage.getItem('hub-arrangement-mode') || (matchMedia('(pointer: coarse)').matches && innerWidth < 760 ? 'responsive' : 'freeform');
    let snapToGridEnabled = localStorage.getItem('hub-snap-to-grid') !== 'false';
    let guidelinesEnabled = localStorage.getItem('hub-guidelines') !== 'false';
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE PROFILE VIEWPORT
     * Defines active Profile Viewport for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeProfileViewport = { width: innerWidth, height: innerHeight };
    localStorage.setItem(`hub-responsive-seed-v2-${activeLayoutProfile}`, 'trusted');
    document.body.dataset.hubViewportProfile = activeViewportProfile;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HUB MODE BREAKPOINTS
     * Defines HUB MODE BREAKPOINTS for the surrounding section.
     * ------------------------------------------------------------------- */
    const HUB_MODE_BREAKPOINTS = Object.freeze({ mobileMax: 639, tabletMax: 759, hysteresis: 24 });
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HUB COLLISION RULES
     * Defines HUB COLLISION RULES for the surrounding section.
     * ------------------------------------------------------------------- */
    const HUB_COLLISION_RULES = Object.freeze({ edgeTolerance: 8, gapFloor: 8, overlapTolerance: 1, recoveryBuffer: 48, desktopMargin: 12 });
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HUB DESKTOP COMPRESSION
     * Defines HUB DESKTOP COMPRESSION for the surrounding section.
     * ------------------------------------------------------------------- */
    const HUB_DESKTOP_COMPRESSION = Object.freeze({ minimumScale: .9, fullScaleEpsilon: .008 });
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: RAW HUB MODE
     * Implementation of raw Hub Mode. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function rawHubMode(width = innerWidth) { return activeLayoutMode === 'responsive' && width <= HUB_MODE_BREAKPOINTS.mobileMax ? 'mobile' : 'desktop'; }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: STABLE HUB MODE
     * Implementation of stable Hub Mode. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function stableHubMode(current, width = innerWidth) { return rawHubMode(width); }
    let activeHubMode = rawHubMode();
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE HUB LAYOUT POLICY
     * Defines active Hub Layout Policy for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeHubLayoutPolicy = 'freeform';
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: RESPONSIVE FLOW REASON
     * Defines responsive Flow Reason for the surrounding section.
     * ------------------------------------------------------------------- */
    let responsiveFlowReason = 'none';
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: RESPONSIVE FLOW ORDER
     * Defines responsive Flow Order for the surrounding section.
     * ------------------------------------------------------------------- */
    let responsiveFlowOrder = [];
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PENDING HUB LAYOUT EVALUATION
     * Defines pending Hub Layout Evaluation for the surrounding section.
     * ------------------------------------------------------------------- */
    let pendingHubLayoutEvaluation = false;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: LAST DESKTOP AUTHORING VIEWPORT
     * Defines last Desktop Authoring Viewport for the surrounding section.
     * ------------------------------------------------------------------- */
    let lastDesktopAuthoringViewport = { width: Math.max(document.documentElement.clientWidth || innerWidth, 1280), height: innerHeight };
    document.body.dataset.hubMode = activeHubMode;
    document.body.dataset.hubLayout = activeHubLayoutPolicy;
    document.body.dataset.hubFlowReason = responsiveFlowReason;

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: FLOW PRESENTATION STATES
     * Defines FLOW PRESENTATION STATES for the surrounding section.
     * ------------------------------------------------------------------- */
    const FLOW_PRESENTATION_STATES = HubCanonicalSizing.states;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: RESPONSIVE CAPABILITY DEFAULTS
     * Defines RESPONSIVE CAPABILITY DEFAULTS for the surrounding section.
     * ------------------------------------------------------------------- */
    const RESPONSIVE_CAPABILITY_DEFAULTS = Object.freeze({ canonical: HubCanonicalSizing.contract(null) });
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET RESPONSIVE CONTRACT
     * Defines widget Responsive Contract for the surrounding section.
     * ------------------------------------------------------------------- */
    const widgetResponsiveContract = Object.freeze(Object.fromEntries(Object.entries(HubCanonicalSizing.contracts)
      .map(([type,canonical])=>[type,Object.freeze({canonical})])));

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: WIDGET RESPONSIVE CAPABILITY
     * Implementation of widget Responsive Capability. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function widgetResponsiveCapability(widgetOrType) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TYPE
       * Defines type for the surrounding section.
       * ------------------------------------------------------------------- */
      const type = typeof widgetOrType === 'string' ? widgetOrType : widgetOrType?.dataset?.contentType;
      return type && widgetResponsiveContract[type] ? widgetResponsiveContract[type] : RESPONSIVE_CAPABILITY_DEFAULTS;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: WIDGET ICON MINIMUM
     * Implementation of widget Icon Minimum. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function widgetIconMinimum(widgetOrType) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TYPE
       * Defines type for the surrounding section.
       * ------------------------------------------------------------------- */
      const type = typeof widgetOrType === 'string' ? widgetOrType : widgetOrType?.dataset?.contentType;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CUSTOM
       * Defines custom for the surrounding section.
       * ------------------------------------------------------------------- */
      const custom = type ? widgetResponsiveContract[type]?.iconMin : null;
      return custom || WIDGET_ICON_MIN;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET CATALOG CATEGORY BY TYPE
     * Defines widget Catalog Category By Type for the surrounding section.
     * ------------------------------------------------------------------- */
    const widgetCatalogCategoryByType = Object.freeze({
      weather:'Weather', solar:'Weather', moon:'Weather', radar:'Weather',
      financialdashboard:'Financial', financeaccounts:'Financial', checkallocator:'Financial', financesandbox:'Financial', equipment:'Financial', operatingcosts:'Financial', cashflow:'Financial', billcenter:'Financial', payroll:'Financial', financial:'Financial', financialoverview:'Financial', financialactionplan:'Financial', creditaccounts:'Financial', latebills:'Financial', insurance:'Financial',
      todo:'Productivity', notes:'Productivity', reminders:'Productivity', calendar:'Productivity', projects:'Productivity', drive:'Productivity', gmail:'Productivity',
      performance:'System', system:'System', analytics:'System', tagim:'System',
      operations:'Operations', operatingcosts:'Operations', equipment:'Operations',
      music:'Media', youtube:'Media', photos:'Media',
      clock:'Utilities', launcher:'Utilities', links:'Utilities'
    });

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET DEFAULT SIZE CONTRACT
     * Defines widget Default Size Contract for the surrounding section.
     * ------------------------------------------------------------------- */
    const widgetDefaultSizeContract = Object.freeze({
      default: Object.freeze({width:460,height:280}),
      ...Object.fromEntries(Object.entries(HubCanonicalSizing.contracts)
        .map(([type,contract])=>[type,HubCanonicalSizing.geometry(contract.defaultState)]))
    });

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: WIDGET CATALOG REGISTRY
     * Defines widget Catalog Registry for the surrounding section.
     * ------------------------------------------------------------------- */
    const widgetCatalogRegistry = Object.freeze(
      [...document.querySelectorAll('.add-widgets-section .widget-library-item[data-content-type]')].map(source => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TYPE
         * Defines type for the surrounding section.
         * ------------------------------------------------------------------- */
        const type = source.dataset.contentType;
        return Object.freeze({
          type,
          label: source.querySelector('span')?.textContent?.trim() || type,
          icon: source.querySelector('svg')?.outerHTML || '',
          category: widgetCatalogCategoryByType[type] || 'Utilities',
          defaultSize: Object.freeze({ ...(widgetDefaultSizeContract[type] || widgetDefaultSizeContract.default) }),
          canonical: widgetResponsiveCapability(type).canonical
        });
      })
    );

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: PREFERRED WIDGET GEOMETRY
     * Implementation of preferred Widget Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function preferredWidgetGeometry(type) {
      if(type==='financialdashboard')return {width:Math.min(1100,innerWidth-70),height:Math.max(500,innerHeight-100)};
      if (type === 'performance') return {width:660,height:510};
      if (type === 'weather') return {width:900,height:720};
      if (type === 'financialoverview' || type === 'financial') return {width:960,height:650};
      if (['checkallocator','cashflow','financesandbox','financeaccounts','projects'].includes(type)) return {width:640,height:500};
      if (['billcenter','payroll','equipment','insurance','creditaccounts','operatingcosts','latebills','financialactionplan'].includes(type)) return {width:520,height:430};
      return {...(widgetDefaultSizeContract[type] || widgetDefaultSizeContract.default)};
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: PREFERRED DESKTOP WIDGET GEOMETRY
     * Implementation of preferred Desktop Widget Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function preferredDesktopWidgetGeometry(type) { return preferredWidgetGeometry(type); }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: RESPONSIVE STATE FOR
     * Implementation of responsive State For. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function responsiveStateFor(widget,width,height) {
      if (!widget.classList.contains('focused') && isResponsiveFlowActive() && FLOW_PRESENTATION_STATES.includes(widget.dataset.flowState)) return widget.dataset.flowState;
      return HubCanonicalSizing.stateForGeometry(width,height,widget,widget.dataset.responsiveState);
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DURABLE WIDGET GEOMETRY
     * Reads the stored authoring geometry rather than temporary responsive presentation.
     * ------------------------------------------------------------------- */
    function durableWidgetGeometry(widget) {
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: NUMBER
       * Defines number for the surrounding section.
       * ------------------------------------------------------------------- */
      const number = (name, fallback = 0) => Number.parseFloat(widget.style.getPropertyValue(name)) || fallback;
      return {
        x: number('--widget-x'), y: number('--widget-y'),
        width: Math.max(widgetIconMinimum(widget).width, number('--widget-width', widgetDefaultSizeContract.default.width)),
        height: Math.max(widgetIconMinimum(widget).height, number('--widget-height', widgetDefaultSizeContract.default.height))
      };
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DURABLE WIDGET RECT
     * Implementation of durable Widget Rect. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function durableWidgetRect(widget, geometry = durableWidgetGeometry(widget)) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LEFT
       * Defines left for the surrounding section.
       * ------------------------------------------------------------------- */
      const left = innerWidth / 2 - scrollX + geometry.x - geometry.width / 2;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TOP
       * Defines top for the surrounding section.
       * ------------------------------------------------------------------- */
      const top = innerHeight / 2 - scrollY + geometry.y - geometry.height / 2;
      return { ...geometry, left, top, right: left + geometry.width, bottom: top + geometry.height };
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: IS RESPONSIVE FLOW ACTIVE
     * Implementation of is Responsive Flow Active. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function isResponsiveFlowActive() { return activeHubLayoutPolicy === 'flow'; }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: IS DESKTOP FREEFORM
     * Implementation of is Desktop Freeform. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function isDesktopFreeform() { return activeHubLayoutPolicy === 'freeform'; }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: RESPONSIVE FLOW WIDGETS
     * Implementation of responsive Flow Widgets. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function responsiveFlowWidgets() {
      return currentWidgets().filter(widget => !widget.hidden && !widget.classList.contains('focused'));
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: FLOW METRICS
     * Implementation of flow Metrics. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function flowMetrics(){
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STYLE
       * Defines style for the surrounding section.
       * ------------------------------------------------------------------- */
      const style=getComputedStyle(document.body);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAP
       * Defines gap for the surrounding section.
       * ------------------------------------------------------------------- */
      const gap=parseFloat(style.columnGap)||12;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LEFT, RIGHT
       * Defines left, right for the surrounding section.
       * ------------------------------------------------------------------- */
      const left=parseFloat(style.paddingLeft)||gap,right=parseFloat(style.paddingRight)||gap;
      return {width:Math.max(1,(document.documentElement.clientWidth||innerWidth)-left-right),gap};
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: FLOW COLUMN COUNT
     * Implementation of flow Column Count. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function flowColumnCount(){
      const {width,gap}=flowMetrics();
      return Math.max(1,Math.min(4,Math.floor((width+gap)/(Math.min(168,HubCanonicalSizing.grid.module)+gap))));
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: BUILD RESPONSIVE PACKING PLAN
     * Selects responsive footprints and fills rows while keeping saved desktop geometry separate.
     * ------------------------------------------------------------------- */
    function buildResponsivePackingPlan(widgets,columns){
      const {width:usable,gap}=flowMetrics();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PLANS
       * Defines plans for the surrounding section.
       * ------------------------------------------------------------------- */
      const plans=widgets.map(widget=>{
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CONTRACT, G
         * Defines contract, g for the surrounding section.
         * ------------------------------------------------------------------- */
        const contract=HubCanonicalSizing.contract(widget),g=durableWidgetGeometry(widget);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ELIGIBLE
         * Defines eligible for the surrounding section.
         * ------------------------------------------------------------------- */
        const eligible=contract.allowedStates.map(state=>({state,...HubCanonicalSizing.sizes[state]}))
          .filter(size=>size.width<=usable+1&&size.width*size.height<=g.width*g.height+1)
          .sort((a,b)=>b.width*b.height-a.width*a.height);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STATE
         * Defines state for the surrounding section.
         * ------------------------------------------------------------------- */
        const state=eligible[0]?.state||contract.minimumState||'compact';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SIZE
         * Defines size for the surrounding section.
         * ------------------------------------------------------------------- */
        const size=HubCanonicalSizing.sizes[state];
        return {widget,state,span:Math.min(columns,size.columns),height:size.height,promotion:'none'};
      });
      // Justify each row without changing widget order or saved desktop sizes.
      // Icon is a presentation state, not a fixed 168px cap in a fluid column.
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: COLUMN WIDTH
       * Defines column Width for the surrounding section.
       * ------------------------------------------------------------------- */
      const columnWidth=(usable-gap*(columns-1))/columns;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ROW, USED
       * Defines row, used for the surrounding section.
       * ------------------------------------------------------------------- */
      let row=[],used=0;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: FINISH ROW
       * Defines finish Row for the surrounding section.
       * ------------------------------------------------------------------- */
      const finishRow=()=>{
        if(!row.length)return;
        while(used<columns){
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SMALLEST
           * Defines smallest for the surrounding section.
           * ------------------------------------------------------------------- */
          const smallest=row.reduce((a,b)=>a.span<=b.span?a:b);
          smallest.span++;used++;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HEIGHT
         * Defines height for the surrounding section.
         * ------------------------------------------------------------------- */
        const height=Math.max(...row.map(plan=>plan.state==='icon'
          ? Math.min(HubCanonicalSizing.grid.module,columnWidth*plan.span+gap*(plan.span-1)) : plan.height));
        row.forEach(plan=>{plan.height=height;});
        row=[];used=0;
      };
      plans.forEach(plan=>{
        if(used+plan.span>columns)finishRow();
        row.push(plan);used+=plan.span;
        if(used===columns)finishRow();
      });
      finishRow();
      return plans;
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DERIVE RESPONSIVE FLOW ORDER
     * Implementation of derive Responsive Flow Order. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function deriveResponsiveFlowOrder() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ENTRIES
       * Defines entries for the surrounding section.
       * ------------------------------------------------------------------- */
      const entries = currentWidgets().filter(widget => !widget.hidden).map(widget => ({ widget, g: durableWidgetGeometry(widget) }));
      entries.sort((a, b) => a.g.y - b.g.y || a.g.x - b.g.x || a.g.width - b.g.width || a.g.height - b.g.height || a.widget.id.localeCompare(b.widget.id, undefined, { numeric: true }));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ROWS
       * Defines rows for the surrounding section.
       * ------------------------------------------------------------------- */
      const rows = [];
      entries.forEach(entry => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LAST
         * Defines last for the surrounding section.
         * ------------------------------------------------------------------- */
        const last = rows.at(-1);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TOLERANCE
         * Defines tolerance for the surrounding section.
         * ------------------------------------------------------------------- */
        const tolerance = Math.max(48, Math.min(entry.g.height, last?.height || entry.g.height) * 0.28);
        if (!last || Math.abs(entry.g.y - last.anchorY) > tolerance) rows.push({ anchorY: entry.g.y, height: entry.g.height, items: [entry] });
        else {
          last.items.push(entry);
          last.anchorY = last.items.reduce((sum, item) => sum + item.g.y, 0) / last.items.length;
          last.height = Math.max(last.height, entry.g.height);
        }
      });
      return rows.flatMap(row => row.items.sort((a, b) => a.g.x - b.g.x || a.g.y - b.g.y || a.g.width - b.g.width || a.g.height - b.g.height || a.widget.id.localeCompare(b.widget.id, undefined, { numeric: true })).map(entry => entry.widget.id));
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DESKTOP INTENT RECT
     * Implementation of desktop Intent Rect. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function desktopIntentRect(widget, viewportWidth, viewportHeight) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: G
       * Defines g for the surrounding section.
       * ------------------------------------------------------------------- */
      const g = durableWidgetGeometry(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LEFT
       * Defines left for the surrounding section.
       * ------------------------------------------------------------------- */
      const left = viewportWidth / 2 + g.x - g.width / 2;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TOP
       * Defines top for the surrounding section.
       * ------------------------------------------------------------------- */
      const top = viewportHeight / 2 + g.y - g.height / 2;
      return { ...g, left, top, right: left + g.width, bottom: top + g.height };
    }

    /* HUB 14.4.16 — pure, bounded layout pressure planner.
       No DOM, storage, timers, or random choices. The runtime owns measurement
       and commits only temporary presentation variables. Every call begins with
       durable user geometry; no cumulative shrink or drift on repeated resizes. */
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HUB PRESSURE PLANNER
     * Defines Hub Pressure Planner for the surrounding section.
     * ------------------------------------------------------------------- */
    const HubPressurePlanner = (() => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: EPS
       * Defines EPS for the surrounding section.
       * ------------------------------------------------------------------- */
      const EPS = .5;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: OVERLAP
       * Defines overlap for the surrounding section.
       * ------------------------------------------------------------------- */
      const overlap = (a,b,gap=0) => a.left < b.left+b.width+gap-EPS && a.left+a.width+gap > b.left+EPS &&
        a.top < b.top+b.height+gap-EPS && a.top+a.height+gap > b.top+EPS;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: CONTAINS
       * Defines contains for the surrounding section.
       * ------------------------------------------------------------------- */
      const contains = (a,b) => b.left >= a.left-EPS && b.top >= a.top-EPS &&
        b.left+b.width <= a.left+a.width+EPS && b.top+b.height <= a.top+a.height+EPS;
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: CLAMP
       * Defines clamp for the surrounding section.
       * ------------------------------------------------------------------- */
      const clamp = (n,min,max) => Math.max(min,Math.min(max,n));
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: AREA
       * Defines area for the surrounding section.
       * ------------------------------------------------------------------- */
      const area = r => r.width*r.height;

      // Maximal empty rectangles keep work bounded. A legal slot is scored by
      // movement from the authored position, then by wasted room, then top/left.
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: PACK
       * Implementation of pack. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function pack(items,width,height,gap,preserve=true) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: FREE
         * Defines free for the surrounding section.
         * ------------------------------------------------------------------- */
        let free=[{left:0,top:0,width:width+gap,height:height+gap}];
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PLACED
         * Defines placed for the surrounding section.
         * ------------------------------------------------------------------- */
        const placed=new Map();
        /* HUB GUIDE ---------------------------------------------------------
         * FUNCTION: OCCUPY
         * Implementation of occupy. Calls and local helpers below belong to this operation.
         * ------------------------------------------------------------------- */
        function occupy(box){
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: USED
           * Defines used for the surrounding section.
           * ------------------------------------------------------------------- */
          const used={...box,width:box.width+gap,height:box.height+gap};
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: NEXT
           * Defines next for the surrounding section.
           * ------------------------------------------------------------------- */
          const next=[];
          for(const slot of free){
            if(!overlap(slot,used)){next.push(slot);continue;}
            if(used.left>slot.left+EPS)next.push({...slot,width:used.left-slot.left});
            if(used.left+used.width<slot.left+slot.width-EPS)next.push({...slot,left:used.left+used.width,width:slot.left+slot.width-used.left-used.width});
            if(used.top>slot.top+EPS)next.push({...slot,height:used.top-slot.top});
            if(used.top+used.height<slot.top+slot.height-EPS)next.push({...slot,top:used.top+used.height,height:slot.top+slot.height-used.top-used.height});
          }
          free=next.filter((r,i)=>r.width>EPS&&r.height>EPS&&!next.some((o,j)=>i!==j&&contains(o,r)&&(!contains(r,o)||j<i)));
        }
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: FITS
         * Defines fits for the surrounding section.
         * ------------------------------------------------------------------- */
        const fits=box=>box.left>=-EPS&&box.top>=-EPS&&box.left+box.width<=width+EPS&&box.top+box.height<=height+EPS;
        if(preserve){
          for(const item of items){
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: BOX
             * Defines box for the surrounding section.
             * ------------------------------------------------------------------- */
            const box={...item,left:item.preferredLeft,top:item.preferredTop};
            if(fits(box)&&[...placed.values()].every(p=>!overlap(p,box,gap))){placed.set(item.id,box);occupy(box);}
          }
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PENDING
         * Defines pending for the surrounding section.
         * ------------------------------------------------------------------- */
        const pending=items.filter(i=>!placed.has(i.id)).sort((a,b)=>area(b)-area(a)||a.order-b.order);
        for(const item of pending){
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: BEST
           * Defines best for the surrounding section.
           * ------------------------------------------------------------------- */
          let best=null;
          for(const slot of free){
            if(item.width+gap>slot.width+EPS||item.height+gap>slot.height+EPS)continue;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: LEFT
             * Defines left for the surrounding section.
             * ------------------------------------------------------------------- */
            const left=preserve?clamp(item.preferredLeft,slot.left,slot.left+slot.width-item.width-gap):slot.left;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: TOP
             * Defines top for the surrounding section.
             * ------------------------------------------------------------------- */
            const top=preserve?clamp(item.preferredTop,slot.top,slot.top+slot.height-item.height-gap):slot.top;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: DISTANCE
             * Defines distance for the surrounding section.
             * ------------------------------------------------------------------- */
            const distance=Math.abs(left-item.preferredLeft)+Math.abs(top-item.preferredTop);
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: SCORE
             * Defines score for the surrounding section.
             * ------------------------------------------------------------------- */
            const score=distance+(slot.width*slot.height-area(item))*.00001;
            if(!best||score<best.score-EPS||(Math.abs(score-best.score)<EPS&&(top<best.top||top===best.top&&left<best.left)))best={...item,left,top,score};
          }
          if(!best)return null;
          placed.set(item.id,best);occupy(best);
        }
        return placed;
      }
      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: ATTEMPT
       * Implementation of attempt. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function attempt(items,width,height,gap){return pack(items,width,height,gap,true)||pack(items,width,height,gap,false);}

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: PLAN
       * Implementation of plan. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function plan(input,options){
        const {width,height,margin=12,gap=20,minGap=8,minScale=.9,allowOverlap=false}=options;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PACKING GAPS
         * Defines packing Gaps for the surrounding section.
         * ------------------------------------------------------------------- */
        const packingGaps = [...new Set([gap, Math.max(minGap, gap * .75), Math.min(gap, minGap)])];
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: FIT AT GAPS
         * Defines fit At Gaps for the surrounding section.
         * ------------------------------------------------------------------- */
        const fitAtGaps = (items, width, height, scale=1) => {
          for (const spacing of packingGaps) {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: PACKED
             * Defines packed for the surrounding section.
             * ------------------------------------------------------------------- */
            const packed = attempt(items, width, height, spacing / scale);
            if (packed) return packed;
          }
          return null;
        };
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: USABLE W, USABLE H
         * Defines usable W, usable H for the surrounding section.
         * ------------------------------------------------------------------- */
        const usableW=Math.max(1,width-margin*2),usableH=Math.max(1,height-margin*2);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ITEMS
         * Defines items for the surrounding section.
         * ------------------------------------------------------------------- */
        const items=input.map((r,order)=>({...r,order,width:r.width,height:r.height,
          preferredLeft:r.x+width/2-r.width/2-margin,preferredTop:r.y+height/2-r.height/2-margin,state:null}));
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: RESULT
         * Defines result for the surrounding section.
         * ------------------------------------------------------------------- */
        const result=(packed,stage,scale=1)=>({viable:true,stage,scale,canvasHeight:height,
          rects:new Map([...packed].map(([id,r])=>[id,{...r,layoutWidth:r.width,layoutHeight:r.height,
            left:margin+r.left*scale,top:margin+r.top*scale,width:r.width*scale,height:r.height*scale}]))});
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NATIVE
         * Defines native for the surrounding section.
         * ------------------------------------------------------------------- */
        const native=items.map(i=>({...i,left:i.preferredLeft,top:i.preferredTop}));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: INSIDE
         * Defines inside for the surrounding section.
         * ------------------------------------------------------------------- */
        const inside=native.every(r=>r.left>=-EPS&&r.top>=-EPS&&r.left+r.width<=usableW+EPS&&r.top+r.height<=usableH+EPS);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CLEAR
         * Defines clear for the surrounding section.
         * ------------------------------------------------------------------- */
        const clear=allowOverlap||native.every((r,i)=>native.slice(i+1).every(other=>!overlap(r,other)));
        if(inside&&clear)return result(new Map(native.map(r=>[r.id,r])),'native');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PACKED
         * Defines packed for the surrounding section.
         * ------------------------------------------------------------------- */
        let packed=fitAtGaps(items,usableW,usableH);
        if(packed)return result(packed,'pack');

        // Greedy best benefit per content cost, one widget step per iteration.
        // No candidate may grow either dimension of a temporary widget. This
        // avoids Half-Full -> Mobile unexpectedly increasing height.
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CONDENSED
         * Defines condensed for the surrounding section.
         * ------------------------------------------------------------------- */
        const condensed=items.map(i=>({...i}));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MAXIMUM STEPS
         * Defines maximum Steps for the surrounding section.
         * ------------------------------------------------------------------- */
        const maximumSteps=items.reduce((sum,i)=>sum+(i.candidates?.length||0),0);
        for(let step=0;step<maximumSteps;step++){
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: CHOICE
           * Defines choice for the surrounding section.
           * ------------------------------------------------------------------- */
          let choice=null;
          for(const item of condensed){
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: CANDIDATES
             * Defines candidates for the surrounding section.
             * ------------------------------------------------------------------- */
            const candidates=(item.candidates||[]).filter(c=>c.width<=item.width+EPS&&c.height<=item.height+EPS&&area(c)<area(item)-EPS);
            candidates.sort((a,b)=>area(b)-area(a));
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: NEXT
             * Defines next for the surrounding section.
             * ------------------------------------------------------------------- */
            const next=candidates[0];if(!next)continue;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: BENEFIT
             * Defines benefit for the surrounding section.
             * ------------------------------------------------------------------- */
            const benefit=(area(item)-area(next)) + Math.max(0,item.width-usableW)*usableH;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: SCORE
             * Defines score for the surrounding section.
             * ------------------------------------------------------------------- */
            const score=benefit/Math.max(1,item.cost||1);
            if(!choice||score>choice.score+EPS||(Math.abs(score-choice.score)<EPS&&item.order<choice.item.order))choice={item,next,score};
          }
          if(!choice)break;
          Object.assign(choice.item,{width:choice.next.width,height:choice.next.height,state:choice.next.state});
          packed=fitAtGaps(condensed,usableW,usableH);
          if(packed)return result(packed,'condense');
        }
        // Never scale before all supported packing reductions were attempted.
        // 90% is the hard readability floor, with only two discrete levels.
        for(const scale of [.95,minScale].filter((s,i,a)=>s<1&&s>=minScale&&a.indexOf(s)===i)){
          packed=fitAtGaps(condensed,usableW/scale,usableH/scale,scale);
          if(packed)return result(packed,'compress',scale);
        }
        return {viable:false,stage:'flow',scale:1,canvasHeight:height,rects:new Map()};
      }
      return Object.freeze({plan,pack,overlap});
    })();

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE DESKTOP PRESENTATION SCALE
     * Defines active Desktop Presentation Scale for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeDesktopPresentationScale = 1;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE DESKTOP PLAN
     * Defines active Desktop Plan for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeDesktopPlan = null;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: DESKTOP PLAN SIGNATURE
     * Defines desktop Plan Signature for the surrounding section.
     * ------------------------------------------------------------------- */
    let desktopPlanSignature = '';
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: DESKTOP TRANSITION WIDTH
     * Defines desktop Transition Width for the surrounding section.
     * ------------------------------------------------------------------- */
    let desktopTransitionWidth = innerWidth;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: LAYOUT ANIMATIONS
     * Defines layout Animations for the surrounding section.
     * ------------------------------------------------------------------- */
    const layoutAnimations = new WeakMap();

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: LAYOUT EDITING ACTIVE
     * Implementation of layout Editing Active. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function layoutEditingActive() {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NODE
       * Defines node for the surrounding section.
       * ------------------------------------------------------------------- */
      const node=document.activeElement;
      return Boolean(node?.closest?.('.widget') && node.matches?.('input,textarea,select,[contenteditable="true"],iframe'));
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DESKTOP LAYOUT WIDTH
     * Implementation of desktop Layout Width. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function desktopLayoutWidth() {
      // Unlike clientWidth, the body's used width includes the reserved gutter
      // consistently both before and after a vertical scrollbar becomes visible.
      return document.body.clientWidth || document.documentElement.clientWidth || innerWidth;
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DESKTOP PRESENTATION PLAN
     * Implementation of desktop Presentation Plan. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function desktopPresentationPlan(viewportWidth=desktopLayoutWidth(),viewportHeight=innerHeight,recoveryInset=0) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDGETS
       * Defines widgets for the surrounding section.
       * ------------------------------------------------------------------- */
      const widgets=responsiveFlowWidgets();
      // A stable canvas height prevents browser chrome and the on-screen
      // keyboard from forcing global shrink. Excess height remains scrollable.
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CANVAS HEIGHT
       * Defines canvas Height for the surrounding section.
       * ------------------------------------------------------------------- */
      const canvasHeight=Math.max(viewportHeight,lastDesktopAuthoringViewport.height);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SIGNATURE
       * Defines signature for the surrounding section.
       * ------------------------------------------------------------------- */
      const signature=widgets.map(w=>{const g=durableWidgetGeometry(w);return [w.id,w.dataset.contentType,g.x,g.y,g.width,g.height].join(':');}).join('|')+'|'+activeLayoutMode;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: INPUT
       * Defines input for the surrounding section.
       * ------------------------------------------------------------------- */
      const input=widgets.map(widget=>{
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: G, CONTRACT
         * Defines g, contract for the surrounding section.
         * ------------------------------------------------------------------- */
        const g=durableWidgetGeometry(widget),contract=HubCanonicalSizing.contract(widget);
        return {id:widget.id,...g,cost:['cashflow','billcenter','projects','gmail','notes','todo'].includes(widget.dataset.contentType)?4:1,
          candidates:contract.allowedStates.filter(state=>HubCanonicalSizing.canAutoShrink(widget,state))
            .map(state=>({state,...HubCanonicalSizing.geometry(state)}))};
      });
      // Overlap already present in durable intent is an authored stack. Only
      // temporary packing must be collision-free; do not unpack a saved stack.
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PLAN
       * Defines plan for the surrounding section.
       * ------------------------------------------------------------------- */
      let plan=HubPressurePlanner.plan(input,{width:viewportWidth-recoveryInset,height:canvasHeight,margin:12,gap:HubCanonicalSizing.grid.gap,minScale:.9,allowOverlap:true});
      plan.signature=signature;plan.viewportWidth=viewportWidth;plan.viewportHeight=viewportHeight;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: OLD
       * Defines old for the surrounding section.
       * ------------------------------------------------------------------- */
      const old=activeDesktopPlan;
      // Hold a valid temporary plan near a threshold; widening eventually
      // recalculates from durable intent. Native placement is never frozen.
      if(!recoveryInset&&old&&old.stage!=='native'&&signature===desktopPlanSignature&&
         old.rects.size===widgets.length&&old.canvasHeight===canvasHeight&&
         [...old.rects.values()].every(r=>r.left>=11.5&&r.left+r.width<=viewportWidth-11.5)&&
         viewportWidth<desktopTransitionWidth+36){
        plan={...old,viewportWidth,viewportHeight,signature};
      }
      return {...plan,reason:plan.stage,minimumScale:.9};
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: ASSESS DESKTOP LAYOUT VIABILITY
     * Implementation of assess Desktop Layout Viability. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function assessDesktopLayoutViability(width=desktopLayoutWidth(),height=innerHeight,recoveryInset=0){
      return desktopPresentationPlan(width,height,recoveryInset);
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CLEAR WIDGET PRESENTATION
     * Implementation of clear Widget Presentation. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function clearWidgetPresentation(widget){
      ['--hub-layout-width','--hub-layout-height','--hub-responsive-scale','--hub-responsive-x','--hub-responsive-y'].forEach(key=>widget.style.removeProperty(key));
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SYNC WIDGET DESKTOP PRESENTATION
     * Implementation of sync Widget Desktop Presentation. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function syncWidgetDesktopPresentation(widget,scale=activeDesktopPresentationScale){
      if(activeLayoutMode === 'freeform' && !activeDesktopPlan){clearWidgetPresentation(widget);return;}
      if(!widget?.isConnected||widget.hidden||widget.classList.contains('focused')||!isDesktopFreeform()){if(widget)clearWidgetPresentation(widget);return;}
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: G, R
       * Defines g, r for the surrounding section.
       * ------------------------------------------------------------------- */
      const g=durableWidgetGeometry(widget),r=widget._hubGesture?null:activeDesktopPlan?.rects.get(widget.id);
      if(r){
        widget.style.setProperty('--hub-layout-width',r.layoutWidth+'px');
        widget.style.setProperty('--hub-layout-height',r.layoutHeight+'px');
        widget.style.setProperty('--hub-responsive-scale',String(scale));
        widget.style.setProperty('--hub-responsive-x',(r.left+r.width/2-innerWidth/2-g.x)+'px');
        widget.style.setProperty('--hub-responsive-y',(r.top+r.height/2-innerHeight/2-g.y)+'px');
      }else{
        widget.style.removeProperty('--hub-layout-width');widget.style.removeProperty('--hub-layout-height');
        widget.style.setProperty('--hub-responsive-scale',String(scale));
        widget.style.setProperty('--hub-responsive-x',(g.x*(scale-1))+'px');
        widget.style.setProperty('--hub-responsive-y',(g.y*(scale-1))+'px');
      }
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CLEAR DESKTOP PRESENTATION GEOMETRY
     * Implementation of clear Desktop Presentation Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function clearDesktopPresentationGeometry(){
      activeDesktopPresentationScale=1;activeDesktopPlan=null;desktopPlanSignature='';
      document.body.removeAttribute('data-hub-desktop-compressed');
      document.body.removeAttribute('data-hub-canvas-scroll');
      document.body.style.removeProperty('--hub-canvas-height');
      currentWidgets().forEach(clearWidgetPresentation);
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: APPLY DESKTOP PRESENTATION GEOMETRY
     * Implementation of apply Desktop Presentation Geometry. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function applyDesktopPresentationGeometry(plan=desktopPresentationPlan()){
      if(!isDesktopFreeform()||!plan.viable){clearDesktopPresentationGeometry();return plan;}
      if(activeDesktopPlan!==plan&&(!activeDesktopPlan||plan.stage!==activeDesktopPlan.stage||
          [...plan.rects].some(([id,r])=>{const old=activeDesktopPlan.rects.get(id);return !old||Math.abs(r.left-old.left)>1||Math.abs(r.top-old.top)>1||r.layoutWidth!==old.layoutWidth||r.layoutHeight!==old.layoutHeight;})))desktopTransitionWidth=plan.viewportWidth;
      activeDesktopPlan=plan;desktopPlanSignature=plan.signature;activeDesktopPresentationScale=plan.scale;
      document.body.dataset.hubPressure=plan.stage;
      document.body.dataset.hubDesktopCompressed=String(plan.scale<1);
      document.body.dataset.hubCanvasScroll=String(plan.canvasHeight>innerHeight+1);
      document.body.style.setProperty('--hub-canvas-height',plan.canvasHeight+'px');
      currentWidgets().forEach(widget=>{syncWidgetDesktopPresentation(widget,plan.scale);queueResponsiveState(widget);});
      return plan;
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: DESKTOP INTERACTION SCALE
     * Implementation of desktop Interaction Scale. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function desktopInteractionScale(){return isDesktopFreeform()?Math.max(.01,activeDesktopPresentationScale||1):1;}

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CANCEL LAYOUT ANIMATION
     * Implementation of cancel Layout Animation. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function cancelLayoutAnimation(widget){
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MOTION
       * Defines motion for the surrounding section.
       * ------------------------------------------------------------------- */
      const motion=layoutAnimations.get(widget);
      if(!motion)return;
      layoutAnimations.delete(widget);
      motion.animation.cancel();
      widget.classList.remove('is-layout-animating');
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CAPTURE LAYOUT RECTS
     * Implementation of capture Layout Rects. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function captureLayoutRects(){
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RECTS
       * Defines rects for the surrounding section.
       * ------------------------------------------------------------------- */
      const rects=new Map();
      rects.motions=new Map();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: WIDGETS
       * Defines widgets for the surrounding section.
       * ------------------------------------------------------------------- */
      const widgets=currentWidgets().filter(w=>!w.hidden&&!w.classList.contains('focused'));
      // Read every visible box before cancelling anything; avoid alternating
      // layout reads and animation writes once per widget.
      widgets.forEach(widget=>{
        rects.set(widget.id,widget.getBoundingClientRect());
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MOTION
         * Defines motion for the surrounding section.
         * ------------------------------------------------------------------- */
        const motion=layoutAnimations.get(widget);
        if(motion)rects.motions.set(widget.id,{...motion,time:motion.animation.currentTime});
      });
      currentWidgets().forEach(cancelLayoutAnimation);
      return rects;
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: LAYOUT TRANSFORM FRAMES
     * Implementation of layout Transform Frames. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function layoutTransformFrames(base,from){
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TRANSFORM
       * Defines transform for the surrounding section.
       * ------------------------------------------------------------------- */
      const transform=base==='none'?'':base;
      return [
        {transform:`translate3d(${from.dx}px,${from.dy}px,0) ${transform} scale(${from.scaleX},${from.scaleY})`},
        {transform:`translate3d(0,0,0) ${transform} scale(1,1)`}
      ];
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: ANIMATE LAYOUT RECTS
     * Implementation of animate Layout Rects. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function animateLayoutRects(before,major=false){
      if(manipulatingWidget||layoutEditingActive()||document.body.classList.contains('hub-booting')||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: TARGETS
       * Defines targets for the surrounding section.
       * ------------------------------------------------------------------- */
      const targets=currentWidgets().filter(widget=>before.has(widget.id)&&!widget.hidden&&!widget.classList.contains('focused'))
        .map(widget=>({widget,rect:widget.getBoundingClientRect(),base:getComputedStyle(widget).transform}));
      // All geometry/style reads finish before any animations start.
      targets.forEach(({widget,rect:next,base})=>{
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: OLD, PREVIOUS
         * Defines old, previous for the surrounding section.
         * ------------------------------------------------------------------- */
        const old=before.get(widget.id),previous=before.motions?.get(widget.id);
        if(!old.width||!old.height||!next.width||!next.height)return;
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: ON SCREEN
         * Defines on Screen for the surrounding section.
         * ------------------------------------------------------------------- */
        const onScreen=rect=>rect.right>=-40&&rect.left<=innerWidth+40&&rect.bottom>=-40&&rect.top<=innerHeight+40;
        if(!onScreen(old)&&!onScreen(next))return;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SAME TARGET
         * Defines same Target for the surrounding section.
         * ------------------------------------------------------------------- */
        const sameTarget=previous&&['left','top','width','height']
          .every(key=>Math.abs(previous.target[key]-next[key])<.5);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ANIMATION, FROM
         * Defines animation, from for the surrounding section.
         * ------------------------------------------------------------------- */
        let animation,from;
        if(sameTarget&&previous.time!=null){
          // A repeated resize evaluation must not restart the easing curve.
          animation=previous.animation;
          from=previous.from;
          if(previous.base!==base)animation.effect.setKeyframes(layoutTransformFrames(base,from));
          animation.play();
          animation.currentTime=previous.time;
        }else{
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DX, DY
           * Defines dx, dy for the surrounding section.
           * ------------------------------------------------------------------- */
          const dx=old.left+old.width/2-next.left-next.width/2,dy=old.top+old.height/2-next.top-next.height/2;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SIZE DELTA
           * Defines size Delta for the surrounding section.
           * ------------------------------------------------------------------- */
          const sizeDelta=Math.abs(old.width-next.width)+Math.abs(old.height-next.height);
          if(Math.abs(dx)+Math.abs(dy)+sizeDelta<1)return;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DISTANCE
           * Defines distance for the surrounding section.
           * ------------------------------------------------------------------- */
          const distance=Math.hypot(dx,dy)+sizeDelta*.25;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: DURATION
           * Defines duration for the surrounding section.
           * ------------------------------------------------------------------- */
          const duration=major ? Math.min(600,400+distance*.2) : Math.min(300,200+distance*.2);
          from={dx,dy,scaleX:old.width/next.width,scaleY:old.height/next.height};
          animation=widget.animate(layoutTransformFrames(base,from),{duration,easing:'cubic-bezier(.2,.8,.2,1)'});
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MOTION
         * Defines motion for the surrounding section.
         * ------------------------------------------------------------------- */
        const motion={animation,target:next,base,from};
        layoutAnimations.set(widget,motion);
        widget.classList.add('is-layout-animating');
        /* HUB GUIDE ---------------------------------------------------------
         * HELPER: CLEANUP
         * Defines cleanup for the surrounding section.
         * ------------------------------------------------------------------- */
        const cleanup=()=>{
          if(layoutAnimations.get(widget)!==motion)return;
          layoutAnimations.delete(widget);
          widget.classList.remove('is-layout-animating');
        };
        animation.finished.then(cleanup,cleanup);
      });
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: PREPARE RESPONSIVE GESTURE
     * Captures original and displayed geometry before dragging or resizing begins.
     * ------------------------------------------------------------------- */
    function prepareResponsiveGesture(widget,kind){
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ORIGINAL, RECT, SCALE
       * Defines original, rect, scale for the surrounding section.
       * ------------------------------------------------------------------- */
      const original=durableWidgetGeometry(widget),rect=widget.getBoundingClientRect(),scale=desktopInteractionScale();
      cancelLayoutAnimation(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SHOWN
       * Defines shown for the surrounding section.
       * ------------------------------------------------------------------- */
      const shown={x:(rect.left+rect.width/2+scrollX-innerWidth/2)/scale,y:(rect.top+rect.height/2+scrollY-innerHeight/2)/scale,width:rect.width/scale,height:rect.height/scale};
      widget._hubGesture={original,shown,kind};
      Object.entries(shown).forEach(([key,value])=>widget._applyLocalValue('--widget-'+key,value,false));
      clearWidgetPresentation(widget);syncWidgetDesktopPresentation(widget,scale);
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: FINISH RESPONSIVE GESTURE
     * Commits a completed gesture relative to the original geometry, or restores a cancelled gesture.
     * ------------------------------------------------------------------- */
    function finishResponsiveGesture(widget,cancelled=false){
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GESTURE
       * Defines gesture for the surrounding section.
       * ------------------------------------------------------------------- */
      const gesture=widget._hubGesture;if(!gesture)return false;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CURRENT
       * Defines current for the surrounding section.
       * ------------------------------------------------------------------- */
      const current=durableWidgetGeometry(widget),{original,shown,kind}=gesture;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CHANGED
       * Defines changed for the surrounding section.
       * ------------------------------------------------------------------- */
      const changed=!cancelled&&['x','y','width','height'].some(key=>Math.abs(current[key]-shown[key])>.5);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NEXT
       * Defines next for the surrounding section.
       * ------------------------------------------------------------------- */
      const next=changed?{x:original.x+current.x-shown.x,y:original.y+current.y-shown.y,
        width:kind==='resize'?current.width:original.width,height:kind==='resize'?current.height:original.height}:original;
      delete widget._hubGesture;
      Object.entries(next).forEach(([key,value])=>widget._applyLocalValue('--widget-'+key,value,false));
      return changed;
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: FIND DURABLE DESKTOP PLACEMENT FOR NEW WIDGET
     * Implementation of find Durable Desktop Placement For New Widget. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function findDurableDesktopPlacementForNewWidget(widget, width, height) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: VIEWPORT WIDTH
       * Defines viewport Width for the surrounding section.
       * ------------------------------------------------------------------- */
      const viewportWidth = lastDesktopAuthoringViewport.width;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: VIEWPORT HEIGHT
       * Defines viewport Height for the surrounding section.
       * ------------------------------------------------------------------- */
      const viewportHeight = lastDesktopAuthoringViewport.height;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MARGIN
       * Defines margin for the surrounding section.
       * ------------------------------------------------------------------- */
      const margin = 20;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GAP
       * Defines gap for the surrounding section.
       * ------------------------------------------------------------------- */
      const gap = 20;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STEP
       * Defines step for the surrounding section.
       * ------------------------------------------------------------------- */
      const step = 20;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: EXISTING
       * Defines existing for the surrounding section.
       * ------------------------------------------------------------------- */
      const existing = currentWidgets().filter(item => item !== widget && !item.hidden).map(item => desktopIntentRect(item, viewportWidth, viewportHeight));
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: FITS
       * Defines fits for the surrounding section.
       * ------------------------------------------------------------------- */
      const fits = candidate => existing.every(rect => candidate.right + gap <= rect.left || candidate.left >= rect.right + gap || candidate.bottom + gap <= rect.top || candidate.top >= rect.bottom + gap);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MAX LEFT
       * Defines max Left for the surrounding section.
       * ------------------------------------------------------------------- */
      const maxLeft = Math.max(margin, viewportWidth - margin - width);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: MAX TOP
       * Defines max Top for the surrounding section.
       * ------------------------------------------------------------------- */
      const maxTop = Math.max(margin, viewportHeight - margin - height);
      for (let top = margin; top <= maxTop; top += step) {
        for (let left = margin; left <= maxLeft; left += step) {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: CANDIDATE
           * Defines candidate for the surrounding section.
           * ------------------------------------------------------------------- */
          const candidate = { left, top, right: left + width, bottom: top + height };
          if (!fits(candidate)) continue;
          return { x: Math.round(left + width / 2 - viewportWidth / 2), y: Math.round(top + height / 2 - viewportHeight / 2) };
        }
      }
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FALLBACK INDEX
       * Defines fallback Index for the surrounding section.
       * ------------------------------------------------------------------- */
      const fallbackIndex = currentWidgets().filter(item => item !== widget).length;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: FALLBACK OFFSET
       * Defines fallback Offset for the surrounding section.
       * ------------------------------------------------------------------- */
      const fallbackOffset = (fallbackIndex % 6) * 24;
      return { x: fallbackOffset, y: fallbackOffset };
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CLEAR RESPONSIVE FLOW METADATA
     * Implementation of clear Responsive Flow Metadata. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function clearResponsiveFlowMetadata() {
      currentWidgets().forEach(widget => {
        widget.style.removeProperty('order');
        widget.style.removeProperty('--hub-flow-span');
        widget.style.removeProperty('--hub-flow-height');
        delete widget.dataset.flowSpan;
        delete widget.dataset.flowState;
        delete widget.dataset.flowPromotion;
        widget.style.removeProperty('--hub-responsive-x');
        widget.style.removeProperty('--hub-responsive-y');
        widget.style.removeProperty('--hub-responsive-scale');
      });
      responsiveFlowOrder = [];
      document.body.style.removeProperty('--hub-flow-columns');
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: APPLY RESPONSIVE FLOW PACKING
     * Implementation of apply Responsive Flow Packing. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function applyResponsiveFlowPacking(forceOrder = false) {
      if (!isResponsiveFlowActive()) { clearResponsiveFlowMetadata(); return; }
      if (forceOrder || !responsiveFlowOrder.length) responsiveFlowOrder = deriveResponsiveFlowOrder();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: LIVE IDS
       * Defines live Ids for the surrounding section.
       * ------------------------------------------------------------------- */
      const liveIds = new Set(currentWidgets().map(widget => widget.id));
      responsiveFlowOrder = responsiveFlowOrder.filter(id => liveIds.has(id));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: KNOWN
       * Defines known for the surrounding section.
       * ------------------------------------------------------------------- */
      const known = new Set(responsiveFlowOrder);
      currentWidgets().forEach(widget => { if (!known.has(widget.id)) responsiveFlowOrder.push(widget.id); });
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: COLUMNS
       * Defines columns for the surrounding section.
       * ------------------------------------------------------------------- */
      const columns = flowColumnCount();
      document.body.style.setProperty('--hub-flow-columns', String(columns));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: VISIBLE BY ORDER
       * Defines visible By Order for the surrounding section.
       * ------------------------------------------------------------------- */
      const visibleByOrder = responsiveFlowOrder.map(id => document.getElementById(id)).filter(widget => widget && !widget.hidden && !widget.classList.contains('focused'));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PLAN BY ID
       * Defines plan By Id for the surrounding section.
       * ------------------------------------------------------------------- */
      const planById = new Map(buildResponsivePackingPlan(visibleByOrder, columns).map(item => [item.widget.id, item]));
      responsiveFlowOrder.forEach((id, index) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDGET
         * Defines widget for the surrounding section.
         * ------------------------------------------------------------------- */
        const widget = document.getElementById(id);
        if (!widget) return;
        widget.style.order = String(index + 1);
        widget.style.removeProperty('--hub-responsive-x');
        widget.style.removeProperty('--hub-responsive-y');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PLAN
         * Defines plan for the surrounding section.
         * ------------------------------------------------------------------- */
        const plan = planById.get(id);
        if (!plan) return;
        widget.dataset.flowState = plan.state;
        widget.dataset.flowSpan = String(plan.span);
        widget.dataset.flowPromotion = plan.promotion;
        widget.style.setProperty('--hub-flow-span', String(plan.span));
        widget.style.setProperty('--hub-flow-height', `${plan.height}px`);
        queueResponsiveState(widget);
      });
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET HUB LAYOUT POLICY
     * Applies flow or freeform presentation and updates widget geometry and transitions.
     * ------------------------------------------------------------------- */
    function setHubLayoutPolicy(policy,reason='none',forceOrder=false,preparedPlan=null){
      if(!['freeform','flow'].includes(policy))return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PREVIOUS
       * Defines previous for the surrounding section.
       * ------------------------------------------------------------------- */
      const previous=activeHubLayoutPolicy;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PREVIOUS PRESSURE
       * Defines previous Pressure for the surrounding section.
       * ------------------------------------------------------------------- */
      const previousPressure=document.body.dataset.hubPressure;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: BEFORE
       * Defines before for the surrounding section.
       * ------------------------------------------------------------------- */
      const before=captureLayoutRects();
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CHANGED
       * Defines changed for the surrounding section.
       * ------------------------------------------------------------------- */
      const changed=policy!==previous;
      activeHubLayoutPolicy=policy;responsiveFlowReason=reason;
      document.body.dataset.hubLayout=policy;document.body.dataset.hubFlowReason=reason;
      if(policy==='flow'){
        if(changed)clearDesktopPresentationGeometry();
        document.body.dataset.hubPressure='flow';
        applyResponsiveFlowPacking(forceOrder||changed);
      }else{
        if(changed)clearResponsiveFlowMetadata();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: PLAN
         * Defines plan for the surrounding section.
         * ------------------------------------------------------------------- */
        const plan=applyDesktopPresentationGeometry(preparedPlan||desktopPresentationPlan());
        if(plan.stage==='native')lastDesktopAuthoringViewport={width:Math.max(lastDesktopAuthoringViewport.width,innerWidth),height:Math.max(lastDesktopAuthoringViewport.height,innerHeight)};
        if(changed)scrollTo({top:0,left:0,behavior:'auto'});
      }
      currentWidgets().forEach(queueResponsiveState);
      if(changed||previousPressure!=='native'||document.body.dataset.hubPressure!=='native')animateLayoutRects(before,changed);
      if(changed)document.dispatchEvent(new CustomEvent('hublayoutpolicychange',{detail:{policy,reason,mode:activeHubMode}}));
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: EVALUATE HUB LAYOUT POLICY
     * Chooses temporary layout presentation from available space; defers changes during active edits.
     * ------------------------------------------------------------------- */
    // Recover the arrangement as a group using presentation-only coordinates.
    // Durable positions remain untouched so widening restores the authored layout.
    function recoverUnreachableWidgets(){
      const entries=currentWidgets().filter(w=>!w.hidden&&!w.classList.contains('focused')&&!w._hubGesture).map(widget=>({widget,g:durableWidgetGeometry(widget)}));
      if(!entries.length)return;
      const dx=Math.max(0,12-Math.min(...entries.map(({g})=>innerWidth/2+g.x-g.width/2)));
      const dy=Math.max(0,12-Math.min(...entries.map(({g})=>innerHeight/2+g.y-g.height/2)));
      const rects=new Map(entries.map(({widget,g})=>[widget.id,{left:innerWidth/2+g.x-g.width/2+dx,top:innerHeight/2+g.y-g.height/2+dy,width:g.width,height:g.height,layoutWidth:g.width,layoutHeight:g.height}]));
      activeDesktopPlan={rects,stage:'recovery',scale:1};
      entries.forEach(({widget})=>syncWidgetDesktopPresentation(widget,1));
      document.body.dataset.hubCanvasScroll='true';
    }

    function evaluateHubLayoutPolicy(force=false){
      // Stable scrollbar gutters can reduce CSS vw units without changing
      // innerWidth. Use the same pixel origin as layout and gesture math.
      document.body.style.setProperty('--hub-viewport-center-x',`${innerWidth / 2}px`);
      if(manipulatingWidget||layoutEditingActive()){
        pendingHubLayoutEvaluation=true;
        document.body.dataset.hubCanvasScroll='true';
        return;
      }
      pendingHubLayoutEvaluation=false;
      if(activeLayoutMode === 'freeform'){
        activeHubLayoutPolicy='freeform'; responsiveFlowReason='none';
        document.body.dataset.hubLayout='freeform'; document.body.dataset.hubFlowReason='none';
        clearResponsiveFlowMetadata(); clearDesktopPresentationGeometry();
        recoverUnreachableWidgets();
        document.body.dataset.hubPressure='native';
        currentWidgets().forEach(widget=>{cancelLayoutAnimation(widget);queueResponsiveState(widget);});
        return;
      }
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: RECOVERY
       * Defines recovery for the surrounding section.
       * ------------------------------------------------------------------- */
      const recovery=activeHubLayoutPolicy==='flow'?36:0;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PLAN
       * Defines plan for the surrounding section.
       * ------------------------------------------------------------------- */
      const plan=assessDesktopLayoutViability(desktopLayoutWidth(),innerHeight,recovery);
      if(plan.viable){
        // Recovery buffer is only a release test; commit against actual width.
        setHubLayoutPolicy('freeform','none',false,recovery?desktopPresentationPlan():plan);
      }else if(innerWidth <= HUB_MODE_BREAKPOINTS.mobileMax) setHubLayoutPolicy('flow','pressure',force);
      else {
        // The old locked tablet layout is retired. Preserve editable geometry
        // when a larger responsive workspace cannot be packed safely.
        activeHubLayoutPolicy='freeform'; document.body.dataset.hubLayout='freeform';
        clearResponsiveFlowMetadata(); clearDesktopPresentationGeometry();
        recoverUnreachableWidgets();
        document.body.dataset.hubPressure='native';
        currentWidgets().forEach(queueResponsiveState);
      }
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET HUB MODE
     * Implementation of set Hub Mode. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setHubMode(next){
      if(!['desktop','tablet','mobile'].includes(next))return;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: PREVIOUS
       * Defines previous for the surrounding section.
       * ------------------------------------------------------------------- */
      const previous=activeHubMode;activeHubMode=next;document.body.dataset.hubMode=next;
      evaluateHubLayoutPolicy(previous!==next);
      if(previous!==next)document.dispatchEvent(new CustomEvent('hubmodechange',{detail:{mode:next,previous}}));
    }
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: EFFECTIVE WIDGET SIZE
     * Implementation of effective Widget Size. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function effectiveWidgetSize(widget){
      // Both canonical classification and container CSS see the layout box,
      // never getBoundingClientRect()'s animated/scaled presentation dimensions.
      return {width:widget.offsetWidth||durableWidgetGeometry(widget).width,height:widget.offsetHeight||durableWidgetGeometry(widget).height};
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: FIT WIDGET TO VIEWPORT
     * Implementation of fit Widget To Viewport. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function fitWidgetToViewport(widget, width, height) {
      if (!isDesktopFreeform()) {
        widget.style.removeProperty('--hub-responsive-scale');
        widget.style.removeProperty('--hub-responsive-x');
        widget.style.removeProperty('--hub-responsive-y');
        return;
      }
      if (widget.classList.contains('focused')) {
        widget.style.removeProperty('--hub-responsive-scale');
        widget.style.removeProperty('--hub-responsive-x');
        widget.style.removeProperty('--hub-responsive-y');
        return;
      }
      if (widget.classList.contains('is-dragging') || widget.classList.contains('is-resizing')) return;
      syncWidgetDesktopPresentation(widget);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: RESPONSIVE FRAME
     * Defines responsive Frame for the surrounding section.
     * ------------------------------------------------------------------- */
    let responsiveFrame = 0;
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: PENDING RESPONSIVE WIDGETS
     * Defines pending Responsive Widgets for the surrounding section.
     * ------------------------------------------------------------------- */
    const pendingResponsiveWidgets = new Set();
    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: QUEUE RESPONSIVE STATE
     * Implementation of queue Responsive State. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function queueResponsiveState(widget) {
      if (widget) pendingResponsiveWidgets.add(widget);
      if (responsiveFrame) return;
      responsiveFrame = requestAnimationFrame(() => {
        responsiveFrame = 0;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TARGETS
         * Defines targets for the surrounding section.
         * ------------------------------------------------------------------- */
        const targets = pendingResponsiveWidgets.size ? [...pendingResponsiveWidgets] : currentWidgets();
        pendingResponsiveWidgets.clear();
        targets.forEach(item => {
          if (!item?.isConnected || item.hidden) return;
          if (item.classList.contains('is-dragging') || item.classList.contains('is-resizing')) {
            deferredResponsiveWidgets.add(item);
            // Presentation stays live during a gesture; desktop packing remains deferred.
          }
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: SIZE
           * Defines size for the surrounding section.
           * ------------------------------------------------------------------- */
          const size = effectiveWidgetSize(item);
          fitWidgetToViewport(item, size.width, size.height);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: STATE
           * Defines state for the surrounding section.
           * ------------------------------------------------------------------- */
          const state = responsiveStateFor(item, size.width, size.height);
          /* HUB GUIDE ---------------------------------------------------------
           * WIDGET-SPECIFIC BEHAVIOR: ITEM.DATASET.CONTENTTYPE === 'PERFORMANCE'
           * Only this widget type uses the following branch.
           * ------------------------------------------------------------------- */
          if (item.dataset.contentType === 'performance') {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: CONTENT
             * Defines content for the surrounding section.
             * ------------------------------------------------------------------- */
            const content = item.querySelector('.widget-content');
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: WIDTH
             * Defines width for the surrounding section.
             * ------------------------------------------------------------------- */
            const width = content?.clientWidth || size.width;
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: HEIGHT
             * Defines height for the surrounding section.
             * ------------------------------------------------------------------- */
            const height = content?.clientHeight || size.height;
            item.dataset.performanceLayout = width >= 460 && height >= 130
              ? (height >= 400 ? 'dashboard' : 'cluster') : 'single';
          }
          if (item.dataset.responsiveState !== state) {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: PREVIOUS
             * Defines previous for the surrounding section.
             * ------------------------------------------------------------------- */
            const previous = item.dataset.responsiveState || '';
            item.dataset.responsiveState = state;
            item.dispatchEvent(new CustomEvent('hubresponsivechange', { detail: { state, previous, width: size.width, height: size.height } }));
          }
        });
      });
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: DEFERRED RESPONSIVE WIDGETS
     * Defines deferred Responsive Widgets for the surrounding section.
     * ------------------------------------------------------------------- */
    const deferredResponsiveWidgets = new Set();
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: SHARED WIDGET RESIZE OBSERVER
     * Defines shared Widget Resize Observer for the surrounding section.
     * ------------------------------------------------------------------- */
    const sharedWidgetResizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (entry.target.classList.contains('is-dragging') || entry.target.classList.contains('is-resizing')) deferredResponsiveWidgets.add(entry.target);
        queueResponsiveState(entry.target);
      });
    });

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: RECONCILE RESPONSIVE AFTER GESTURE
     * Implementation of reconcile Responsive After Gesture. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function reconcileResponsiveAfterGesture(widget) {
      deferredResponsiveWidgets.delete(widget);
      queueResponsiveState(widget);
      evaluateHubLayoutPolicy(true);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: OBSERVE WIDGET RESPONSIVE STATE
     * Implementation of observe Widget Responsive State. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function observeWidgetResponsiveState(widget) {
      sharedWidgetResizeObserver.observe(widget);
      queueResponsiveState(widget);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: UPDATE VIEWPORT ENVIRONMENT
     * Implementation of update Viewport Environment. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function updateViewportEnvironment() {
      activeProfileViewport = { width: innerWidth, height: innerHeight };
      invalidateSnapGeometry();
      if (manipulatingWidget) pendingHubLayoutEvaluation = true;
      else setHubMode(stableHubMode(activeHubMode, innerWidth));
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: NEXT PROFILE
       * Defines next Profile for the surrounding section.
       * ------------------------------------------------------------------- */
      const nextProfile = detectLayoutProfile();
      if (nextProfile !== activeViewportProfile) {
        activeViewportProfile = nextProfile;
        document.body.dataset.hubViewportProfile = nextProfile;
        document.dispatchEvent(new CustomEvent('hubviewportprofilechange', { detail: { profile: nextProfile } }));
      }
      currentWidgets().forEach(queueResponsiveState);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: LAYOUT STORAGE KEY
     * Implementation of layout Storage Key. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function layoutStorageKey(widget, variable) {
      return profileLayoutKey(activeLayoutProfile, widget, variable);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: PROFILE LAYOUT KEY
     * Implementation of profile Layout Key. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function profileLayoutKey(profile, widget, variable) {
      return `hub-layout-${profile}-${widget.id}-${variable}`;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SNAP VALUE
     * Implementation of snap Value. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function snapValue(value) {
      return Math.round(value / 20) * 20;
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: WIDGET SIZE MAGNETS
     * Implementation of widget Size Magnets. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function widgetSizeMagnets(widget) {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: CONTRACT
       * Defines contract for the surrounding section.
       * ------------------------------------------------------------------- */
      const contract=HubCanonicalSizing.contract(widget);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: ALLOWED
       * Defines allowed for the surrounding section.
       * ------------------------------------------------------------------- */
      const allowed=contract.allowedStates.length?contract.allowedStates:HubCanonicalSizing.states;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SIZES
       * Defines sizes for the surrounding section.
       * ------------------------------------------------------------------- */
      const sizes=allowed.map(state=>HubCanonicalSizing.sizes[state]);
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: UNIQUE
       * Defines unique for the surrounding section.
       * ------------------------------------------------------------------- */
      const unique=axis=>[...new Set(sizes.map(size=>size[axis]))].map(value=>({value,
        label:sizes.filter(size=>size[axis]===value).map(size=>size.label).join(' / '),priority:8}));
      return {widths:unique('width'),heights:unique('height')};
    }


    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: MAGNETIC SNAP
     * Implementation of magnetic Snap. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function magneticSnap(value, candidates, threshold = 24) {
      return candidates.reduce((best, candidate) => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: DISTANCE
         * Defines distance for the surrounding section.
         * ------------------------------------------------------------------- */
        const distance = Math.abs(value - candidate.value);
        if (distance > threshold) return best;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SCORE
         * Defines score for the surrounding section.
         * ------------------------------------------------------------------- */
        const score = distance - Math.min(10, candidate.priority || 0) * .25;
        return !best || score < best.score ? { ...candidate, distance, score } : best;
      }, null);
    }

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: CURRENT WIDGETS
     * Returns active Hub widget elements, excluding parked financial windows.
     * ------------------------------------------------------------------- */
    function currentWidgets() {
      return [...document.querySelectorAll('.widget:not([data-finance-parked])')];
    }

    // Saved layouts capture durable desktop intent. Snap and responsive presentation stay gesture/runtime owned.
    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: ACTIVE SNAP GEOMETRY
     * Defines active Snap Geometry for the surrounding section.
     * ------------------------------------------------------------------- */
    let activeSnapGeometry = null;

    /* HUB GUIDE ---------------------------------------------------------
     * FUNCTION: SET LAYOUT MODE
     * Implementation of set Layout Mode. Calls and local helpers below belong to this operation.
     * ------------------------------------------------------------------- */
    function setLayoutMode(mode, save = true) {
      activeLayoutMode = mode === 'responsive' ? 'responsive' : 'freeform';
      document.body.dataset.arrangementMode = activeLayoutMode;
      document.querySelectorAll('[data-layout-mode]').forEach(button => {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ACTIVE
         * Defines active for the surrounding section.
         * ------------------------------------------------------------------- */
        const active = button.dataset.layoutMode === activeLayoutMode;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      if (save) localStorage.setItem('hub-arrangement-mode', activeLayoutMode);
      if (save) { setHubMode(rawHubMode()); evaluateHubLayoutPolicy(true); }
      hideSnapGuides();
      invalidateSnapGeometry();
    }

    /* HUB GUIDE ---------------------------------------------------------
     * STATE / REFERENCES: HUB LAYOUTS
     * Defines Hub Layouts for the surrounding section.
     * ------------------------------------------------------------------- */
    const HubLayouts = (() => {
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STORAGE KEY
       * Defines STORAGE KEY for the surrounding section.
       * ------------------------------------------------------------------- */
      const STORAGE_KEY = 'hub-layout-snapshots-v1';
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: SCHEMA VERSION
       * Defines SCHEMA VERSION for the surrounding section.
       * ------------------------------------------------------------------- */
      const SCHEMA_VERSION = 1;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: GEOMETRY KEYS
       * Defines GEOMETRY KEYS for the surrounding section.
       * ------------------------------------------------------------------- */
      const GEOMETRY_KEYS = Object.freeze(['x', 'y', 'width', 'height']);
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STYLE KEYS
       * Defines STYLE KEYS for the surrounding section.
       * ------------------------------------------------------------------- */
      const STYLE_KEYS = Object.freeze({
        x: '--widget-x',
        y: '--widget-y',
        width: '--widget-width',
        height: '--widget-height'
      });
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: READY
       * Defines ready for the surrounding section.
       * ------------------------------------------------------------------- */
      let ready = false;
      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: APPLYING
       * Defines applying for the surrounding section.
       * ------------------------------------------------------------------- */
      let applying = false;

      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: EMPTY STORE
       * Defines empty Store for the surrounding section.
       * ------------------------------------------------------------------- */
      const emptyStore = () => ({ schemaVersion: SCHEMA_VERSION, activeId: null, dirty: false, layouts: [] });
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: FINITE
       * Defines finite for the surrounding section.
       * ------------------------------------------------------------------- */
      const finite = value => Number.isFinite(Number(value));
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: CLEAN TEXT
       * Defines clean Text for the surrounding section.
       * ------------------------------------------------------------------- */
      const cleanText = (value, fallback = '') => String(value ?? fallback).trim();
      /* HUB GUIDE ---------------------------------------------------------
       * HELPER: ESCAPE HTML
       * Defines escape HTML for the surrounding section.
       * ------------------------------------------------------------------- */
      const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: NORMALIZE WIDGET ENTRY
       * Implementation of normalize Widget Entry. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function normalizeWidgetEntry(id, raw, index) {
        if (!raw || !cleanText(id) || !GEOMETRY_KEYS.every(key => finite(raw[key]))) return null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDTH
         * Defines width for the surrounding section.
         * ------------------------------------------------------------------- */
        const width = Number(raw.width);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: HEIGHT
         * Defines height for the surrounding section.
         * ------------------------------------------------------------------- */
        const height = Number(raw.height);
        if (width <= 0 || height <= 0) return null;
        return {
          visible: raw.visible !== false,
          x: Number(raw.x),
          y: Number(raw.y),
          width,
          height,
          stack: finite(raw.stack) ? Number(raw.stack) : index,
          contentType: cleanText(raw.contentType, 'empty') || 'empty'
        };
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: NORMALIZE LAYOUT
       * Implementation of normalize Layout. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function normalizeLayout(raw) {
        if (!raw || (raw.schemaVersion != null && raw.schemaVersion !== SCHEMA_VERSION) || !cleanText(raw.id) || !cleanText(raw.name) || !raw.widgets || typeof raw.widgets !== 'object' || Array.isArray(raw.widgets)) return null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: CREATED AT
         * Defines created At for the surrounding section.
         * ------------------------------------------------------------------- */
        const createdAt = cleanText(raw.createdAt);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: UPDATED AT
         * Defines updated At for the surrounding section.
         * ------------------------------------------------------------------- */
        const updatedAt = cleanText(raw.updatedAt);
        if (!Number.isFinite(Date.parse(createdAt)) || !Number.isFinite(Date.parse(updatedAt))) return null;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDGETS
         * Defines widgets for the surrounding section.
         * ------------------------------------------------------------------- */
        const widgets = {};
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RAW ENTRIES
         * Defines raw Entries for the surrounding section.
         * ------------------------------------------------------------------- */
        const rawEntries = Object.entries(raw.widgets);
        for (let index = 0; index < rawEntries.length; index += 1) {
          const [id, rawEntry] = rawEntries[index];
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ENTRY
           * Defines entry for the surrounding section.
           * ------------------------------------------------------------------- */
          const entry = normalizeWidgetEntry(id, rawEntry, index);
          if (!entry) return null;
          widgets[cleanText(id)] = entry;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VIEWPORT
         * Defines viewport for the surrounding section.
         * ------------------------------------------------------------------- */
        const viewport = raw.viewport && finite(raw.viewport.width) && finite(raw.viewport.height)
          ? { width: Math.max(1, Number(raw.viewport.width)), height: Math.max(1, Number(raw.viewport.height)) }
          : null;
        return {
          schemaVersion: SCHEMA_VERSION,
          id: cleanText(raw.id),
          name: cleanText(raw.name).slice(0, 40),
          createdAt,
          updatedAt,
          viewport,
          widgets
        };
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: WIDGET ENTRIES
       * Implementation of widget Entries. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function widgetEntries(layout) {
        return Object.entries(layout.widgets).filter(([,entry]) => !removedWidgetTypes.has(entry.contentType)).map(([id, entry]) => ({ id, ...entry }));
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: READ STORE
       * Implementation of read Store. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function readStore() {
        try {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: PARSED
           * Defines parsed for the surrounding section.
           * ------------------------------------------------------------------- */
          const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
          if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || !Array.isArray(parsed.layouts)) return emptyStore();
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: LAYOUTS
           * Defines layouts for the surrounding section.
           * ------------------------------------------------------------------- */
          const layouts = parsed.layouts.map(normalizeLayout).filter(Boolean);
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: ACTIVE ID
           * Defines active Id for the surrounding section.
           * ------------------------------------------------------------------- */
          const activeId = layouts.some(layout => layout.id === parsed.activeId) ? parsed.activeId : null;
          return { schemaVersion: SCHEMA_VERSION, activeId, dirty: Boolean(activeId && parsed.dirty), layouts };
        } catch {
          return emptyStore();
        }
      }

      /* HUB GUIDE ---------------------------------------------------------
       * STATE / REFERENCES: STATE
       * Defines state for the surrounding section.
       * ------------------------------------------------------------------- */
      let state = readStore();

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: WRITE STORE
       * Implementation of write Store. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function writeStore() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: MAKE ID
       * Implementation of make Id. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function makeId() {
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
        return `layout-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: STATUS
       * Implementation of status. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function status(message, tone = '') {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ELEMENT
         * Defines element for the surrounding section.
         * ------------------------------------------------------------------- */
        const element = $('layoutEditorStatus');
        if (!element) return;
        element.textContent = message;
        element.classList.remove('success', 'warning');
        if (tone) element.classList.add(tone);
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: CAPTURE
       * Implementation of capture. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function capture() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDGETS
         * Defines widgets for the surrounding section.
         * ------------------------------------------------------------------- */
        const widgets = currentWidgets();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STACK ORDER
         * Defines stack Order for the surrounding section.
         * ------------------------------------------------------------------- */
        const stackOrder = widgets
          .map(widget => ({ id: widget.id, z: Number.parseFloat(widget.style.getPropertyValue('--widget-z')) || 0 }))
          .sort((a, b) => a.z - b.z || a.id.localeCompare(b.id, undefined, { numeric: true }));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STACK BY ID
         * Defines stack By Id for the surrounding section.
         * ------------------------------------------------------------------- */
        const stackById = new Map(stackOrder.map((entry, index) => [entry.id, index]));
        return {
          viewport: {
            width: Math.max(1, Math.round(lastDesktopAuthoringViewport.width || innerWidth)),
            height: Math.max(1, Math.round(lastDesktopAuthoringViewport.height || innerHeight))
          },
          widgets: Object.fromEntries(widgets.map(widget => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: GEOMETRY
             * Defines geometry for the surrounding section.
             * ------------------------------------------------------------------- */
            const geometry = durableWidgetGeometry(widget);
            return [widget.id, {
              visible: !widget.hidden,
              x: geometry.x,
              y: geometry.y,
              width: geometry.width,
              height: geometry.height,
              stack: stackById.get(widget.id) ?? 0,
              contentType: widget.dataset.contentType || 'empty'
            }];
          }))
        };
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: SAVE
       * Implementation of save. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function save(name) {
        if (!ready || applying || manipulatingWidget) return false;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RESOLVED NAME
         * Defines resolved Name for the surrounding section.
         * ------------------------------------------------------------------- */
        const resolvedName = cleanText(name).slice(0, 40);
        if (!resolvedName) {
          status('Enter a layout name before saving.', 'warning');
          $('layoutNameInput')?.focus();
          return false;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SNAPSHOT
         * Defines snapshot for the surrounding section.
         * ------------------------------------------------------------------- */
        const snapshot = capture();
        if (!Object.keys(snapshot.widgets).length) {
          status('Add at least one widget before saving a layout.', 'warning');
          return false;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: TIMESTAMP
         * Defines timestamp for the surrounding section.
         * ------------------------------------------------------------------- */
        const timestamp = new Date().toISOString();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LAYOUT
         * Defines layout for the surrounding section.
         * ------------------------------------------------------------------- */
        const layout = normalizeLayout({
          schemaVersion: SCHEMA_VERSION,
          id: makeId(),
          name: resolvedName,
          createdAt: timestamp,
          updatedAt: timestamp,
          viewport: snapshot.viewport,
          widgets: snapshot.widgets
        });
        if (!layout) {
          status('The current arrangement could not be validated.', 'warning');
          return false;
        }
        state.layouts.push(layout);
        state.activeId = layout.id;
        state.dirty = false;
        writeStore();
        $('layoutNameInput').value = '';
        render();
        status(`${layout.name} saved.`, 'success');
        document.dispatchEvent(new CustomEvent('hubsavedlayoutschange', { detail: { action: 'save', id: layout.id } }));
        return true;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: APPLY GEOMETRY
       * Implementation of apply Geometry. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function applyGeometry(widget, entry, persist) {
        GEOMETRY_KEYS.forEach(key => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: PROPERTY
           * Defines property for the surrounding section.
           * ------------------------------------------------------------------- */
          const property = STYLE_KEYS[key];
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: VALUE
           * Defines value for the surrounding section.
           * ------------------------------------------------------------------- */
          const value = entry[key];
          if (widget._applyLocalValue) widget._applyLocalValue(property, value, false);
          else widget.style.setProperty(property, `${value}px`);
          if (persist) localStorage.setItem(profileLayoutKey(activeLayoutProfile, widget, property), String(value));
        });
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: APPLY STACK
       * Implementation of apply Stack. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function applyStack(entries, liveById, persist) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NEXT Z
         * Defines next Z for the surrounding section.
         * ------------------------------------------------------------------- */
        let nextZ = 100;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: SAVED IDS
         * Defines saved Ids for the surrounding section.
         * ------------------------------------------------------------------- */
        const savedIds = new Set(entries.map(entry => entry.id));
        currentWidgets()
          .filter(widget => !savedIds.has(widget.id))
          .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
          .forEach(widget => {
            widget.style.setProperty('--widget-z', ++nextZ);
            if (persist) localStorage.setItem(`hub-widget-z-${widget.id}`, String(nextZ));
          });
        [...entries].sort((a, b) => a.stack - b.stack || a.id.localeCompare(b.id, undefined, { numeric: true })).forEach(entry => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: WIDGET
           * Defines widget for the surrounding section.
           * ------------------------------------------------------------------- */
          const widget = liveById.get(entry.id);
          if (!widget) return;
          widget.style.setProperty('--widget-z', ++nextZ);
          if (persist) localStorage.setItem(`hub-widget-z-${widget.id}`, String(nextZ));
        });
        topWidgetZ = Math.max(topWidgetZ, nextZ);
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: ACTIVATE
       * Implementation of activate. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function activate(id) {
        if (!ready || applying || manipulatingWidget) return false;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STORED
         * Defines stored for the surrounding section.
         * ------------------------------------------------------------------- */
        const stored = state.layouts.find(layout => layout.id === id);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LAYOUT
         * Defines layout for the surrounding section.
         * ------------------------------------------------------------------- */
        const layout = normalizeLayout(stored);
        if (!layout || Object.keys(layout.widgets).length !== Object.keys(stored.widgets).length) {
          status('That layout is incomplete and was not applied.', 'warning');
          return false;
        }
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LIVE WIDGETS
         * Defines live Widgets for the surrounding section.
         * ------------------------------------------------------------------- */
        const liveWidgets = currentWidgets();
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LIVE BY ID
         * Defines live By Id for the surrounding section.
         * ------------------------------------------------------------------- */
        const liveById = new Map(liveWidgets.map(widget => [widget.id, widget]));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ENTRIES
         * Defines entries for the surrounding section.
         * ------------------------------------------------------------------- */
        const entries = widgetEntries(layout);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ENTRIES BY ID
         * Defines entries By Id for the surrounding section.
         * ------------------------------------------------------------------- */
        const entriesById = new Map(entries.map(entry => [entry.id, entry]));
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MISSING COUNT
         * Defines missing Count for the surrounding section.
         * ------------------------------------------------------------------- */
        const missingCount = entries.filter(entry => !liveById.has(entry.id)).length;
        if (focusedWidget) setWidgetFocus(focusedWidget, false);
        applying = true;
        manipulatingWidget = true;
        try {
          liveWidgets.forEach(widget => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: ENTRY
             * Defines entry for the surrounding section.
             * ------------------------------------------------------------------- */
            const entry = entriesById.get(widget.id);
            setWidgetVisibilityState(widget, entry ? !entry.visible : true, { persist: false, refresh: false, markDirty: false });
            if (entry) applyGeometry(widget, entry, false);
          });
          applyStack(entries, liveById, false);

          liveWidgets.forEach(widget => {
            /* HUB GUIDE ---------------------------------------------------------
             * STATE / REFERENCES: ENTRY
             * Defines entry for the surrounding section.
             * ------------------------------------------------------------------- */
            const entry = entriesById.get(widget.id);
            if (entry) applyGeometry(widget, entry, true);
            if (entry?.visible) localStorage.removeItem(`hub-${widget.id}-minimized`);
            else localStorage.setItem(`hub-${widget.id}-minimized`, 'true');
          });
          applyStack(entries, liveById, true);
          persistWidgetIds();
          state.activeId = layout.id;
          state.dirty = false;
          writeStore();
        } catch (error) {
          status('The layout could not be applied safely.', 'warning');
          return false;
        } finally {
          manipulatingWidget = false;
          applying = false;
        }
        updateMinimizedTray();
        invalidateSnapGeometry();
        evaluateHubLayoutPolicy(true);
        currentWidgets().forEach(queueResponsiveState);
        render();
        status(missingCount ? `${layout.name} activated · ${missingCount} deleted widget skipped.` : `${layout.name} activated.`, missingCount ? 'warning' : 'success');
        document.dispatchEvent(new CustomEvent('hubsavedlayoutschange', { detail: { action: 'activate', id: layout.id, missingCount } }));
        return true;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: RENAME
       * Implementation of rename. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function rename(id) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LAYOUT
         * Defines layout for the surrounding section.
         * ------------------------------------------------------------------- */
        const layout = state.layouts.find(item => item.id === id);
        if (!layout) return false;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: NAME
         * Defines name for the surrounding section.
         * ------------------------------------------------------------------- */
        const name = prompt('Rename layout', layout.name);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: RESOLVED
         * Defines resolved for the surrounding section.
         * ------------------------------------------------------------------- */
        const resolved = cleanText(name).slice(0, 40);
        if (!resolved) return false;
        layout.name = resolved;
        layout.updatedAt = new Date().toISOString();
        writeStore();
        render();
        status(`${layout.name} renamed.`, 'success');
        document.dispatchEvent(new CustomEvent('hubsavedlayoutschange', { detail: { action: 'rename', id } }));
        return true;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: REMOVE
       * Implementation of remove. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function remove(id) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: LAYOUT
         * Defines layout for the surrounding section.
         * ------------------------------------------------------------------- */
        const layout = state.layouts.find(item => item.id === id);
        if (!layout || !confirm(`Delete "${layout.name}"?`)) return false;
        state.layouts = state.layouts.filter(item => item.id !== id);
        if (state.activeId === id) {
          state.activeId = null;
          state.dirty = false;
        }
        writeStore();
        render();
        status(`${layout.name} deleted.`, 'success');
        document.dispatchEvent(new CustomEvent('hubsavedlayoutschange', { detail: { action: 'delete', id } }));
        return true;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: MARK DIRTY
       * Implementation of mark Dirty. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function markDirty() {
        if (!ready || applying || !state.activeId || state.dirty) return;
        state.dirty = true;
        writeStore();
        render();
        status('Active layout modified · save explicitly to keep this arrangement.', 'warning');
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: THUMBNAIL MARKUP
       * Implementation of thumbnail Markup. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function thumbnailMarkup(layout) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VIEWPORT
         * Defines viewport for the surrounding section.
         * ------------------------------------------------------------------- */
        const viewport = layout.viewport || { width: 1280, height: 800 };
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: WIDGETS
         * Defines widgets for the surrounding section.
         * ------------------------------------------------------------------- */
        const widgets = widgetEntries(layout).filter(entry => entry.visible).map(entry => {
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: LEFT
           * Defines left for the surrounding section.
           * ------------------------------------------------------------------- */
          const left = viewport.width / 2 + entry.x - entry.width / 2;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: TOP
           * Defines top for the surrounding section.
           * ------------------------------------------------------------------- */
          const top = viewport.height / 2 + entry.y - entry.height / 2;
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: X
           * Defines x for the surrounding section.
           * ------------------------------------------------------------------- */
          const x = Math.max(0, Math.min(98, left / viewport.width * 100));
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: Y
           * Defines y for the surrounding section.
           * ------------------------------------------------------------------- */
          const y = Math.max(0, Math.min(98, top / viewport.height * 100));
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: WIDTH
           * Defines width for the surrounding section.
           * ------------------------------------------------------------------- */
          const width = Math.max(3, Math.min(100 - x, entry.width / viewport.width * 100));
          /* HUB GUIDE ---------------------------------------------------------
           * STATE / REFERENCES: HEIGHT
           * Defines height for the surrounding section.
           * ------------------------------------------------------------------- */
          const height = Math.max(3, Math.min(100 - y, entry.height / viewport.height * 100));
          return `<i class="layout-thumb-widget" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%;width:${width.toFixed(2)}%;height:${height.toFixed(2)}%"></i>`;
        }).join('');
        return `<div class="layout-thumbnail" aria-hidden="true">${widgets}</div>`;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: CARD MARKUP
       * Implementation of card Markup. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function cardMarkup(layout) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ACTIVE
         * Defines active for the surrounding section.
         * ------------------------------------------------------------------- */
        const active = layout.id === state.activeId;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MODIFIED
         * Defines modified for the surrounding section.
         * ------------------------------------------------------------------- */
        const modified = active && state.dirty;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ENTRIES
         * Defines entries for the surrounding section.
         * ------------------------------------------------------------------- */
        const entries = widgetEntries(layout);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: VISIBLE COUNT
         * Defines visible Count for the surrounding section.
         * ------------------------------------------------------------------- */
        const visibleCount = entries.filter(entry => entry.visible).length;
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: STATE LABEL
         * Defines state Label for the surrounding section.
         * ------------------------------------------------------------------- */
        const stateLabel = modified ? '<span class="layout-modified-badge">Modified</span>' : active ? 'Active' : 'Saved';
        return `<div class="layout-card${active ? ' active' : ''}" role="button" tabindex="0" data-layout-activate="${escapeHTML(layout.id)}" aria-label="Activate ${escapeHTML(layout.name)}">
          ${thumbnailMarkup(layout)}
          <div class="layout-card-copy"><strong>${escapeHTML(layout.name)}</strong><small>${visibleCount} visible · ${entries.length} total · ${stateLabel}</small></div>
          <div class="layout-card-actions">
            <button class="layout-card-action activate" type="button">Activate</button>
            <button class="layout-card-action" type="button" data-layout-rename="${escapeHTML(layout.id)}">Rename</button>
            <button class="layout-card-action" type="button" data-layout-delete="${escapeHTML(layout.id)}">Delete</button>
          </div>
        </div>`;
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: BIND LIBRARY
       * Implementation of bind Library. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function bindLibrary(container) {
        if (!container) return;
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * container.querySelectorAll('[data-layout-activate]').forEach(card  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        container.querySelectorAll('[data-layout-activate]').forEach(card => {
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * card.onclick = event  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          card.onclick = event => {
            if (event.target.closest('[data-layout-rename],[data-layout-delete]')) return;
            activate(card.dataset.layoutActivate);
          };
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * card.onkeydown = event  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          card.onkeydown = event => {
            if ((event.key === 'Enter' || event.key === ' ') && !event.target.closest('button')) {
              event.preventDefault();
              activate(card.dataset.layoutActivate);
            }
          };
        });
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * container.querySelectorAll('[data-layout-rename]').forEach(button  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        container.querySelectorAll('[data-layout-rename]').forEach(button => {
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * button.onclick = event  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          button.onclick = event => { event.stopPropagation(); rename(button.dataset.layoutRename); };
        });
        /* HUB GUIDE ---------------------------------------------------------
         * EVENT BINDING
         * container.querySelectorAll('[data-layout-delete]').forEach(button  — connects the control or lifecycle event to its handler.
         * ------------------------------------------------------------------- */
        container.querySelectorAll('[data-layout-delete]').forEach(button => {
          /* HUB GUIDE ---------------------------------------------------------
           * EVENT BINDING
           * button.onclick = event  — connects the control or lifecycle event to its handler.
           * ------------------------------------------------------------------- */
          button.onclick = event => { event.stopPropagation(); remove(button.dataset.layoutDelete); };
        });
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: RENDER
       * Implementation of render. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function render() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MARKUP
         * Defines markup for the surrounding section.
         * ------------------------------------------------------------------- */
        const markup = state.layouts.length
          ? state.layouts.map(cardMarkup).join('')
          : '<div class="layout-custom-empty">No saved layouts yet.<br>Arrange your widgets, then save the current layout.</div>';
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MANAGER LIBRARY
         * Defines manager Library for the surrounding section.
         * ------------------------------------------------------------------- */
        const managerLibrary = $('customLayoutLibrary');
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: MENU LIBRARY
         * Defines menu Library for the surrounding section.
         * ------------------------------------------------------------------- */
        const menuLibrary = $('layoutMenuLibrary');
        if (managerLibrary) managerLibrary.innerHTML = markup;
        if (menuLibrary) menuLibrary.innerHTML = markup;
        bindLibrary(managerLibrary);
        bindLibrary(menuLibrary);
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: ACTIVE
         * Defines active for the surrounding section.
         * ------------------------------------------------------------------- */
        const active = state.layouts.find(layout => layout.id === state.activeId);
        if ($('layoutManagerCount')) $('layoutManagerCount').textContent = `${state.layouts.length} saved`;
        if ($('layoutMenuState')) $('layoutMenuState').textContent = active ? `${active.name}${state.dirty ? ' · Modified' : ''}` : 'None active';
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: OPEN
       * Implementation of open. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function open({ focusName = false } = {}) {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: EDITOR
         * Defines editor for the surrounding section.
         * ------------------------------------------------------------------- */
        const editor = $('layoutEditor');
        editor.classList.add('open');
        editor.setAttribute('aria-hidden', 'false');
        render();
        if (focusName) requestAnimationFrame(() => $('layoutNameInput')?.focus());
      }

      /* HUB GUIDE ---------------------------------------------------------
       * FUNCTION: CLOSE
       * Implementation of close. Calls and local helpers below belong to this operation.
       * ------------------------------------------------------------------- */
      function close() {
        /* HUB GUIDE ---------------------------------------------------------
         * STATE / REFERENCES: EDITOR
         * Defines editor for the surrounding section.
         * ------------------------------------------------------------------- */
        const editor = $('layoutEditor');
        editor.classList.remove('open');
        editor.setAttribute('aria-hidden', 'true');
      }

      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * $('openLayoutEditor').onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      $('openLayoutEditor').onclick = () => open();
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * $('saveCurrentLayout').onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      $('saveCurrentLayout').onclick = () => open({ focusName: true });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * $('closeLayoutEditor').onclick = close; — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      $('closeLayoutEditor').onclick = close;
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * $('saveCustomLayout').onclick = ()  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      $('saveCustomLayout').onclick = () => save($('layoutNameInput').value);
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * $('layoutNameInput').addEventListener('keydown', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      $('layoutNameInput').addEventListener('keydown', event => {
        if (event.key === 'Enter') save(event.currentTarget.value);
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * $('layoutEditor').addEventListener('pointerdown', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      $('layoutEditor').addEventListener('pointerdown', event => {
        if (event.target === $('layoutEditor')) close();
      });
      /* HUB GUIDE ---------------------------------------------------------
       * EVENT BINDING
       * addEventListener('keydown', event  — connects the control or lifecycle event to its handler.
       * ------------------------------------------------------------------- */
      addEventListener('keydown', event => {
        if (event.key === 'Escape' && $('layoutEditor').classList.contains('open')) close();
      });

      return {
        capture,
        save,
        activate,
        rename,
        delete: remove,
        markDirty,
        render,
        open,
        close,
        /* HUB GUIDE ---------------------------------------------------------
         * METHOD: READY
         * Behavior for this entry in the surrounding registry or service.
         * ------------------------------------------------------------------- */
        ready() {
          ready = true;
          state = readStore();
          render();
        },
        storageKey: STORAGE_KEY
      };
    })();

    /* HUB GUIDE ---------------------------------------------------------
     * EVENT BINDING
     * document.querySelectorAll('[data-layout-mode]').forEach(button  — connects the control or lifecycle event to its handler.
     * ------------------------------------------------------------------- */
    document.querySelectorAll('[data-layout-mode]').forEach(button => button.onclick = () => setLayoutMode(button.dataset.layoutMode));
    setLayoutMode(activeLayoutMode, false);
    function syncAlignmentOptions(){
      $('snapToGrid').checked=snapToGridEnabled;
      $('showGuidelines').checked=guidelinesEnabled;
      hideSnapGuides(); invalidateSnapGeometry();
    }
    $('snapToGrid').onchange=event=>{snapToGridEnabled=event.target.checked;localStorage.setItem('hub-snap-to-grid',String(snapToGridEnabled));syncAlignmentOptions();};
    $('showGuidelines').onchange=event=>{guidelinesEnabled=event.target.checked;localStorage.setItem('hub-guidelines',String(guidelinesEnabled));syncAlignmentOptions();};
    syncAlignmentOptions();
