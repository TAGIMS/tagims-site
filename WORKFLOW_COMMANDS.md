# TAGIMS Owner Workflow Commands
Status: Active project-agnostic workflow protocol

These commands are owner control-plane instructions. They are operating protocols, not conversational suggestions.

## Mandatory handoff footer
Every production/workflow response triggered by `RESUME`, `CONTINUE`, `STATUS`, `PAUSE`, or a Codex completion must end with exactly:

`TASK ID #N: <READY / IN PROGRESS / COMPLETE / BLOCKED / PAUSED>`
`OBJECTIVE: <one short plain-language phrase>`
`ALEX ACTION: <one exact next action or None — GPT is handling the next step.>`

The footer is mandatory. Do not substitute a generic summary.

## RESUME [PROJECT]
When the owner issues `RESUME` or `RESUME <PROJECT>`:

1. Read `AGENTS.md`, `CURRENT_STATE.md` if present, and other authoritative project-state/workflow files before responding.
2. Recover the current active Task ID, last completed checkpoint, current owner, blockers, branch/SHA when relevant, and exact next operational step.
3. Continue from the existing checkpoint. Do not restart planning, invent a new task, or treat RESUME as ordinary conversation.
4. Give only the minimum context needed to re-enter the workflow.
5. End with the mandatory three-line handoff footer.

If project state is stale, contradictory, or missing enough information to resume safely, set the task status to `BLOCKED` and make `ALEX ACTION` the single action required to resolve the missing state.

## CONTINUE
Advance from the current checkpoint and the previous `ALEX ACTION`.

Do not regenerate the project plan from scratch. Preserve the active Task ID for same-slice continuation/recovery unless a new objective has genuinely begun.

End with the mandatory three-line handoff footer.

## STATUS
Report only:

- current task/status;
- what just completed or changed;
- who currently owns the next step;
- blocker, if any;
- exact next operational action.

End with the mandatory three-line handoff footer.

## PAUSE [PROJECT]
Before pausing meaningful work:

1. Update `CURRENT_STATE.md` when the repository uses one.
2. Record active Task ID/status, branch/SHA when relevant, accepted work, validation/deployment state, blockers, and exactly one next operational step.
3. End with the mandatory three-line handoff footer using status `PAUSED` unless the task is actually blocked or complete.

## QUESTION / CONVO
Discussion-only by default. Do not execute code, Git, deployment, or infrastructure changes unless the owner clearly converts the conversation into an action request.

The mandatory workflow footer is not required for ordinary discussion-only responses unless the owner also asks for workflow state.

## Task IDs
Use sequential `TASK ID #N` values within a project. Same-slice refinement, recovery, or retry normally keeps the same Task ID. Create a new Task ID only when a genuinely new objective begins.

A task is `COMPLETE` only when its stated objective is actually achieved. Local implementation success is not equivalent to merged, deployed, or physically accepted unless the objective explicitly ends there.

## Owner-action rule
`ALEX ACTION` must contain exactly one next action.

Examples:

- `Pass HANDOFF 2/4 to Codex.`
- `Authorize the Cloudflare GitHub App for TAGIMS/tagims-site.`
- `Open the preview URL and verify the mobile navigation.`
- `None — GPT is handling the next step.`

Do not give Alex a list of multiple competing next actions in this field.

## Handoff ergonomics
For large owner-mediated transfers, use small numbered blocks labeled:

`TASK #N — HANDOFF X/Y`

Split by file or semantic unit first. Keep each block practically screen-sized. Do not require the owner to technically validate hashes, payload completeness, diffs, or transport integrity.
