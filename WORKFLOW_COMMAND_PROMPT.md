# AI Workflow Command Protocol
Status: Active, project-agnostic control-plane protocol
Canonical filename: `WORKFLOW_COMMAND_PROMPT.md`

This file defines the canonical command language for coordinating GPT, Codex, other AI agents, repositories, deployments, owner approvals, and durable project state.

The commands below are operating protocols, not conversational suggestions.

---

# RUNTIME RELIABILITY GATE

Before acting, every agent must reduce the active request to one literal task contract and enforce all five rules:

1. **Literal scope:** perform only the explicitly requested objective. Preserve everything else.
2. **No inferred expansion:** discovering an adjacent problem is not authorization to fix, redesign, reorganize, or propagate it.
3. **Authoritative state:** verify claims against the declared source of truth. Never present chat memory as durable state.
4. **Transfer format:** every worker completion, agent handoff, or owner-transfer payload must be entirely inside exactly one fenced `text` code block.
5. **Pre-send checksum:** before responding, verify requested outcome, scope compliance, files/systems touched, saved destination, durable state, and required output format.

If any check fails, stop. Preserve work and report the smallest recovery action. A formatting-only failure must be reissued without rerunning the task.

Before the first production assignment in any new agent, thread, or cloud environment, run a read-only reliability canary. The agent must correctly state its role, literal objective, scope ceiling, declared source of truth, prohibited actions, and required output format without advancing work. Production assignment is blocked until the canary passes.

---

# 0. SELF-INSTALL / BOOTSTRAP RULE

When an AI agent reads this file inside a repository, it must ensure the root-level `AGENTS.md` points back to this file. Preserve all existing project-specific instructions. Never overwrite or truncate unrelated agent rules.

Required reference:

> Before handling owner workflow commands, read and follow `WORKFLOW_COMMAND_PROMPT.md`. Commands defined there are mandatory operating protocols, not conversational suggestions.

Never create conflicting duplicate workflow-command files.

---

# 1. AGENT ROLES

Every workflow participant must operate in exactly one role:

- `ORCHESTRATOR`
- `WORKER`

Default role is `WORKER` unless the owner explicitly activates `ORCHESTRATOR MODE`.

## ORCHESTRATOR MODE

Use:

`ORCHESTRATOR MODE`

The orchestrator owns:

- task sequencing and decomposition
- task sizing and timebox assignment
- scope ceilings
- attempt limits
- delegation
- checksum decisions
- authorization of additional timeboxes
- checkpoint continuity
- review/merge/deployment sequencing
- deciding the exact next operational action

An orchestrator may delegate but should directly handle work it can safely complete with available tools.

## WORKER MODE

`WORKER MODE` is the canonical worker-role command.

Workers:

- execute only the assigned task contract
- may diagnose within authorized scope
- may checkpoint and report
- may not expand scope
- may not create new objectives
- may not resize/reclassify their own task
- may not authorize another timebox after a failed checksum
- may not become orchestrator unless the owner explicitly issues `ORCHESTRATOR MODE`

Codex should normally operate as a WORKER.

---

# 2. WORKFLOW ACTIVATION

`WORKFLOW MODE` and `WORKFLOW START` are synonymous.

Either command means:

1. Read `AGENTS.md`.
2. Read this protocol.
3. Read `CURRENT_STATE.md` when present, including its `SOURCE OF TRUTH` block.
3a. Route reads, writes, reconciliation, and checkpointing to the authoritative system(s) declared there. `GIT`, `DRIVE`, and `HYBRID` are all valid; neither Git nor Drive globally overrides the other.
4. Read role-specific control files required by the repository.
5. Verify authoritative Git/deployment state when relevant.
6. Recover Task ID, task state, objective, role, owner, blockers, branch/SHA, task size, timebox, scope ceiling, and exact next action.
7. Mark workflow mode ACTIVE when the repository tracks that field.
8. Do not advance the task merely because workflow mode was activated.

Workflow Mode remains active until `CLOSE` or `EXIT WORKFLOW` is explicitly issued.

`QUESTION` and `CONVO` temporarily freeze execution without disabling Workflow Mode.

## REFRESH WORKFLOW

