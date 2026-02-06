---
name: ast-visualization
description: Knowledge about tree-sitter AST parsing and visualization strategies for source code analysis
---

# AST Visualization with Tree-sitter

## What is Tree-sitter?

Tree-sitter is an incremental parsing system that generates concrete syntax trees for source files. It supports 150+ languages and produces S-expression output representing the full parse tree.

## S-expression Format

Tree-sitter outputs ASTs as nested S-expressions with position metadata:

```
(module [0, 0] - [10, 0]
  (function_definition [0, 0] - [5, 0]
    name: (identifier [0, 4] - [0, 11])
    parameters: (parameters [0, 11] - [0, 13])
    body: (block [1, 4] - [5, 0]
      (expression_statement [1, 4] - [1, 20]
        (call [1, 4] - [1, 20]
          function: (identifier [1, 4] - [1, 9])
          arguments: (argument_list [1, 9] - [1, 20]))))))
```

> **Note:** The visualize command uses tree-sitter only for node type statistics (frequency counts), not for full S-expression parsing. The structural description is built by reading the source file directly, which is more token-efficient and produces cleaner diagrams.

Each node contains:
- **Type**: e.g., `function_definition`, `identifier`
- **Position**: `[start_line, start_col] - [end_line, end_col]`
- **Named fields**: e.g., `name:`, `body:`, `parameters:`
- **Children**: nested nodes

## Common Node Types

| Category | Node Types |
|----------|-----------|
| Declarations | `function_definition`, `class_definition`, `variable_declaration`, `method_definition` |
| Statements | `if_statement`, `for_statement`, `while_statement`, `return_statement`, `try_statement` |
| Expressions | `call_expression`, `binary_expression`, `assignment_expression`, `member_expression` |
| Structural | `module`, `program`, `block`, `body`, `statement_block` |
| Literals | `string`, `number`, `boolean`, `null`, `template_string` |
| Types | `type_annotation`, `type_identifier`, `generic_type`, `union_type` |

## Visualization Strategy

### Structural Description Strategy

The visualization uses a two-source approach:

1. **Tree-sitter** — provides node type frequency statistics via `tree-sitter parse | grep | sort | uniq -c`
2. **Source file** — read directly (`cat` or `head`) to extract the actual structural hierarchy

This avoids parsing the full S-expression output (which is token-expensive and error-prone) and instead produces a clean natural language description of the file's architecture. The description is passed directly to Miro's `diagram_create` tool as a `mindmap` — no Mermaid or PlantUML syntax is needed.

### Semantic Node Vocabulary

| Label | Maps to AST Node Types |
|-------|----------------------|
| Class | `class_definition`, `class_declaration`, `struct_item` |
| Function | `function_definition`, `function_declaration`, `arrow_function` |
| Method | `method_definition`, `function_definition` (inside class) |
| Interface | `interface_declaration`, `protocol`, `abstract_class_declaration` |
| Import | `import_statement`, `import_from_statement`, `require` |
| Export | `export_statement`, `export_default_declaration` |
| Constant | `const`, `let` (top-level), `enum_item` |
| Type | `type_alias_declaration`, `typedef`, `type_annotation` |
| Enum | `enum_declaration`, `enum_definition` |

### Depth and Size Management

- **Default depth: 5** — captures module → class → method structure without excessive detail
- **Node target: 30-60** — enough for a useful overview without visual noise
- **Node collapsing**: When a container has >6 members, show first 6 + summary `... (N more members)`
- **Type filtering**: Use `--filter` to show only specific semantic types (e.g., `function_definition,class_definition`)

### Language Support

Well-supported languages include: Python, JavaScript, TypeScript, Go, Rust, C, C++, Java, Ruby, C#, Swift, Kotlin, PHP, Bash, HTML, CSS, JSON, YAML, TOML, and many more.

Tree-sitter auto-detects language from file extension.
