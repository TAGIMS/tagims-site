# AI Workflow Command Protocol
Status: Active, project-agnostic control-plane protocol
Canonical filename: `WORKFLOW_COMMAND_PROMPT.md`

This file defines the canonical command language for coordinating GPT, Codex, other AI agents, repositories, deployments, owner approvals, and durable project state.

The commands below are operating protocols, not conversational suggestions.

---

# 0. SELF-INSTALL / BOOTSTRAP RULE

When an AI agent reads this file inside a repository, it must first ensure the repository's root-level `AGENTS.md` points back to this file.

If `AGENTS.md` already exists, preserve all existing content and add an equivalent of the following instruction only if it is missing:

> Before handling owner workflow commands, read and follow `WORKFLOW_COMMAND_PROMPT.md`. Commands defined there are mandatory operating protocols, not conversational suggestions.

Do not overwrite, truncate, or discard project-specific `AGENTS.md` instructions.

If `AGENTS.md` does not exist, create a minimal file containing that reference while preserving room for future project-specific rules.

After the reference is present, use this file as the canonical definition of owner workflow commands. Never create conflicting duplicate workflow-command files.

---

# 1. MANDATORY HANDOFF FOOTER

Every workflow/production response triggered by `START`, `RESUME`, `CONTINUE`, `PROCEED`, `STATUS`, `PAUSE`, `CHECKPOINT`, `BRIEF`, `CLOSE`, `EXIT WORKFLOW`, `WCPADD`, `PROPAGATE`, `WORKFLOW MODE`, `HANDOFF`, `REVIEW`, `APPROVE`, `REJECT`, `ABORT`, or a Codex completion must end with exactly:

`TASK ID #N: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`

`OBJECTIVE: <one short plain-language phrase>`

`ALEX ACTION: <one exact next action or None — GPT is handling the next step.>`

Do not substitute a generic summary. `ALEX ACTION` must contain exactly one next action.

Any prompt, completion report, handoff, or other payload the owner must copy between agent windows must be placed inside a fenced code block so the UI exposes a one-click copy control. Large transfers must be split into numbered screen-sized fenced blocks.

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

A task is `COMPLETE` only when its stated objective is actually achieved. Local implementation success does not equal merged, deployed, or physically accepted success unless the objective explicitly ends there.

---

# 3. START <PROJECT>

Initialize a brand-new project or formalize an existing unstructured project.

When issued:

1. Identify the intended project/repository.
2. Verify whether a repository already exists.
3. Read existing `AGENTS.md` and project documentation before modifying anything.
4. Run the self-install/bootstrap rule in Section 0.
5. Establish project identity, source-of-truth files, repository/default branch, deployment target if any, and project boundaries.
6. Create `CURRENT_STATE.md` if no equivalent authoritative resume checkpoint exists.
7. Assign `TASK ID #1`.
8. Define one initial objective.
9. Identify the current owner of the next step.
10. Record exactly one next operational action.
11. Do not begin speculative implementation unless explicitly requested or clearly included in the START instruction.

End with the mandatory handoff footer.

---

# 4. RESUME / CONTINUE / PROCEED [PROJECT]

`RESUME`, `CONTINUE`, and `PROCEED` are synonymous workflow commands.

All three mean: recover authoritative current state when needed, then advance from the exact recorded next operational action.

Accepted syntax:

- `RESUME`
- `RESUME <PROJECT>`
- `CONTINUE`
- `CONTINUE <PROJECT>`
- `PROCEED`
- `PROCEED <PROJECT>`

When any alias is issued:

1. Identify the active/target project.
2. Read `AGENTS.md`.
3. Read this workflow protocol.
4. Read `CURRENT_STATE.md` if present.
5. Read other authoritative workflow/state files required by the project.
6. Verify actual Git/deployment state when relevant.
7. Recover the active Task ID, task status, objective, last accepted checkpoint, current owner, branch/SHA when relevant, test/deployment state, blockers, and exact next operational step.
8. Continue from that checkpoint.
9. Do not restart planning.
10. Do not invent a new task unless the recorded objective is complete and a genuinely new objective has been authorized.

