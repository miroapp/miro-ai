# Design-to-Code with Miro

Miro bridges the gap between visual design and code implementation through Miro Specs and MCP integration.

## Miro Specs

Miro Specs converts team context into technical specifications that AI coding tools can consume.

### What Miro Specs Captures

| Content Type | What It Extracts |
|--------------|------------------|
| **PRDs** | Requirements, acceptance criteria, user stories |
| **Wireframes** | UI structure, component hierarchy, interactions |
| **Prototypes** | Screen flows, states, transitions |
| **Technical Diagrams** | Architecture, data models, API contracts |
| **Product Decisions** | Context, rationale, constraints |

### Spec Generation Process

1. **Select Content** - Choose frames, wireframes, or entire boards
2. **Generate Spec** - AI analyzes and structures the content
3. **Review & Refine** - Edit the generated specification
4. **Export** - Send to coding tools or download

### Output Format

Miro Specs generates structured documents with:
- Component specifications
- Functional requirements
- Design constraints
- Implementation notes
- Acceptance criteria

## Integration with AI Coding Tools

Miro Specs integrates directly with popular AI coding assistants:

| Tool | Integration Method | Capabilities |
|------|-------------------|--------------|
| **GitHub Copilot** | Extension | Send specs as context |
| **Cursor** | Plugin | Import as project context |
| **Claude Code** | MCP | Direct board reading |
| **Windsurf** | Plugin | Workspace integration |
| **Lovable** | API | Design-to-app pipeline |

### Workflow Examples

**Design Handoff (Wireframe to Code):**
```
1. Designer creates wireframes in Miro
2. PM adds requirements to the frame
3. Generate Miro Spec from frame
4. Developer imports spec into Cursor
5. AI generates component scaffolding
6. Developer refines and implements
```

**Architecture Documentation:**
```
1. Architect draws system diagram in Miro
2. Add technical notes and constraints
3. Generate technical spec
4. Send to Claude Code via MCP
5. AI generates infrastructure code
```

## MCP Integration

The Model Context Protocol (MCP) enables external AI agents to interact with Miro boards directly.

### Reading Board Context

AI coding tools can:
- Extract requirements from specific frames
- Read wireframe structure and components
- Access technical diagrams and annotations
- Pull design decisions and rationale

### Key Prompts

| Prompt | Purpose |
|--------|---------|
| `code_create_from_board` | Analyze wireframes/PRDs and generate code |
| `code_explain_on_board` | Visualize code logic by creating diagrams |

### MCP Context Tools

Use these tools to read board content via MCP:

| Tool | Use Case |
|------|----------|
| `context_explore` | Discover board contents (frames, documents, prototypes, tables, diagrams) |
| `context_get` | Get detailed content from specific items |

### Example: Claude Code Reading Miro

```
User: "Generate the login component from the wireframe"

Claude Code:
1. Uses context_explore to discover board contents
2. Identifies the login wireframe frame
3. Uses context_get with the frame URL to extract details
4. Generates React component matching the design
```

## Best Practices

### For Design Teams
- Use consistent frame naming conventions
- Add requirement notes near wireframes
- Include state diagrams for complex interactions
- Document design decisions in text elements

### For Development Teams
- Use context_explore first to understand board scope
- Focus on specific frames rather than entire boards
- Use context_get with specific item URLs for detailed content

### For Product Teams
- Keep PRDs close to related wireframes
- Link acceptance criteria to UI elements
- Document edge cases and error states
- Maintain living documentation as designs evolve
