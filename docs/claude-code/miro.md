# miro Plugin

Core Miro MCP integration for Claude Code. Create diagrams, documents, and tables on Miro boards, and explore board contents — all driven by natural-language prompts that auto-activate the right skill.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

## Features

- 6 task-focused skills (auto-loaded by relevance — no slash commands to memorize)
- Automatic OAuth configuration
- HTTP MCP server connection to `https://mcp.miro.com/`

## Skills

The plugin ships six skills. Each one teaches Claude how to handle a specific kind of task on a Miro board, including which MCP tool to call, what to ask the user for, and how to format the result.

### miro-browse

**Activates when:** the user wants to list, explore, or filter items on a Miro board, or asks "what's on this board?".

Uses `board_list_items` for filtered listing and `context_explore` / `context_get` for higher-level board summarization. Knows how to handle URLs with `moveToWidget` to scope to a specific frame or item.

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

### miro-diagram

**Activates when:** the user wants to create a diagram from a text description.

**Supported diagram types:**
- `flowchart` — Processes, workflows, decision trees
- `mindmap` — Hierarchical ideas, brainstorming
- `uml_class` — Class diagrams, OOP relationships
- `uml_sequence` — Sequence diagrams, interactions
- `entity_relationship` — Database schemas, ER diagrams

The diagram type is auto-detected from the description, or you can specify explicitly. For precise control, the skill knows about `diagram_get_dsl` and Mermaid notation.

**Example prompts:**

```
create a flowchart for user login authentication on https://miro.com/app/board/abc=

add an ER diagram of users, products, orders, reviews to https://miro.com/app/board/abc=

draw a class diagram for the payment processing system on https://miro.com/app/board/abc=
```

### miro-doc

**Activates when:** the user wants to create or edit a Google-Docs-style markdown document on a board.

**Supported markdown:** headings (H1–H6), bold, italic, unordered/ordered lists, links.
**Not supported:** code blocks, tables (use `miro-table` instead), images, horizontal rules.

The skill also knows the `doc_get` / `doc_update` find-and-replace pattern for editing existing documents.

**Example prompt:**

```
create a sprint planning doc with goals and team assignments on https://miro.com/app/board/abc=
```

### miro-table

**Activates when:** the user wants to create a table with typed columns (text, or color-coded select dropdowns).

Built-in templates for task trackers, decision logs, and risk registers. The skill also covers `table_sync_rows` (with `key_column` upsert) and `table_list_rows` for reading and idempotently updating table data.

**Example prompt:**

```
create a task tracker on https://miro.com/app/board/abc= with columns: Task, Assignee, Status (To Do/In Progress/Done), Priority (Low/Medium/High)
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

### For Better Diagrams
- Be specific about elements and relationships
- Mention flow direction (top-down, left-right)
- Include decision points and conditions
- Use Mermaid notation for precise control

### For Tables
- Use select columns for status/priority fields
- Define distinct colors for each option
- Use meaningful column names
- Set a stable `key_column` when syncing from external data

### For Documents
- Structure with clear headings
- Use lists for multiple items
- Keep content scannable

## Related

- [Overview](overview.md) - Plugin system introduction
- [Tools Reference](../mcp/tools-reference.md) - Full MCP tool documentation
