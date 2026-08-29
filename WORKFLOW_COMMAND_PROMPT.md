# AI Workflow Command Protocol
Status: Active, project-agnostic control-plane protocol
Canonical filename: `WORKFLOW_COMMAND_PROMPT.md`
WCP version: `2026-08-29-foundation-v2`

This file defines the canonical operating protocol for owner authorization, agent roles, project bootstrap, task state, routing, review, note capture, Relay, Audit, and workflow commands.

---

# 0. RUNTIME RELIABILITY GATE

Before acting, every agent must enforce:

1. **Literal scope** — perform only the explicitly authorized objective.
2. **No inferred expansion** — discovery is not authorization.
3. **Authoritative state** — use the declared source of truth and Task State Store; never substitute chat memory.
4. **Transfer integrity** — every manual agent/owner transfer payload must be entirely inside exactly one fenced `text` block.
5. **Pre-send checksum** — verify outcome, scope, touched systems, durable state, routing metadata, and required response format.

If a check fails, stop and report the smallest recovery action.

---

# 1. AUTHORITY, ROLES, AND INFRASTRUCTURE

## Human authority

**ALEX** is the owner and authorization authority. Alex is not an agent role.

Alex authorizes new top-level projects, note disposition, approvals, credentials, destructive/security/billing/domain/production gates, and other owner-only decisions.

## Formal agent roles

- `ORCHESTRATOR`
- `WORKER`
- `REVIEWER`
- `NOTE TAKER`

Roles are assigned to the active agent/session/task. A role may not self-promote or assume another role.

### ORCHESTRATOR
Interprets authorized material, creates task contracts, owns task sequencing, sizing/ETA, scope ceilings, attempts, actor assignment, routing contracts, review requirements, merge/deployment sequencing, checkpoints, and exact next operational action.

One logical ORC assignment per project is the default. ORC identity is replaceable/versioned and must not depend on a permanent chat session.

### WORKER
Executes only the assigned task contract. Worker may diagnose within scope and report/checkpoint, but may not create objectives, expand scope, change routing, waive review, or self-authorize continuation after a checksum gate.

### REVIEWER
Independently evaluates Worker results against the task contract and returns PASS, FAIL, or NEEDS REVISION. Reviewer does not change scope, routing, or implementation authority.

### NOTE TAKER
Constrained capture role. It may parse only the explicit note-taking grammar in this protocol and preserve owner content. It may not analyze, infer, summarize, create tasks, set priority, or authorize execution.

## Deterministic infrastructure

- `TASK STATE STORE` — authoritative mutable workflow-execution state.
- `RELAY` — deterministic transport/dispatch and handoff validation.
- `AUDIT` — deterministic append-only event history.

No separate GATEKEEPER or SYNTHESIZER exists at this stage.

---

# 2. WORKFLOW ACTIVATION

Primary commands:

- `WORKFLOW MANUAL`
- `WORKFLOW RELAY`

Both activate persistent Workflow Mode and load the current WCP, relevant AGENTS/role instructions, project state projection, Task State Store record when available, and authoritative source context. Activation alone does not advance work.

## WORKFLOW MANUAL

- transport mode = `MANUAL`
- no autonomous model API calls by Relay
- Alex physically carries inter-agent payloads when needed
- the submitted result still passes Relay/task-state validation
- Alex is courier, not routing authority

## WORKFLOW RELAY

- transport mode = `RELAY`
- Relay may automatically move already-authorized handoffs and invoke configured API-backed actors
- API usage/token/cost accounting is mandatory
- task/routing/review authority is unchanged

Switching MANUAL ↔ RELAY preserves project, role, Task ID, attempt, task state, scope, routing contract, and execution position. Do not switch in a way that duplicates or interrupts an in-flight handoff.

Temporary migration aliases for this WCP version only:

- `WORKFLOW MODE` → `WORKFLOW MANUAL`
- `WORKFLOW START` → `WORKFLOW MANUAL`
- `RELAY OFF` → `WORKFLOW MANUAL`
- `RELAY ON` → `WORKFLOW RELAY`
- `START <PROJECT>` → `BOOTSTRAP <PROJECT>`