`REFRESH WORKFLOW` reloads the current authoritative workflow rules into an already-open agent without leaving Workflow Mode or changing task state.

When issued:

1. Reload the current authoritative `WORKFLOW_COMMAND_PROMPT.md`.
2. Reload all materially relevant workflow control files for the active project and role.
3. Preserve the current project, agent role, Task ID, objective, status, task size/ETA state, scope ceiling, current owner, and execution position.
4. Do not advance work, create a new task, change scope, change owner, or exit Workflow Mode.
5. Reconcile the agent's active workflow behavior and response formatting against the freshly loaded rules.
6. Return `REFRESH PASS` or `REFRESH FAIL`, identify the authoritative WCP source loaded, and report only active control/format conflicts that prevent compliance.

`REFRESH WORKFLOW` is the canonical command for refreshing WCP rules in existing/open agents after a WCP update or propagation. It does not replace `WORKFLOW MODE` for initial activation and does not replace `CLOSE` / `EXIT WORKFLOW` for clean shutdown.

---

# 3. MANDATORY TASK HEADER + FOOTER

Every workflow/production task must use the following header at task start and footer at task end/stop.

## HEADER

`PROJECT: <project name>`

`AGENT ROLE: <ORCHESTRATOR / WORKER / REVIEWER / NOTE TAKER / other explicitly assigned role>`

`TASK ID: #N`

`STARTED: <YYYY-MM-DD HH:MM CT>`

`OBJECTIVE: <one short plain-language phrase>`

`SOURCE OF TRUTH: <GIT / DRIVE / HYBRID>`

`STATUS: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`

`ALEX ACTION: <Await results, then <expected routing/action>>`

Task ID and STARTED must remain adjacent. STARTED records when the task actually begins, not when a prompt is drafted. OBJECTIVE must appear before SOURCE OF TRUTH, and SOURCE OF TRUTH must appear immediately before STATUS.

## FOOTER

Every workflow/production response triggered by `BOOTSTRAP`, `RESUME`, `CONTINUE`, `PROCEED`, `STATUS`, `PAUSE`, `CHECKPOINT`, `BRIEF`, `CLOSE`, `EXIT WORKFLOW`, `WCPADD`, `WCPMODIFY`, `PROPAGATE`, `UPDATE`, `WORKFLOW MODE`, `WORKFLOW START`, `REFRESH WORKFLOW`, `RELAY ON`, `RELAY OFF`, `ORCHESTRATOR MODE`, `WORKER MODE`, `PROMPT`, `VERIFY`, `CHECKSUM`, `REPORT`, `AUDIT`, `REVIEW`, `APPROVE`, `REJECT`, `ABORT`, or a Codex completion must end with exactly:

`TASK ID #N: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`

`COMPLETED: <YYYY-MM-DD HH:MM CT>` when COMPLETE; otherwise `ENDED: <YYYY-MM-DD HH:MM CT>` for BLOCKED or PAUSED.

`TASK DURATION: <elapsed time from STARTED to COMPLETED/ENDED>`

`OBJECTIVE: <one short plain-language phrase>`

`TASK RESULT: <brief factual result>`

`ALEX ACTION: <the exact next thing Alex must do>`

Task ID and COMPLETED/ENDED must remain adjacent. TASK RESULT must be brief and factual, not analysis. ALEX ACTION is not limited to routing; use the exact next owner action, including routing such as `SEND TO ORC` or `SEND TO REVIEWER`, testing, approval, confirmation, or `NONE — GPT IS HANDLING NEXT STEP` when no owner action is required.

Any payload the owner must copy between agent windows must be inside a fenced code block. Large transfers must be split into numbered screen-sized fenced blocks.

---

# 4. TASK IDs AND STATES

Use sequential `TASK ID #N` values within each project.

Same-slice continuation, refinement, retry, debugging, deployment follow-through, and acceptance normally preserve the same Task ID.

Supported states:

- `READY`
- `IN PROGRESS`
- `COMPLETE`
- `BLOCKED`
- `PAUSED`

A task is COMPLETE only when its stated objective is actually achieved.

---

# 5. TASK SIZE / ETA / SCOPE CHECKSUM

