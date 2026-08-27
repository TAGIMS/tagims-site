# AI Workflow Command Protocol
Status: Active, project-agnostic control-plane protocol
Canonical filename: `WORKFLOW_COMMAND_PROMPT.md`

This file defines a compact command language for coordinating GPT, Codex, other AI agents, repositories, deployments, and owner approvals across multiple parallel projects.

The commands below are operating protocols, not conversational suggestions.

---

# 0. SELF-INSTALL / BOOTSTRAP RULE

When an AI agent reads this file inside a repository, it must first ensure that the repository's root-level `AGENTS.md` points back to this file.

## If `AGENTS.md` already exists

Preserve all existing content.

Add the following instruction only if an equivalent instruction is not already present:

> Before handling owner workflow commands, read and follow `WORKFLOW_COMMAND_PROMPT.md`. Commands defined there are mandatory operating protocols, not conversational suggestions.

Do not overwrite, replace, truncate, or discard existing `AGENTS.md` instructions.

If the repository already has a workflow-command reference using an older filename, update that reference to `WORKFLOW_COMMAND_PROMPT.md`.

## If `AGENTS.md` does not exist

Create a minimal root-level `AGENTS.md` containing:

```md
# Agent Instructions

Before handling owner workflow commands, read and follow `WORKFLOW_COMMAND_PROMPT.md`.

Commands defined there are mandatory operating protocols, not conversational suggestions.

Preserve project-specific architecture, security, deployment, and repository instructions added later.
```

## Bootstrap completion

After the reference is present, use this file as the canonical definition of owner workflow commands.

Never create duplicate workflow command files unless explicitly required for compatibility.

---

# 1. MANDATORY HANDOFF FOOTER

Every workflow/production response triggered by `START`, `RESUME`, `CONTINUE`, `STATUS`, `PAUSE`, `CHECKPOINT`, `HANDOFF`, `REVIEW`, `APPROVE`, `REJECT`, `ABORT`, or a Codex completion must end with exactly:

`TASK ID #N: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`

`OBJECTIVE: <one short plain-language phrase>`

`ALEX ACTION: <one exact next action or None — GPT is handling the next step.>`

Do not substitute a generic summary.

`ALEX ACTION` must contain exactly one next action.

---

# 2. TASK IDs AND STATES

Use sequential `TASK ID #N` values within each project.

Same-slice continuation, refinement, retry, debugging, deployment follow-through, and acceptance normally preserve the same Task ID.

Create a new Task ID only when a genuinely new objective begins.

Supported task states:

- `READY`
- `IN PROGRESS`
- `COMPLETE`
- `BLOCKED`
- `PAUSED`

A task is `COMPLETE` only when its stated objective is actually achieved.

Local implementation success does not equal merged, deployed, or physically accepted success unless the objective explicitly ends there.

---

# 3. START <PROJECT>

Initialize a brand-new project or formalize an existing unstructured project.

When `START <PROJECT>` is issued:

1. Identify the intended project/repository.
2. Verify whether a repository already exists.
3. Read any existing `AGENTS.md` and project documentation before modifying anything.
4. Run the self-install/bootstrap rule in Section 0.
5. Establish project identity, source-of-truth files, repository/default branch, deployment target if any, and project boundaries.
6. Create `CURRENT_STATE.md` if the project does not already have an equivalent authoritative resume checkpoint.
7. Assign `TASK ID #1`.
8. Define one initial objective.
9. Identify the current owner of the next step.
10. Record exactly one next operational action.
11. Do not begin speculative implementation unless explicitly requested or clearly included in the START instruction.

End with the mandatory handoff footer.

---

# 4. RESUME <PROJECT>

Recover an existing project's authoritative state and continue exactly where it stopped.

When `RESUME` or `RESUME <PROJECT>` is issued:

1. Read `AGENTS.md`.
2. Read this file.
3. Read `CURRENT_STATE.md` if present.
4. Read other authoritative workflow/state files required by the project.
5. Verify actual Git/deployment state when relevant.
6. Recover:
   - active Task ID
   - task status
   - objective
   - last accepted checkpoint
   - current owner
   - branch/SHA when relevant
   - test/deployment state
   - blockers
   - exact next operational step