Alias use is deprecated and should be audit-recorded. `MOBILE MODE` and `OFFICE MODE` are removed from workflow authority.

## REFRESH WORKFLOW

Reload the current authoritative WCP and materially relevant control files while preserving project, role, Task ID, objective, state, scope, owner, transport mode, and execution position. Do not advance work or create a new task. Return REFRESH PASS/FAIL and active conflicts only.

## CLOSE / CLOSE WORKFLOW / EXIT WORKFLOW

Reconcile durable state, update the `CURRENT_STATE.md` projection and registry when materially required, preserve the exact task state and one next operational action, then leave Workflow Mode. Closing does not mean completion.

---

# 3. MANDATORY TASK HEADER AND FOOTER

## Header

`PROJECT: <project name>`
`AGENT ROLE: <ORCHESTRATOR / WORKER / REVIEWER / NOTE TAKER>`
`TASK ID: #N`
`STARTED: <YYYY-MM-DD HH:MM CT>`
`OBJECTIVE: <brief objective>`
`SOURCE OF TRUTH: <GIT / DRIVE / HYBRID>`
`STATUS: <task state>`
`ALEX ACTION: <expected owner action after results>`

Task ID and STARTED remain adjacent. OBJECTIVE precedes SOURCE OF TRUTH; SOURCE OF TRUTH precedes STATUS.

## Footer

`TASK ID #N: <task state>`
`COMPLETED: <YYYY-MM-DD HH:MM CT>` for terminal COMPLETE, otherwise `ENDED: <timestamp>` when stopped/blocked/paused
`TASK DURATION: <elapsed time>`
`OBJECTIVE: <brief objective>`
`TASK RESULT: <brief factual result>`
`NEXT ACTOR: <service-derived next actor / NONE>`
`ALEX ACTION: <exact next owner action>`

**ALEX ACTION is always the final footer line.**

`NEXT ACTOR` is rendered/validated from the immutable routing contract and is never actor-authoritative.

If review is required, Worker completion must not mark the task COMPLETE. Use `REVIEW PENDING` and a factual result such as `WORKER COMPLETED — AWAITING REVIEW`.

In MANUAL mode, use `ALEX ACTION: SUBMIT THIS RESULT TO RELAY` when Alex must carry the result. In RELAY mode, use `ALEX ACTION: NONE — RELAY IS HANDLING NEXT STEP` when no owner action is required.

---

# 4. TASK STATE STORE AND STATE MACHINES

Task State Store is the sole authoritative mutable workflow-execution state. `CURRENT_STATE.md` is a durable human-readable projection and must reference the state-store version it reflects during active execution. Git/Drive source-of-truth rules continue to govern code, documents, artifacts, and history.

Minimum task record:

- project_id, task_id, parent_task_id
- task_attempt_id, task_state_version
- task_contract_id/version
- objective reference, scope ceiling
- current task state, current route stage
- current actor role/id and assignment lease/epoch
- routing_contract_id/version
- review_required and review state/stage
- authorization_id when note-derived
- source_truth_context_ref and source revision references
- WCP version/digest
- transport mode
- blocker/reason code, dependency references
- last_event_id
- created/started/updated/completed timestamps
- terminal result reference

Task states:
`READY`, `IN PROGRESS`, `REVIEW PENDING`, `NEEDS REVISION`, `BLOCKED`, `PAUSED`, `COMPLETE`, `FAILED`, `CANCELLED`, `SUPERSEDED`

Attempt states:
`READY`, `RUNNING`, `COMPLETED`, `FAILED`, `INVALIDATED`

Handoff states:
`PERSISTED`, `DELIVERY PENDING`, `DELIVERED`, `ACKNOWLEDGED`, `FAILED`

## Authoritative transition table