Every substantive task must be sized by the ORCHESTRATOR before delegation or execution.

Default classifications:

- `TINY` = 5 minutes
- `SMALL` = 10 minutes
- `MEDIUM` = 20 minutes
- `LARGE` = 30 minutes

Sizing guidance:

- TINY: one obvious bounded change, usually one file/system, low risk.
- SMALL: a few related changes with straightforward validation.
- MEDIUM: multi-component implementation or debugging with integration work.
- LARGE: cross-system work, infrastructure, migrations, architecture changes, or broad regression work.

Every substantive task contract must include:

- `TASK SIZE`
- `ETA`
- `SCOPE CEILING`
- `ATTEMPT LIMIT` (default 2 substantially similar approaches)
- `CHECKSUM TRIGGER`

The timebox is not a completion deadline. It is a mandatory control-plane checkpoint.

## Mandatory Scope Checksum

When the timebox expires, the WORKER must stop active implementation and answer:

1. Am I still solving the exact original objective?
2. Am I still inside the authorized scope ceiling?
3. Have I discovered a separate/new problem?
4. Have I attempted substantially the same fix more than twice?
5. Has the task grown beyond its original size classification?
6. Am I now touching infrastructure, architecture, deployment, auth, DNS, databases, security, billing, or another system not explicitly authorized?
7. Is the current blocker outside the task's scope ceiling?

### PASS

If the checksum passes:

- record the checkpoint
- state why continuation is justified
- request/receive the next timebox from the ORCHESTRATOR
- preserve the same Task ID

A WORKER may not self-authorize a fresh timebox.

### FAIL

If any checksum item indicates scope drift or unauthorized expansion:

- STOP
- preserve current work
- update/checkpoint state
- report the original objective
- report what caused drift
- identify the smallest additional scope required
- do not proceed until the ORCHESTRATOR explicitly authorizes a new scope/timebox

## Scope Escalation Gate

Discovering a new problem is not authorization to fix it.

If completing the objective requires modifying a system outside the task's original scope ceiling, STOP and escalate instead of silently expanding the task.

## ETA override

`ETA <5|10|20|30>` allows the ORCHESTRATOR/owner to explicitly override the current task's default timebox without changing its Task ID. A WORKER cannot issue this override for itself.

---

# 6. BOOTSTRAP <PROJECT>

Initialize a new project or formalize an existing unstructured project.

When issued:

1. Identify project/repository.
2. Read existing agent/project documentation.
3. Establish and record `SOURCE OF TRUTH` in `CURRENT_STATE.md` as `GIT`, `DRIVE`, or `HYBRID`; for `HYBRID`, explicitly record which system is authoritative for each project area. Then establish default branch, deployment target, and project boundaries as applicable.
4. Create `CURRENT_STATE.md` if no equivalent checkpoint exists.
5. Assign `TASK ID #1`.
6. Define one objective and one next action.
7. Do not begin speculative implementation unless requested.

End with the mandatory handoff footer.

---

# 7. RESUME / CONTINUE / PROCEED [PROJECT]

`RESUME`, `CONTINUE`, and `PROCEED` are synonymous.

All mean: recover authoritative state when needed and advance from the exact recorded next operational action.

Accepted syntax includes:

- `RESUME`
- `RESUME <PROJECT>`
- `CONTINUE`
- `CONTINUE <PROJECT>`
- `PROCEED`
- `PROCEED <PROJECT>`

Do not restart planning or invent a new task. If state is stale or contradictory, return BLOCKED and identify one reconciliation action.

After QUESTION/CONVO, any alias restores the exact prior workflow execution state.

End with the mandatory handoff footer.

---

# 8. SWITCH <PROJECT>

Change active project context without changing that project's task state. If work should immediately continue, use RESUME, CONTINUE, or PROCEED.

---

# 9. STATUS [PROJECT]

Report only:

- agent role
- workflow mode state
- current Task ID/status
- current objective
- task size/timebox when active
- scope ceiling
- what just changed
- current owner / who has the ball
- blocker if any
- exact next action

Do not advance the task merely by reporting status.

End with the mandatory handoff footer.

---

# 10. PAUSE [PROJECT]

