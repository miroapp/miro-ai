# miro-ast

Visualize tree-sitter AST output on Miro boards. Parse any source file in your project and create an interactive syntax tree diagram.

## Prerequisites

- `miro` plugin installed (provides Miro MCP tools)
- [tree-sitter CLI](https://tree-sitter.github.io/tree-sitter/) installed (`brew install tree-sitter-cli`)
- Language grammar configured for your target language (run `tree-sitter init-config` if first time)

## Commands

| Command | Description |
|---------|-------------|
| `/miro-ast:visualize` | Parse a file and visualize its AST on a Miro board |

### Usage

```bash
# Auto-detect project entry point
/miro-ast:visualize <board-url>

# Specific file
/miro-ast:visualize <board-url> src/parser.ts

# Limit depth
/miro-ast:visualize <board-url> main.py --depth 5

# Filter node types
/miro-ast:visualize <board-url> app.ts --filter function_definition,class_definition

# Concrete syntax tree
/miro-ast:visualize <board-url> index.js --cst
```

Only `board-url` is required. When no file is specified, the plugin auto-detects the project entry point (e.g., `src/index.ts`, `main.py`, `main.go`).

## Local Testing

```bash
# Test from a target project directory
cd /path/to/your/project
claude --plugin-dir /path/to/miro-ai/claude-plugins/miro-ast

# Then run the command
/miro-ast:visualize https://miro.com/app/board/your-board-id=
```

The `--plugin-dir` flag loads the plugin for the current session without installing it globally.

## What Gets Created

1. **AST Mindmap Diagram** — Structural overview showing classes, functions, methods, and module organization
2. **Summary Document** — File metadata, node type frequency, and parsing options used
