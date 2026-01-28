# Power Development Guide

This guide covers creating Kiro powers for Miro integration.

## Power Architecture

A Kiro power is a directory containing:

```
power-name/
├── POWER.md      # Steering instructions (required)
└── mcp.json      # MCP configuration (required)
```

## POWER.md Structure

The `POWER.md` file contains metadata and steering instructions:

```markdown
---
name: "power-identifier"
displayName: "Human-Readable Name"
description: "What this power enables"
keywords: ["keyword1", "keyword2"]
---

# Onboarding

Instructions for first-time setup.

# Steering Instructions

Guidance for Kiro on how to use this power.

## Workflow: Name

Step-by-step process.

## Best Practices

Recommendations for effective use.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Power identifier (kebab-case) |
| `displayName` | Yes | Human-readable title |
| `description` | Yes | What the power does |
| `keywords` | No | Search terms |

### Sections

**Onboarding** - First-time setup instructions:
```markdown
# Onboarding

## Step 1: Authenticate
When this power activates, Kiro will prompt you to connect via OAuth.
Ensure you select the correct team.
```

**Steering Instructions** - Guidance for Kiro:
```markdown
# Steering Instructions

You are an expert at [domain]. Use the MCP tools to [accomplish goal].
```

**Workflows** - Named processes:
```markdown
## Workflow: Design-to-Code

1. **Fetch Context**: Use `get_board_context` to read the board
2. **Analyze Structure**: Identify components and relationships
3. **Generate Output**: Create the appropriate files
```

**Best Practices** - Usage recommendations:
```markdown
## Best Practices

- Always ask for the Board ID if not detected
- Start with project summary before detailed extraction
```

## MCP Configuration

The `mcp.json` file configures MCP server connections:

```json
{
  "mcpServers": {
    "server-name": {
      "url": "https://mcp.example.com/",
      "disabled": false,
      "autoApprove": [],
      "headers": {
        "X-AI-Source": "kiro-power-name"
      }
    }
  }
}
```

### Configuration Fields

| Field | Required | Description |
|-------|----------|-------------|
| `url` | Yes | MCP server endpoint |
| `disabled` | No | Whether to disable this server |
| `autoApprove` | No | Tools to auto-approve |
| `headers` | No | Custom HTTP headers |

### Miro MCP Configuration

For Miro integration:

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "disabled": false,
      "autoApprove": [],
      "headers": {
        "X-AI-Source": "kiro-your-power-name"
      }
    }
  }
}
```

The `X-AI-Source` header helps Miro track which integration is making requests.

## Example Power

### Directory Structure

```
miro-docs/
├── POWER.md
└── mcp.json
```

### POWER.md

```markdown
---
name: "miro-docs"
displayName: "Miro Documentation Generator"
description: "Generate documentation from Miro board content"
keywords: ["miro", "documentation", "specs"]
---

# Onboarding

## Step 1: Authenticate Miro
When this power activates, Kiro will prompt you to connect to Miro.
Select the team containing your documentation boards.

# Steering Instructions

You are an expert at extracting structured documentation from visual boards.
Use Miro MCP tools when the user mentions "the board", "diagrams", or "specs".

## Workflow: Extract Documentation

1. **List Frames**: Use `get_board_items` to find all frames
2. **Get Content**: For each frame, extract text and structure
3. **Format Output**: Generate markdown documentation
4. **Organize**: Create a logical document structure

## Best Practices

- Start with the project summary frame
- Use frame names as section headers
- Include diagrams as references, not inline images
- Ask for clarification on ambiguous content
```

### mcp.json

```json
{
  "mcpServers": {
    "miro-mcp": {
      "url": "https://mcp.miro.com/",
      "disabled": false,
      "autoApprove": [],
      "headers": {
        "X-AI-Source": "kiro-miro-docs"
      }
    }
  }
}
```

## Testing Powers

### Local Development

1. Create your power directory
2. Add POWER.md with steering instructions
3. Configure mcp.json for required services
4. Add the power to Kiro's configuration
5. Test with sample prompts

### Testing Checklist

- [ ] POWER.md has valid frontmatter
- [ ] mcp.json is valid JSON
- [ ] MCP servers are reachable
- [ ] Steering instructions trigger correctly
- [ ] Workflows produce expected results

### Sample Prompts

Test your power with prompts that should trigger it:

```
"Use the board to generate documentation"
"What's on my Miro board?"
"Create a spec from the wireframes"
```

## Best Practices

### Steering Instructions

- Be specific about when the power should activate
- Provide clear step-by-step workflows
- Include error handling guidance
- Reference specific MCP tools by name

### MCP Configuration

- Use descriptive server names
- Include identifying headers for debugging
- Configure only necessary servers
- Document required authentication

### Documentation

- Include onboarding steps for new users
- Provide example prompts
- Document expected board organization
- List prerequisites clearly

## Related

- [Overview](overview.md) - Kiro powers introduction
- [code-gen](code-gen.md) - Example power
- [MCP Tools Reference](../mcp/tools-reference.md) - Available MCP tools
