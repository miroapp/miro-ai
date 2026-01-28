# Miro Research Plugin

Research any topic and visualize findings on Miro boards.

## What It Does

`/research [board-url] [query]` - Performs thorough research using available tools and creates visual outputs on Miro.

**Input:** A question or topic to research
**Output:** Documents, tables, and diagrams on a Miro board with all source links preserved

## How It Works

1. **Research** - Uses whatever tools are available:
   - Glean MCP (if connected) - enterprise search across code, docs, wikis
   - Local repositories and files in current workspace
   - Web search for external context

2. **Analyze** - Structures findings into insights, evidence, relationships, experts

3. **Visualize** - Creates appropriate Miro artifacts:
   - Documents for summaries and detailed findings
   - Tables for structured data and resource lists
   - Diagrams for relationships, flows, and hierarchies

4. **Link Everything** - All artifacts include links back to sources

## Examples

```bash
# Architecture research
/research https://miro.com/app/board/abc= "How does authentication work?"

# Documentation gathering
/research https://miro.com/app/board/abc= "API documentation and patterns"

# Expert finding
/research https://miro.com/app/board/abc= "Who are the Kubernetes experts?"

# Process investigation
/research https://miro.com/app/board/abc= "Deployment pipeline and release process"
```

## MCP Servers

| Server | Purpose | Required |
|--------|---------|----------|
| Miro | Board visualization | Yes |
| Glean | Enterprise search | Optional (falls back to local context) |

Both use HTTP remote servers with browser OAuth - no tokens to configure.

## Setup

```bash
cd miro-research
claude plugins add .
```

## Resources

- [Miro MCP Documentation](https://developers.miro.com/docs/miro-mcp)
- [Glean MCP Documentation](https://developers.glean.com/guides/mcp)
