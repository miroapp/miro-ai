# Spec Storage Format Reference

Detailed documentation of how Miro specs are stored in `.miro/specs/` directory.

## Directory Structure

```
.miro/specs/
├── documents/           # Miro document items
│   ├── 3458764612345.md
│   └── 3458764612346.md
├── diagrams/            # Diagram descriptions
│   ├── 3458764612347.md
│   └── 3458764612348.md
├── prototypes/          # Prototype screens and containers
│   ├── 3458764612349-screen.html
│   ├── 3458764612350-container.md
│   └── 3458764612351-screen.html
├── tables/              # Table data
│   ├── 3458764612352.json
│   └── 3458764612353.json
├── frames/              # Frame summaries
│   ├── 3458764612354.md
│   └── 3458764612355.md
├── other/               # Unknown types (slides, etc.)
│   ├── 3458764612356.md
│   └── 3458764612357.md
├── images/              # Extracted images
│   ├── 3458764612358.png
│   └── 3458764612359.png
└── index.json           # Metadata index
```

## File Naming Convention

All files are named using Miro item IDs:
- Format: `[item_id].[extension]`
- Example: `3458764612345.html`
- Ensures unique names
- Allows cross-referencing with Miro URLs

## Content Formats

### Documents (Markdown)

**Location:** `.miro/specs/documents/[id].md`

**Format:** Markdown content from Miro document

**Example:**
```markdown
# Product Requirements

## Overview

This feature enables users to...

- Requirement 1
- Requirement 2

## Technical Details

The implementation will include:
1. Authentication system
2. User profile management
3. Data persistence layer
```

**Features:**
- Preserves Markdown structure
- Maintains heading hierarchy
- Keeps lists and formatting
- Clean text format

**Reading:**
```bash
# View content
cat .miro/specs/documents/3458764612345.md

# Parse with markdown tools
# Or read directly
```

### Diagrams (Markdown)

**Location:** `.miro/specs/diagrams/[id].md`

**Format:** AI-generated description of diagram

**Example:**
```markdown
# Architecture Diagram

## Components

- Frontend (React)
  - User Interface
  - State Management
  - API Client

- Backend (Node.js)
  - REST API
  - Business Logic
  - Database Layer

## Connections

- Frontend -> Backend: HTTP/REST
- Backend -> Database: PostgreSQL
- Backend -> Cache: Redis

## Flow

1. User interacts with Frontend
2. Frontend sends API request to Backend
3. Backend processes request
4. Backend queries Database
5. Response returned to Frontend
```

**Features:**
- Structured text description
- Component breakdown
- Relationship analysis
- Flow documentation

### Prototypes

#### Prototype Screens (HTML)

**Location:** `.miro/specs/prototypes/[id]-screen.html`

**Format:** HTML markup representing UI layout

**Example:**
```html
<div class="screen">
  <header>
    <h1>Login Page</h1>
  </header>
  <form>
    <input type="text" placeholder="Email"/>
    <input type="password" placeholder="Password"/>
    <button>Sign In</button>
  </form>
  <img src="../images/3458764612356.png" alt="Login mockup"/>
</div>
```

**Features:**
- Screen layouts in HTML
- UI component structure
- Embedded design images

#### Prototype Containers (Markdown)

**Location:** `.miro/specs/prototypes/[id]-container.md`

**Format:** AI-generated navigation map

**Example:**
```markdown
# User Authentication Flow

## Screens

1. **Login Screen** (3458764612349-screen)
   - Login button → Home Screen
   - Sign up link → Registration Screen

2. **Home Screen** (3458764612350-screen)
   - Profile button → Profile Screen
   - Logout button → Login Screen

3. **Profile Screen** (3458764612351-screen)
   - Back button → Home Screen
   - Edit button → Edit Profile Screen
```

**Features:**
- Navigation flows and relationships
- Screen inventory
- Interaction documentation

### Tables (JSON)

**Location:** `.miro/specs/tables/[id].json`

**Format:** Structured JSON with columns and rows