7. Continue from the checkpoint.
8. Do not restart planning.
9. Do not invent a new task.
10. Do not treat `RESUME` as ordinary conversation.

If state is contradictory, stale, or unsafe to infer, return `BLOCKED` and identify one exact action required to reconcile it.

End with the mandatory handoff footer.

---

# 5. SWITCH <PROJECT>

Change the active conversational/project context without changing that project's task state.

Use when multiple projects are running in parallel.

When `SWITCH <PROJECT>` is issued:

1. Identify the target project.
2. Load enough authoritative state to establish context.
3. Do not advance, pause, or modify the target project merely because it became active.
4. Report its active task and current owner briefly.
5. Preserve all other project states.

If the user wants work to continue immediately after switching, use `RESUME <PROJECT>` instead.

---

# 6. CONTINUE

Advance from the current checkpoint and previous `ALEX ACTION`.

Do not regenerate the project plan from scratch.

Preserve the current Task ID unless a genuinely new objective begins.

If the previous action was an owner handoff to another agent, interpret `CONTINUE` as processing the returned result and advancing the workflow.

End with the mandatory handoff footer.

---

# 7. STATUS [PROJECT]

Provide an orientation snapshot.

Report only:

- current Task ID/status
- current objective
- what just completed or changed
- current owner / who has the ball
- blocker, if any
- exact next operational action

Do not restart or advance the task unless explicitly asked.

End with the mandatory handoff footer.

---

# 8. PAUSE [PROJECT]

Create a clean resumable stopping point.

Before pausing:

1. Update `CURRENT_STATE.md` when used by the repository.
2. Record Task ID/status.
3. Record branch/SHA when relevant.
4. Record accepted work.
5. Record validation/deployment state.
6. Record blockers/risks.
7. Record current owner.
8. Record exactly one next operational step.

Use `PAUSED` unless the task is actually `BLOCKED` or `COMPLETE`.

End with the mandatory handoff footer.

---

# 9. CHECKPOINT

Persist the current state immediately without necessarily pausing work.

Update `CURRENT_STATE.md` or the project's equivalent authoritative checkpoint with:

- Task ID/status
- objective
- branch/SHA when relevant
- completed/accepted work
- evidence and validation
- deployment/runtime state
- blockers/risks
- current owner
- exactly one next operational step

The checkpoint must be sufficient for a fresh agent/thread to resume without relying on chat memory.

End with the mandatory handoff footer.

---

# 10. QUESTION

Answer the owner's question without executing workflow changes by default.

Do not edit code, Git, deployments, infrastructure, files, or production systems unless the owner explicitly converts the request into execution.

Do not require the workflow footer for an ordinary question unless workflow state is also requested.

---

# 11. CONVO

Enter discussion/planning mode.

Use for brainstorming, architecture discussion, weighing alternatives, or talking through a decision.

No execution by default.

Do not change task state merely because a conversation occurred.

---

# 12. NOTE <TEXT>

Record information relevant to the active project without automatically changing execution state.

Classify the note as appropriate:

- durable project context
- decision
- constraint
- future idea
- temporary observation
- acceptance result
- blocker

Update the appropriate authoritative project file when the note materially affects future work.

Do not create unnecessary permanent documentation for trivial comments.

---

# 13. STEPS

Show the current task as a concise operational sequence.

Include:

- where the task stands
- what has already happened
- what happens next
- which actor owns each step
- any unavoidable manual owner action

Do not replace the task plan or create a new objective unless explicitly requested.

---

# 14. ROUTE <OBJECTIVE>

Determine the best execution owner and path for a requested objective.

Possible owners include:

- GPT/orchestrator
- Codex
- another specialized agent
- owner/manual action
- external service/tool

Consider:

- required tools
- repository access
- risk
- scope
- parallelizability
- need for coding
- need for physical/user acceptance
- deployment consequences

Produce the smallest safe task contract and assign ownership.

Do not automatically send work to Codex when GPT can complete it directly and safely.

---

# 15. HANDOFF

Generate the exact next agent-ready transfer from current authoritative state.

A handoff should include only what the receiving agent needs:

