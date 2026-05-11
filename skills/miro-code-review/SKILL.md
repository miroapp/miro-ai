---
name: miro-code-review
description: Use when the user wants to create a visual code review on a Miro board from a pull/merge request (GitHub, GitLab, or any forge), local uncommitted changes, or a branch comparison — produces a file-changes table, summary/architecture/security docs, and architecture diagrams, then links them back from the PR/MR.
---

# Visual Code Review

Generate a comprehensive visual code review on a Miro board from a pull/merge request, local changes, or a branch comparison. Includes architecture analysis, security review, and optionally enriches with enterprise documentation. After the artifacts are created, link them back from the PR/MR description so reviewers can find them without leaving their forge.

The user provides a Miro board URL plus one source: a PR/MR number, `owner/repo#number` (or `group/project!number`), a full PR/MR URL, the keyword "local changes", or a branch name to compare against the default branch. The skill is platform-agnostic: it detects the forge from the URL or the configured git remote and uses whichever CLI is available locally.

## Workflow

### 1. Identify the source from the user's request

Determine the source type and infer the platform from the URL or configured git remote:

- A bare number → PR/MR in the current repo (infer the platform from the configured git remote: `git remote get-url origin`)
- `owner/repo#number` (or `group/project!number` for GitLab-style) → PR/MR in an external repo on the same platform as the current remote, unless a host is given
- A full URL → extract host, owner/group, repo/project, and PR/MR number from the URL; the host determines the platform
- "local changes" / uncommitted work → local diff only, no PR
- A branch name → local diff against the default branch (`main` or whatever the remote shows as default)

#### Tool selection

Pick the CLI based on what's installed and what the source points at. Do not assume `gh`. Run `command -v <cli>` to check availability before invoking:

- GitHub URLs / `github.com` remote → `gh` CLI if available
- GitLab URLs / `gitlab.com` or self-hosted GitLab → `glab` CLI if available
- If no first-party CLI is available for the detected platform, fall back to authenticated REST via `curl` using whatever credentials the user already has configured (e.g. `~/.netrc`, env var tokens like `$GITHUB_TOKEN`, `$GITLAB_TOKEN`)
- For local / branch-comparison sources, plain `git` is sufficient — no platform CLI needed

State the detected platform and tool in chat output before proceeding.

### 2. Extract Changes

Fetch two things, regardless of platform:

1. **Metadata**: title, description/body, author, list of changed files with additions/deletions per file
2. **Unified diff** of the change

Use whichever CLI matches the platform detected in §1; the JSON/text shape will differ between forges — normalize fields downstream.

**GitHub example (`gh`):**
```bash
# Current repo
gh pr view $PR_NUMBER --json title,body,author,files,additions,deletions
gh pr diff $PR_NUMBER

# External repo
gh pr view $PR_NUMBER --repo $OWNER/$REPO --json title,body,author,files,additions,deletions
gh pr diff $PR_NUMBER --repo $OWNER/$REPO
```

**GitLab example (`glab`):**
```bash
# Current project
glab mr view $MR_NUMBER -F json
glab mr diff $MR_NUMBER

# External project
glab mr view $MR_NUMBER -R $GROUP/$PROJECT -F json
glab mr diff $MR_NUMBER -R $GROUP/$PROJECT
```

**REST fallback (any platform):** issue an authenticated `curl` to the platform's REST endpoint for the PR/MR and its diff. Use the user's configured token (`$GITHUB_TOKEN`, `$GITLAB_TOKEN`, etc.) and pass `Accept: application/vnd.github.v3.diff` (or platform equivalent) for the diff.

**For Local Changes:**
```bash
git status --porcelain
git diff HEAD
```

**For Branch Comparison:**
```bash
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD | sed 's@^refs/remotes/origin/@@')
git log $DEFAULT_BRANCH..HEAD --oneline
git diff $DEFAULT_BRANCH...HEAD
```

#### Determine the source-link base URL

Capture once and reuse for every file reference in §5 (table cells, document bullets, diagram labels). Pin links to the head SHA so they survive force-pushes.

Record:

- `LINK_HOST` — host from §1 (e.g. `github.com`, `gitlab.com`, self-hosted)
- `LINK_OWNER` / `LINK_REPO` (GitHub-style) **or** `LINK_GROUP` / `LINK_PROJECT` (GitLab-style)
- `LINK_SHA` — PR/MR head commit SHA, fetched per platform:

```bash
# GitHub
LINK_SHA=$(gh pr view $PR_NUMBER --json headRefOid -q .headRefOid)
# external repo: add --repo $OWNER/$REPO

# GitLab
LINK_SHA=$(glab mr view $MR_NUMBER -F json | jq -r '.diff_refs.head_sha // .sha')
# external project: add -R $GROUP/$PROJECT

# Local diff or branch comparison
LINK_SHA=$(git rev-parse HEAD)
```

REST fallback: read `head.sha` (GitHub) or `diff_refs.head_sha` (GitLab) from the same JSON payload already fetched above — no extra round-trip needed.

- `LINK_BASE_SHA` — base commit SHA (the PR/MR target tip, or the merge-base for branch comparisons). Required by §5 "Showing change" to render before/after diagrams and to hyperlink "before" nodes to the prior revision:

```bash
# GitHub
LINK_BASE_SHA=$(gh pr view $PR_NUMBER --json baseRefOid -q .baseRefOid)
# external repo: add --repo $OWNER/$REPO

# GitLab
LINK_BASE_SHA=$(glab mr view $MR_NUMBER -F json | jq -r '.diff_refs.base_sha // .target_branch')
# external project: add -R $GROUP/$PROJECT

# Local diff (uncommitted): base is the current HEAD itself
LINK_BASE_SHA=$(git rev-parse HEAD)

# Branch comparison
LINK_BASE_SHA=$(git merge-base origin/$DEFAULT_BRANCH HEAD)
```

