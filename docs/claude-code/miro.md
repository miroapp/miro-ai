# miro Plugin

Core Miro MCP integration for Claude Code. Explore boards, run visual code reviews, extract specs, and explain codebases on Miro — driven by natural-language prompts that auto-activate the right skill. Diagrams, docs, and tables are created through Canvas Composer.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

## Features

- 4 task-focused skills (auto-loaded by relevance — no slash commands to memorize)
- Automatic OAuth configuration
- HTTP MCP server connection to `https://mcp.miro.com/`

## Skills

The plugin ships four skills. Each one teaches Claude how to handle a specific kind of task on a Miro board, including which MCP tool to call, what to ask the user for, and how to format the result.

### miro-browse

**Activates when:** the user wants to list, explore, or filter items on a Miro board, or asks "what's on this board?".

Lists, filters, and summarizes board items, and retrieves the content of a specific item. Understands URLs with `moveToWidget` or `focusWidget` that scope the operation to a single frame or item.

**Example prompts:**

```
list items on https://miro.com/app/board/uXjVK123abc=/

show me only the frames on https://miro.com/app/board/uXjVK123abc=/

summarize what's on https://miro.com/app/board/uXjVK123abc=/
```

### miro-code-review

**Activates when:** the user wants a visual code review on a Miro board from a GitHub PR, local uncommitted changes, or a branch comparison.

Generates file-changes table, summary/architecture/security docs, and architecture diagrams on the board.

**Example prompts:**

```
review PR 123 on https://miro.com/app/board/abc=

visual review of local changes on https://miro.com/app/board/abc=

compare feat/payments against main on https://miro.com/app/board/abc=
```

### miro-code-spec

**Activates when:** the user wants to extract a Miro board's specs (documents, diagrams, prototypes, tables, frames, images) to local `.miro/specs/` files.

Accepts a board URL (extract all spec items) or a single-item URL with `moveToWidget`/`focusWidget` (extract that one item). Saves files for AI-assisted planning and implementation without repeated API calls.

**Example prompts:**

```
extract specs from https://miro.com/app/board/abc=

download the design doc at https://miro.com/app/board/abc=/?moveToWidget=345...

pull all PRD content from https://miro.com/app/board/abc= into .miro/specs/
```

### miro-code-explain-on-board

**Activates when:** the user wants to explain or visualize a codebase on a Miro board.

Produces a minimal, notation-correct set of diagrams (flowchart, UML class, UML sequence, ERD) that each answer one question at one abstraction level, plus a short companion document. Diagrams are grounded in real repo artifacts — no invented symbols — and rendered via the MCP Mermaid tools.

**Example prompts:**

```
explain this codebase on https://miro.com/app/board/abc=

diagram the architecture of the payments service on https://miro.com/app/board/abc=

visualize how a request flows through this repo on https://miro.com/app/board/abc=
```

## MCP Configuration

The plugin automatically configures the Miro MCP server:

```json
{
  "miro": {
    "type": "http",
    "url": "https://mcp.miro.com/",
    "headers": {
      "X-AI-Source": "claude-code-plugin"
    }
  }
}
```

## Tips

- Include a Miro board URL in your prompt so the right skill can activate
- For diagrams/docs/tables, ask naturally — Canvas Composer handles generation without dedicated format skills
- Be specific about scope (frame, PR number, branch) when exploring or reviewing

## Related

- [Overview](overview.md) - Plugin system introduction
- [Tools Reference](../mcp/tools-reference.md) - Full MCP tool documentation