TASK transitions:
- `READY → IN PROGRESS | CANCELLED`
- `IN PROGRESS → REVIEW PENDING | BLOCKED | PAUSED | FAILED | CANCELLED`
- `REVIEW PENDING → COMPLETE | NEEDS REVISION | BLOCKED | CANCELLED`
- `NEEDS REVISION → IN PROGRESS | CANCELLED | SUPERSEDED` only through a new authorized attempt
- `BLOCKED → IN PROGRESS | PAUSED | CANCELLED | FAILED` after the blocker is explicitly cleared/authorized
- `PAUSED → IN PROGRESS | CANCELLED | SUPERSEDED`
- `COMPLETE`, `FAILED`, `CANCELLED`, and `SUPERSEDED` are terminal and immutable; corrections create a new task/attempt or explicit superseding record rather than rewriting history

No-review tasks may transition `IN PROGRESS → COMPLETE` only after ORC validates/accepts the Worker result and the routing contract explicitly declares `review_required=false`. A Worker may never directly author the terminal task COMPLETE transition. Review-required tasks may enter COMPLETE only from REVIEW PENDING after the required Reviewer result and ORC acceptance.

ATTEMPT transitions:
- `READY → RUNNING | INVALIDATED`
- `RUNNING → COMPLETED | FAILED | INVALIDATED`
- `COMPLETED`, `FAILED`, and `INVALIDATED` are terminal for that attempt
- revision creates a new `task_attempt_id`; the prior attempt remains immutable

HANDOFF transitions:
- `PERSISTED → DELIVERY PENDING | FAILED`
- `DELIVERY PENDING → DELIVERED | FAILED`
- `DELIVERED → ACKNOWLEDGED | FAILED`
- `ACKNOWLEDGED` and `FAILED` are terminal for that handoff ID; retry uses the same handoff ID/state semantics and idempotency key, never a silent replacement handoff

Every transition validates the expected prior state and `task_state_version`. Superseded/cancelled attempts may not later emit authoritative transitions.

## Duration semantics

- `TASK DURATION` measures authoritative task elapsed time from the task STARTED timestamp to terminal task transition, excluding no time unless a future metric explicitly defines active-only duration.
- Actor/stage durations (Worker execution, Review, Relay delivery, pause/block intervals) are separate audit/telemetry metrics and must not replace TASK DURATION.
- A Worker footer at REVIEW PENDING reports the Worker/actor-stage duration when useful, but the final task footer reports full TASK DURATION.

---

# 5. TASK CONTRACT / ETA / CHECKSUM

Every substantive Worker task is sized by ORC:

- `TINY` = 5m
- `SMALL` = 10m
- `MEDIUM` = 20m
- `LARGE` = 30m

Required contract fields:

- Task ID / attempt
- one objective
- authoritative starting source/revision
- `TASK SIZE`
- `ETA`
- `SCOPE CEILING`
- `ATTEMPT LIMIT` (default 2 substantially similar approaches)
- `CHECKSUM TRIGGER`
- allowed systems/paths
- locked invariants
- validation
- routing/review requirements
- literal stop condition

`ETA <5|10|20|30>` may be set by Alex/ORC; Worker may not self-renew.

## Scope checksum

At the ETA/checksum trigger Worker stops and checks:

1. still solving the exact objective?
2. still inside scope ceiling?
3. separate/new problem discovered?
4. substantially repeated the same fix more than twice?
5. task grown beyond original size?
6. touching unapproved infrastructure/architecture/deployment/auth/DNS/database/security/billing/other systems?
7. blocker outside scope?

PASS → preserve Task ID; ORC may authorize another timebox.

FAIL → stop, preserve state, report drift and smallest additional scope; ORC/owner must explicitly authorize further scope.

`CHECKSUM [PROJECT | TASK]` forces this check immediately.

Checksum is not Reviewer: checksum prevents drift during work; Reviewer evaluates semantic correctness after a result exists.

---

# 6. BOOTSTRAP <PROJECT>

Alex calls BOOTSTRAP; ORC executes it. ORC may recommend but may not independently establish a new top-level project.

BOOTSTRAP must be atomic/idempotent at the project-reservation boundary and:

1. normalize the requested project name into a deterministic `project_key` used only for uniqueness (for example case-folded, trimmed, whitespace-normalized; the human display name is preserved separately)
2. derive/accept a `bootstrap_idempotency_key` for the owner-authorized bootstrap request
3. atomically reserve a globally unique `project_id` with a datastore unique constraint on `project_key` and idempotency key before creating artifacts
4. create the bootstrap record in `BOOTSTRAPPING` state; simultaneous duplicate requests must resolve to the same reservation or fail closed, never create competing projects
5. detect duplicate project name/ID and return the existing reservation/current project rather than creating another
6. create `PROJECT - <Project Name>` in the appropriate Drive container when applicable
7. establish SOURCE OF TRUTH: GIT / DRIVE / HYBRID and version the authority split
8. establish exactly one writable `CURRENT_STATE.md` projection home: GIT or DRIVE
9. initialize that projection and its Task State Store version reference
10. establish the project note file and stable note-entry identity rules; new entries default PARK
11. register the project in `SYSTEM - Master Project Registry.md`
12. assign a logical primary ORC with assignment version/epoch
13. create initial Task State Store project record and exactly one next action
14. transition bootstrap state `BOOTSTRAPPING → READY` only after all required records/artifacts succeed, then emit PROJECT_BOOTSTRAPPED
15. on unrecoverable partial failure transition bootstrap state to `FAILED`, preserve the same project_id/reservation and recovery metadata, and never silently create a replacement project
16. retry/recovery with the same bootstrap idempotency key resumes the existing `BOOTSTRAPPING`/`FAILED` reservation
17. stop without speculative implementation

Project-bootstrap states are `BOOTSTRAPPING`, `READY`, `FAILED`. `READY` is terminal for that bootstrap operation; a failed operation is repaired/retried against the same reserved identity.

---

# 7. NOTE TAKER AND OWNER NOTE AUTHORIZATION

Note-taking commands are parsed only inside an explicit note-taking session:

- `NEW NOTE <PROJECT>`
- `UPDATE NOTE <PROJECT>` / `MODIFY NOTE <PROJECT>`
- `SECTION <SUBJECT>` / `NEW SECTION <SUBJECT>`
- `NOTE <BODY>`
- `END NOTE TAKING`

Natural command order may be normalized only when unambiguous. Project ambiguity stops for confirmation. SECTION always creates a new section.

NOTE body is authoritative owner content. Permitted cleanup only: obvious spelling, grammatical punctuation, capitalization, removal of non-content filler (um/uh), and immediate accidental speech-stumble repetition. Preserve original captured text or digest when cleanup occurs.

Every appended entry gets stable `note_entry_id` and revision-safe append handling. NOTE outside an active note-taking session must not be silently interpreted.

Owner disposition commands:

- `PARK NOTE` — preserve; no ORC processing
- `REVIEW NOTE` — authorize ORC read-only interpretation/analysis/proposal creation for the exact authorized snapshot; no implementation task creation or project/system changes
- `EXECUTE NOTE` — authorize ORC to create normal task contracts from the exact authorized snapshot; all downstream WCP controls remain mandatory

Every disposition binds to project_id, note_entry_id, Drive file/version, content digest, authorization_id, authenticated owner identity, and timestamp. Later appended content never inherits an earlier authorization. Authorization may be explicitly superseded/revoked.

---

# 8. RELAY / ROUTING / RESULT ENVELOPE

ORC is routing authority. Relay is messenger/runner only.

Normal reviewed flow:
`ORC → RELAY → WORKER → RELAY → REVIEWER → RELAY → ORC`

No-review path is allowed only when the routing contract explicitly declares review not required. Blocked/checksum/scope/discovery escalations return through Relay to ORC. Reviewer revision returns to ORC; ORC creates/authorizes the next attempt.

Every task attempt carries an immutable versioned routing contract including project/task/attempt identity, task_state_version, review requirement, expected next actor/stage, authorized source/scope refs, and WCP/ruleset identity.

Relay must not infer or repair routing.

Minimum result/handoff envelope:

- routing_contract_id
- handoff_id
- project_id, task_id, task_attempt_id
- task_state_version
- from actor role/id
- result_status
- expected_next_actor
- review_required
- payload/result reference and digest
- source-truth context
- WCP version/digest
- idempotency key

Relay validates authenticated submitter, handoff/routing IDs, attempt/state version, actor assignment, payload digest, expected result schema, and expected next actor.

Missing/invalid machine metadata fails closed. Missing visible NEXT ACTOR may be rendered from valid machine metadata. Malformed/stale/contradictory/unauthorized routing is rejected, audit-recorded, and returned to ORC.

Delivery is at-least-once; processing/state transitions are effectively-once through idempotency. Retry the same handoff ID; do not create replacement IDs automatically.

---

# 9. AUDIT

AUDIT is append-only history; it is not mutable task state and does not interpret results.

Provenance:

- `SERVICE_OBSERVED` — facts infrastructure directly witnessed
- `ACTOR_ASSERTED` — lifecycle/result/checksum/review claims made by intelligent actors

Representative service events include NOTE_CAPTURED, NOTE_DISPOSITION_SET/SUPERSEDED, PROJECT_BOOTSTRAPPED, HANDOFF_PERSISTED, DELIVERY_ATTEMPTED/FAILED, RESPONSE_RECEIVED, ROUTE_VALIDATION_FAILED, RESULT_ENVELOPE_REJECTED, MODE_CHANGED, OWNER_SUBMISSION_RECEIVED, duplicate suppression, checksum comparison, and API usage/cost.

State transition, audit event, and durable outbox mutation should commit atomically where possible. If required audit persistence fails, authoritative state must not silently advance.

Do not store unrestricted prompts/transcripts, credentials, secrets, or protected payloads in the audit ledger. Store bounded metadata/digests/references.

---

# 10. PROJECT / SOURCE-OF-TRUTH RULES

Project containers use `PROJECT - <Human Readable Project Name>` when Drive applies. Avoid duplicate project containers and competing writable current-state files.

SOURCE OF TRUTH values are exactly `GIT`, `DRIVE`, or `HYBRID`; the value identifies artifact/document authority and does not override workflow-state authority.

Authority is scoped by domain:
- **Workflow execution state:** Task State Store is authoritative for active task/attempt/handoff state, actor assignment, routing stage, review state, and transport mode.
- **Code/repository artifacts:** Git is authoritative when the project authority split assigns code/history to Git.
- **Drive documents/artifacts:** Drive is authoritative for the document/artifact areas assigned to Drive.
- **Human-readable resume projection:** exactly one writable `CURRENT_STATE.md` projection exists and reflects a specific Task State Store version during active execution; it never overrides newer Task State Store state.
- `GIT` — project artifacts are Git-authoritative except explicitly external runtime facts.
- `DRIVE` — project documents/artifacts are Drive-authoritative.
- `HYBRID` — Git and Drive each control explicitly named domains; the split is versioned.

No global precedence list may be used to let Git or Drive override Task State Store workflow state outside its authority domain.

`WS - GPT` is a durable control-plane workspace as well as a GPT working area. Only one active discoverable canonical-named `WORKFLOW_COMMAND_PROMPT.md` should exist in Drive control-plane locations; historical copies must be clearly archived/renamed.

---

# 11. CORE WORKFLOW COMMANDS

`RESUME [PROJECT]` / `CONTINUE [PROJECT]` / `PROCEED [PROJECT]`
Recover authoritative state and advance from the exact recorded next action. Do not invent a new task.

`SWITCH <PROJECT>`
Change active project context without changing project task state.

`STATUS [PROJECT]`
Report role, workflow/transport mode, task ID/state, objective, size/ETA, scope ceiling, current actor/who has the ball, blocker, and exact next action. Do not advance work.

`UPDATE [PROJECT | TARGET]`
Apply the explicitly requested bounded change to the authoritative system(s). Preserve Task ID for same-objective revisions; no unrelated scope expansion.

`PAUSE [PROJECT]`
Persist a clean resumable stop while Workflow Mode remains active.