**Example:**
```json
{
  "title": "Feature Backlog",
  "columns": [
    {
      "title": "Feature",
      "type": "text"
    },
    {
      "title": "Status",
      "type": "select",
      "options": ["To Do", "In Progress", "Done"]
    },
    {
      "title": "Priority",
      "type": "select",
      "options": ["Low", "Medium", "High"]
    },
    {
      "title": "Owner",
      "type": "text"
    }
  ],
  "rows": [
    {
      "Feature": "User authentication",
      "Status": "In Progress",
      "Priority": "High",
      "Owner": "Alice"
    },
    {
      "Feature": "Profile page",
      "Status": "To Do",
      "Priority": "Medium",
      "Owner": "Bob"
    }
  ]
}
```

**Features:**
- Column definitions with types
- All row data
- Select column options
- Structured for parsing

**Reading:**
```bash
# Parse with jq
cat .miro/specs/tables/3458764612351.json | jq '.rows[]'

# Get specific column
cat .miro/specs/tables/3458764612351.json | jq '.rows[] | .Feature'
```

### Frames (Markdown)

**Location:** `.miro/specs/frames/[id].md`

**Format:** AI-generated summary of frame contents

**Example:**
```markdown
# Authentication Flow Frame

## Overview

This frame contains the complete authentication flow specification including login, registration, and password reset processes.

## Contents

### Documents
- Login Requirements (3458764612345)
- Security Specifications (3458764612346)

### Diagrams
- Authentication Flow Diagram (3458764612347)
- Database Schema (3458764612348)

### Prototypes
- Login Screen (3458764612349)
- Registration Screen (3458764612350)

## Key Information

- OAuth 2.0 integration required
- JWT tokens for session management
- Multi-factor authentication optional
```

**Features:**
- High-level frame summary
- Contents inventory
- Key information extraction
- Organization context

### Images (PNG)

**Location:** `.miro/specs/images/[id].png`

**Format:** Binary PNG image data

**Features:**
- Extracted from HTML content
- Named by Miro item ID
- Referenced by relative paths
- Preserved original quality

**Usage:**
- Automatically embedded in HTML via relative paths
- Can be viewed directly
- Included in version control (if desired)

## Metadata Index (index.json)

**Location:** `.miro/specs/index.json`

**Format:** Complete extraction metadata

**Schema:**
```json
{
  "board_url": "https://miro.com/app/board/uXjVK123abc=/",
  "extracted_at": "2025-02-05T12:34:56.789Z",
  "items": [
    {
      "id": "3458764612345",
      "type": "document",
      "title": "Product Requirements",
      "path": "documents/3458764612345.md",
      "url": "https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345"
    },
    {
      "id": "3458764612349",
      "type": "prototype",
      "title": "Login Screen",
      "path": "prototypes/3458764612349-screen.html",
      "url": "https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612349",
      "parentUrl": "https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612350"
    },
    {
      "id": "3458764612350",
      "type": "prototype",
      "title": "User Authentication Flow",
      "path": "prototypes/3458764612350-container.md",
      "url": "https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612350"
    },
    {
      "id": "3458764612347",
      "type": "diagram",
      "title": null,
      "path": "diagrams/3458764612347.md",
      "url": "https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612347"
    }
  ],
  "images": [
    {
      "id": "3458764612355",
      "path": "images/3458764612355.png",
      "referenced_by": [
        "prototypes/3458764612349-screen.html"
      ]
    }
  ],
  "summary": {
    "total_items": 8,
    "by_type": {
      "document": 2,
      "diagram": 2,
      "prototype": 2,
      "table": 1,
      "frame": 1
    },
    "total_images": 3
  }
}
```

**Fields:**

- **board_url:** Original board URL used for extraction
- **extracted_at:** ISO 8601 timestamp
- **items:** Array of extracted items
  - **id:** Miro item ID
  - **type:** Content type (document/diagram/prototype/table/frame)
  - **title:** Item title if available (may be null)
  - **path:** Relative path to file
  - **url:** Original Miro URL with moveToWidget parameter
  - **parentUrl:** (Optional) Parent container URL for prototype screens