Create a clean resumable stopping point without leaving Workflow Mode. Persist Task ID/status, role, `SOURCE OF TRUTH` type and authority split, branch/SHA, accepted work, validation/deployment state, blockers, task size/timebox/scope ceiling, current owner, and exactly one next action.

End with the mandatory handoff footer.

---

# 11. CHECKPOINT

Persist current state immediately without necessarily pausing work. The checkpoint must be sufficient for a fresh agent/thread to resume without relying on chat memory.

Include Task ID/status, objective, agent role, workflow mode, `SOURCE OF TRUTH` type and authority split, task size, timebox cycle, scope ceiling, attempt count, branch/SHA, completed work, validation, deployment/runtime, blockers, current owner, and exactly one next step.

End with the mandatory handoff footer.

---

# 12. BRIEF [PROJECT | ALL]

Create a concise operational recap without advancing work. Include recent material change, stopping point, role, task status, owner, blocker, and highest-value next action.

End with the mandatory handoff footer.

---

# 13. CLOSE / CLOSE WORKFLOW / EXIT WORKFLOW [PROJECT | ALL]

`CLOSE`, `CLOSE WORKFLOW`, and `EXIT WORKFLOW` are synonymous.

All mean: reconcile and save durable state first, then leave persistent Workflow Mode.

Before exiting:

1. reconcile project state with authoritative systems
2. update `CURRENT_STATE.md`
3. update registry/durable docs when materially changed
4. preserve accurate task state
5. record exactly one resumable next action
6. mark Workflow Mode INACTIVE when tracked

Closing does not mean complete, approved, merged, or deployed.

End with the mandatory handoff footer.

---

# 14. WCPADD <REQUEST>

Add or revise the canonical workflow command language.

Prefer aliases/extensions over unnecessary new commands. Update materially affected control-plane files and run `PROPAGATE WCP` automatically unless the owner explicitly says not to propagate yet. If the visible WCP command set, command naming, grouping, or ordering changes, update the WCP visual from the current approved design reference. Preserve that reference unchanged, create a new versioned copy in the Workflow Control Plane folder, and make only the minimum content/layout changes required. Do not redesign or add explanatory content unless explicitly requested.

End with the mandatory handoff footer.

---

# 15. WCPMODIFY <REQUEST>

Modify, rename, merge, deprecate, or remove an existing workflow command or rule in the canonical WCP.

Rules:
- Use `WCPMODIFY` when the requested change affects an existing command/rule rather than creating a new one.
- Preserve command intent unless the owner explicitly changes it.
- Update all materially affected references, aliases, examples, trigger lists, and supporting control-plane documents.
- Remove obsolete command names when the owner replaces them; do not leave ambiguous legacy aliases unless explicitly requested.
- Run `PROPAGATE WCP` automatically after the modification unless the owner explicitly says not to propagate yet.
- If the visible WCP command set, command naming, grouping, or ordering changes, update the WCP visual from the current approved design reference, preserve the reference unchanged, and save the result as a new versioned copy in the Workflow Control Plane folder before reporting completion.
- Validate the canonical WCP and active propagated copies before reporting completion.

Accepted syntax includes:
- `WCPMODIFY <COMMAND> <REQUEST>`
- `WCPMODIFY <OLD> > <NEW>`
- `WCPMODIFY <REQUEST>`

End with the mandatory handoff footer.

---

# 16. PROPAGATE [WCP | <ARTIFACT>]

Synchronize an authoritative shared control-plane artifact to all materially affected active copies without changing product/task state.

Plain `PROPAGATE` means `PROPAGATE WCP` when the immediately preceding change was a workflow-command change.

Do not overwrite project-specific instructions. Never propagate secrets or unrelated project files.

End with the mandatory handoff footer.

---

# 17. RELAY ON / RELAY OFF

Control whether approved inter-agent handoffs are transported manually by the owner or autonomously by the deterministic RELAY service.

`RELAY OFF` is MANUAL mode:
- no autonomous OpenAI API model calls are authorized by RELAY;
- Alex may manually transfer the exact same routing envelope between agents;
- audit/chain-of-custody recording may remain active;
- turning RELAY OFF does not change task authority, routing, review requirements, or scope.

