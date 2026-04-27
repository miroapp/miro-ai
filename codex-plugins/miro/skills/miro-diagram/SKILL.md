---
name: miro-diagram
description: >-
  Use when the user wants to create a diagram (flowchart, mindmap, UML class,
  UML sequence, entity-relationship) on a Miro board from a natural-language
  description or Mermaid/PlantUML notation.
---
# Create Diagram on Miro Board

Create a diagram on the specified Miro board using the provided description.

## Inputs

Identify from the user's request:
1. **board-url** (required): Miro board URL (e.g., `https://miro.com/app/board/uXjVK123abc=/`)
2. **description** (required): What to diagram — natural language or Mermaid/PlantUML notation

## Diagram Types

Automatically detect or let the user specify:
- **flowchart** - Processes, workflows, decision trees
- **mindmap** - Hierarchical ideas, brainstorming structures
- **uml_class** - Class diagrams, OOP relationships
- **uml_sequence** - Sequence diagrams, component interactions
- **entity_relationship** - Database schemas, ER diagrams

## Workflow

1. If board URL is missing, ask the user for it
2. If description is missing or unclear, ask what they want to diagram
3. Determine the appropriate diagram type from the description (or ask if ambiguous)
4. *(Optional, for precise control)* Call `diagram_get_dsl` first to fetch the DSL spec — useful when the user wants a structurally complex diagram and you'd rather author the DSL directly than rely on natural language.
5. Call `diagram_create` with the board URL, the diagram description, and optionally the diagram type if specified. Set `parent_id` to a frame ID if the diagram should sit inside a frame.
6. Report success with a link to the board

## Examples

**User input:** `create a diagram on https://miro.com/app/board/abc= for the user login authentication flow`

**Action:** Create a flowchart showing the user login authentication process.

---

**User input:** `add a diagram of our e-commerce DB schema (users, products, orders, reviews) to https://miro.com/app/board/abc=`

**Action:** Create an entity-relationship diagram for the e-commerce database.

---

**User input:** `make a diagram on https://miro.com/app/board/abc=`

**Action:** Ask the user what they want to diagram.

## Tips for Better Diagrams

When crafting the description:
- Be specific about elements and their relationships
- Mention flow direction if important (top-down, left-right)
- Include decision points and conditions
- Name the key components clearly

For complex diagrams, suggest using Mermaid notation for precise control:

```
flowchart TD
    A[Start] --> B{Valid Email?}
    B -->|Yes| C[Send Verification]
    B -->|No| D[Show Error]
    C --> E[Wait for Confirm]
    E --> F[Create Account]
```

## Positioning on the Board

Board coordinates use a Cartesian system with center at `(0, 0)`. Positive X goes right, positive Y goes down.

**Spacing recommendations** when placing multiple items:
- Diagrams: 2000–3000 units apart
- Documents: 500–1000 units apart
- Tables: 1500–2000 units apart

To place a diagram inside a frame, set `parent_id` to the frame's ID.
