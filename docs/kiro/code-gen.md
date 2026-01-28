# code-gen Power

Use Miro boards as the source of truth for architectural specs, UI diagrams, and project logic with Kiro.

## Overview

The code-gen power enables design-to-code workflows where Miro boards contain visual specifications that Kiro translates into working code.

## Installation

The power is located at `powers/code-gen/` in this repository:

```
powers/code-gen/
├── POWER.md      # Steering instructions
└── mcp.json      # Miro MCP configuration
```

## Configuration

The power automatically configures Miro MCP:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "headers": {
        "X-AI-Source": "kiro-code-gen-extension"
      }
    }
  }
}
```

## Authentication

When the power activates:

1. Kiro will prompt you to connect to Miro via OAuth
2. Sign in and select the **team** where your project boards are located
3. Authorize the connection

## Design-to-Code Workflow

### 1. Fetch Context

Use Miro MCP tools to read board contents:
- `get_board_context` - Get overall board context
- `get_board_items` - List specific items

### 2. Analyze Structure

The power teaches Kiro to interpret board elements:

| Board Element | Interpretation |
|---------------|----------------|
| **Sticky Notes** | Requirements or user stories |
| **Connectors** | Data flows or logic gates |
| **Frames** | Application modules or UI screens |
| **Diagrams** | System architecture or workflows |

### 3. Generate Specs

Before writing code, Kiro summarizes board context into structured specifications using EARS notation (Easy Approach to Requirements Syntax).

### 4. Implementation

Kiro maps board items to specific files:

| Board Item | Code Mapping |
|------------|--------------|
| "Login" frame | `src/components/Login.tsx` |
| "User" shape | `src/types/User.ts` |
| Flow chart | State machine or switch/case logic |

## Best Practices

### Board Organization

For best results, organize your Miro boards:

- **Use frames** to group related screens or modules
- **Name items clearly** - names become variable/component names
- **Show relationships** with connectors and arrows
- **Include annotations** for business logic

### Prompting Kiro

When working with boards:

```
"Implement the login flow from the Miro board"
"Generate the API endpoints shown in the architecture diagram"
"Create React components for each screen in the wireframes frame"
```

Always provide the **Board ID** or URL if Kiro doesn't detect it automatically.

### Flow Charts

When boards contain flow charts:
- Kiro implements logic using clean switch/case patterns
- State machines are used for complex flows
- Decision nodes become conditional logic

## Triggers

The power activates when you mention:
- "the board"
- "diagrams"
- "specs"
- References to Miro content

## Example Workflow

```
User: "Based on the architecture diagram on my Miro board, generate the API routes"

Kiro: [Fetches board content using MCP]
      [Analyzes the architecture diagram]
      [Identifies endpoints, data flows, and services]
      [Generates code structure]

# Generated files:
src/
├── routes/
│   ├── users.ts
│   ├── products.ts
│   └── orders.ts
├── services/
│   └── ...
└── types/
    └── ...
```

## Related

- [Overview](overview.md) - Kiro powers introduction
- [Power Development](power-development.md) - Build your own powers
- [MCP Tools Reference](../mcp/tools-reference.md) - Available MCP tools
