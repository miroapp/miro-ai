# miro Plugin

Core Miro MCP integration for Claude Code, plus three skills for codebase-oriented workflows that span the repo and the board.

Creating and exploring board content — diagrams, documents, tables, stickies, standalone formats — is handled by the Miro MCP server's own tools and needs no skill. Ask for it in natural language.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

## Features

- 3 task-focused skills (auto-loaded by relevance — no slash commands to memorize)
- Automatic OAuth configuration
- HTTP MCP server connection to `https://mcp.miro.com/`

## Skills

The plugin ships three skills. Each one carries a multi-step workflow that the MCP tools alone don't describe: reading a pull request from a forge, writing spec files into the repo, or deciding what a codebase's diagram set should contain.


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

Produces a minimal, notation-correct set of diagrams (flowchart, UML class, UML sequence, ERD) that each answer one question at one abstraction level, plus a short companion document. Diagrams are grounded in real repo artifacts — no invented symbols — and written to the board as Mermaid diagram widgets through the MCP canvas tools.

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

These apply to prompts you send straight to the MCP tools, with or without a skill in play.

### For Better Diagrams
- Be specific about elements and relationships
- Mention flow direction (top-down, left-right)
- Include decision points and conditions
- Use Mermaid notation for precise control

### For Tables
- Use select columns for status/priority fields
- Define distinct colors for each option
- Use meaningful column names
- Use a stable identifier column when syncing rows from external data

### For Documents
- Structure with clear headings
- Use lists for multiple items
- Keep content scannable

## Related

- [Overview](overview.md) - Plugin system introduction
- [Tools Reference](../mcp/tools-reference.md) - Full MCP tool documentation
