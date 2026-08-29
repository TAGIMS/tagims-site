# TAGIMS.com Agent Instructions
Status: Active control-plane rules

## 1. Project identity
- Public website: **TAGIMS.com**
- Repository: `TAGIMS/tagims-site`
- Production domain: `tagims.com`
- Production hosting: Cloudflare Pages
- Default branch: `main`
- Architecture preference: static HTML/CSS/JavaScript unless explicitly approved otherwise.

This repository is separate from `TAGIMS/TAGiM`. Do not silently merge deployment or repository responsibilities.

## 2. Formal roles and workflow
Formal roles are ORCHESTRATOR, WORKER, REVIEWER, and NOTE TAKER. Alex is human authorization authority, not an agent role. RELAY, AUDIT, and Task State Store are deterministic infrastructure.

Primary workflow activation:
- `WORKFLOW MANUAL`
- `WORKFLOW RELAY`

`REFRESH WORKFLOW` reloads current WCP/control files without advancing work. `CLOSE`, `CLOSE WORKFLOW`, and `EXIT WORKFLOW` reconcile durable state before exit.

Temporary migration aliases and all canonical commands are defined only in `WORKFLOW_COMMAND_PROMPT.md`. ROUTE/HANDOFF and MOBILE/OFFICE MODE are not workflow commands.

Before workflow work, read `WORKFLOW_COMMAND_PROMPT.md` and the current project state projection.

## 3. Authority boundaries
Only ORC may create/resize/rescope tasks, assign actors, issue/change routing contracts, set review requirements, or authorize continuation after failed checksum.

Workers execute only assigned contracts and stop at scope/timebox/checksum gates. REVIEWER independently evaluates completed work. NOTE TAKER only captures owner notes under the WCP note grammar.

Task State Store is authoritative for mutable workflow execution. `CURRENT_STATE.md` is the durable human-readable projection during active execution.

## 4. Relay / audit
Authoritative inter-agent transfers follow the ORC-issued immutable routing contract and RELAY validation. RELAY never infers scope, review requirements, actor selection, or semantic correctness.

`NEXT ACTOR` is service-derived from the routing contract. RELAY transport facts use SERVICE_OBSERVED provenance; actor lifecycle/result claims use ACTOR_ASSERTED provenance in AUDIT.

## 5. Mandatory task controls
Every substantive worker task requires Task ID, objective, exact starting state/branch/SHA when relevant, TASK SIZE, ETA, SCOPE CEILING, ATTEMPT LIMIT, CHECKSUM TRIGGER, allowed paths/systems, locked invariants, validation, transport/publication requirements, and literal stop condition.

At checksum expiration Worker stops. Discovering a new problem is not authorization to fix it.

## 6. Source-of-truth precedence
1. actual authoritative Git/deployment state
2. Task State Store when active
3. `CURRENT_STATE.md` projection when present
4. role-specific control instructions
5. this `AGENTS.md`
6. `WORKFLOW_COMMAND_PROMPT.md`
7. explicit active task contract
8. supporting docs
9. historical conversation/checkpoints

## 7. Operating principles
- Build the smallest complete vertical slice.
- Diagnose before editing when root cause is uncertain.
- Do not modify unrelated systems.
- Preserve accepted visual/business baselines unless explicitly unlocked.
- Do not invent business claims.
- Use focused branches/PRs for substantive website work unless explicitly authorized otherwise.
- Do not merge without authorization when review/approval is required.

## 8. Deployment boundaries
Expected architecture: `TAGIMS/tagims-site main → Cloudflare Pages → tagims.com`.

TAGiM application infrastructure is separate unless explicitly included in task scope. Do not modify DNS, Vercel, or unrelated infrastructure merely because a website task encounters a routing problem; stop and escalate.

## 9. Copy / completion rules
Any payload Alex must manually transfer must be inside a fenced code block.

A Worker completion requiring review moves the TASK to `REVIEW PENDING`, not terminal COMPLETE. The canonical WCP footer includes Task ID/state, completion/end timestamp, duration, objective, factual TASK RESULT, service-derived NEXT ACTOR, and ALEX ACTION as the final line.
