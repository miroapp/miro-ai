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

Capture once and reuse for every file reference in §5 (table cells, document bullets, diagram labels). Pin links to the head SHA so they survive force-pushes. Record:

- `LINK_HOST`, `LINK_OWNER`/`LINK_REPO` (or `LINK_GROUP`/`LINK_PROJECT`) — from §1
- `LINK_SHA` — PR/MR head commit SHA (fall back to `git rev-parse HEAD` for local/branch sources)
- `LINK_BASE_SHA` — base commit SHA (PR/MR target tip, or `git merge-base` for branch comparisons); required by §5 "Showing change". If unreachable, skip "before" diagrams and announce once in chat.
- `LINK_TEMPLATE` — host-shaped blob URL with a `{path}` placeholder and optional `#L<start>-L<end>` anchor. For **no-remote sources** (`local changes` or a branch with no remote/PR) set it to `""` and render plain paths — never invent URLs.

State the chosen template in chat before creating artifacts. See `references/source-links.md` for the per-platform SHA-fetch commands, URL templates by forge, and the no-remote / unreachable-base handling.

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

**Positioning:**

Prefer laying artifacts out in a single row so the reviewer can scan them left-to-right. Pass placement to the Miro MCP tools per their schemas.

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

Create first (appears at board center). Using the Miro MCP table tool, create a table with four columns in this order:

1. **Status** — a fixed-set column with values *Added*, *Modified*, *Deleted*, color-coded green / orange / red respectively.
2. **File** — a text column containing the full source URL built per §5 "Linking conventions" (Miro renders URLs in text cells as clickable). Use the plain path when no remote URL is available.
3. **Change** — a text column with a brief summary of changes and key review points.
4. **Risk** — a fixed-set column with values *Low*, *Medium*, *High*, color-coded green / orange / red respectively.

Pick the column types and option shape from the table tool's live schema.

For very large PRs (30+ files), create separate tables:
- High-risk changes table
- Standard changes table

---

#### Documents

**Document 1: Main Summary** — create when the §4.5 value gate for the summary doc passes. Skip if the PR description already covers the same ground.

**Document 2: Architecture Analysis** — create only when the §4.5 architecture-doc value gate passes (the diff introduces new modules, modifies public interfaces, changes dependencies, or adds breaking changes). Skip otherwise, even on Medium/Large PRs.

**Document 3: Security Analysis** — create only when security-sensitive paths are touched (auth, crypto, config, migrations, input handling). Never create as a checklist-only artifact on a PR with no security-relevant diff.

**Additional Documents** — for Very Large PRs, create per-subsystem documents in the same row ("API Changes Analysis", "Database Migration Review", "UI/Frontend Changes", etc.).

See `references/document-templates.md` for the full markdown template of each document.

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

Primary signal is the **label prefix** (per-element styling is not guaranteed by the Miro Mermaid renderer): `[ADDED]` (after diagram only), `[REMOVED]` (before diagram only), `[UPDATED]` (both diagrams, prefix in the after only); unmarked elements are unchanged context. Prefixes alone must be self-sufficient. Additionally emit Mermaid `classDef` directives as a best-effort colour layer.

See `references/diagram-conventions.md` for the full prefix semantics and the `classDef` block to emit.

**Diagram Selection Guide:**

| Change Type | Diagram Type | Pattern | Purpose |
|-------------|--------------|---------|---------|
| Feature addition (purely additive) | flowchart | Single annotated (after) | Show new components and how they wire in |
| Refactoring | class diagram | Side-by-side before/after | Structural rearrangement is the whole point |
| API/integration change | sequence diagram | Side-by-side before/after | Flow shape changes |
| DB migration / schema change | ER diagram | Side-by-side before/after | Schema delta is the focus |
| Bug fix | flowchart | Single annotated (after) | Mark the fix point in the flow |
| Data pipeline restructure | flowchart | Side-by-side before/after | Data flow shape changes |
| Mixed / large refactor | per-subsystem | Side-by-side per subsystem | One pair per affected boundary |

**Diagram Positions:**

Place a side-by-side pair adjacent to each other so the delta is visible at a glance. Otherwise let the row layout from §5 "Positioning" carry — pass placement to the Miro MCP diagram tool per its schema.

| Diagram (or pair) | When to create |
|-------------------|----------------|
| Main flow/architecture pair | Always |
| Component relationships pair | Medium+ PRs with structural change |
| Sequence/interaction pair | API/integration changes |
| ER pair | Data pipeline / schema changes |
| Single annotated (additions only) | Purely additive change, ≤ 3 new elements |

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

Append a delimited block (reusing the same `<!-- miro-pr-docs:start -->` … `<!-- miro-pr-docs:end -->` markers each run) to the existing description, replacing it in place if already present and never overwriting the user-authored portion. Use the same CLI selection from §1 to read, splice, and write the body back; if editing fails for lack of permission, post the block as a PR/MR comment instead and note it in chat.

See `references/pr-linking.md` for the exact block format, link rules, idempotency rules, and per-platform (`gh`/`glab`/REST) commands.

## Output

If the §4.5 bail-out applied, the entire output is the trivial-PR chat message — no board link, no description update, nothing else.

Otherwise, after completion provide:
1. Link to the Miro board (or frame, if `moveToWidget` was provided)
2. Confirmation that the PR/MR description was updated, or that we left a comment as a fallback, or that the post step was skipped because the source was local / branchless
3. Summary of elements created (X docs, Y diagrams as N pairs + M single annotated, Z table rows). Mention base revision `<short LINK_BASE_SHA>` and head revision `<short LINK_SHA>` in this chat summary only — do **not** place these SHAs on the Miro board. Also note which artifact types were intentionally skipped per §4.5, with a one-line reason.
4. High-risk files requiring careful review
5. Security findings (if any critical/high)
6. Architecture concerns (if any breaking changes)

## References

- `references/risk-assessment.md` — detailed scoring criteria
- `references/review-patterns.md` — review patterns
- `references/source-links.md` — per-platform SHA-fetch commands and blob-URL templates for §2
- `references/diagram-conventions.md` — diagram change-marking prefixes and the Mermaid `classDef` block (§5)
- `references/document-templates.md` — full markdown templates for the summary, architecture, and security documents (§5)
- `references/pr-linking.md` — block format, link/idempotency rules, and per-platform commands for posting the link back to the PR/MR (§6)
- `references/background.md` — review philosophy, visual-review benefits, the artifact-selection table, and the board layout reference
