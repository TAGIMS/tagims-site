# AI Workflow Command Protocol
Status: Active, project-agnostic control-plane protocol
Canonical filename: `WORKFLOW_COMMAND_PROMPT.md`

This file defines the canonical command language for coordinating GPT, Codex, other AI agents, repositories, deployments, owner approvals, and durable project state.

The commands below are operating protocols, not conversational suggestions.

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

## WORKER MODE / WORK MODE

`WORKER MODE` and `WORK MODE` are synonymous.

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
3. Read `CURRENT_STATE.md` when present.
4. Read role-specific control files required by the repository.
5. Verify authoritative Git/deployment state when relevant.
6. Recover Task ID, task state, objective, role, owner, blockers, branch/SHA, task size, timebox, scope ceiling, and exact next action.
7. Mark workflow mode ACTIVE when the repository tracks that field.
8. Do not advance the task merely because workflow mode was activated.

Workflow Mode remains active until `CLOSE` or `EXIT WORKFLOW` is explicitly issued.

`QUESTION` and `CONVO` temporarily freeze execution without disabling Workflow Mode.

---

# 3. MANDATORY HANDOFF FOOTER

Every workflow/production response triggered by `START`, `RESUME`, `CONTINUE`, `PROCEED`, `STATUS`, `PAUSE`, `CHECKPOINT`, `BRIEF`, `CLOSE`, `EXIT WORKFLOW`, `WCPADD`, `PROPAGATE`, `WORKFLOW MODE`, `WORKFLOW START`, `ORCHESTRATOR MODE`, `WORKER MODE`, `WORK MODE`, `HANDOFF`, `REVIEW`, `APPROVE`, `REJECT`, `ABORT`, or a Codex completion must end with exactly:

`TASK ID #N: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`

`OBJECTIVE: <one short plain-language phrase>`

`ALEX ACTION: <one exact next action or None — GPT is handling the next step.>`

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

# 5. TASK SIZE / TIMEBOX / SCOPE CHECKSUM

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
- `TIMEBOX`
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

## TIMEBOX override

`TIMEBOX <5|10|20|30>` allows the ORCHESTRATOR/owner to explicitly override the current task's default timebox without changing its Task ID. A WORKER cannot issue this override for itself.

---

# 6. START <PROJECT>

Initialize a new project or formalize an existing unstructured project.

When issued:

1. Identify project/repository.
2. Read existing agent/project documentation.
3. Establish source-of-truth files, default branch, deployment target, and project boundaries.
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

Create a clean resumable stopping point without leaving Workflow Mode. Persist Task ID/status, role, branch/SHA, accepted work, validation/deployment state, blockers, task size/timebox/scope ceiling, current owner, and exactly one next action.

End with the mandatory handoff footer.

---

# 11. CHECKPOINT

Persist current state immediately without necessarily pausing work. The checkpoint must be sufficient for a fresh agent/thread to resume without relying on chat memory.

Include Task ID/status, objective, agent role, workflow mode, task size, timebox cycle, scope ceiling, attempt count, branch/SHA, completed work, validation, deployment/runtime, blockers, current owner, and exactly one next step.

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

Prefer aliases/extensions over unnecessary new commands. Update materially affected control-plane files and run `PROPAGATE WCP` automatically unless the owner explicitly says not to propagate yet.

End with the mandatory handoff footer.

---

# 15. PROPAGATE [WCP | <ARTIFACT>]

Synchronize an authoritative shared control-plane artifact to all materially affected active copies without changing product/task state.

Plain `PROPAGATE` means `PROPAGATE WCP` when the immediately preceding change was a workflow-command change.

Do not overwrite project-specific instructions. Never propagate secrets or unrelated project files.

End with the mandatory handoff footer.

---

# 16. QUESTION

Answer without executing workflow changes by default. If Workflow Mode is active, QUESTION freezes execution but does not exit it.

---

# 17. CONVO

Discussion/planning mode. No execution by default. If Workflow Mode is active, CONVO freezes execution but does not exit it.

---

# 18. CLARIFY <TEXT>

Correct or disambiguate a misunderstanding, typo, naming issue, scope interpretation, or communication lapse without creating a new task by default.

---

# 19. EXPLAIN <TOPIC>

Explain a system, task, decision, file, concept, workflow state, or implementation without changing it.

---

# 20. NOTE <TEXT>

