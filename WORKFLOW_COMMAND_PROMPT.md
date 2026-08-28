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

Every workflow/production response triggered by `START`, `RESUME`, `CONTINUE`, `STATUS`, `PAUSE`, `CHECKPOINT`, `BRIEF`, `CLOSE`, `WCPADD`, `WORKFLOW MODE`, `EXIT WORKFLOW`, `HANDOFF`, `REVIEW`, `APPROVE`, `REJECT`, `ABORT`, or a Codex completion must end with exactly:

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

# 10. BRIEF [PROJECT | ALL]

Create a fast operational recap before work begins.

## `BRIEF <PROJECT>`

Read, as applicable:

1. `SYSTEM - Master Project Registry.md`
2. the project's `CURRENT_STATE.md`
3. authoritative Git/deployment state when the current task depends on it
4. recent accepted checkpoints/decisions needed to understand the immediate context

Return only:

- what was completed most recently
- where the project stopped
- current Task ID/status
- current owner
- blocker, if any
- highest-value next task/action

Do not advance the task merely by briefing it.

## `BRIEF ALL`

Read the Master Project Registry and the `CURRENT_STATE.md` files for active/high-priority projects.

Produce a concise portfolio recap:

- what materially changed most recently
- where each active project stopped
- blockers
- current owners
- recommended priority order
- the single best project/task to resume next

Prefer signal over exhaustive history.

End with the mandatory handoff footer.

---

# 11. CLOSE [PROJECT | ALL]

Perform an end-of-work-session synchronization so the next session can resume without relying on chat history.

## `CLOSE <PROJECT>`

Before closing:

1. reconcile the current project state with authoritative files/systems;
2. update the project's `CURRENT_STATE.md`;
3. update `SYSTEM - Master Project Registry.md` when status, priority, owner, repo, deployment, or next action changed;
4. update durable decision/architecture/workflow documentation only when the session materially changed those facts;
5. for Git-backed projects, ensure repository workflow/state docs accurately reflect the accepted state;
6. record completed work, validation/deployment status, blockers/risks, current owner, and exactly one next operational step;
7. do not create meaningless commits or documentation churn solely because `CLOSE` was issued.

If closing all active work, use `CLOSE ALL` and repeat this synchronization for every project materially touched during the session.

`CLOSE` is an end-of-session synchronization command. It does not mean the project or active task is complete.

When unfinished work remains, leave the task in the accurate state (`IN PROGRESS`, `BLOCKED`, or `PAUSED`) and make the next action explicit.

End with the mandatory handoff footer.

---

# 12. WCPADD [X-TASK]

Add or revise a command in the canonical workflow command language.

Use:

`WCPADD <command definition or requested workflow behavior>`

Examples:

- `WCPADD add a DEPLOY command for production releases`
- `WCPADD update BRIEF so it includes blocked dependencies`
- `WCPADD add a SECURITY REVIEW command`

When issued:

1. Read the current canonical `WORKFLOW_COMMAND_PROMPT.md`.
2. Determine whether the requested behavior:
   - belongs in an existing command;
   - requires a new command;
   - conflicts with or duplicates an existing command.
3. Prefer extending an existing command when that keeps the language simpler.
4. If a new command is justified, define:
   - command name/syntax;
   - purpose;
   - trigger conditions;
   - required reads/writes;
   - stop/approval conditions;
   - handoff-footer behavior where applicable.
5. Update the canonical `WORKFLOW_COMMAND_PROMPT.md`.
6. Update `AGENTS.md`, `SYSTEM - Daily Ops.md`, `SYSTEM - Project Bootstrap.md`, `SYSTEM - Master Project Registry.md`, naming/system docs, and repo-local workflow files only where the new command materially affects them.
7. Propagate the updated command definition to all active Git-backed project workflow copies that use the canonical protocol.
8. Preserve project-specific instructions and do not overwrite unrelated agent rules.
9. Do not create conflicting duplicate workflow-command files.
10. Report exactly what was changed and where.

`WCPADD` changes the workflow control plane itself. Treat it as an administrative/meta command, not as a normal project task.

When the requested addition is ambiguous or could materially alter safety/approval behavior, stop and ask for clarification before propagating.

End with the mandatory handoff footer.

---

# 13. WORKFLOW MODE

