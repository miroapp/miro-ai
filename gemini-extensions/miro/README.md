# Miro Plugin

Secure access to Miro boards. Enables AI to read board context, create diagrams, and generate code with enterprise-grade security.

## Components

| Type   | Details |
|--------|---------|
| Skills | `miro-browse`, `miro-diagram`, `miro-doc`, `miro-table` |
| MCP    | Miro MCP server (`https://mcp.miro.com/`) |

## Installation

1. Ensure Miro MCP is configured (OAuth).
2. Enable this plugin in your AI tool settings.

## Usage

Ask Claude in natural language with a Miro board URL — the relevant skill loads automatically. For example:

- *"List the frames on `https://miro.com/app/board/...`"* → `miro-browse`
- *"Create a flowchart for the login flow on `https://miro.com/app/board/...`"* → `miro-diagram`
- *"Add a sprint-planning doc to `https://miro.com/app/board/...`"* → `miro-doc`
- *"Make a task tracker table on `https://miro.com/app/board/...`"* → `miro-table`

## License

MIT
