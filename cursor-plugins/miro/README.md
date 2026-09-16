# Miro Plugin

Secure access to Miro boards. Enables AI to read board context, create diagrams, and generate code with enterprise-grade security.

## Components

| Type   | Details |
|--------|---------|
| Skills | `miro-code-explain-on-board`, `miro-code-review`, `miro-code-spec` |
| MCP    | Miro MCP server (`https://mcp.miro.com/`) |

## Installation

1. Ensure Miro MCP is configured (OAuth).
2. Enable this plugin in your AI tool settings.

## Usage

Ask Claude in natural language with a Miro board URL — the relevant skill loads automatically. For example:

- *"Explain this codebase on `https://miro.com/app/board/...`"* → `miro-code-explain-on-board`
- *"Review PR 123 on `https://miro.com/app/board/...`"* → `miro-code-review`
- *"Extract specs from `https://miro.com/app/board/...`"* → `miro-code-spec`

Creating content on a board — diagrams, documents, tables, stickies, standalone formats — needs no skill. Ask for it directly and the Miro MCP server's own tools handle it, including the authoring guidance they load on demand.

## License

MIT
