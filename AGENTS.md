# TAGIMS.com Agent Instructions
Status: Active control-plane rules

## 1. Project identity
- Public website: **TAGIMS.com**
- Repository: `TAGIMS/tagims-site`
- Production domain: `tagims.com`
- Production hosting: Cloudflare Pages
- Default branch: `main`
- Architecture preference: static HTML/CSS/JavaScript; do not introduce a framework without a compelling approved reason.

This repository is separate from `TAGIMS/TAGiM`, which serves the TAGiM application at `app.tagims.com`. Do not merge their deployment or repository responsibilities.

## 2. Owner workflow commands — mandatory
Before handling an owner workflow command, read and follow `WORKFLOW_COMMAND_PROMPT.md`.

Commands defined there are mandatory operating protocols, not conversational suggestions.

The canonical workflow command set includes project lifecycle, orchestration, review/approval, multi-project routing, work-mode, CHEATSHEET, workflow-administration commands, and the persistent `WORKFLOW MODE` / `EXIT WORKFLOW` execution-state commands. `WCPADD <request>` is the only command for adding or revising workflow commands; it must update the canonical workflow file and propagate only to materially affected control-plane files/projects.

`WORKFLOW MODE` activates persistent structured workflow execution and remains active until `EXIT WORKFLOW` is explicitly issued. `QUESTION` and `CONVO` temporarily freeze execution without disabling workflow mode. `EXIT WORKFLOW` returns to ordinary ad hoc interaction without changing the underlying task/project state.

`BRIEF` is the start-of-session recap command. `CLOSE` is the end-of-session synchronization command. `RESUME` must always recover authoritative project state before proceeding and all workflow responses must follow the mandatory `TASK ID / OBJECTIVE / ALEX ACTION` handoff footer defined in `WORKFLOW_COMMAND_PROMPT.md`.

## 3. Source-of-truth precedence
1. Actual authoritative Git/deployment state
2. `CURRENT_STATE.md` when present
3. `AGENTS.md`
4. `WORKFLOW_COMMAND_PROMPT.md`
5. Explicit active task contract
6. Supporting project documentation
7. Historical conversation/checkpoints

If these conflict, stop and reconcile state before implementation.

## 4. Operating principles
- Refactor cleanly instead of stacking monkey patches or repeated CSS override layers.
- Preserve the established dark futuristic TAGIMS identity unless an explicit redesign is approved.
- Preserve Operational Leakage and LAND → MEASURE → EXPAND positioning.
- Preserve audit scoring mechanics unless a specific bug or approved business-logic change is identified.
- Do not invent testimonials, metrics, partnerships, certifications, case studies, or business claims.
- Keep TAGIMS.com and TAGiM application infrastructure separate.
- Use a focused branch/PR for substantive website refinement unless explicitly authorized otherwise.
- Do not merge without owner authorization when the active task requires review/approval.

## 5. Deployment boundaries
Target website architecture:

`TAGIMS/tagims-site main → Cloudflare Pages → tagims.com`

`TAGIMS/TAGiM → Vercel → app.tagims.com` remains separate and out of scope unless explicitly assigned.

Do not modify `www.tagims.com`, Squarespace legacy records, or unrelated DNS during website work unless explicitly included in the task contract.

## 6. Task execution
Every implementation task should define:
- Task ID
- objective
- exact starting state/branch/SHA when relevant
- allowed scope
- locked invariants
- validation requirements
- stop condition
- owner handoff

Diagnose before editing when root cause is uncertain. Do not expand scope without authorization.

## 7. Completion
A task is COMPLETE only when the stated objective is actually achieved. Implementation, merge, deployment, and acceptance are distinct states unless the objective explicitly combines them.

Always follow the mandatory workflow footer defined in `WORKFLOW_COMMAND_PROMPT.md`.