# Miro Board Content Types

Miro boards contain various content types, each designed for specific purposes in visual collaboration.

## Core Content Types

| Type | Description | Limits | Business Value |
|------|-------------|--------|----------------|
| **Sticky Notes** | Quick brainstorming, 16 colors | 3000 chars | Capture and cluster ideas rapidly |
| **Cards** | Structured work items with assignees, due dates, custom fields | Unlimited fields | Task tracking, kanban workflows |
| **Frames** | Containers to organize sections of a board | Unlimited nesting | Navigation, presentation mode |
| **Shapes** | Flowchart symbols, UML, BPMN, AWS/Azure/Cisco icons | 1000+ shapes | Technical and business diagrams |
| **Connectors** | Lines and arrows connecting elements | Multiple styles | Show relationships and flows |
| **Text** | Free-form text anywhere on canvas | Rich formatting | Labels, annotations, notes |

## Structured Content

| Type | Description | Capabilities | Business Value |
|------|-------------|--------------|----------------|
| **Tables/Grids** | Visual tables with auto-resize cells | Select columns, filtering | Structured data, comparison matrices |
| **Documents** | Rich text docs (Google Docs-style) within canvas | Markdown-like formatting | Long-form content alongside visuals |
| **Mind Maps** | Hierarchical nodes with auto-layout | Collapsible branches | Brainstorming, planning hierarchies |

## Design Content

| Type | Description | Capabilities | Business Value |
|------|-------------|--------------|----------------|
| **Wireframes** | 60+ pre-built UI elements for mockups | Drag-and-drop components | Rapid prototyping without design tools |
| **Prototypes** | Interactive clickable prototypes with hotspots | Screen flows, transitions | User testing, stakeholder demos |
| **Mockups** | Higher-fidelity design representations | Figma import support | Design review, handoff |

## Media Content

| Type | Description | Capabilities | Business Value |
|------|-------------|--------------|----------------|
| **Images** | PNG, JPG, SVG, GIF support | Crop, resize, annotate | Reference materials, screenshots |
| **PDFs** | Multi-page PDF viewer | Navigate pages, annotate | Document review on canvas |
| **Videos** | Embedded video content | YouTube, Vimeo, uploads | Tutorials, recordings |
| **Embeds** | Live content from external sources | YouTube, Figma, Google Docs, Loom | Centralized context |

## Data Content

| Type | Description | Capabilities | Business Value |
|------|-------------|--------------|----------------|
| **App Cards** | Synced items from integrations | Jira, Asana, Monday.com | Two-way sync with project tools |
| **Data Tables** | Spreadsheet-like data grids | Import CSV, filter, sort | Data visualization |
| **Charts** | Bar, line, pie charts | Data binding | Visual data representation |

## Content Organization Patterns

### Frame-Based Organization
```
Board
├── Frame: "Sprint 12 Planning"
│   ├── Sticky Notes (brainstorm)
│   ├── Cards (tasks)
│   └── Table (assignments)
├── Frame: "Architecture"
│   ├── Shapes (system diagram)
│   └── Document (specs)
└── Frame: "References"
    ├── Images (mockups)
    └── Embeds (Figma links)
```

### Common Patterns

1. **Kanban Board**: Frames as columns, Cards as tasks
2. **User Story Map**: Sticky notes in swim lanes
3. **Architecture Diagram**: Shapes with connectors
4. **Workshop Board**: Frames for activities, Stickies for input
5. **Design Specs**: Wireframes + Documents in frames