If state is contradictory, stale, or unsafe to infer, return `BLOCKED` and identify one exact action required to reconcile it.

After `QUESTION` or `CONVO`, any of these aliases returns to the exact workflow state that existed before the temporary discussion freeze.

End with the mandatory handoff footer.

---

# 5. SWITCH <PROJECT>

Change the active conversational/project context without changing that project's task state.

When issued:

1. Identify the target project.
2. Load enough authoritative state to establish context.
3. Do not advance, pause, or modify the target merely because it became active.
4. Report its active task and current owner briefly.
5. Preserve all other project states.

If the user wants work to continue immediately after switching, use `RESUME`, `CONTINUE`, or `PROCEED`.

---

# 6. STATUS [PROJECT]

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

# 7. PAUSE [PROJECT]

Create a clean resumable stopping point without leaving workflow mode.

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

# 8. CHECKPOINT

Persist the current state immediately without necessarily pausing work.

Update `CURRENT_STATE.md` or the project's equivalent authoritative checkpoint with:

- Task ID/status
- objective
- workflow-mode state
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

# 9. BRIEF [PROJECT | ALL]

Create a fast operational recap before work begins.

For `BRIEF <PROJECT>`, read the project's current checkpoint, registry entry when available, and authoritative Git/deployment state when needed. Return only the most recent meaningful change, where the project stopped, current Task ID/status, current owner, blocker if any, and highest-value next action.

For `BRIEF ALL`, read the Master Project Registry and active/high-priority `CURRENT_STATE.md` files. Produce a concise portfolio recap with material changes, stopping points, blockers, current owners, recommended priority order, and the single best project/task to resume next.

Do not advance work merely by briefing it.

End with the mandatory handoff footer.

---

# 10. CLOSE / EXIT WORKFLOW [PROJECT | ALL]

`CLOSE` and `EXIT WORKFLOW` are synonymous workflow commands.

Both mean: reconcile and save durable state first, then leave persistent Workflow Mode.

Accepted syntax includes:

- `CLOSE`
- `CLOSE <PROJECT>`
- `CLOSE ALL`
- `CLOSE WORKFLOW`
- `EXIT WORKFLOW`
- `EXIT WORKFLOW <PROJECT>`
- `EXIT WORKFLOW ALL`

Before exiting:

1. Reconcile current project state with authoritative files/systems.
2. Update the project's `CURRENT_STATE.md`.
3. Update the Master Project Registry when status, priority, owner, repo, deployment, or next action changed.
4. Update durable decision/architecture/workflow documentation only when the session materially changed those facts.
5. For Git-backed projects, ensure repository workflow/state docs accurately reflect the accepted state.
6. Record completed work, validation/deployment status, blockers/risks, current owner, and exactly one next operational step.
7. Mark workflow mode `INACTIVE` in the authoritative checkpoint when that field is used.
8. Do not create meaningless commits or documentation churn solely because CLOSE/EXIT was issued.

For `CLOSE ALL` / `EXIT WORKFLOW ALL`, repeat synchronization for every project materially touched during the session before leaving workflow mode.

Closing/exiting does not mean the project or task is complete. Preserve the accurate task state (`READY`, `IN PROGRESS`, `BLOCKED`, `PAUSED`, or `COMPLETE`). Do not mark work approved, merged, deployed, or complete merely because workflow mode was exited.

End with the mandatory handoff footer.

---

# 11. WCPADD <REQUEST>

Add or revise the canonical workflow command language.

When issued:

1. Read the current canonical `WORKFLOW_COMMAND_PROMPT.md`.
2. Determine whether the requested behavior belongs in an existing command, requires a new command, or conflicts with/duplicates an existing command.
3. Prefer extending or aliasing an existing command when that keeps the language simpler.
4. Define command syntax, purpose, trigger conditions, required reads/writes, stop/approval conditions, and footer behavior where applicable.
5. Update the canonical workflow file.
6. Update materially affected control-plane files only where necessary.
7. Run `PROPAGATE WCP` automatically unless the owner explicitly says not to propagate yet.
8. Preserve project-specific instructions and never overwrite unrelated agent rules.
9. Do not create conflicting duplicate workflow-command files.
10. Report exactly what changed and where.