Enter persistent structured workflow execution for the active project or repository.

Use:

`WORKFLOW MODE`

When issued:

1. Read `AGENTS.md`.
2. Read this canonical workflow protocol.
3. Read `CURRENT_STATE.md` if present.
4. Read the active orchestrator/work-mode/task-contract files required by the repository.
5. Verify authoritative Git/deployment state when relevant to the active task.
6. Recover the current Task ID, task state, objective, owner, blockers, branch/SHA, and exact next operational action.
7. Mark workflow mode as `ACTIVE` in `CURRENT_STATE.md` or the repository's equivalent authoritative checkpoint when one exists.
8. Do not advance the task merely because workflow mode was activated.
9. From that point forward, treat owner workflow commands and production work as governed by this protocol until `EXIT WORKFLOW` is explicitly issued.
10. Preserve workflow mode across `START`, `RESUME`, `CONTINUE`, `STATUS`, `CHECKPOINT`, `PAUSE`, `BRIEF`, `CLOSE`, handoffs, and Codex completion reports unless explicitly exited.

While workflow mode is active:

- do not silently fall back to ordinary ad hoc agent behavior;
- follow Task ID, checkpoint, scope, approval, validation, transport, and handoff rules;
- stop at defined task boundaries instead of chaining into unrelated work;
- use `QUESTION` or `CONVO` for temporary non-executing discussion without disabling workflow mode;
- `CONTINUE` returns to the exact prior workflow execution state after `QUESTION` or `CONVO`.

Workflow mode is an execution-protocol state, not a project/task status. Activating it must not change the task from `READY`, `IN PROGRESS`, `COMPLETE`, `BLOCKED`, or `PAUSED`.

End with the mandatory handoff footer.

---

# 14. EXIT WORKFLOW

Leave persistent structured workflow execution without changing the underlying project/task state.

Use:

`EXIT WORKFLOW`

When issued:

1. Preserve the current Task ID, objective, branch/SHA, current owner, blockers, locks, approvals, and checkpoint state.
2. Mark workflow mode as `INACTIVE` in `CURRENT_STATE.md` or the repository's equivalent authoritative checkpoint when one exists.
3. Do not mark work complete, paused, blocked, approved, merged, or deployed merely because workflow mode was exited.
4. Return to normal conversational/ad hoc interaction rules after reporting the preserved project state.
5. Keep all workflow commands available; `WORKFLOW MODE` can reactivate structured execution at any time.

`EXIT WORKFLOW` disables protocol enforcement for subsequent ordinary interaction; it does not erase, reset, or rewrite project truth.

End with the mandatory handoff footer.

---

# 15. QUESTION

Answer the owner's question without executing workflow changes by default.

Do not edit code, Git, deployments, infrastructure, files, or production systems unless the owner explicitly converts the request into execution.

Do not require the workflow footer for an ordinary question unless workflow state is also requested.

---

# 16. CONVO

Enter discussion/planning mode.

Use for brainstorming, architecture discussion, weighing alternatives, or talking through a decision.

No execution by default.

Do not change task state merely because a conversation occurred.

---

# 16A. CLARIFY <TEXT>

Correct or disambiguate a misunderstanding, typo, naming issue, scope interpretation, or communication lapse without creating a new task by default.

When `CLARIFY` is issued:

1. Treat the supplied clarification as authoritative for the current context unless it conflicts with a higher-priority locked or safety-critical rule.
2. Restate the corrected interpretation only when needed to remove ambiguity.
3. Apply the correction to subsequent workflow reasoning and execution.
4. Update durable project documentation only when the clarification materially changes project truth, naming, scope, constraints, or acceptance criteria.
5. Do not execute unrelated work merely because a clarification was supplied.
6. Do not silently rewrite previously accepted or locked work unless the clarification explicitly changes it.

`CLARIFY` is normally non-executing and does not require the mandatory handoff footer unless workflow state is also being changed or reported.

---

# 16B. EXPLAIN <TOPIC>

Explain a system, task, decision, file, concept, workflow state, or implementation in plain language without changing it.

When `EXPLAIN` is issued:

