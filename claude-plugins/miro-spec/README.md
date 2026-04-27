# Miro Spec Plugin

Extract and save Miro specifications to local files for AI-assisted planning and implementation.

## Overview

The miro-spec plugin downloads all specification content from Miro boards (documents, diagrams, prototypes, tables, frames, and other types) and saves them to `.miro/specs/` directory. This makes specs available for LLMs to reference during planning and implementation phases.

## Features

- Extract specs from entire boards or individual items
- Download all embedded images automatically
- Save content in organized directory structure
- Convert image URLs to local relative paths
- Generate metadata index for easy navigation
- Supports all content types including unknown/new types
- Preserves formatting for documents (Markdown) and prototypes (HTML)

## Installation

### Prerequisites

- Claude Code CLI
- Miro MCP server installed and configured

### Setup

1. Enable the miro-spec plugin in your Claude Code settings
2. Ensure Miro MCP is configured with board access

## Usage

Prompt Claude in natural language with a Miro board or item URL:

```
extract specs from https://miro.com/app/board/uXjVK123abc=/
download the design doc at https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345
pull all PRD content from https://miro.com/app/board/uXjVK123abc=/ into .miro/specs/
```

The `miro-spec-guide` skill activates automatically and extracts content from the board (or single item) into `.miro/specs/`.

### Output Structure

Extracted specs are saved to `.miro/specs/`:

```
.miro/specs/
├── documents/         # Markdown documents
│   └── [id].md
├── diagrams/          # Diagram descriptions
│   └── [id].md
├── prototypes/        # Prototype containers and screens
│   ├── [id]-container.md
│   └── [id]-screen.html
├── tables/            # Table data
│   └── [id].json
├── frames/            # Frame summaries
│   └── [id].md
├── other/             # Unknown types (slides, etc.)
│   └── [id].md
├── images/            # Downloaded images
│   └── [id].png
└── index.json         # Metadata index
```

### Metadata Index

`index.json` contains:
- Board URL and extraction timestamp
- List of all extracted items with types, titles, and paths
- Parent URLs for items that have parents
- Image inventory with local paths
- Original item URLs for reference

## How to Use Extracted Specs

Once specs are extracted, you can:

1. **Planning:** Reference spec files when creating implementation plans
2. **Context:** LLMs can read spec content directly from local files
3. **Implementation:** Use diagrams and documents to guide code generation
4. **Validation:** Compare implementation against saved specifications

Example workflow:

1. Ask Claude to extract specs from a board URL.
2. Review `.miro/specs/index.json` to see what was extracted.
3. Ask Claude to plan implementation using specs in `.miro/specs/`.
4. Claude reads relevant files during planning and coding.

## Examples

### Extract Product Requirements

Prompt: "extract specs from https://miro.com/app/board/uXjVK-product-spec=/"

Output:
```
Extracted 5 documents, 3 diagrams, 2 prototypes, 1 table
Downloaded 12 images
Saved to .miro/specs/
```

### Extract Single Design Document

Prompt: "download the design doc at https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345"

Output:
```
Extracted 1 document
Downloaded 3 images
Saved to .miro/specs/
```

## Skills

### `miro-spec-guide`
Auto-activates when the user asks to extract Miro specs to local files. Carries the full extraction workflow (parse URL → discover items via `context_explore` → per-item extract → subagent for prototype screens → `index.json` bookkeeping → verification) plus reference material:
- `references/spec-storage.md` — Detailed file format documentation

## Directory Management

### Clean Extraction

When extraction starts, if `.miro/specs/` already has content, you'll be prompted:
- **Clean and extract fresh:** Removes existing files, starts fresh
- **Add to existing:** Keeps existing files, adds new ones
- **Cancel:** Aborts operation

### Manual Cleanup

Remove all extracted specs:
```bash
rm -rf .miro/specs/
```

## Content Types Supported

| Type | Saves As | Contains |
|------|----------|----------|
| Documents | `.md` | Markdown content with formatting |
| Diagrams | `.md` | AI-generated description and analysis |
| Prototypes | `.html` | Screen HTML or navigation map |
| Tables | `.json` | Structured table data |
| Frames | `.md` | AI-generated frame summary |
| Images | `.png` | Downloaded image data |

## Tips

- Use board URLs to extract complete specifications
- Use item URLs when you only need specific documents
- Images are automatically extracted from HTML content
- Check `index.json` to see what was extracted
- Extracted specs are local - commit them or keep in .gitignore

## Troubleshooting

**"Miro MCP not available"**
- Install and configure Miro MCP server first

**"Board not found"**
- Verify you have access to the board
- Check URL is correct and complete

**"No items found"**
- Board may not contain spec-type items (documents, frames, tables)
- Try extracting from specific item URL instead

**Images not downloading**
- Some images may not be accessible via MCP
- Original URLs will be preserved if download fails

## Related Plugins

- **miro:** Core Miro integration for creating and reading board content
- **miro-tasks:** Track implementation tasks on Miro boards
- **miro-research:** Research topics and visualize findings on Miro

## Support

For issues or questions:
- Repository: https://github.com/miroapp/miro-ai
- Miro Support: support@miro.com
