# Miro Review Plugin

Visual code reviews on Miro boards. Generates comprehensive review artifacts from GitHub PRs or local changes, with optional context enrichment from enterprise knowledge bases.

## Features

- **Multiple Review Types**: Standard, security-focused, and architecture-focused reviews
- **Visual Artifacts**: Tables, documents, and diagrams created on Miro boards
- **Flexible Sources**: GitHub PRs, local changes, or branch comparisons

## Commands

### `/miro-review:review` - Standard Code Review

Generate a comprehensive visual code review with file analysis, risk assessment, and architectural diagrams.

```bash
# PR in current repo
/miro-review:review https://miro.com/app/board/abc123= 42

# External repo PR
/miro-review:review https://miro.com/app/board/abc123= facebook/react#12345

# Local changes
/miro-review:review https://miro.com/app/board/abc123= --local

# Branch comparison
/miro-review:review https://miro.com/app/board/abc123= --branch feature-login
```

**Creates:**
- File changes table with status and risk levels
- Summary document with overview and checklist
- Architecture diagrams showing component relationships

### `/miro-review:security` - Security Review

Security-focused analysis looking for vulnerabilities and compliance concerns.

```bash
/miro-review:security https://miro.com/app/board/abc123= 42
```

**Creates:**
- Security findings table with severity ratings
- Security summary with compliance checklist
- Attack surface diagram

### `/miro-review:architecture` - Architecture Review

Architecture-focused analysis of structural changes and design patterns.

```bash
/miro-review:architecture https://miro.com/app/board/abc123= 42
```

**Creates:**
- Component impact table
- Architecture summary with breaking changes
- Component diagrams (before/after for refactoring)
- Data flow and sequence diagrams

## MCP Integrations

### Miro (Required)
Creates visual artifacts on Miro boards:
- Tables for structured data
- Documents for summaries
- Diagrams for architecture visualization

## Skills

### `code-review`
Knowledge base for effective code review:
- `references/risk-assessment.md` - File and change risk scoring criteria
- `references/review-patterns.md` - Security, architecture, and quality patterns

## Prerequisites

- **GitHub CLI** (`gh`) - For fetching PR information
- **Git** - For local changes and branch comparisons
- **Miro Board** - With edit access via MCP authentication

## Installation

This plugin is part of the miro-ai plugins collection. To use it:

1. Ensure Miro MCP is configured (authentication via OAuth)
2. Use the commands with a valid Miro board URL

## Output Example

After running a review, you'll see on your Miro board:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Summary   │    │   Files     │    │  Component  │ │
│  │  Document   │    │   Table     │    │   Diagram   │ │
│  │             │    │             │    │             │ │
│  │ - Overview  │    │ File | Risk │    │  [A]──[B]   │ │
│  │ - Checklist │    │ ─────────── │    │   │    │    │ │
│  │ - Questions │    │ auth | High │    │  [C]──[D]   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## License

MIT