1. Inspect relevant authoritative context when necessary for an accurate explanation.
2. Explain the requested topic at the minimum useful depth unless the owner asks for a detailed breakdown.
3. Distinguish verified facts from assumptions or interpretation.
4. Do not edit code, files, Git, deployments, infrastructure, or task state by default.
5. If the explanation reveals a defect or recommended change, identify it without automatically implementing it.

`EXPLAIN` is non-executing and does not require the mandatory handoff footer unless workflow state is also requested.

---

# 17. NOTE <TEXT>

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

# 18. STEPS

Show the current task as a concise operational sequence.

Include:

- where the task stands
- what has already happened
- what happens next
- which actor owns each step
- any unavoidable manual owner action

Do not replace the task plan or create a new objective unless explicitly requested.

---

# 19. ROUTE <OBJECTIVE>

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

# 20. HANDOFF

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

# 21. SPLIT

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

# 22. SYNC [PROJECT]

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

# 23. REVIEW

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

# 24. APPROVE

Approve the current review/acceptance gate and advance only to the next already-authorized stage.

Examples:

- approve preview for merge
- approve migration cutover
- approve physical acceptance
- approve locked design

Approval does not grant unlimited scope.

End with the mandatory handoff footer.

---

# 25. REJECT <REASON>

Reject the current result while preserving the active Task ID unless the objective itself is abandoned.

Record the rejection reason.

Route the task back to the appropriate owner with a focused correction contract.

Do not immediately generate speculative patches without identifying the reason for failure.

End with the mandatory handoff footer.

---

# 26. ABORT

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

# 27. LOCK <THING>

Mark an accepted design, behavior, interface, architecture decision, visual baseline, workflow rule, or other invariant as protected.

Persist the lock in the appropriate durable project documentation.

Future tasks must preserve the lock unless explicitly unlocked.

---

# 28. UNLOCK <THING>

Explicitly permit modification of a previously locked invariant.

Record:

- what is unlocked
- why
- scope of permitted change
- whether the unlock is temporary or permanent

Do not interpret unrelated change requests as implicit unlocks.

---

# 29. PRIORITY <PROJECT OR TASK>

Raise or set execution priority among parallel projects/tasks.

Update queue/order information without silently cancelling other work.

Priority changes sequencing, not scope or approval gates.

---

# 30. QUEUE

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

# 31. MOBILE MODE

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

# 32. OFFICE MODE

Switch workflow ergonomics for desktop/office use without changing project state.

Desktop mode may use:

- fuller diagnostics
- local development tools when useful
- larger review surfaces
- multiple windows
- direct file inspection

Project source of truth and Task IDs remain unchanged.

---

# 33. USAGE

Report available workload/resource/usage information relevant to the active environment when that information is actually accessible.

Do not fabricate token, quota, billing, or account usage that cannot be read from an authoritative source.

If unavailable, state what can and cannot be determined.

---

# 34. CHEATSHEET <TOPIC>

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

# 35. CORE EXECUTION PRINCIPLES

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

# 36. CODEX TASK CONTRACT

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

# 37. CURRENT_STATE.md RECOMMENDED FORMAT

Use `CURRENT_STATE.md` as the single resumable checkpoint when appropriate.

```md
# CURRENT STATE

TASK ID: #N
STATUS: READY | IN PROGRESS | COMPLETE | BLOCKED | PAUSED
OBJECTIVE: <one short objective>
WORKFLOW MODE: ACTIVE | INACTIVE

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

# 38. NEW REPOSITORY BOOTSTRAP SUMMARY

For a new repository:

1. Copy `WORKFLOW_COMMAND_PROMPT.md` into the repository root.
2. The first agent that reads it must run Section 0 and safely create/amend `AGENTS.md`.
3. Preserve all pre-existing `AGENTS.md` content.
4. Create `CURRENT_STATE.md` when project work becomes stateful.
5. Use `START <PROJECT>` for a new project.
6. Use `BRIEF <PROJECT>` or `BRIEF ALL` to regain orientation.
7. Use `WORKFLOW MODE` when persistent structured execution is required.
8. Use `RESUME <PROJECT>` to continue work.
9. Use `CLOSE <PROJECT>` or `CLOSE ALL` before ending a meaningful work session.
10. Use `EXIT WORKFLOW` to return to ordinary ad hoc interaction without changing project/task state.

This protocol is designed to remain project-agnostic and durable across repositories, sessions, devices, and parallel AI-agent workflows.