To extract the pre-change content of a single file (needed when the unified diff alone doesn't carry enough surrounding structure, e.g. class hierarchies):

```bash
git show $LINK_BASE_SHA:path/to/file
```

If the base SHA is unreachable (shallow clone, history pruned, target branch not fetched), skip "before" diagrams and announce once in chat: `"base revision unavailable — only 'after' diagrams created"`.

- `LINK_TEMPLATE` — pick by host shape; substitute `{path}` per reference, append `#L<start>-L<end>` line anchors when calling out a specific hunk:
  - GitHub-style: `https://{host}/{owner}/{repo}/blob/{sha}/{path}` (anchor: `#L{a}-L{b}`)
  - GitLab-style: `https://{host}/{group}/{project}/-/blob/{sha}/{path}` (anchor: `#L{a}-{b}`)
  - Bitbucket-style (example pattern, not exhaustive): `https://{host}/{workspace}/{repo}/src/{sha}/{path}`

**No-remote sources** (`local changes`, or a branch with no pushed remote / no PR): set `LINK_TEMPLATE=""` and announce in chat once: `"No remote URL available — file references shown as plain paths."` Do not invent URLs.

State the chosen template in chat before creating artifacts, e.g.: `Source links: https://github.com/acme/api/blob/<sha>/{path}`.

### 3. Analyze Changes

For each changed file, determine:

**Basic Analysis:**
- **Status**: Added, Modified, or Deleted
- **Change Summary**: Brief description combining what changed and review points
- **Risk Level**: See risk assessment below

**Architecture Analysis:**
- New components or modules introduced
- Dependency changes (new imports, package updates)
- Interface/API modifications
- Pattern changes (design patterns introduced or violated)
- Breaking changes requiring consumer updates

**Security Analysis:**
- Input validation and sanitization
- Authentication/authorization changes
- Sensitive data handling (logging, storage)
- Injection vulnerabilities (SQL, XSS, command)
- Cryptography usage
- Configuration security

### 4. Risk Assessment

| Risk Level | Criteria |
|------------|----------|
| **High** | Security-sensitive, auth/authz, database migrations, core business logic, breaking API changes, cryptography |
| **Medium** | API changes, configuration, shared utilities, new dependencies, data model changes |
| **Low** | Tests, documentation, styling, localization, internal refactoring |

### 4.5 Triage: decide what (if anything) to create

Every artifact must earn its place. Before doing any creation work, decide whether the PR is worth visualizing at all and which artifact types would actually help a reviewer.

**Bail-out rule.** If **all** of the following hold, create no Miro artifacts and report only in chat:

- ≤ 2 files changed, AND
- < 20 lines changed (additions + deletions combined), AND
- No file marked **High** risk in §4, AND
- No security-sensitive paths touched (auth, crypto, config, migrations).

In that case, the entire skill output is a single chat message of the form:

> PR is trivial (N files, ±M lines, no high-risk areas). Skipping Miro visualization — a board would not add review value. PR/MR description was not modified.

Skip §5 and §6 entirely.

**Value gate (per artifact).** When the bail-out does not apply, still only create an artifact if it tells a reviewer something the diff itself does not already make obvious:

- **Table** — create when ≥ 3 files changed *or* mixed risk levels exist. For 1–2 file PRs that don't bail out, skip the table.
- **Summary doc** — create when the PR has non-trivial intent that isn't already captured in the PR title/body, OR when ≥ 2 high-risk items need callouts. Skip if it would just paraphrase the PR description.
- **Architecture doc** — create only if structural changes are detected (new modules, modified public interfaces, dependency changes, breaking changes). Skip otherwise.
- **Security doc** — create only when security-sensitive paths are touched (see §3 "Security Analysis"). Never create as a checklist-only artifact.
- **Diagram** — create only when the change involves multi-component flow, control/data path changes, or structural relationships that are hard to grasp from the diff. Render as a **side-by-side before/after pair** by default (see §5 "Showing change"); use a **single annotated "after" diagram** only when the change is purely additive and touches ≤ 3 elements. Explicitly skip diagrams that would be a single node, two nodes with one arrow, or a literal restatement of the diff.

**Announce the plan in chat** before creating anything, e.g.:

> Plan: 1 table, 1 summary doc, no diagrams (changes are localized to a single function).

This makes the triage visible and lets the user redirect before any board content is created.

### 5. Create Miro Board Content

**Principle:** every artifact must earn its place. If an artifact would not help a reviewer understand the PR faster than the diff alone, do not create it. See §4.5 for the triage rules.

**Scale content *up to* these caps based on PR size, and apply the §4.5 value gates — fewer artifacts is fine.**

#### Linking conventions

Every file reference produced in §5 must be a clickable hyperlink to the source platform when a base URL is available. Use the `LINK_TEMPLATE` and `LINK_SHA` captured in §2.

- **When `LINK_TEMPLATE` is set** (PR/MR or branch with a known remote): build the URL by substituting the file `{path}`. Add a line anchor `#L<start>-L<end>` when calling out a specific hunk (high-risk files, security findings, architecture callouts). Resolve start/end from the diff hunks captured in §2 (`@@ -a,b +c,d @@`, use the new-file range). Skip the anchor if the reference spans multiple non-contiguous hunks.
- **When `LINK_TEMPLATE` is empty** (`local changes` or no remote): render every file reference as a plain path. Do not invent URLs.

Per-artifact rules:

- **Table → File column**: put the full URL as the cell content. Miro renders URLs in text cells as clickable links. With no remote, put the plain path.
- **Documents**: use markdown links — `[path/to/file.ts](url)` for whole-file references and `[path/to/file.ts:42-58](url#L42-L58)` for hunk references. Apply this in *every* file mention (Overview, Key Changes, High-Risk Areas, Architecture > New Components / Modified Interfaces, Security > Security-Sensitive Changes, etc.).
- **Diagrams**: keep node labels as plain paths — the Miro diagram tool does not document clickable nodes. When a node corresponds to a single source file, append the URL as a second line in the node label so a reader can copy it.

**Positioning Notes:**

Use a **horizontal row layout** because tables and docs have fixed width but variable height, while diagrams are more complex:

```
[Table] → [Doc1] → [Doc2] → [Doc3] → [Diagram1] → [Diagram2]
  x=0      x=1200   x=2000   x=2800     x=3600       x=5600
```

- **Tables**: Created at board center (0,0) - no x/y positioning support
- **Documents**: Start at x=1200, increment by 800 for each doc
- **Diagrams**: Continue after last doc position add extra 400, increment by 2000 for each diagram
- All items at y=0 (same row)

#### Scaling Guidelines

| PR Size | Files | LOC (±) | Documents | Diagrams |
|---------|-------|---------|-----------|----------|
| Trivial | 1–2 | < 20 | none (bail out per §4.5) | none |
| Small | 1–5 | < 100 | 0–1 summary | 0–1 flow |
| Medium | 6–15 | < 500 | 1–2 (summary + deep-dive if needed) | 1–3 |
| Large | 16–30 | < 1500 | 2–3 (summary + architecture + security if applicable) | 2–4 |
| Very Large | 30+ | ≥ 1500 | 3+ (by subsystem) | 3+ |

> A side-by-side before/after pair counts as **one** diagram for the budgets above — the column limits conceptual artifacts, not raw board widgets.

---

#### File Changes Table

Create first (appears at board center). Use Miro MCP tool to create a table with columns **in this order**:

| Column | Type | Options |
|--------|------|---------|
| Status | select | Added (#00FF00), Modified (#FFA500), Deleted (#FF0000) |
| File | text | Linked file URL (Miro auto-renders URLs in text cells as clickable). Use the plain path when no remote URL is available — see §5 "Linking conventions". |
| Change | text | Brief summary of changes and key review points |
| Risk | select | Low (#00FF00), Medium (#FFA500), High (#FF0000) |

For very large PRs (30+ files), create separate tables:
- High-risk changes table
- Standard changes table

---

#### Documents

**Document 1: Main Summary (x=800, y=0)**

Create when the §4.5 value gate for the summary doc passes. Skip if the PR description already covers the same ground.

```markdown
# Code Review: [PR Title]

**Author:** [author]
**Files Changed:** [count]
**Lines:** +[additions] / -[deletions]

---

## Overview
[2-3 sentences describing what this change does]

## Key Changes
- [Bullet points of significant changes]

## High-Risk Areas
- [path/to/file.ts:42-58](url#L42-L58) — [reason this file is high-risk]

## Review Checklist
- [ ] Logic correctness verified
- [ ] Edge cases handled
- [ ] Error handling appropriate
- [ ] No security concerns
- [ ] Tests adequate

## Questions for Author
- [Clarifying questions based on the diff]
```

**Document 2: Architecture Analysis (x=1600, y=0)**

Create only when the §4.5 architecture-doc value gate passes — i.e. the diff introduces new modules, modifies public interfaces, changes dependencies, or adds breaking changes. Skip otherwise, even on Medium/Large PRs.

```markdown
# Architecture Analysis

## Structural Changes

### New Components
- [path/to/new_module.ts](url) — [purpose / role]

### Modified Interfaces
- [path/to/api.ts:120-180](url#L120-L180) — [API change / contract modification]

### Dependency Changes
- [package.json](url) — [added/removed/updated dependency]

## Design Patterns
- [Patterns introduced or modified]
- [Anti-patterns identified]

## Breaking Changes
- [Changes requiring consumer updates]
- [Migration requirements]

## Architecture Concerns
- [Coupling/cohesion issues]
- [Layer violations]
- [Scalability implications]
```

**Document 3: Security Analysis (x=2400, y=0)**

Create only when security-sensitive paths are touched (auth, crypto, config, migrations, input handling). Never create as a checklist-only artifact on a PR with no security-relevant diff.

```markdown
# Security Analysis

**Risk Score:** [Critical/High/Medium/Low]

## Security-Sensitive Changes
- [path/to/auth.ts:30-95](url#L30-L95) — [auth/authz modification]
- [path/to/handler.ts:10-40](url#L10-L40) — [data handling change]
- [path/to/route.ts:200-220](url#L200-L220) — [API exposure change]

## Vulnerability Assessment

### Input Validation
- [Validation present/missing]

### Data Protection
- [Sensitive data handling]
- [Encryption usage]

### Access Control
- [Authorization checks]

## Security Checklist
- [ ] Input validation present
- [ ] Output encoding applied
- [ ] Authentication verified
- [ ] Authorization checks in place
- [ ] Sensitive data protected
- [ ] No hardcoded secrets
- [ ] Dependencies secure

## Recommendations
- [Security improvements needed]
```

**Additional Documents (x=3200, x=4000, etc.)**

For Very Large PRs, create per-subsystem documents (continue incrementing x by 800):
- "API Changes Analysis"
- "Database Migration Review"
- "UI/Frontend Changes"
- etc.

---

#### Diagrams

Create diagrams based on the type of changes. Position after the last document (continue x increments of 800).

##### Showing change: before/after vs. annotated

Every diagram must make the *delta* visible at a glance, not just the post-change state.

- **Default: side-by-side before/after pair.** Build two diagrams of the same type with the same DSL conventions and place them adjacently on the same y-row. Build the "before" from the `LINK_BASE_SHA` revision (use `git show $LINK_BASE_SHA:path` when the unified diff doesn't carry enough surrounding structure), and the "after" from `LINK_SHA`.
- **Single annotated "after" diagram instead** when *all* of these hold:
  - The change is purely additive (no deleted files, no removed classes/components, no removed edges in the relevant subsystem), AND
  - The additions do not rearrange existing relationships (no rewired callers, no moved responsibilities), AND
  - There are ≤ 3 new nodes/edges to mark.
- If `LINK_BASE_SHA` is unreachable (shallow clone, history pruned), degrade every pair to a single annotated "after" diagram and reuse the chat announcement from §2.

##### Marking convention

Primary signal is the **label prefix**, because per-element styling is not guaranteed by the Miro Mermaid renderer:

- `[ADDED] <name>` — element introduced in this change. In an *after* diagram only (omitted from before).
- `[REMOVED] <name>` — element deleted in this change. In a *before* diagram only (omitted from after).
- `[UPDATED] <name>` — element kept but with a meaningful change to signature, body, or relationships. Present in both diagrams; prefix appears in the *after* only.
- Unmarked elements are unchanged context.

Also emit Mermaid `classDef` directives as a best-effort visual layer — a renderer that honours them produces colour:

```mermaid
classDef added    fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
classDef removed  fill:#fee2e2,stroke:#dc2626,stroke-width:2px,stroke-dasharray:5 5;
classDef updated  fill:#fef3c7,stroke:#d97706,stroke-width:2px;
class A,B added
class C removed
class D updated
```

Prefixes alone must be self-sufficient: if Miro drops the classDef block, the reviewer still sees what changed from the label text. Do not create a legend widget on the board — the prefixes are self-explanatory and a separate legend just clutters the layout.

**Diagram Selection Guide:**

| Change Type | Diagram Type | Pattern | Purpose |
|-------------|--------------|---------|---------|
| Feature addition (purely additive) | `flowchart` | Single annotated (after) | Show new components and how they wire in |
| Refactoring | `uml_class` | Side-by-side before/after | Structural rearrangement is the whole point |
| API/integration change | `uml_sequence` | Side-by-side before/after | Flow shape changes |
| DB migration / schema change | `entity_relationship` | Side-by-side before/after | Schema delta is the focus |
| Bug fix | `flowchart` | Single annotated (after) | Mark the fix point in the flow |
| Data pipeline restructure | `flowchart` | Side-by-side before/after | Data flow shape changes |
| Mixed / large refactor | per-subsystem | Side-by-side per subsystem | One pair per affected boundary |

**Diagram Positions:**

A side-by-side pair occupies two adjacent x slots (gap = 2000 between pair members); the next diagram or pair starts another 2000 after the last slot used. A single annotated diagram occupies one slot. Let `N` = last document `x` + 800.

| Diagram (or pair) | Position(s) | When to create |
|-------------------|-------------|----------------|
| Main flow/architecture pair | `before` at x=N, `after` at x=N+2000 | Always |
| Component relationships pair | next two slots | Medium+ PRs with structural change |
| Sequence/interaction pair | next two slots | API/integration changes |
| ER pair | next two slots | Data pipeline / schema changes |
| Single annotated (additions only) | one slot | Purely additive change, ≤ 3 new elements |

Adjust `N` based on the actual number of documents created.

**Each diagram should show:**
- Affected components/modules (highlighted)
- Data/control flow through changed code
- Dependencies between changed files
- Trust boundaries (for security-relevant changes)
- Where a node corresponds to a single source file, append its URL on a second line of the label so a reader can copy it (paths only — diagram nodes are not clickable). Skip the URL when no remote is available. Use `LINK_BASE_SHA` in URLs on *before* diagrams; use `LINK_SHA` on *after* diagrams.
- The change markers from §5 "Marking convention" applied to every modified/added/removed element — the diagram or pair must make the delta visible at a glance.

### 6. Post link back to PR/MR

Once the artifacts are created, surface the link from the PR/MR itself so reviewers see it without leaving their forge.

**Skip this step entirely** when:
- The source is "local changes"
- The source is a branch with no associated open PR/MR

In those cases the link is reported only in chat output (see §Output below).

#### Block format

Append a delimited block to the existing PR/MR description. Reuse the same delimiters on every run so the block can be replaced cleanly:

```
<!-- miro-pr-docs:start -->
## PR documentation

PR details on Miro: <link>

- <X> documents, <Y> diagrams, <Z> table rows
- High-risk files: <count>
- Security findings: <count>
<!-- miro-pr-docs:end -->
```

**Link rules:**
- If the original Miro URL contained `moveToWidget=<frameId>`, reuse that exact URL — clicking opens straight to the frame
- Otherwise use the plain board URL

**Idempotency:**
- If the description already contains the `<!-- miro-pr-docs:start -->` … `<!-- miro-pr-docs:end -->` markers, replace the contents in place
- Otherwise append the block at the end of the existing description, preserving everything else verbatim
- Never overwrite the user-authored portion of the description

#### Update the description

Use the same CLI selection from §1. Read the current body, splice the new block, write it back.

**GitHub example (`gh`):**
```bash
# Read current body
BODY=$(gh pr view $PR_NUMBER --json body -q .body)
# (splice: replace existing block or append) → produce $NEW_BODY
gh pr edit $PR_NUMBER --body "$NEW_BODY"
```

**GitLab example (`glab`):**
```bash
BODY=$(glab mr view $MR_NUMBER -F json | jq -r .description)
# (splice) → $NEW_BODY
glab mr update $MR_NUMBER --description "$NEW_BODY"
```

**REST fallback:** read and PATCH the PR/MR body via the platform's REST API with the user's token.

#### Permission failure fallback

If editing the description fails because the user lacks permission (for example, when reviewing someone else's PR), post the same block as a single PR/MR comment instead. Mention this fallback in the chat output so the user knows the description was not changed.

## Output

If the §4.5 bail-out applied, the entire output is the trivial-PR chat message — no board link, no description update, nothing else.

Otherwise, after completion provide:
1. Link to the Miro board (or frame, if `moveToWidget` was provided)
2. Confirmation that the PR/MR description was updated, or that we left a comment as a fallback, or that the post step was skipped because the source was local / branchless
3. Summary of elements created (X docs, Y diagrams as N pairs + M single annotated, Z table rows). Mention base revision `<short LINK_BASE_SHA>` and head revision `<short LINK_SHA>` in this chat summary only — do **not** place these SHAs on the Miro board. Also note which artifact types were intentionally skipped per §4.5, with a one-line reason.
4. High-risk files requiring careful review
5. Security findings (if any critical/high)
6. Architecture concerns (if any breaking changes)

## Background

### Review Philosophy

Effective code reviews focus on:
1. **Correctness** - Does the code do what it's supposed to?
2. **Security** - Are there vulnerabilities or data exposures?
3. **Maintainability** - Can others understand and modify this code?
4. **Performance** - Are there efficiency concerns?
5. **Consistency** - Does it follow project conventions?

### Visual Review Benefits

Creating visual artifacts helps:
- **Async collaboration** - Reviewers can engage at their own pace
- **Context preservation** - Related docs and diagrams in one place
- **Discussion tracking** - Comments attached to specific items
- **Knowledge sharing** - Junior devs learn from visual explanations

### Visualization Patterns

When to use each artifact type:

| Artifact | Best For |
|----------|----------|
| **Table** | File lists, structured comparisons, status tracking |
| **Document** | Summaries, detailed analysis, checklists |
| **Flowchart** | Process flows, decision trees, bug fix context |
| **Class Diagram** | Structural changes, refactoring, OOP patterns |
| **Sequence Diagram** | API interactions, message flows, integrations |
| **ER Diagram** | Database changes, data model updates |

### Layout Reference

```
┌─────────────────────────────────────────────────────────┐
│                    MIRO BOARD LAYOUT                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  x=-2000          x=0              x=2000      x=4000   │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐         │
│  │ Summary │      │  Table  │      │ Diagram │  y=0    │
│  │   Doc   │      │ (files) │      │  (arch) │         │
│  └─────────┘      └─────────┘      └─────────┘         │
│                                                         │
│  ┌─────────┐                       ┌─────────┐         │
│  │ Detail  │                       │ Diagram │  y=1500 │
│  │   Doc   │                       │ (flow)  │         │
│  └─────────┘                       └─────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## References

See `references/risk-assessment.md` for detailed scoring criteria and `references/review-patterns.md` for review patterns.