Record durable information relevant to the active project without automatically changing execution state.

---

# 21. STEPS

Show the current task as a concise operational sequence including where it stands, what happened, what happens next, actor ownership, and any unavoidable owner action.

---

# 22. ROUTE <OBJECTIVE>

Determine the best execution owner/path. ORCHESTRATOR owns routing; WORKER may recommend but may not reassign itself or others.

---

# 23. HANDOFF

Generate the exact next agent-ready transfer. Include Task ID, objective, AGENT ROLE, repository/project, starting branch/SHA, TASK SIZE, TIMEBOX, SCOPE CEILING, ATTEMPT LIMIT, relevant context, allowed scope, locked invariants, validation requirements, stop condition, and expected completion report.

End with the mandatory handoff footer.

---

# 24. SPLIT

ORCHESTRATOR-only decomposition of an objective into parallel-safe independent tasks. Workers may recommend a split but may not authorize it.

---

# 25. SYNC [PROJECT]

Reconcile documented project state with authoritative systems. Do not silently change production merely to make states match.

---

# 26. REVIEW

Perform an independent checksum against the task contract. Return PASS, FAIL, or NEEDS REVISION. Review scope, timebox/checksum compliance, acceptance criteria, regressions, branch/SHA, deployment, and documentation accuracy.

End with the mandatory handoff footer.

---

# 27. APPROVE

Approve the current review/acceptance gate and advance only to the next already-authorized stage. Approval does not grant unlimited scope.

---

# 28. REJECT <REASON>

Reject the current result while preserving the active Task ID unless the objective itself is abandoned.

---

# 29. ABORT

Terminate the active task without marking it complete. Preserve existing work/state and record rollback/cleanup needs.

---

# 30. LOCK <THING>

Mark an accepted design, behavior, interface, architecture decision, workflow rule, or invariant as protected.

---

# 31. UNLOCK <THING>

Explicitly permit modification of a previously locked invariant.

---

# 32. PRIORITY <PROJECT OR TASK>

ORCHESTRATOR changes sequencing priority without changing scope or approval gates.

---

# 33. QUEUE

Show active project/task queue: project, Task ID, status, role/owner, objective, blocker, priority, timebox state, and next action.

---

# 34. MOBILE MODE

Switch workflow ergonomics for mobile use without changing project state.

---

# 35. OFFICE MODE

Switch workflow ergonomics for desktop/office use without changing project state.

---

# 36. USAGE

Report available workload/resource/usage information only when actually accessible. Never fabricate usage data.

---

# 37. CHEATSHEET <TOPIC>

Create a high-information-density, single-glance visual explainer. Unless explicitly told otherwise, CHEATSHEET is visual-first and equivalent to `CHEATSHEET IMAGE` when image generation is available.

---

# 38. CORE EXECUTION PRINCIPLES

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
16. A WORKER must stop at the scope ceiling or mandatory checksum.

---

# 39. CODEX / WORKER TASK CONTRACT

Every substantive worker task must define:

- AGENT ROLE: WORKER
- Task ID
- one objective
- repository
- base branch
- exact base SHA when relevant
- prerequisites
- TASK SIZE
- TIMEBOX
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

# 40. CURRENT_STATE.md RECOMMENDED FORMAT

```md
# CURRENT STATE

AGENT ROLE: ORCHESTRATOR | WORKER
WORKFLOW MODE: ACTIVE | INACTIVE

TASK ID: #N
STATUS: READY | IN PROGRESS | COMPLETE | BLOCKED | PAUSED
OBJECTIVE: <one short objective>
TASK SIZE: TINY | SMALL | MEDIUM | LARGE
TIMEBOX: 5m | 10m | 20m | 30m
TIMEBOX CYCLE: <integer>
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

# 41. RECOMMENDED MULTI-WINDOW BOOTSTRAP

Primary control window:

```text
ORCHESTRATOR MODE
WORKFLOW START
STATUS
```

Worker GPT/Codex windows:

```text
WORK MODE
WORKFLOW START
STATUS
RESUME <PROJECT>
```

Only the explicitly designated ORCHESTRATOR may assign/reassign tasks, set timeboxes/scope ceilings, split work, or authorize continuation after a failed checksum.

This protocol is designed to remain project-agnostic and durable across repositories, sessions, devices, and parallel AI-agent workflows.