`CHECKPOINT`
Persist current state/projection without necessarily pausing.

`BRIEF [PROJECT | ALL]`
Read-only operational recap; do not advance work.

`STEPS`
Show concise operational sequence/current position/ownership.

`PROMPT`
Generate the exact next agent-ready task transfer from the current authorized contract. Manual owner transfers must be entirely inside one fenced `text` block.

`SPLIT`
ORC-only decomposition into parallel-safe child tasks.

`SYNC [PROJECT]`
Reconcile documented/project state with authoritative systems without silently changing production.

`PRIORITY <PROJECT OR TASK>`
ORC changes sequencing priority without scope change.

`QUEUE`
Show active project/task queue and ownership.

`USAGE`
Report available workflow/API usage/cost information only when actually accessible.

---

# 12. QUALITY / CONTROL COMMANDS

`VERIFY [PROJECT | TARGET]`
Confirm a specific result against authoritative state; return PASS/FAIL/UNKNOWN.

`REVIEW`
Independent task/result evaluation against contract; return PASS/FAIL/NEEDS REVISION.

`APPROVE`
Advance only to the next already-authorized stage.

`REJECT <REASON>`
Reject current result while preserving task identity unless objective is abandoned.

`ABORT`
Terminate active task without marking it complete; preserve state/cleanup requirements.

`LOCK <THING>` / `UNLOCK <THING>`
Protect or explicitly reopen an accepted invariant.

`REPORT [PROJECT | TASK]`
Read-only creep/monkey-patch/root-cause diagnostic; does not authorize implementation.

`AUDIT [PROJECT | SYSTEM | ALL]`
Broad read-only integrity audit across sources of truth, state, control-plane rules, documentation, implementation boundaries, and unresolved blockers. Findings do not authorize fixes.

---

# 13. CONVERSATION COMMANDS

`QUESTION`
Answer without execution; freezes active workflow execution but does not exit it.

`CONVO`
Discussion/planning only; freezes execution but does not exit active workflow.

`CLARIFY <TEXT>`
Correct/disambiguate communication without creating a new task by default.

`EXPLAIN <TOPIC>`
Explain without changing state.

---

# 14. WCP MAINTENANCE

`WCPADD <REQUEST>`
Add/revise canonical workflow language and propagate materially affected active text copies unless explicitly deferred.

`WCPMODIFY <REQUEST>`
Modify/rename/merge/deprecate/remove existing WCP rules; reconcile all materially affected references and propagate unless explicitly deferred.

`PROPAGATE [WCP | ARTIFACT]`
Synchronize the authoritative shared artifact to materially affected active copies without changing product/task state.

`CHEATSHEET <TOPIC>`
Generate the requested visual cheatsheet. WCP visual is derived from text, never source of truth.

**Current temporary exception:** WCP PNG/visual refresh is explicitly deferred during the active foundation reconciliation until Alex authorizes the final visual update. Text/control-plane reconciliation may complete first.

---

# 15. EXECUTION PRINCIPLES

1. Build the smallest complete vertical slice before expansion.
2. Diagnose root cause before patching.
3. Refactor cleanly instead of stacking monkey patches.
4. Do not modify unrelated systems.
5. Preserve accepted baselines/locks.
6. Keep credentials/secrets out of repos, prompts, logs, and audit payloads.
7. Treat destructive/security/billing/auth/domain/production changes as approval-gated unless explicitly authorized.
8. Prefer reversible changes/rollback paths.
9. Verify publication transport before coding when publication is part of the objective.
10. Local success is not production success.
11. Keep unrelated projects/repositories separate.
12. Discovery is not authorization.
13. Do not merge/deploy beyond explicit authority.
14. Do not use Alex as technical courier when RELAY mode can safely perform the transport.
15. Worker stops at scope ceiling or checksum trigger.
16. Reviewer and ORC share synthesis for current scale; add a dedicated synthesizer only when demonstrated fan-in load requires it.

---

This protocol is designed to remain durable from small MANUAL-mode projects through multi-project RELAY-mode execution without changing its core authority contracts.
