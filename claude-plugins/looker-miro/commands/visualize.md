---
description: Query Looker data and create visualizations on a Miro board
argument-hint: "[board-url] [query?]"
---

# Visualize Looker Data on Miro

Query Looker analytics data using natural language and create visual diagrams on a Miro board.

## Arguments

Parse the user's input to extract:
1. **board-url** (required): Miro board URL
2. **query** (optional): Natural language query for Looker data (if not provided, ask the user)

## Workflow

1. If board URL is missing, ask the user for it
2. If query is missing, ask the user what Looker data they want to visualize
3. Query Looker using the Looker MCP tools with the natural language query
4. Analyze the returned data structure
5. Determine the best visualization type based on the data:
   - **Table** - For tabular data with multiple columns
   - **Flowchart** - For process flows or status transitions
   - **Hierarchy/Mindmap** - For hierarchical or grouped data
   - **Timeline** - For time-series or date-based data
6. Create the visualization on the Miro board using appropriate Miro MCP tools
7. Create an explanation document next to the visualization using `miro__doc_create` with:
   - **Title**: The original natural language query
   - **Data source**: Looker model/explore used
   - **Query details**: Filters, dimensions, measures applied
   - **Key insights**: 2-3 bullet points summarizing what the data shows
   - **Position**: Place the doc to the right of the visualization (x offset +1500 from the visualization)
8. Report success with a link to the board

## Visualization Types

| Type | Best For | Miro Tool |
|------|----------|-----------|
| **Table** | Structured data with rows/columns | `miro__table_create` |
| **Flowchart** | Processes, workflows, status flows | `miro__diagram_create` (type: flowchart) |
| **Hierarchy** | Org charts, categories, groupings | `miro__diagram_create` (type: mindmap) |
| **Timeline** | Time-series, trends, milestones | `miro__diagram_create` (type: flowchart) |

## Examples

**Basic query:**
```
/looker-miro:visualize https://miro.com/app/board/abc= "show me top 10 products by revenue this quarter"
```
→ Queries Looker for product revenue data and creates a table on the board

**With visualization preference:**
```
/looker-miro:visualize https://miro.com/app/board/abc= "sales pipeline by stage"
```
→ Creates a flowchart showing sales stages

**Time-based data:**
```
/looker-miro:visualize https://miro.com/app/board/abc= "monthly active users for the last 6 months"
```
→ Creates a timeline or chart showing user growth

## Data Transformation

### For Tables
Transform Looker query results into Miro table format:
- Map each data field to a table column
- Use text columns for most data types
- Use select columns for status/category fields with limited values
- Include up to 50 rows (paginate if needed)

### For Diagrams
Transform data into diagram descriptions:
- **Flowchart**: Map status/stage fields to flow nodes
- **Hierarchy**: Map parent-child or category relationships to tree structure
- **Timeline**: Map date fields to timeline events

## Positioning

Each visualization is paired with an explanation document to its right:
- First visualization: x=0, y=0 → explanation doc: x=1500, y=0
- Second visualization: x=0, y=2500 → explanation doc: x=1500, y=2500
- Third visualization: x=0, y=5000 → explanation doc: x=1500, y=5000

## Best Practices

- Keep queries focused and specific
- Use meaningful column names in tables
- For large datasets, consider filtering or aggregating before visualization
- Use consistent colors for status/category fields across visualizations

## Tips

- Combine multiple queries to create dashboard-style boards
- Use frames to group related visualizations
- Refresh visualizations by re-running the command with updated queries