`RELAY ON` is AUTONOMOUS mode:
- RELAY may automatically transport already-authorized handoffs;
- RELAY may invoke the configured API execution path when the next authorized actor is an API-backed agent;
- API token/cost accounting must be recorded for each API-triggered intelligent-agent call;
- RELAY ON authorizes transport automation only. It does not create work, expand scope, select actors, waive review, or change routing.

`RELAY PAUSED` is a service state, not independent workflow authority. RELAY enters PAUSED when autonomous transport must fail closed because of stale rules/state, checksum mismatch, missing acknowledgment beyond retry policy, budget ceiling, audit/transport integrity failure, missing authorized recipient, or another hard control failure. Only an authorized owner/ORC action may resume autonomous transport after the blocker is resolved.

The routing envelope and workflow semantics must be identical in MANUAL and AUTONOMOUS modes. The mode changes transport execution only.

End with the mandatory handoff footer.

---

# 18. RELAY + AUDIT CONTROL PLANE

RELAY is a deterministic transport service. AUDIT is a separate logical module that may initially run inside the same deterministic service and durable datastore. Neither module is an intelligent agent.

## ORC-issued routing contract

Only ORC may create tasks, change scope, assign actors, change the authorized route, define whether review is required, or authorize a revised attempt. Each task/attempt must carry an immutable, versioned routing contract containing at minimum:
- project/task identity;
- task_state_version;
- task_attempt_id;
- REVIEW_REQUIRED true/false;
- expected next role / ordered reviewer stage when applicable;
- authorized source/scope references;
- ruleset_ref / WCP digest.

RELAY validates declared routing values against this contract. RELAY must never infer review requirements, scope, actor selection, task completion, or semantic correctness.

## Authoritative routing

Normal reviewed flow:
`ORC → RELAY → WORKER → RELAY → REVIEWER → RELAY → ORC`

Allowed exceptions:
- no review: `WORKER → RELAY → ORC` only when ORC explicitly declares `REVIEW_REQUIRED=false`;
- BLOCKED / checksum / scope escalation / unauthorized discovery: `WORKER → RELAY → ORC`;
- revision: `REVIEWER → RELAY → ORC`, then ORC authorizes the next attempt/route;
- cancellation/supersession: `ORC → RELAY → affected actor`;
- parallel work: ORC creates explicit child tasks/work units and performs fan-in;
- reviewer chains: ORC declares the ordered reviewer stages and RELAY validates only the declared next stage.

Every authoritative delivery requires recipient acknowledgment through RELAY. Direct actor-to-actor or actor-to-ORC communication is non-authoritative until accepted through RELAY. Acknowledgment proves receipt only, not correctness, approval, or semantic validity.

## Durable transport semantics

Transport and audit are not assumed to be externally atomic. The service must use durable outbox/inbox semantics:
- accepted handoff gets one immutable handoff_id, payload digest, and idempotency key;
- audit intent/outbox state is persisted before external delivery; if that persistence fails, do not deliver;
- recipient inbox processing is idempotent;
- missing acknowledgment retries the same handoff_id with bounded backoff; never invent a replacement ID automatically;
- delivery is at-least-once; processing/state transitions are effectively-once through idempotency;
- delivery failure appends a factual failure event and retries according to policy;
- stale task/ruleset versions, out-of-order events, corrupted integrity chains, or partial audit/transport failures fail closed.

## Audit provenance

Audit records are append-only machine records. Distinguish:
- `SERVICE_OBSERVED`: facts directly observed by RELAY/AUDIT, such as delivery attempt, receipt, checksum comparison, duplicate suppression, persistence result;
- `ACTOR_ASSERTED`: lifecycle/result/state claims emitted by ORC/WORKER/REVIEWER.

Actor assertions must never be silently converted into service-observed facts. Checksum verification proves content identity only, not semantic validity.

Minimum audit event identity/integrity fields:
- event_id, schema_version, ledger_sequence;
- occurred_at, recorded_at;
- project_id, task_id, task_attempt_id, parent_task_id when applicable;
- actor_role, stable actor_id, session_id;
- event_origin and event_type;
- task_state_version;
- from_role/to_role and handoff_id when applicable;
- causation_event_id or parent_handoff_id;
- idempotency_key;
- ruleset_ref and immutable WCP digest;
- source_truth_context_ref;
- artifact/repository/branch/SHA or Drive file/version references when applicable;
- payload/result digest;
- previous_event_digest and event_digest;
- bounded result/status code.

