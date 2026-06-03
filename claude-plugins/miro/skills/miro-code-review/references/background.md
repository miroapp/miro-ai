# Background

Context and rationale behind the visual code review workflow.

## Review Philosophy

Effective code reviews focus on:
1. **Correctness** - Does the code do what it's supposed to?
2. **Security** - Are there vulnerabilities or data exposures?
3. **Maintainability** - Can others understand and modify this code?
4. **Performance** - Are there efficiency concerns?
5. **Consistency** - Does it follow project conventions?

## Visual Review Benefits

Creating visual artifacts helps:
- **Async collaboration** - Reviewers can engage at their own pace
- **Context preservation** - Related docs and diagrams in one place
- **Discussion tracking** - Comments attached to specific items
- **Knowledge sharing** - Junior devs learn from visual explanations

## Visualization Patterns

When to use each artifact type:

| Artifact | Best For |
|----------|----------|
| **Table** | File lists, structured comparisons, status tracking |
| **Document** | Summaries, detailed analysis, checklists |
| **Flowchart** | Process flows, decision trees, bug fix context |
| **Class Diagram** | Structural changes, refactoring, OOP patterns |
| **Sequence Diagram** | API interactions, message flows, integrations |
| **ER Diagram** | Database changes, data model updates |

## Layout Reference

```
┌─────────────────────────────────────────────────────────┐
│                    MIRO BOARD LAYOUT                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────┐      ┌─────────┐      ┌─────────┐          │
│  │  Table  │  →   │   Docs  │  →   │ Diagrams│          │
│  │ (files) │      │         │      │         │          │
│  └─────────┘      └─────────┘      └─────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
