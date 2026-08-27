# AI Workflow Command Protocol
Status: Active, project-agnostic control-plane protocol
Canonical filename: `WORKFLOW_COMMAND_PROMPT.md`

This file defines a compact command language for coordinating GPT, Codex, other AI agents, repositories, deployments, and owner approvals across multiple parallel projects.

The commands below are operating protocols, not conversational suggestions.

---

# 0. SELF-INSTALL / BOOTSTRAP RULE
When an AI agent reads this file inside a repository, it must ensure root-level `AGENTS.md` points to this file. Preserve existing `AGENTS.md` content. If missing, create a minimal `AGENTS.md` telling agents to read `WORKFLOW_COMMAND_PROMPT.md`. Never overwrite existing agent instructions.

---

# 1. MANDATORY HANDOFF FOOTER
Every workflow response triggered by `START`, `BRIEF`, `RESUME`, `CONTINUE`, `STATUS`, `PAUSE`, `CHECKPOINT`, `CLOSE`, `HANDOFF`, `REVIEW`, `APPROVE`, `REJECT`, `ABORT`, or a Codex completion must end with exactly:

`TASK ID #N: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`
`OBJECTIVE: <one short plain-language phrase>`
`ALEX ACTION: <one exact next action or None — GPT is handling the next step.>`

`ALEX ACTION` must contain exactly one next action.

---

# 2. TASK IDS AND STATES
Use sequential `TASK ID #N` values within each project. Same-slice continuation, refinement, retry, debugging, deployment follow-through, and acceptance normally preserve the same Task ID. Create a new Task ID only when a genuinely new objective begins.

Supported states: `READY`, `IN PROGRESS`, `COMPLETE`, `BLOCKED`, `PAUSED`.

---

# 3. START <PROJECT>
Initialize a new project or formalize an unstructured project. Verify project/repository identity, read existing instructions, establish source-of-truth files, create `CURRENT_STATE.md` when needed, assign Task #1, define one objective, identify the current owner, and record exactly one next operational action.

---

# 4. BRIEF [PROJECT | ALL]
Create a fast operational recap before work begins.

`BRIEF <PROJECT>` reads the Master Project Registry when available, the project `CURRENT_STATE.md`, and authoritative Git/deployment state when relevant. Return only what was completed most recently, where work stopped, current Task ID/status, current owner, blocker if any, and highest-value next action. Do not advance the task.

`BRIEF ALL` reads the Master Project Registry and active/high-priority project checkpoints. Summarize material recent changes, where each active project stopped, blockers, current owners, recommended priority order, and the single best task/project to resume next.

End with the mandatory handoff footer.

---

# 5. RESUME <PROJECT>
Recover authoritative project state and continue exactly where it stopped. Read `AGENTS.md`, this file, `CURRENT_STATE.md`, and other authoritative state files. Verify actual Git/deployment state when relevant. Do not restart planning or invent a new task.

---

# 6. SWITCH <PROJECT>
Change active project context without changing task state. Load enough state to establish context, report the active task/current owner briefly, and preserve other project states. Use `RESUME <PROJECT>` when work should immediately continue.

---

# 7. CONTINUE
Advance from the current checkpoint and previous `ALEX ACTION`. Do not regenerate the plan. Preserve the Task ID unless a genuinely new objective begins.

---

# 8. STATUS [PROJECT]
Report current Task ID/status, objective, what changed, current owner, blocker if any, and exact next operational action. Do not advance the task merely by reporting status.

---

# 9. PAUSE [PROJECT]
Create a clean resumable stopping point. Update `CURRENT_STATE.md` when used and record Task ID/status, branch/SHA, accepted work, validation/deployment state, blockers/risks, current owner, and exactly one next operational step.

---

# 10. CHECKPOINT
Persist current state without necessarily pausing. The checkpoint must allow a fresh agent/thread to resume without chat memory.

---

# 11. CLOSE [PROJECT | ALL]
Perform end-of-work-session synchronization so the next session can resume without relying on chat history.

`CLOSE <PROJECT>` reconciles current state, updates `CURRENT_STATE.md`, updates the Master Project Registry when status/priority/owner/repo/deployment/next action changed, and updates durable decision/architecture/workflow docs only when material facts changed. For Git-backed projects, ensure repo workflow/state docs accurately reflect accepted state. Record completed work, validation/deployment status, blockers/risks, current owner, and exactly one next operational step. Do not create meaningless commits or documentation churn solely because `CLOSE` was issued.

`CLOSE ALL` repeats this synchronization for every project materially touched during the session.

`CLOSE` does not mean the project/task is complete. Leave unfinished work in the accurate state.

End with the mandatory handoff footer.

---

# 12. QUESTION
Answer without executing workflow changes by default.

# 13. CONVO
Discussion/planning mode. No execution by default.

# 14. NOTE <TEXT>
Record relevant project information without automatically changing execution state. Persist only materially useful durable context.

