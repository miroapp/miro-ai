# miro-research Plugin

Research any topic and visualize findings on Miro boards.

## Overview

The miro-research plugin performs thorough research using available tools and creates visual outputs on Miro boards. It intelligently uses whatever data sources are available:

- **Glean MCP** (if connected) - Enterprise search across code, docs, wikis
- **Local context** - Repositories and files in the current workspace
- **Web search** - External information when relevant

## Installation

```bash
/plugin install miro-research@miro-ai
```

## Command

### `/miro-research:research`

Research a topic and visualize findings on a Miro board.

```bash
/miro-research:research [board-url] [query]
```

**Examples:**

```bash
# Architecture research
/miro-research:research https://miro.com/app/board/abc= "How does authentication work?"

# Documentation gathering
/miro-research:research https://miro.com/app/board/abc= "API documentation and patterns"

# Expert finding
/miro-research:research https://miro.com/app/board/abc= "Who are the Kubernetes experts?"

# Process investigation
/miro-research:research https://miro.com/app/board/abc= "Deployment pipeline and release process"
```

## Output

The command automatically creates appropriate Miro visualizations based on the data:

| Finding Type | Visualization |
|-------------|---------------|
| Summary/analysis | Document |
| List of resources | Table |
| System architecture | Network diagram |
| Process/workflow | Flowchart |
| Topic categories | Mindmap |
| Code/org structure | Hierarchy |
| Historical events | Timeline |

All artifacts include links back to source materials.

## MCP Requirements

| Server | Purpose | Required |
|--------|---------|----------|
| Miro | Board visualization | Yes |
| Glean | Enterprise search | Optional |

Both use HTTP remote servers with browser OAuth authentication.

## Workflow

1. **Research** - Gathers information from available sources
2. **Analyze** - Structures findings into insights, evidence, relationships
3. **Visualize** - Creates documents, tables, and diagrams on the Miro board
4. **Link** - Preserves all source URLs in artifacts

## Related Plugins

- [miro](miro.md) - Core Miro MCP integration
- [miro-tasks](miro-tasks.md) - Task tracking in Miro tables
