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

### 5. Create Miro Board Content

**IMPORTANT: Scale content based on PR size.** Create multiple documents and diagrams for larger PRs.

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

| PR Size | Files | Documents | Diagrams |
|---------|-------|-----------|----------|
| Small | 1-5 | 1 summary | 1 flow diagram |
| Medium | 6-15 | 2 docs (summary + deep-dive) | 2-3 diagrams |
| Large | 16-30 | 3 docs (summary + architecture + security) | 3-4 diagrams |
| Very Large | 30+ | 4+ docs (by subsystem/area) | 5+ diagrams |

---

#### File Changes Table

Create first (appears at board center). Use Miro MCP tool to create a table with columns **in this order**:

| Column | Type | Options |
|--------|------|---------|
| Status | select | Added (#00FF00), Modified (#FFA500), Deleted (#FF0000) |
| File | text | File path |
| Change | text | Brief summary of changes and key review points |
| Risk | select | Low (#00FF00), Medium (#FFA500), High (#FF0000) |

For very large PRs (30+ files), create separate tables:
- High-risk changes table
- Standard changes table

---

#### Documents

**Document 1: Main Summary (x=800, y=0)**

Always create this document:

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
- [Files/components requiring careful review]

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

Create for Medium+ PRs or when structural changes detected:

```markdown
# Architecture Analysis

## Structural Changes

### New Components
- [List new modules, services, classes]

### Modified Interfaces
- [API changes, contract modifications]

### Dependency Changes
- [New, removed, or updated dependencies]

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

Create for Large+ PRs or when security-sensitive code detected:

```markdown
# Security Analysis

**Risk Score:** [Critical/High/Medium/Low]

## Security-Sensitive Changes
- [Auth/authz modifications]
- [Data handling changes]
- [API exposure changes]

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

**Diagram Selection Guide:**

| Change Type | Diagram Type | Purpose |
|-------------|--------------|---------|
| Feature addition | `flowchart` | Show component interactions |
| Refactoring | `uml_class` | Show structural changes |
| API/integration | `uml_sequence` | Show interaction flow |
| Database changes | `entity_relationship` | Show schema modifications |
| Bug fix | `flowchart` | Show fix location in flow |
| Data pipeline | `flowchart` | Show data flow |

**Diagram Positions:**

Position diagrams after the last document. For a typical Large PR with 3 docs:

| Diagram | Position | When to Create |
|---------|----------|----------------|
| Main flow/architecture | x=3200, y=0 | Always |
| Component relationships | x=4000, y=0 | Medium+ PRs |
| Sequence/interaction | x=4800, y=0 | API changes |
| Data flow | x=5600, y=0 | Data pipeline changes |
| Before/after comparison | x=6400, y=0 | Major refactoring |

Adjust starting x based on actual number of documents created.

**Each diagram should show:**
- Affected components/modules (highlighted)
- Data/control flow through changed code
- Dependencies between changed files
- Trust boundaries (for security-relevant changes)

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

After completion, provide:
1. Link to the Miro board (or frame, if `moveToWidget` was provided)
2. Confirmation that the PR/MR description was updated, or that we left a comment as a fallback, or that the post step was skipped because the source was local / branchless
3. Summary of elements created (X docs, Y diagrams, Z table rows)
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