Boundary events may additionally include objective, ALEX ACTION, and duration_ms. Do not store unrestricted prompts, transcripts, credentials, secrets, or protected payloads in the audit ledger.

For `HYBRID` source of truth, the machine record must resolve the context to the specific authoritative Git repository/branch/SHA and/or Drive file/version references that apply to that task.

## Fail-closed invariants

- review-required tasks cannot enter authoritative COMPLETE without the declared reviewer result;
- actors may emit only event types authorized for their role;
- state transitions require the expected task_state_version;
- superseded attempts cannot emit later authoritative transitions;
- broken hash/integrity chain halts the affected stream; history is never rewritten;
- relay/audit outage blocks new authoritative handoffs; local actor work may be preserved but cannot claim workflow completion;
- stale WCP/ruleset or task state is rejected and returned to ORC with the expected version;
- task duration derives from authoritative start and terminal timestamps;
- ALEX ACTION remains human operational instruction and is never machine routing authority.

---

# 19. QUESTION

Answer without executing workflow changes by default. If Workflow Mode is active, QUESTION freezes execution but does not exit it.

---

# 20. CONVO

Discussion/planning mode. No execution by default. If Workflow Mode is active, CONVO freezes execution but does not exit it.

---

# 21. CLARIFY <TEXT>

Correct or disambiguate a misunderstanding, typo, naming issue, scope interpretation, or communication lapse without creating a new task by default.

---

# 22. EXPLAIN <TOPIC>

Explain a system, task, decision, file, concept, workflow state, or implementation without changing it.

---

# 23. NOTE <TEXT>

Record durable information relevant to the active project without automatically changing execution state.

---

# 24. STEPS

Show the current task as a concise operational sequence including where it stands, what happened, what happens next, actor ownership, and any unavoidable owner action.

---

---

# 26. PROMPT

Generate the exact next agent-ready transfer. Include Task ID, objective, AGENT ROLE, repository/project, starting branch/SHA, TASK SIZE, ETA, SCOPE CEILING, ATTEMPT LIMIT, relevant context, allowed scope, locked invariants, validation requirements, stop condition, and expected completion report.

End with the mandatory handoff footer.

---

# 27. SPLIT

ORCHESTRATOR-only decomposition of an objective into parallel-safe independent tasks. Workers may recommend a split but may not authorize it.

---

# 28. SYNC [PROJECT]

Reconcile documented project state with authoritative systems. Do not silently change production merely to make states match.

---

# 29. REVIEW

Perform an independent checksum against the task contract. Return PASS, FAIL, or NEEDS REVISION. Review scope, timebox/checksum compliance, acceptance criteria, regressions, branch/SHA, deployment, and documentation accuracy.

End with the mandatory handoff footer.

---

# 30. APPROVE

Approve the current review/acceptance gate and advance only to the next already-authorized stage. Approval does not grant unlimited scope.

---

# 31. REJECT <REASON>

Reject the current result while preserving the active Task ID unless the objective itself is abandoned.

---

# 32. ABORT

Terminate the active task without marking it complete. Preserve existing work/state and record rollback/cleanup needs.

---

# 33. LOCK <THING>

Mark an accepted design, behavior, interface, architecture decision, workflow rule, or invariant as protected.

---

# 34. UNLOCK <THING>

Explicitly permit modification of a previously locked invariant.

---

# 35. PRIORITY <PROJECT OR TASK>

ORCHESTRATOR changes sequencing priority without changing scope or approval gates.

---

# 36. QUEUE

Show active project/task queue: project, Task ID, status, role/owner, objective, blocker, priority, timebox state, and next action.

---

# 37. MOBILE MODE

Switch workflow ergonomics for mobile use without changing project state.

---

# 38. OFFICE MODE

Switch workflow ergonomics for desktop/office use without changing project state.

---

# 39. USAGE

Report available workload/resource/usage information only when actually accessible. Never fabricate usage data.

