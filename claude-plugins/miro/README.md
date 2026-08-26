# Miro Plugin

Secure access to Miro boards. Enables AI to read board context, create diagrams, and generate code with enterprise-grade security.

## Components

| Type   | Details |
|--------|---------|
| Skills | `miro-browse`, `miro-code-review`, `miro-code-spec`, `miro-code-explain-on-board` |
| MCP    | Miro MCP server (`https://mcp.miro.com/`) |

## Installation

1. Ensure Miro MCP is configured (OAuth).
2. Enable this plugin in your AI tool settings.

## Usage

Ask Claude in natural language with a Miro board URL — the relevant skill loads automatically. For example:

- *"List the frames on `https://miro.com/app/board/...`"* → `miro-browse`
- *"Review PR 123 on `https://miro.com/app/board/...`"* → `miro-code-review`
- *"Extract specs from `https://miro.com/app/board/...`"* → `miro-code-spec`
- *"Explain this codebase on `https://miro.com/app/board/...`"* → `miro-code-explain-on-board`

Diagrams, docs, and tables are created through Canvas Composer — no dedicated format skills.

## License

MIT
