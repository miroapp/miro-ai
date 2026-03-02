---
description: Generate visual code review on Miro board from GitHub PR or local changes
argument-hint: "<board-url> <pr|owner/repo#pr|PR-URL|--local|--branch name>"
allowed-tools: Bash(gh:*), Bash(git:*)
---

# Visual Code Review

Generate a comprehensive visual code review on a Miro board from GitHub PRs, local changes, or branch comparisons. Includes architecture analysis, security review, and optionally enriches with enterprise documentation.

## Arguments

- `board-url` (required): Miro board URL where the review will be created
- Source (one of):
  - `<pr-number>`: GitHub PR number in current repo (e.g., `42`)
  - `<owner/repo#number>`: PR from external repo (e.g., `facebook/react#12345`)
  - `<PR-URL>`: Full GitHub PR URL (e.g., `https://github.com/owner/repo/pull/42`)
  - `--local`: Review uncommitted local changes
  - `--branch <name>`: Compare branch against main

## Workflow

### 1. Parse Arguments

Extract the board URL and determine the source type:
- If argument is a number → GitHub PR in current repo
- If argument matches `owner/repo#number` → External GitHub PR
- If argument is a GitHub URL → Extract owner, repo, and PR number from URL
- If argument is `--local` → Local uncommitted changes
- If argument is `--branch <name>` → Branch comparison

### 2. Extract Changes

**For GitHub PR (current repo):**
```bash
gh pr view $PR_NUMBER --json title,body,author,files,additions,deletions
gh pr diff $PR_NUMBER
```

**For GitHub PR (external repo):**
```bash
gh pr view $PR_NUMBER --repo $OWNER/$REPO --json title,body,author,files,additions,deletions
gh pr diff $PR_NUMBER --repo $OWNER/$REPO
```

**For Local Changes:**
```bash
git status --porcelain
git diff HEAD
```

**For Branch Comparison:**
```bash
git log main..HEAD --oneline
git diff main...HEAD
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

---

## Example Usage

```
# PR in current repo
/miro-review:review https://miro.com/app/board/abc123= 42

# PR from external repo (short format)
/miro-review:review https://miro.com/app/board/abc123= facebook/react#12345

# PR from external repo (full URL)
/miro-review:review https://miro.com/app/board/abc123= https://github.com/vercel/next.js/pull/789

# Local uncommitted changes
/miro-review:review https://miro.com/app/board/abc123= --local

# Compare branch against main
/miro-review:review https://miro.com/app/board/abc123= --branch feature-login
```

## Output

After completion, provide:
1. Link to the Miro board
2. Summary of elements created (X docs, Y diagrams, Z table rows)
3. High-risk files requiring careful review
4. Security findings (if any critical/high)
5. Architecture concerns (if any breaking changes)