# 15. STEPS
Show the current task as a concise operational sequence: current state, what happened, what happens next, owners, and any unavoidable manual owner action.

# 16. ROUTE <OBJECTIVE>
Determine the best execution owner/path: GPT, Codex, specialized agent, owner/manual action, or external tool/service. Produce the smallest safe task contract. Do not automatically route to Codex when GPT can safely complete the work directly.

# 17. HANDOFF
Generate the exact next agent-ready transfer from current authoritative state. Include Task ID, objective, repo/project, branch/SHA when relevant, context, scope, locks, validation, stop condition, and expected completion report. Large transfers use `TASK #N — HANDOFF X/Y` in screen-sized blocks.

# 18. SPLIT
Decompose an objective into parallel-safe independent tasks with explicit ownership, scope, dependencies, acceptance criteria, stop conditions, and merge/integration order.

# 19. SYNC [PROJECT]
Reconcile documented state with authoritative repo/branch/SHA/PR/CI/deployment/runtime/workflow state. Identify drift without silently changing production or merging merely to force alignment.

# 20. REVIEW
Perform an independent checksum against the task contract and return `PASS`, `FAIL`, or `NEEDS REVISION`.

# 21. APPROVE
Approve the current gate and advance only to the next already-authorized stage.

# 22. REJECT <REASON>
Reject the current result, preserve the Task ID unless the objective is abandoned, record the reason, and route a focused correction contract.

# 23. ABORT
Terminate the active task without marking it complete. Record reason, surviving work/artifacts, cleanup/rollback, and whether the objective may restart later.

# 24. LOCK <THING>
Persist an accepted invariant as protected.

# 25. UNLOCK <THING>
Explicitly permit modification of a lock and record scope/reason/duration.

# 26. PRIORITY <PROJECT OR TASK>
Raise/set execution priority without cancelling unrelated work.

# 27. QUEUE
Show project, Task ID, status, objective, current owner, blocker, priority, and next action for active work.

# 28. MOBILE MODE
Use shorter handoffs, minimal typing, one owner action at a time, cloud execution, and small copyable blocks without changing project state.

# 29. OFFICE MODE
Use fuller diagnostics, local tools, larger review surfaces, multiple windows, and direct file inspection without changing project state.

# 30. USAGE
Report available workload/resource/usage information when accessible. Do not fabricate unavailable account usage.

# 31. CHEATSHEET <TOPIC>
Create a high-information-density, single-glance visual explainer. Supported modifiers: `IMAGE`, `TEXT`, `UPDATE`, `COMPARE`, `FLOW`, `SYSTEM`. Default is visual-first.

---

# 32. CORE EXECUTION PRINCIPLES
1. Build the smallest complete vertical slice before expanding.
2. Diagnose root cause before patching.
3. Refactor cleanly instead of stacking monkey patches.
4. Do not modify unrelated systems.
5. Preserve accepted baselines and locks.
6. Keep secrets/credentials/tokens/private keys/sensitive account data out of repos and prompts.
7. Treat destructive/security/billing/auth/domain/production changes as approval-gated unless explicitly authorized.
8. Prefer reversible changes and preserve rollback paths.
9. Verify transport/deployment path before coding when publication is part of the objective.
10. Do not treat sandbox/local success as production success.
11. Keep unrelated repositories/products separate.
12. Do not expand scope without authorization.
13. Do not merge without authorization unless explicitly granted.
14. Do not use the owner as a technical courier when agents/tools can perform the transfer directly.

---

# 33. CODEX TASK CONTRACT
Every substantive Codex task should define Task ID, one objective, repo, base branch, exact base SHA when relevant, prerequisites, allowed scope, locked invariants, validation, transport/publication mode, and literal stop condition. Codex reads `AGENTS.md` and this protocol, verifies repo/branch/SHA/scope, stops on stale/inconsistent state, diagnoses before editing, implements complete fixes, tests, reports files/checks, stops at the stop condition, never merges without authorization unless explicitly granted, and never expands scope without authorization.

If an exact required base SHA is unavailable or mismatched: **STOP. DO NOT CODE.**

---

# 34. CURRENT_STATE.md RECOMMENDED FORMAT
`CURRENT_STATE.md` should record Task ID, status, objective, repo, branch/SHA when relevant, current owner, completed work, validation, deployment/runtime, blockers/risks, and exactly one next operational step.

---

# 35. NEW REPOSITORY BOOTSTRAP SUMMARY
1. Copy `WORKFLOW_COMMAND_PROMPT.md` into the repo root.
2. Safely create/amend `AGENTS.md` to reference it.
3. Preserve pre-existing `AGENTS.md` content.
4. Create `CURRENT_STATE.md` when project work becomes stateful.
5. Use `START <PROJECT>` for a new project.
6. Use `BRIEF <PROJECT>` or `BRIEF ALL` to regain orientation.
7. Use `RESUME <PROJECT>` to continue work.
8. Use `CLOSE <PROJECT>` or `CLOSE ALL` before ending a meaningful work session.