- **images:** Array of extracted images
  - **id:** Image item ID
  - **path:** Relative path to image file
  - **referenced_by:** Prototype screen files that reference this image
- **summary:** Quick stats
  - **total_items:** Total items extracted
  - **by_type:** Count by content type
  - **total_images:** Total images downloaded

**Usage:**
```bash
# List all documents
cat .miro/specs/index.json | jq '.items[] | select(.type=="document")'

# Get item URL by ID
cat .miro/specs/index.json | jq '.items[] | select(.id=="3458764612345") | .url'

# Count items by type
cat .miro/specs/index.json | jq '.summary.by_type'
```

## Image Path Conventions

### Original Miro URLs

```
https://miro.com/api/v1/boards/uXjVK123abc=/resources/3458764612355
```

### Converted Relative Paths

**From documents directory:**
```html
<img src="../images/3458764612355.png"/>
```

**From prototypes directory:**
```html
<img src="../images/3458764612355.png"/>
```

### Path Resolution

All HTML files are in subdirectories one level deep:
- `.miro/specs/documents/` → `../images/`
- `.miro/specs/prototypes/` → `../images/`

Images directory is at root level:
- `.miro/specs/images/`

## File Size Considerations

### Typical Sizes

- **Documents:** 2-20 KB Markdown
- **Diagrams:** 1-10 KB Markdown
- **Prototypes:** 10-100 KB HTML (screens), 2-10 KB Markdown (containers)
- **Tables:** 1-20 KB JSON
- **Frames:** 1-5 KB Markdown
- **Images:** 100 KB - 2 MB PNG

### Large Boards

For boards with 50+ items:
- Total directory size: 10-50 MB (due to images)
- Consider using `.gitignore` if not committing
- Extract specific frames instead of entire board

## Version Control

### Commit to Git

**Advantages:**
- Specs versioned with code
- Team has access to specifications
- History of spec changes

**Disadvantages:**
- Increases repository size
- Images add significant bulk
- Frequent updates create large diffs

### Add to .gitignore

**Advantages:**
- Smaller repository size
- Faster clones and pulls
- No spec update commits

**Disadvantages:**
- Team must extract individually
- No spec history in git
- Specs may drift between team members

**Recommendation:**
```gitignore
# Option 1: Ignore everything
.miro/

# Option 2: Commit metadata only
.miro/specs/images/
.miro/specs/documents/
.miro/specs/prototypes/
```

## Programmatic Access

### Reading in Scripts

**Shell:**
```bash
#!/bin/bash
# List all documents
for doc in .miro/specs/documents/*.html; do
  echo "Processing $doc"
  # Extract content or process HTML
done
```

**Python:**
```python
import json
from pathlib import Path

# Load index
with open('.miro/specs/index.json') as f:
    index = json.load(f)

# Process each document
for item in index['items']:
    if item['type'] == 'document':
        path = Path('.miro/specs') / item['path']
        with open(path) as f:
            content = f.read()
            # Process HTML content
```

**Node.js:**
```javascript
const fs = require('fs');
const path = require('path');

// Load index
const index = JSON.parse(
  fs.readFileSync('.miro/specs/index.json', 'utf8')
);

// Process tables
index.items
  .filter(item => item.type === 'table')
  .forEach(item => {
    const data = JSON.parse(
      fs.readFileSync(path.join('.miro/specs', item.path), 'utf8')
    );
    // Process table data
  });
```

## Best Practices

### File Organization

- Keep original structure (don't reorganize)
- Use index.json as source of truth
- Don't manually edit extracted files
- Re-extract if specs change

### Naming

- Never rename files (breaks references)
- Use IDs from index.json for lookups
- Reference files by relative paths

### Updates

- Use "Clean and extract fresh" for major changes
- Use "Add to existing" for single item updates
- Check extraction timestamp in index.json
- Compare with board to verify currency

### Performance

- Index once at start of session
- Cache file paths in memory
- Use streaming for large files
- Parse JSON tables incrementally