`WCPADD` changes the workflow control plane itself. Treat it as an administrative/meta command, not as a normal product task.

When the requested addition is ambiguous or could materially alter safety/approval behavior, stop and ask for clarification before propagating.

End with the mandatory handoff footer.

---

# 12. PROPAGATE [WCP | <ARTIFACT>]

Synchronize an authoritative shared control-plane artifact to all materially affected active copies without changing product/task state.

Default behavior:

- `PROPAGATE` means `PROPAGATE WCP` when the immediately preceding change was a workflow-command change.
- `PROPAGATE WCP` synchronizes the canonical `WORKFLOW_COMMAND_PROMPT.md` and materially affected command references/cheatsheets to every active Git-backed project that uses the protocol.
- `PROPAGATE <ARTIFACT>` synchronizes another explicitly named shared control-plane artifact only when an authoritative source is clearly established.

When issued:

1. Identify the authoritative source/version.
2. Identify all active consumers that are expected to mirror it.
3. Compare before writing; do not overwrite project-specific instructions.
4. Update only materially affected copies/references.
5. Preserve project task IDs, states, branches, product code, and deployment state unless propagation itself is the active authorized task.
6. Verify the propagated copies match the authoritative source or intentionally documented project-specific variant.
7. Report destinations updated, destinations already current, and any destination that could not be updated.

Never propagate secrets, credentials, environment-specific private data, or unrelated project files.

`PROPAGATE` is a workflow-administration command. It does not create a new product task by itself.

End with the mandatory handoff footer.

---

# 13. WORKFLOW MODE

Enter persistent structured workflow execution for the active project or repository.

When issued:

1. Read `AGENTS.md`.
2. Read this canonical workflow protocol.
3. Read `CURRENT_STATE.md` if present.
4. Read active orchestrator/work-mode/task-contract files required by the repository.
5. Verify authoritative Git/deployment state when relevant.
6. Recover current Task ID, task state, objective, owner, blockers, branch/SHA, and exact next operational action.
7. Mark workflow mode `ACTIVE` in `CURRENT_STATE.md` when that field is used.
8. Do not advance the task merely because workflow mode was activated.
9. Remain in workflow mode until `CLOSE` or `EXIT WORKFLOW` is explicitly issued.

While active:

- do not silently fall back to ordinary ad hoc agent behavior;
- follow Task ID, checkpoint, scope, approval, validation, transport, and handoff rules;
- stop at defined task boundaries instead of chaining into unrelated work;
- `QUESTION` and `CONVO` temporarily freeze execution without disabling workflow mode;
- `RESUME`, `CONTINUE`, or `PROCEED` returns from that temporary freeze.

Workflow mode is an execution-protocol state, not a project/task status.

End with the mandatory handoff footer.

---

# 14. QUESTION

Answer the owner's question without executing workflow changes by default.

Do not edit code, Git, deployments, infrastructure, files, or production systems unless the owner explicitly converts the request into execution.

If Workflow Mode is active, QUESTION temporarily freezes execution but does not exit workflow mode.

No mandatory footer is required for an ordinary question unless workflow state is also requested.

---

# 15. CONVO

Enter discussion/planning mode.

Use for brainstorming, architecture discussion, weighing alternatives, or talking through a decision.

No execution by default. Do not change task state merely because a conversation occurred. If Workflow Mode is active, CONVO temporarily freezes execution without disabling it.

---

# 15A. CLARIFY <TEXT>

Correct or disambiguate a misunderstanding, typo, naming issue, scope interpretation, or communication lapse without creating a new task by default.

Treat the supplied clarification as authoritative for the current context unless it conflicts with a higher-priority locked or safety-critical rule. Apply the correction to subsequent workflow reasoning. Update durable project documentation only when the clarification materially changes project truth, naming, scope, constraints, or acceptance criteria.

