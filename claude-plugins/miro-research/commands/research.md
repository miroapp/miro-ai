---
description: Research a topic and visualize findings on a Miro board
argument-hint: [board-url] [research-query]
---

# Research and Visualize on Miro

Perform thorough research on a topic and create visual outputs (documents, tables, diagrams) on a Miro board.

## Arguments

1. **board-url** (required): Miro board URL for visualization
2. **research-query** (required): Topic or question to research

## Research Strategy

Use ALL available tools to gather comprehensive information:

### 1. Check Available Data Sources

Determine what's available:
- **Glean MCP** (`company_search`, `chat`, `people_profile_search`) - enterprise search across code, docs, wikis
- **Local context** - repositories, files, and code in the current workspace
- **Web search** - if relevant external information is needed

### 2. Gather Information

**If Glean MCP is connected:**
- Use `company_search` to find relevant documents, code, and resources
- Use `chat` for analytical questions with citations
- Use `people_profile_search` to identify experts and owners

**If Glean is NOT available:**
- Search local repositories using Grep and Glob
- Read relevant files in the workspace
- Analyze code structure and documentation
- Use web search for external context if appropriate

**Always:**
- Cast a wide net first, then focus on most relevant findings
- Track all sources and links
- Identify relationships between findings

### 3. Analyze and Structure

Organize findings into:
- **Key insights** - Main takeaways and answers
- **Supporting evidence** - Code, docs, examples
- **Relationships** - How things connect
- **Experts/owners** - Who to contact
- **Sources** - All links and references

## Visualization Output

Create appropriate Miro artifacts based on the data:

### Documents (for summaries and detailed findings)
Use `miro__draft_doc_new` for:
- Research summary with key findings
- Detailed explanations
- Recommendations and next steps

Include markdown links to all sources: `[Title](URL)`

### Tables (for structured data)
Use `miro__table_create_new` and `miro__table_sync_rows` for:
- Lists of resources/documents found
- Comparison of options
- Search results with metadata

Columns should include linked titles, sources, dates, owners.

### Diagrams (for relationships and flows)
Use `miro__draft_diagram_new` for:
- Architecture/dependency diagrams (network)
- Process flows (flowchart)
- Topic exploration (mindmap)
- Hierarchies (hierarchy)
- Timelines (timeline)

Include source URLs in node descriptions.

## Automatic Visualization Selection

Choose visualizations based on the data:

| Finding Type | Visualization |
|-------------|---------------|
| Summary/analysis | Document |
| List of resources | Table |
| System architecture | Network diagram |
| Process/workflow | Flowchart |
| Topic categories | Mindmap |
| Code/org structure | Hierarchy |
| Historical events | Timeline |

Create MULTIPLE artifacts when appropriate - don't force everything into one format.

## Link Preservation

**CRITICAL**: Every artifact must include links to sources:

- **Documents**: `[Title](URL)` markdown links
- **Tables**: Hyperlinked titles in cells
- **Diagrams**: URLs in node descriptions or frame notes
- **Frame**: Add "Sources" section listing all references

## Board Organization

1. Create a **frame** for the research with descriptive title
2. Place **summary document** at top
3. Add **tables** for structured findings
4. Include **diagrams** showing relationships
5. Add **Sources** section at bottom with all links

Position items to show logical flow and relationships.

## Examples

### Code Architecture Research
```
/research https://miro.com/app/board/abc= "How does authentication work in our services?"
```
→ Creates: summary doc, code references table, architecture diagram with service relationships

### Documentation Gathering
```
/research https://miro.com/app/board/abc= "API documentation and usage patterns"
```
→ Creates: overview doc, docs table with links, mindmap of API topics

### Expert Finding
```
/research https://miro.com/app/board/abc= "Who are the experts on Kubernetes in our company?"
```
→ Creates: expert summary doc, people table with roles/teams, org diagram

### Process Investigation
```
/research https://miro.com/app/board/abc= "Deployment pipeline and release process"
```
→ Creates: process doc, tools/systems table, flowchart of deployment steps

## Error Handling

- **No Glean MCP**: Fall back to local repos and files - still do thorough research
- **No results found**: Report clearly, suggest query refinement, try alternative searches
- **Miro access issues**: Verify board URL and OAuth session
- **Complex topic**: Break into multiple focused searches, create multiple frames

## Quality Checklist

Before completing:
- [ ] All sources have working links
- [ ] Visualizations match the data type
- [ ] Summary captures key findings
- [ ] Relationships are shown visually
- [ ] Board is organized and scannable