- Task ID
- objective
- repository/project
- starting branch/SHA when relevant
- relevant context
- allowed scope
- locked invariants
- validation requirements
- stop condition
- expected completion report

For large transfers use:

`TASK #N — HANDOFF X/Y`

Split by semantic unit/file first and keep blocks practically screen-sized.

End with the mandatory handoff footer.

---

# 16. SPLIT

Decompose an objective into parallel-safe independent tasks.

For each task force define:

- Task ID/subtask ID
- owner
- objective
- repository
- base branch/SHA
- feature branch/worktree if appropriate
- allowed scope
- locked invariants
- dependencies
- acceptance criteria
- stop condition
- merge/integration order

Do not parallelize tasks that would edit the same state unsafely.

---

# 17. SYNC [PROJECT]

Reconcile the project's documented state with actual authoritative systems.

Check as relevant:

- repository
- branch
- SHA
- working tree
- pull requests
- CI/checks
- deployment
- production runtime
- workflow/state docs

Identify drift and establish the true source of truth.

Do not silently change production or merge branches merely to make state match.

---

# 18. REVIEW

Perform an independent checksum of the current result against the task contract.

Review for:

- acceptance criteria
- missing requirements
- unauthorized scope changes
- monkey patches
- regressions
- insufficient testing
- branch/SHA correctness
- preview/deployment correctness
- documentation/state accuracy

Return one of:

- `PASS`
- `FAIL`
- `NEEDS REVISION`

Do not approve merely because implementation completed.

When physical acceptance is required, produce one clear owner acceptance test.

End with the mandatory handoff footer.

---

# 19. APPROVE

Approve the current review/acceptance gate and advance only to the next already-authorized stage.

Examples:

- approve preview for merge
- approve migration cutover
- approve physical acceptance
- approve locked design

Approval does not grant unlimited scope.

End with the mandatory handoff footer.

---

# 20. REJECT <REASON>

Reject the current result while preserving the active Task ID unless the objective itself is abandoned.

Record the rejection reason.

Route the task back to the appropriate owner with a focused correction contract.

Do not immediately generate speculative patches without identifying the reason for failure.

End with the mandatory handoff footer.

---

# 21. ABORT

Terminate the active task without marking it complete.

Record:

- why it was aborted
- what work exists
- whether any branch/deployment/artifact remains
- rollback or cleanup requirement
- whether the objective is abandoned or may be restarted later

Use `PAUSED` or another accurate state if the project itself remains active.

End with the mandatory handoff footer.

---

# 22. LOCK <THING>

Mark an accepted design, behavior, interface, architecture decision, visual baseline, workflow rule, or other invariant as protected.

Persist the lock in the appropriate durable project documentation.

Future tasks must preserve the lock unless explicitly unlocked.

---

# 23. UNLOCK <THING>

Explicitly permit modification of a previously locked invariant.

Record:

- what is unlocked
- why
- scope of permitted change
- whether the unlock is temporary or permanent

Do not interpret unrelated change requests as implicit unlocks.

---

# 24. PRIORITY <PROJECT OR TASK>

Raise or set execution priority among parallel projects/tasks.

Update queue/order information without silently cancelling other work.

Priority changes sequencing, not scope or approval gates.

---

# 25. QUEUE

Show the multi-project command view.

For each active project/task show concisely:

- project
- Task ID
- status
- objective
- current owner
- blocker
- priority
- next action

Use this to decide what should run, wait, split, or switch next.

---

# 26. MOBILE MODE

Switch workflow ergonomics for mobile use without changing project state.

Prefer:

- shorter handoffs
- minimal typing
- one owner action at a time
- cloud execution
- no dependence on local desktop compute
- small copyable blocks

Project source of truth and Task IDs remain unchanged.

---

# 27. OFFICE MODE

Switch workflow ergonomics for desktop/office use without changing project state.

Desktop mode may use:

- fuller diagnostics
- local development tools when useful
- larger review surfaces
- multiple windows
- direct file inspection

Project source of truth and Task IDs remain unchanged.

---

# 28. USAGE

Report available workload/resource/usage information relevant to the active environment when that information is actually accessible.

Do not fabricate token, quota, billing, or account usage that cannot be read from an authoritative source.

If unavailable, state what can and cannot be determined.