Do not execute unrelated work merely because a clarification was supplied.

---

# 15B. EXPLAIN <TOPIC>

Explain a system, task, decision, file, concept, workflow state, or implementation in plain language without changing it.

Inspect authoritative context when necessary. Distinguish verified facts from assumptions. Do not edit code, files, Git, deployments, infrastructure, or task state by default.

---

# 16. NOTE <TEXT>

Record information relevant to the active project without automatically changing execution state.

Classify the note as appropriate: durable project context, decision, constraint, future idea, temporary observation, acceptance result, or blocker.

Update the appropriate authoritative project file when the note materially affects future work. Do not create unnecessary permanent documentation for trivial comments.

---

# 17. STEPS

Show the current task as a concise operational sequence including where it stands, what already happened, what happens next, which actor owns each step, and any unavoidable manual owner action.

Do not replace the task plan or create a new objective unless explicitly requested.

---

# 18. ROUTE <OBJECTIVE>

Determine the best execution owner and path for a requested objective.

Possible owners include GPT/orchestrator, Codex, another specialized agent, owner/manual action, or an external service/tool.

Consider required tools, repository access, risk, scope, parallelizability, coding need, physical/user acceptance, and deployment consequences. Produce the smallest safe task contract and assign ownership.

Do not automatically send work to Codex when GPT can complete it directly and safely.

---

# 19. HANDOFF

Generate the exact next agent-ready transfer from current authoritative state.

Include only what the receiving agent needs: Task ID, objective, repository/project, starting branch/SHA when relevant, relevant context, allowed scope, locked invariants, validation requirements, stop condition, and expected completion report.

For large transfers use `TASK #N — HANDOFF X/Y`, split by semantic unit/file first, and keep blocks practically screen-sized.

End with the mandatory handoff footer.

---

# 20. SPLIT

Decompose an objective into parallel-safe independent tasks.

For each task force define Task ID/subtask ID, owner, objective, repository, base branch/SHA, feature branch/worktree if appropriate, allowed scope, locked invariants, dependencies, acceptance criteria, stop condition, and merge/integration order.

Do not parallelize tasks that would edit the same state unsafely.

---

# 21. SYNC [PROJECT]

Reconcile documented project state with actual authoritative systems.

Check as relevant: repository, branch, SHA, working tree, pull requests, CI/checks, deployment, production runtime, and workflow/state docs.

Identify drift and establish the true source of truth. Do not silently change production or merge branches merely to make state match.

---

# 22. REVIEW

Perform an independent checksum of the current result against the task contract.

Review acceptance criteria, missing requirements, unauthorized scope changes, monkey patches, regressions, insufficient testing, branch/SHA correctness, preview/deployment correctness, and documentation/state accuracy.

Return one of `PASS`, `FAIL`, or `NEEDS REVISION`.

Do not approve merely because implementation completed. When physical acceptance is required, produce one clear owner acceptance test.

End with the mandatory handoff footer.

---

# 23. APPROVE

Approve the current review/acceptance gate and advance only to the next already-authorized stage.

Approval does not grant unlimited scope.

End with the mandatory handoff footer.

---

# 24. REJECT <REASON>

Reject the current result while preserving the active Task ID unless the objective itself is abandoned.

Record the rejection reason and route the task back to the appropriate owner with a focused correction contract. Do not immediately generate speculative patches without identifying the failure reason.

End with the mandatory handoff footer.

---

# 25. ABORT

Terminate the active task without marking it complete.

Record why it was aborted, what work exists, whether any branch/deployment/artifact remains, rollback or cleanup requirement, and whether the objective is abandoned or may be restarted later.

Use `PAUSED` or another accurate state if the project itself remains active.

End with the mandatory handoff footer.

---

# 26. LOCK <THING>

Mark an accepted design, behavior, interface, architecture decision, visual baseline, workflow rule, or other invariant as protected. Persist the lock in the appropriate durable project documentation.

