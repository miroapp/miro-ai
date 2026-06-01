# Document Templates

Full markdown templates for the review documents created in §5. Apply the per-document value gates from the SKILL (Main Summary, Architecture, Security) before creating each one, and hyperlink every file mention per the §5 "Linking conventions".

## Document 1: Main Summary

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

## Document 2: Architecture Analysis

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

## Document 3: Security Analysis

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

## Additional Documents

For Very Large PRs, create per-subsystem documents in the same row:
- "API Changes Analysis"
- "Database Migration Review"
- "UI/Frontend Changes"
- etc.