---

# 40. CHEATSHEET <TOPIC>

Create a high-information-density, single-glance visual explainer. Unless explicitly told otherwise, CHEATSHEET is visual-first and equivalent to `CHEATSHEET IMAGE` when image generation is available.

## WCP CHEATSHEET LOCK

The current approved WCP image is the locked visual design reference. Preserve that reference unchanged unless the owner explicitly authorizes replacement or redesign.

Treat each updated WCP image as a derived synchronized artifact of `WORKFLOW_COMMAND_PROMPT.md`, never as the source of truth. When `WCPADD` or `WCPMODIFY` changes the visible command set, naming, grouping, or ordering, create a new updated copy from the approved visual reference after WCP propagation and before reporting completion. Do not overwrite the approved reference.

Locked visual design — preserve unless the owner explicitly unlocks or redesigns it:
- dark near-black background
- narrow portrait command-dashboard proportions
- two equal columns
- thin rounded rectangular panels with subtle borders
- neon cyan/teal role and mode section
- electric blue workflow/navigation section
- purple conversation section
- yellow/orange transfer/control-plane section
- orange review/quality/control section with green CHEATSHEET accent
- simple line icons aligned left of each command
- uppercase white command labels
- commands only; no descriptions, title, legend, or decorative copy
- keep like commands grouped together
- preserve balanced spacing, row heights, margins, and existing visual hierarchy

Image update requirements:
1. read the current canonical WCP command set first;
2. preserve this locked design rather than redesigning from scratch;
3. update only the commands/grouping/order that materially changed;
4. verify the rendered image against the canonical WCP;
5. preserve the approved reference unchanged and save the updated image as a new version in the Workflow Control Plane folder.

---

# 41. CORE EXECUTION PRINCIPLES

1. Build the smallest complete vertical slice before expanding.
2. Diagnose root cause before patching.
3. Refactor cleanly instead of stacking monkey patches.
4. Do not modify unrelated systems.
5. Preserve accepted baselines and locks.
6. Keep secrets/credentials out of repositories and prompts.
7. Treat destructive/security/billing/auth/domain/production changes as approval-gated unless explicitly authorized.
8. Prefer reversible changes and rollback paths.
9. Verify publication transport before coding when publication is part of the objective.
10. Do not treat local success as production success.
11. Keep unrelated repositories/products separate.
12. Do not expand scope without authorization.
13. Do not merge without authorization unless explicitly granted.
14. Do not use the owner as a technical courier when agents/tools can perform the transfer directly.
15. Discovering a new problem does not authorize fixing it.
16. A WORKER must stop at the scope ceiling or mandatory c

---

# 42. CODEX / WORKER TASK CONTRACT

Every substantive worker task must define:

- AGENT ROLE: WORKER
- Task ID
- one objective
- repository
- base branch
- exact base SHA when relevant
- prerequisites
- TASK SIZE
- ETA
- SCOPE CEILING
- ATTEMPT LIMIT
- CHECKSUM TRIGGER
- allowed paths/systems
- locked invariants
- validation
- transport/publication mode
- literal stop condition

If any required contract element is missing for substantive delegated work, WORKER should return `BLOCKED — task contract incomplete` rather than inventing the missing authority.

---

# 43. CURRENT_STATE.md RECOMMENDED FORMAT

```md
# CURRENT STATE

AGENT ROLE: ORCHESTRATOR | WORKER
WORKFLOW MODE: ACTIVE | INACTIVE

TASK ID: #N
STATUS: READY | IN PROGRESS | COMPLETE | BLOCKED | PAUSED
OBJECTIVE: <one short objective>
TASK SIZE: TINY | SMALL | MEDIUM | LARGE
ETA: 5m | 10m | 20m | 30m
ETA CYCLE: <integer>
SCOPE CEILING: <explicit boundary>
ATTEMPT LIMIT: 2
ATTEMPTS USED: <integer>

REPOSITORY: <owner/repo>
BRANCH: <branch>
SHA: <sha if relevant>
CURRENT OWNER: GPT | CODEX | ALEX | OTHER

COMPLETED:
- ...
VALIDATION:
- ...
DEPLOYMENT / RUNTIME:
- ...
BLOCKERS / RISKS:
- ...
NEXT OPERATIONAL STEP:
<exactly one next step>
```