Future tasks must preserve the lock unless explicitly unlocked.

---

# 27. UNLOCK <THING>

Explicitly permit modification of a previously locked invariant.

Record what is unlocked, why, scope of permitted change, and whether the unlock is temporary or permanent. Do not interpret unrelated change requests as implicit unlocks.

---

# 28. PRIORITY <PROJECT OR TASK>

Raise or set execution priority among parallel projects/tasks without silently cancelling other work. Priority changes sequencing, not scope or approval gates.

---

# 29. QUEUE

Show the multi-project command view.

For each active project/task show concisely: project, Task ID, status, objective, current owner, blocker, priority, and next action.

Use this to decide what should run, wait, split, or switch next.

---

# 30. MOBILE MODE

Switch workflow ergonomics for mobile use without changing project state.

Prefer shorter handoffs, minimal typing, one owner action at a time, cloud execution, no dependence on local desktop compute, and small copyable blocks.

Project source of truth and Task IDs remain unchanged.

---

# 31. OFFICE MODE

Switch workflow ergonomics for desktop/office use without changing project state.

Desktop mode may use fuller diagnostics, local development tools when useful, larger review surfaces, multiple windows, and direct file inspection.

Project source of truth and Task IDs remain unchanged.

---

# 32. USAGE

Report available workload/resource/usage information relevant to the active environment when that information is actually accessible.

Do not fabricate token, quota, billing, or account usage that cannot be read from an authoritative source.

---

# 33. CHEATSHEET <TOPIC>

Create a high-information-density, single-glance visual explainer for a complex topic.

Primary goal: compress a large amount of connected information into one coherent visual that can be absorbed quickly.

Default behavior:

1. Identify the core concept.
2. Extract the most important connected information.
3. Organize it into a strong visual hierarchy.
4. Select the best visual structure automatically, such as a system architecture map, process flow, layered diagram, decision tree, comparison grid, timeline, or relationship map.
5. Optimize for high information density without becoming unreadable.
6. Prefer visual generation when the environment supports it.

Supported modifiers:

- `CHEATSHEET IMAGE <TOPIC>` — generate the actual visual.
- `CHEATSHEET TEXT <TOPIC>` — return the structured information architecture only.
- `CHEATSHEET UPDATE` — revise the current cheatsheet while preserving accepted structure/style.
- `CHEATSHEET COMPARE <A> vs <B>` — comparison-oriented visual.
- `CHEATSHEET FLOW <TOPIC>` — process/workflow-oriented visual.
- `CHEATSHEET SYSTEM <TOPIC>` — architecture/components/dependencies visual.

Unless explicitly told otherwise, `CHEATSHEET` is visual-first and equivalent to `CHEATSHEET IMAGE` when image generation is available.

---

# 34. CORE EXECUTION PRINCIPLES

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

# 35. CODEX TASK CONTRACT

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

If an exact required base SHA is unavailable or mismatched: **STOP. DO NOT CODE.**

---

# 36. CURRENT_STATE.md RECOMMENDED FORMAT

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

# 37. NEW REPOSITORY BOOTSTRAP SUMMARY

For a new repository:

1. Copy `WORKFLOW_COMMAND_PROMPT.md` into the repository root.
2. The first agent that reads it must run Section 0 and safely create/amend `AGENTS.md`.
3. Preserve all pre-existing `AGENTS.md` content.
4. Create `CURRENT_STATE.md` when project work becomes stateful.
5. Use `START <PROJECT>` for a new project.
6. Use `BRIEF <PROJECT>` or `BRIEF ALL` to regain orientation.
7. Use `WORKFLOW MODE` when persistent structured execution is required.
8. Use `RESUME`, `CONTINUE`, or `PROCEED` to continue work.
9. Use `CLOSE` or `EXIT WORKFLOW` to synchronize durable state and leave workflow mode.
10. Use `PROPAGATE WCP` after shared workflow changes when automatic WCPADD propagation did not already run.

This protocol is designed to remain project-agnostic and durable across repositories, sessions, devices, and parallel AI-agent workflows.