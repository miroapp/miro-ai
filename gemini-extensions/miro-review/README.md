# Miro Review Plugin

Visual code reviews on Miro boards. Generates comprehensive review artifacts from GitHub PRs or local changes, with optional context enrichment from enterprise knowledge bases.

## Features

- **Auto-activates** on natural-language review requests with a board URL
- **Visual Artifacts**: Tables, documents, and diagrams created on Miro boards
- **Flexible Sources**: GitHub PRs (current or external repo), local changes, or branch comparisons

## Usage

Prompt Claude in natural language with a Miro board URL and a source:

```
review PR 42 on https://miro.com/app/board/abc123=
review facebook/react#12345 on https://miro.com/app/board/abc123=
review my local changes on https://miro.com/app/board/abc123=
review branch feature-login against main on https://miro.com/app/board/abc123=
```

The `miro-code-review` skill activates automatically and produces a file-changes table, one or more summary/architecture/security documents, and architecture diagrams scaled to the size of the change.

## MCP Integrations

### Miro (Required)
Creates visual artifacts on Miro boards:
- Tables for structured data
- Documents for summaries
- Diagrams for architecture visualization

## Skills

### `miro-code-review`
Auto-activates when the user asks for a code review on a Miro board. Carries the full review workflow (parse source → extract diff → risk-score → build artifacts) plus reference material:
- `references/risk-assessment.md` - File and change risk scoring criteria
- `references/review-patterns.md` - Security, architecture, and quality patterns

## Prerequisites

- **GitHub CLI** (`gh`) - For fetching PR information
- **Git** - For local changes and branch comparisons
- **Miro Board** - With edit access via MCP authentication

## Installation

This plugin is part of the miro-ai plugins collection. To use it:

1. Ensure Miro MCP is configured (authentication via OAuth)
2. Prompt Claude with a board URL and a review source

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