---

# 29. CHEATSHEET <TOPIC>

Create a high-information-density, single-glance visual explainer for a complex topic.

Primary goal:

**compress a large amount of connected information into one coherent visual that can be absorbed quickly.**

Default behavior:

1. Identify the core concept.
2. Extract the most important connected information.
3. Organize it into a strong visual hierarchy.
4. Select the best visual structure automatically, such as:
   - system architecture map
   - process flow
   - layered diagram
   - decision tree
   - comparison grid
   - timeline
   - relationship map
5. Optimize for high information density without becoming unreadable.
6. Prefer visual generation when the environment supports it.

Supported modifiers:

- `CHEATSHEET IMAGE <TOPIC>` — generate the actual visual.
- `CHEATSHEET TEXT <TOPIC>` — return the structured information architecture only.
- `CHEATSHEET UPDATE` — revise the current cheatsheet while preserving accepted structure/style.
- `CHEATSHEET COMPARE <A> vs <B>` — comparison-oriented visual.
- `CHEATSHEET FLOW <TOPIC>` — process/workflow-oriented visual.
- `CHEATSHEET SYSTEM <TOPIC>` — architecture/components/dependencies visual.

Unless explicitly told otherwise, `CHEATSHEET` is visual-first.

---

# 30. CORE EXECUTION PRINCIPLES

These rules apply across commands and projects:

1. Build the smallest complete vertical slice before expanding.
2. Diagnose root cause before patching.
3. Refactor cleanly instead of stacking repeated overrides or monkey patches.
4. Do not modify unrelated systems.
5. Preserve accepted baselines and locks.
6. Keep secrets, credentials, tokens, private keys, and sensitive account data out of repositories and prompts.
7. Treat destructive/security/billing/auth/domain/production changes as approval-gated unless explicitly authorized.
8. Prefer reversible changes and preserve rollback paths.
9. Verify transport/deployment path before coding when publication is part of the objective.
10. Do not treat sandbox/local success as production success.
11. Keep unrelated repositories and products separate.
12. Do not expand scope without authorization.
13. Do not merge without authorization unless the active task explicitly grants it.
14. Do not use the owner as a technical courier when agents/tools can perform the transfer directly.

---

# 31. CODEX TASK CONTRACT

Every substantive Codex implementation task should define:

- Task ID
- one objective
- repository
- base branch
- exact base SHA when relevant
- prerequisites
- allowed scope
- locked invariants
- validation
- transport/publication mode
- literal stop condition

Codex should:

1. Read `AGENTS.md`.
2. Read this workflow protocol.
3. Verify repo/branch/SHA/scope.
4. Stop if authoritative state is stale or inconsistent.
5. Diagnose uncertain root causes before editing.
6. Implement complete system-level fixes.
7. Add/update tests where appropriate.
8. Run required checks.
9. Use focused branches/worktrees when appropriate.
10. Use focused pull requests when review is required.
11. Produce preview deployments when required.
12. Report files changed and checks performed.
13. Stop at the defined stop condition.
14. Never merge without authorization unless explicitly granted.
15. Never expand scope without authorization.

If an exact required base SHA is unavailable or mismatched:

**STOP. DO NOT CODE.**

---

# 32. CURRENT_STATE.md RECOMMENDED FORMAT

Use `CURRENT_STATE.md` as the single resumable checkpoint when appropriate.

```md
# CURRENT STATE

TASK ID: #N
STATUS: READY | IN PROGRESS | COMPLETE | BLOCKED | PAUSED
OBJECTIVE: <one short objective>

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

# 33. NEW REPOSITORY BOOTSTRAP SUMMARY

For a new repository:

1. Copy `WORKFLOW_COMMAND_PROMPT.md` into the repository root.
2. The first agent that reads it must run Section 0 and safely create/amend `AGENTS.md`.
3. Preserve all pre-existing `AGENTS.md` content.
4. Create `CURRENT_STATE.md` when project work becomes stateful.
5. Use `START <PROJECT>` for a new project.
6. Use `RESUME <PROJECT>` thereafter.

This protocol is designed to remain project-agnostic and durable across repositories, sessions, devices, and parallel AI-agent workflows.
