# Miro Plugin

Secure access to Miro boards. Enables AI to read board context, create diagrams, and generate code with enterprise-grade security.

## Components

| Type   | Details |
|--------|---------|
| Skills | `miro-browse`, `miro-code-explain-on-board`, `miro-code-review`, `miro-code-spec`, `miro-diagram`, `miro-doc`, `miro-format`, `miro-table` |
| MCP    | Miro MCP server (`https://mcp.miro.com/`) |

## Installation

1. Ensure Miro MCP is configured (OAuth).
2. Enable this plugin in your AI tool settings.

## Usage

Ask Claude in natural language with a Miro board URL — the relevant skill loads automatically. For example:

- *"List the frames on `https://miro.com/app/board/...`"* → `miro-browse`
- *"Explain this codebase on `https://miro.com/app/board/...`"* → `miro-code-explain-on-board`
- *"Review PR 123 on `https://miro.com/app/board/...`"* → `miro-code-review`
- *"Extract specs from `https://miro.com/app/board/...`"* → `miro-code-spec`
- *"Create a flowchart for the login flow on `https://miro.com/app/board/...`"* → `miro-diagram`
- *"Add a sprint-planning doc to `https://miro.com/app/board/...`"* → `miro-doc`
- *"Create a doc in Miro about our Q3 roadmap"* → `miro-format`
- *"Make a task tracker table on `https://miro.com/app/board/...`"* → `miro-table`

## License

MIT