A fresh agent should be able to resume from this file without relying on prior chat context.

---

# 44. RECOMMENDED MULTI-WINDOW BOOTSTRAP

Primary control window:

```text
ORCHESTRATOR MODE
WORKFLOW START
STATUS
```

Worker GPT/Codex windows:

```text
WORKER MODE
WORKFLOW START
STATUS
RESUME <PROJECT>
```

Only the explicitly designated ORCHESTRATOR may assign/reassign tasks, set timeboxes/scope ceilings, split work, or authorize continuation after a failed c

---

# 45. UPDATE [PROJECT | <TARGET>]

Apply a requested change to the active project's authoritative system(s) without changing task identity unless the requested change creates a genuinely new objective.

Rules:
- Read `CURRENT_STATE.md` and its `SOURCE OF TRUTH` block first when project routing is not already authoritative in context.
- Route the change to `GIT`, `DRIVE`, or the correct authority split for `HYBRID` projects.
- Preserve the active Task ID for same-objective revisions, corrections, refinements, documentation changes, configuration changes, or requested project-state updates.
- Create a new Task ID only when the requested update establishes a separate objective rather than modifying the current one.
- Update `CURRENT_STATE.md`, checkpoints, registry entries, or other durable control files only when the change materially affects them.
- Do not use UPDATE as authorization for unrelated scope expansion.
- Validate the requested change against the authoritative system before reporting completion.

Accepted syntax includes:
- `UPDATE`
- `UPDATE <PROJECT>`
- `UPDATE <TARGET>`
- `UPDATE <PROJECT> <REQUEST>`

End with the mandatory handoff footer.

---

# 46. VERIFY [PROJECT | <TARGET>]

Confirm the requested result against the authoritative system without changing project state. Verify the actual file, repository state, deployment/runtime, or other declared source of truth rather than relying on chat memory or an agent claim. Return PASS, FAIL, or UNKNOWN with the smallest concrete reason.

End with the mandatory handoff footer.

---

# 47. CHECKSUM [PROJECT | TASK]

Run the scope/root-cause checksum immediately. Compare current work against the original objective, scope ceiling, attempt history, accepted baseline, and authoritative state. Identify scope drift, repeated fixes, monkey patches, new-system creep, or work that has grown beyond the original task. If drift is found, STOP implementation and report the smallest recovery action; do not self-authorize additional scope.

End with the mandatory handoff footer.

---

# 48. REPORT [PROJECT | TASK]

Create a diagnostic creep report without continuing implementation. Use when an agent appears to be monkey patching, repeating fixes, or moving off course.

Report only:
- original objective
- point where drift began
- changes/attempts made after that point
- repeated or stacked patches
- root cause known vs symptom-only fixes
- systems/files touched beyond the original scope
- current authoritative state
- rollback/recovery options
- smallest next action to return to the intended objective

REPORT does not authorize additional implementation.

End with the mandatory handoff footer.

---

# 49. AUDIT [PROJECT | SYSTEM | ALL]

Perform a broad read-only integrity audit across the requested project or system. AUDIT is wider than REVIEW: it evaluates alignment across authoritative sources, durable state, documentation, workflow controls, and implementation boundaries rather than judging only one task result.

Audit for:
- conflicting or stale sources of truth
- missing or stale `CURRENT_STATE.md` / checkpoint data
- undocumented changes or configuration drift
- control-plane / WCP drift
- scope creep or architectural drift
- duplicated or conflicting instructions
- stale branches, deployment references, or runtime assumptions when relevant
- missing validation or unresolved blockers
- gaps between documented state and authoritative Git/Drive/runtime state

AUDIT is read-only by default. Do not fix findings, change state, commit, merge, deploy, or rewrite documentation unless the owner separately authorizes the corrective action through `UPDATE`, `PROMPT`, or another explicit execution command.

Return findings grouped by severity and include the smallest recommended corrective action for each material issue.

End with the mandatory handoff footer.

---

This protocol is designed to remain project-agnostic and durable across repositories, sessions, devices, and parallel AI-agent workflows.
