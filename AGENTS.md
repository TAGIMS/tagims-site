# TAGIMS.com Agent Instructions
Status: Active control-plane rules

## 1. Project identity
- Public website: **TAGIMS.com**
- Repository: `TAGIMS/tagims-site`
- Production domain: `tagims.com`
- Production hosting: Cloudflare Pages
- Default branch: `main`
- Architecture preference: static HTML/CSS/JavaScript unless explicitly approved otherwise.

This repository is separate from `TAGIMS/TAGiM`, which serves the TAGiM application. Do not silently merge their deployment or repository responsibilities.

## 2. Agent role and workflow commands
Default agent role is **WORKER**.

- `ORCHESTRATOR MODE` explicitly designates the current agent as ORCHESTRATOR.
- `WORKER MODE` = `WORK MODE`.
- `WORKFLOW MODE` = `WORKFLOW START` and does not assign orchestrator authority.
- `RESUME` = `CONTINUE` = `PROCEED`.
- `CLOSE` = `CLOSE WORKFLOW` = `EXIT WORKFLOW`; all must save/reconcile durable state before leaving Workflow Mode.
- `WCPADD <request>` updates the workflow command protocol and propagates it unless explicitly told not to.
- `PROPAGATE` means `PROPAGATE WCP` after a workflow-command change.

Before handling workflow commands, read `WORKFLOW_COMMAND_PROMPT.md`.

`QUESTION` and `CONVO` temporarily freeze execution without changing role or leaving Workflow Mode.

## 3. Orchestrator vs worker authority
Only an explicitly designated ORCHESTRATOR may:
- assign/reassign workers
- size tasks
- set/renew timeboxes
- define/expand scope ceilings
- split tasks
- authorize continuation after checksum
- change execution priority

Workers execute only their assigned contract and must stop at scope/timebox gates.

## 4. Mandatory task controls
Every substantive worker task requires:
- Task ID
- one objective
- exact starting state/branch/SHA when relevant
- TASK SIZE
- TIMEBOX
- SCOPE CEILING
- ATTEMPT LIMIT (default 2)
- CHECKSUM TRIGGER
- allowed paths/systems
- locked invariants
- validation
- transport/publication mode
- literal stop condition

Default timeboxes:
- TINY 5m
- SMALL 10m
- MEDIUM 20m
- LARGE 30m

At expiration, WORKER stops for the mandatory scope checksum. A worker may not self-renew the timebox.

**Discovering a new problem is not authorization to fix it.**

If a task hits infrastructure, architecture, deployment, auth, DNS, database, security, billing, or another system outside its SCOPE CEILING, STOP and escalate instead of expanding scope.

## 5. Source-of-truth precedence
1. actual authoritative Git/deployment state
2. `CURRENT_STATE.md` when present
3. role-specific control instructions
4. this `AGENTS.md`
5. `WORKFLOW_COMMAND_PROMPT.md`
6. explicit active task contract
7. supporting docs
8. historical conversation/checkpoints

## 6. Operating principles
- Build the smallest complete vertical slice.
- Diagnose before editing when root cause is uncertain.
- Refactor cleanly instead of stacking monkey patches.
- Do not modify unrelated systems.
- Preserve accepted visual/business baselines unless explicitly unlocked.
- Do not invent testimonials, metrics, partnerships, certifications, case studies, or business claims.
- Use focused branches/PRs for substantive website work unless explicitly authorized otherwise.
- Do not merge without authorization when review/approval is required.

## 7. Deployment boundaries
Expected website architecture:

`TAGIMS/tagims-site main → Cloudflare Pages → tagims.com`

TAGiM application infrastructure remains a separate system unless explicitly included in the active task's SCOPE CEILING.

Do not modify DNS, legacy records, Vercel, or unrelated deployment infrastructure merely because a website task encounters a routing problem. Stop and escalate first.

## 8. Copy/handoff rules
Any payload Alex must copy/paste/forward between GPT/Codex/agent windows must be inside a fenced code block. Large transfers must be split into numbered screen-sized blocks.

## 9. Completion semantics
A task is COMPLETE only when the stated objective is actually achieved. Implementation, merge, deployment, and acceptance remain distinct unless the task contract explicitly combines them.

Every workflow production task must use the mandatory task header/footer defined in `WORKFLOW_COMMAND_PROMPT.md`, including `TASK ID` + `STARTED` in the header and `TASK ID` + `COMPLETED/ENDED` + `TASK DURATION` + `OBJECTIVE` + `TASK RESULT` + `ALEX ACTION` in the footer.
