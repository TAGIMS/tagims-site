# TAGIMS apps — Hub interface MVP

Canonical pages: `/apps`, `/apps/photo-center`, `/apps/estimates`, `/apps/crm`.
User direction: independent app pages with the actual Hub as their shared interface. The plural `/apps/estimates` URL remains canonical.

## Reused foundations

- Hub: latest inspected `HUB_BRANCH - 16.0 SYNTHESIZED/HUB_16.0`, modified September 9, 2026. Original source compartments, settings, theme controls, window manager, resize/drag/focus/minimize, and saved layouts imported into `apps/_hub`. Original Drive release unchanged. Finance records and finance dashboard code are not copied into the employee pages.
- Estimating: September 10 Author / Inspector / Reviewer prompts in `PROJECT3 - Estimates`. Preserve separate contractor/client copies, explicit scope confirmation, Alex's correction approvals, final client review, and no automatic client sending. This MVP records manual workflow stages; it does not claim to generate those PDFs or perform AI reviews.
- Photo proof of concept: `3_BIZ - PcolaHome LLC/8. WEBSITE/PHOTO MANAGEMENT SITE`. Its project IDs, photo IDs, original blobs, stage labels, and `phr-photos-v1` backup format have an explicit importer. Import is atomic into the local demo, collisions abort, and public approvals require fresh review.
- CRM: [existing architecture](https://docs.google.com/document/d/1tEKYkz7BAz23oLVVIZgGGqBtdUVCXmAt/edit), centered on shared client/project identity, visible next action, role-based access, and recorded workflow changes. Configurable stage boards and automated scheduling remain later increments.
- Backend: existing Hub Financials Supabase project `pqaucwuuegebngkrybbx`. Optional `ops_projects.fin_project_id` links to the existing owner-protected financial project. No financial records/policies were modified.

## Implemented

All four pages use one generated Hub runtime. App layouts are namespaced as `tagims:hub:<page>:v1:`. Local demo records use one IndexedDB store across pages. Main Hub settings and data keys are untouched.

Native widgets: app launcher; clients/projects; project contact/team assignment; walkthrough notes; materials/punch/tools/supplies/timeline/document links; photo upload/camera picker; photo library; website approval/export; estimate author; manual Inspector/Reviewer workflow.

Shared mode uses Supabase password sign-in, access-token refresh, relational records, private Storage, and server-checked permissions. No service-role key or new account is provisioned. Staff accounts must already exist before owner assignment. Owner links to finance are represented in the schema; no automatic name-based financial merge occurs.

Photos support JPEG, PNG, WebP up to 20 MB for new uploads. Metadata save follows object upload, with orphan cleanup on failure. Server failures remain visible. No silent fallback from shared storage to local mode. Camera behavior on an actual iPhone and interrupted-network/resumable upload remain unverified.

Only the owner can approve website use. The export takes approved photos only, resizes to at most 1600px, re-encodes as JPEG to strip original metadata, and requests public title/city explicitly. It produces a self-contained HTML gallery. It does not publish to WordPress/PColaHome; revocation cannot remove previously exported copies.

Estimate drafts accept TBD price/quantity, calculate cents consistently, require confirmed scope/client/address and priced items before review, block direct status changes, freeze reviewed items, and create a new version for revisions. Manual clearance is an owner action with an audit event. The widgets do not send estimates or record customer acceptance automatically.

## Backend changes actually applied

1. `operations_mvp` — initial tables (earlier in this task).
2. `operations_access_and_workflow` — corrected role policies, actor/workflow guards, narrow private helper functions, contact projection, review/approval commands, staff assignment, private photo bucket.
3. `operations_next_action` — visible next action and due date, project change audit events.

SQL files in `database` document applied changes; do not rerun them as setup. `database/test-operations.sql` is a rollback-only check with temporary test users/records. Run security advisors after database changes. The only reported security advisory was the existing disabled leaked-password protection setting; no auth plan or billing settings were changed.

## Build and test

`node tools/build-operations.cjs` rebuilds the shared runtime and the four pages. Edit the source compartments rather than generated `hub.js` or generated page HTML. `tools/import-hub.cjs` is a one-time import helper, not part of the routine build: rerunning it would replace the adapted compartments.

`node --test worker/test/routing.test.js` checks existing and new routes. `node tools/test-operations.cjs` uses Playwright and installed Edge for end-to-end local-mode testing; screenshots go to ignored `test-results`. The browser test covers native Hub startup, client/project/note/field workflows, estimate review, photo persistence and approval/revocation, and per-app layout storage. Database tests prove owner/field/viewer/outsider isolation and review/approval restrictions. Real-account browser sign-in and multi-device operation have not been performed on Alex's behalf.

## Deployment and next work

Development branch is `codex/operations-app-pages`, based on site main `5dcdd78`. The Pages app assets and the fronting Worker's route allowlist are separate deployment pieces; both must be reviewed for live domain routing. No DNS, production merge, billing, or unrelated TAGiM app changes are part of this branch.

Before live use: validate a real staff sign-in, add employee accounts through the established account process, confirm device upload behavior, and review the public website destination. No automated publication is enabled.

Next estimating increment: implement the approved document template and synchronized contractor/client artifacts, payment schedules, materials/cost inputs, timeline, and exact correction approvals. AI consumes recorded photo evidence and proposes scope; it must not infer hidden conditions or final dimensions as facts. Store prompt version/provenance and approval outcomes. Gmail/Calendar connect through server-side OAuth adapters with narrowly scoped credentials; SSO should reuse a supported identity flow after explicit cost review if needed.

Financial authority: only Alex may approve a financial commitment after discussion. Generic task approval and tool permissions do not authorize purchases, plan changes, paid features, renewals/top-ups, or billing changes. Stop and discuss any specific financial step before proceeding.
