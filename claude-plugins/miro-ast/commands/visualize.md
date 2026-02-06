---
description: Parse a source file with tree-sitter and visualize its AST on a Miro board
argument-hint: "<board-url> [file-path] [--depth N] [--filter type1,type2] [--cst]"
allowed-tools: Bash(tree-sitter:*), Bash(which:*), Bash(test:*), Bash(wc:*), Bash(ls:*), Bash(find:*), Bash(brew:*), Bash(npm:*), Bash(cargo:*), Bash(cat:*), Bash(head:*), mcp__miro__*
---

# Visualize AST on Miro Board

Parse a source file using tree-sitter and create an interactive syntax tree visualization on a Miro board.

## Arguments

- `board-url` (required): Miro board URL
- `file-path` (optional): Path to source file relative to CWD. If omitted, auto-detect entry point.
- `--depth N` (optional): Maximum tree depth to visualize. Default: **5**
- `--filter type1,type2` (optional): Comma-separated node types to include (e.g., `function_definition,class_definition`)
- `--cst` (optional): Show concrete syntax tree instead of abstract syntax tree

## Workflow

### 1. Parse Arguments

Extract the board URL from arguments. It must be a valid Miro board URL (contains `miro.com/app/board/`).

If a file path is provided, resolve it relative to the user's current working directory.

If no file path is provided, auto-detect the project entry point.

### 2. Check tree-sitter Installation

```bash
which tree-sitter
```

If tree-sitter is not installed, inform the user and offer installation options:
- `brew install tree-sitter-cli` (macOS/Linux)
- `npm install -g tree-sitter-cli` (cross-platform)
- `cargo install --locked tree-sitter-cli` (Rust)

**Ask the user which method they prefer before installing. Do not install automatically.**

### 2b. Verify Language Grammar

After confirming tree-sitter is installed, verify the grammar works for the target file:

```bash
tree-sitter parse <file> 2>&1 | head -5
```

If parsing fails with a grammar-related error (e.g., "No language found", "Unknown language"):

1. Run `tree-sitter init-config` to create the config file
2. Clone the appropriate grammar repo (e.g., `tree-sitter-python`, `tree-sitter-typescript`)
3. Add the grammar's parent directory to `parser-directories` in the tree-sitter config

**Do not install grammars automatically — show the user the steps and ask before proceeding.**

### 3. Resolve Source File

**If file-path is provided:**
Resolve relative to CWD. Verify the file exists with `test -f <path>`.

**If file-path is omitted, auto-detect entry point in priority order:**

1. `src/index.ts`, `src/index.js`, `src/main.ts`, `src/main.js`
2. `index.ts`, `index.js`, `main.ts`, `main.js`
3. `src/app.ts`, `src/app.js`, `app.ts`, `app.js`
4. `main.py`, `app.py`, `src/main.py`, `src/app.py`
5. `src/*/main.py`, `src/*/__main__.py`, `*/__main__.py`
6. `main.go`, `cmd/main.go`
7. `src/main.rs`, `src/lib.rs`
8. `Main.java` (search in `src/`)
9. Check `package.json` → `main` field if it points to a source file
10. Check `pyproject.toml` → `[project.scripts]` or `[tool.poetry.scripts]` for Python entry points
11. Check `setup.py` or `setup.cfg` → `console_scripts` for Python entry points
12. Fall back: first source file (`*.ts`, `*.js`, `*.py`, `*.go`, `*.rs`, `*.java`, `*.c`, `*.cpp`) in CWD root or `src/`

Check each candidate with `test -f <path>` and use the first match.

If no suitable file is found, tell the user and ask them to specify a file path.

### 4. Analyze Source Structure

Use two complementary sources to build a structural understanding of the file.

**4a. Get node type statistics with tree-sitter:**

```bash
tree-sitter parse <absolute-file-path> | grep -o '([a-z_]*' | sed 's/(//' | sort | uniq -c | sort -rn | head -30
```

If `--cst` flag is set, add the `-c` flag to the parse command. This provides a frequency count of node types without processing the full S-expression tree.

**If parsing fails:**
- Show the stderr output to the user
- Common issue: missing language grammar. Refer the user to step 2b for grammar setup.

**4b. Read the source file directly:**

- For files under 500 lines: `cat <absolute-file-path>`
- For larger files: `head -200 <absolute-file-path>`

This is the primary source for understanding the file's structure — classes, functions, methods, imports, and exports.

**4c. Apply filters and depth:**

- `--depth N` (default: **5**): Controls how many nesting levels to include in the structural description
- `--filter type1,type2`: Only include matching structural elements (e.g., `function_definition,class_definition`)

### 5. Build Structural Description

From the source file content (step 4b) and node statistics (step 4a), compose a natural language hierarchy describing the file's structure.

**Structural hierarchy format:**

```
Module: {filename}
  Import: os, sys, pathlib
  Import: from typing import List, Optional
  Class: ConfigManager
    Method: __init__(self, path)
    Method: load(self)
    Method: save(self, data)
    Method: validate(self)
  Function: parse_args()
  Function: main()
  Constant: DEFAULT_CONFIG, VERSION
```

**Rules:**

- Target **30-60 structural nodes** — enough for a useful overview without visual noise
- Use semantic labels: `Class`, `Function`, `Method`, `Interface`, `Import`, `Export`, `Constant`, `Type`, `Enum`
- When a container (class, module) has more than 8 members, show the first 6 and add a summary: `... (N more members)`
- Apply `--depth` to control nesting (e.g., depth 3 shows Module → Class → Method but not method internals)
- Apply `--filter` to include only matching semantic types
- Include function/method signatures (name + parameters) but not body details

### 6. Create Miro Board Artifacts

**Artifact 1: Structure Diagram (mindmap)**

Use the Miro `diagram_create` tool to create the mindmap:
- Board: the board URL from arguments
- Text description: pass the hierarchical description directly as natural language — do not generate Mermaid or PlantUML syntax
- Diagram type: `mindmap`
- Position: x=0, y=0

**Artifact 2: Summary Document**

Use the Miro `doc_create` tool to create a summary document:
- Board: the board URL from arguments
- Position: x=-1500, y=0
- Content (plain text with headings — no code blocks or tables, which are not supported by Miro doc_create):

```
AST: {filename}

Language: {detected language from extension}
File: {absolute file path}
Structural elements visualized: {count of nodes in description}
Max depth: {actual max depth used}

Node Type Frequency (top 10 from tree-sitter)

{type}: {count}
{type}: {count}
...

Semantic Labels

Class — class or struct definition
Function — top-level function
Method — function inside a class
Interface — interface or protocol
Import — import or require statement
Export — exported symbol
Constant — top-level constant or enum value
Type — type alias or typedef

Options

Depth limit: {N}
Filter: {types or "none"}
Tree type: {AST or CST}
```

### 7. Report Results

Output to the user:
1. Link to the Miro board
2. Which file was parsed (and whether it was auto-detected)
3. Number of nodes visualized
4. Any truncation applied (depth reduction, collapsed nodes)
5. Suggest re-running with `--filter` for focused views if the tree was large

## Examples

```
# Auto-detect entry point
/miro-ast:visualize https://miro.com/app/board/abc123=

# Specific file
/miro-ast:visualize https://miro.com/app/board/abc123= src/utils/parser.ts

# With depth limit
/miro-ast:visualize https://miro.com/app/board/abc123= main.py --depth 5

# Filter to only show function and class definitions
/miro-ast:visualize https://miro.com/app/board/abc123= app.ts --filter function_definition,class_definition

# Concrete syntax tree
/miro-ast:visualize https://miro.com/app/board/abc123= index.js --cst
```
