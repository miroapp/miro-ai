# miro Plugin

Core Miro MCP integration for Claude Code. Create diagrams, documents, and tables on Miro boards.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

## Features

- 5 built-in slash commands
- MCP skill for effective tool usage
- Automatic OAuth configuration
- HTTP MCP server connection to `https://mcp.miro.com/`

## Commands

### /miro:browse

List and explore items on a Miro board.

**Usage:**
```
/miro:browse <board-url>
```

**Arguments:**
- `board-url` (required) - Miro board URL

**Example:**
```
/miro:browse https://miro.com/app/board/uXjVK123abc=/
```

Lists frames, documents, tables, and other items on the board.

---

### /miro:diagram

Create a diagram from a text description.

**Usage:**
```
/miro:diagram <board-url> <description>
```

**Arguments:**
- `board-url` (required) - Miro board URL
- `description` (required) - What to diagram

**Supported Diagram Types:**
- `flowchart` - Processes, workflows, decision trees
- `mindmap` - Hierarchical ideas, brainstorming
- `uml_class` - Class diagrams, OOP relationships
- `uml_sequence` - Sequence diagrams, interactions
- `entity_relationship` - Database schemas, ER diagrams

**Examples:**
```
/miro:diagram https://miro.com/app/board/abc= user login authentication flow

/miro:diagram https://miro.com/app/board/abc= database schema for e-commerce: users, products, orders

/miro:diagram https://miro.com/app/board/abc= class diagram for payment processing system
```

The diagram type is auto-detected from your description, or you can specify it explicitly.

---

### /miro:doc

Create a markdown document on a Miro board.

**Usage:**
```
/miro:doc <board-url> <content-description>
```

**Arguments:**
- `board-url` (required) - Miro board URL
- `content-description` (required) - What to document

**Supported Markdown:**
- Headings (`# H1` through `###### H6`)
- Bold (`**text**`)
- Italic (`*text*`)
- Unordered lists (`- item`)
- Ordered lists (`1. item`)
- Links (`[text](url)`)

**Not Supported:**
- Code blocks
- Tables (use `/miro:table` instead)
- Images

**Example:**
```
/miro:doc https://miro.com/app/board/abc= sprint planning document with goals and team assignments
```

---

### /miro:table

Create a table with typed columns.

**Usage:**
```
/miro:table <board-url> <table-description>
```

**Arguments:**
- `board-url` (required) - Miro board URL
- `table-description` (required) - Columns and data to create

**Column Types:**
- `text` - Free-form text entry
- `select` - Dropdown with predefined options (with colors)

**Example:**
```
/miro:table https://miro.com/app/board/abc= task tracker with columns: Task (text), Assignee (text), Status (select: To Do, In Progress, Done), Priority (select: Low, Medium, High)
```

---

### /miro:summarize

Generate documentation from board content.

**Usage:**
```
/miro:summarize <board-url>
```

**Arguments:**
- `board-url` (required) - Miro board URL

**Document Types Generated:**
- `project_summary` - High-level overview
- `style_guide` - Design tokens, colors, typography
- `screen_design_requirements` - UI/UX specifications
- `technical_specification` - Implementation details
- `functional_requirements` - Business requirements

**Example:**
```
/miro:summarize https://miro.com/app/board/abc=
```

Start with project summary to understand board structure, then request specific document types.

## Skills

The plugin includes the `miro-mcp` skill which teaches Claude:

- How to use each MCP tool effectively
- Best practices for positioning content
- Error handling patterns
- Diagram description formats
- Table column configuration

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

### For Documents
- Structure with clear headings
- Use lists for multiple items
- Keep content scannable

## Related

- [Overview](overview.md) - Plugin system introduction
- [miro-tasks](miro-tasks.md) - Task tracking integration
- [Tools Reference](../mcp/tools-reference.md) - Full MCP tool documentation
