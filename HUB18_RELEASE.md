# Hub 18 deployment milestone

Source: `PROJECT4 - Hub/HUB_MAIN_BRANCH - 18.0 - BUSINESS CENTER/HUB_18.0` in Alex's existing Google Drive project.

The `/apps/hubbahub/` package copies the existing Hub HTML as `index.html`, the generated `hub.js`, runtime CSS/business scripts/native finance scripts, and supplied widget images. Original source filenames and contents in Drive are unchanged. Edit modular sources there and rebuild before the next release; do not patch generated `hub.js`.

Excluded: SQL/migrations, audit material, development notes, tests, transfer tools, and legacy finance implementation. No browser records, sessions, photos, or appearance settings are migrated by deployment. Existing cloud configuration is preserved; no database changes are included.

Validation: JavaScript syntax checks and local subpath startup; Business Center and Financial Dashboard opened successfully without sign-in. This is a packaging milestone, not completion of unfinished CRM workflows or a data migration.

The TAGIMS + Hub integration sandbox remains a separate milestone. The production homepage, TAGiM, TANK and photo publishing system are unchanged by this release.
