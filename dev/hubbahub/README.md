# TAGIMS + Hub 18 design sandbox

Public path: `/dev/hubbahub/`. No old scripted demo, tour, games or adapter is retained.

- `index.html`: website header and real Hub iframe.
- `site.css`: website shell only; Hub CSS remains owned by `/apps/hubbahub/`.
- `workspace-storage.js`: separates localStorage, sessionStorage and IndexedDB names from the live Hub. This is convenience isolation, not an authentication/security boundary. Explicit cloud sign-in accesses real shared records.
- `build-runtime.cjs`: generates `hub-runtime.html` from the released Hub markup. Run after changing its HTML; the runtime scripts and CSS are reused directly without duplicated widget code.

The original Google Drive Hub and historical website demo are unchanged. No database migration or browser-data transfer is performed.
