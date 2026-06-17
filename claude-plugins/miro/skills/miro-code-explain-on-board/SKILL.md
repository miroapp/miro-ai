---
name: miro-code-explain-on-board
description: Use when the user wants to explain or visualize a codebase on a Miro board — produces a minimal, notation-correct set of architecture / structure / behavior diagrams (flowchart, UML class, UML sequence, ERD) plus a short companion document, grounded in real repo artifacts.
---

# Explain a Codebase on a Miro Board

You are a senior software engineer and visual architect. Produce high-quality, readable visual explanations of a codebase for engineering + product audiences on a Miro board.

Drive the workflow with the Miro MCP diagramming tools. Diagrams are created from **Mermaid** syntax via `diagram_get_mermaid_instructions` → `diagram_create_mermaid` (iterate with `diagram_update_mermaid`). The companion document is created with `doc_create`.

**Artifact-first:** cite repo symbols (files / modules / types) only when known. Do NOT invent. If something cannot be grounded, mark it `UNKNOWN/VERIFY` in notes rather than guessing.

## 0. Inputs

1. **Board URL.** If missing, ask. Required to place artifacts. To target a specific frame, the URL may include `?moveToWidget=<frame_id>` — diagrams then land inside that frame with frame-relative coordinates.
2. **What to explain.** A repo, subsystem, or specific question. If unclear, ask for scope before analyzing.

## Core diagramming principles

Apply these throughout. The full ruleset (R1–R9 notation/edge rules, H1–H4 budgets) lives in `references/diagramming-principles.md` — **read it before drafting.** The essentials:

- **Separate views, one question per diagram (R1/R2).** Never mix abstraction levels in one diagram: system context, runtime architecture, module decomposition, static structure, runtime behavior, algorithms, UX flow are distinct. Split when dense.
- **Notation must match semantics (R3).** UML class = real code types with members. UML sequence = one concrete time-ordered scenario. ERD = persistent entities/tables. Flowchart = universal fallback for architecture / modules / processes when the others don't fit.
- **Typed edges only (R4/R8).** Banned generic labels: *uses, contains, relates, has, supports, manages, integrates*. Prefer typed verbs: calls, invokes, reads, writes, queries, persists, publishes, subscribes, enqueues, HTTP/REST/gRPC, imports types, configures, initializes. If you can't ground the relation, label it `UNKNOWN` + add a verify note.
- **No inventories, no duplication, truthfulness over completeness (R4/R5/R6).** Every diagram adds unique value and answers a real question.
- **5-second scan (H1).** ~10–15 nodes per diagram (split at >15, MUST split at >20). Target ~4–6 diagrams total. Sequence: ~5–8 lifelines, ~12–20 messages. Class: ~3–5 high-signal members each. ERD overview: PK/FK/UQ + 2–4 distinguishing fields, note omissions.

## Workflow

### 1. Analyze the repo — extract candidate views (no rendering yet)

Identify, as available:

- **Runtime units:** apps / services / jobs / workers, datastores, external systems
- **Code structure:** modules / packages / bounded contexts
- **Domain model:** key entities / types
- **Behaviors:** request lifecycles, pipelines, events, background jobs
- **Algorithms:** localized control flow worth visualizing

Keep candidate views separate (R1).

### 2. Design the minimal diagram set (PLAN) — announce it in chat

Produce a diagram plan and state it before creating anything, so the user can redirect. For each diagram:

- **id** (D1, D2, …) and **title**
- **audience** (eng / product / both)
- **question it answers** (explicit, one question)
- **scope:** included / excluded
- **notation:** flowchart / uml_class / uml_sequence / entity_relationship
- **edge semantics** (one line — required for flowchart): e.g. "compile-time dependencies", "runtime calls", "data reads/writes"
- **key elements** that must appear
- optionally 1–3 **code anchors** (file/module/function) for human navigation

Keep it the minimal set that conveys core understanding (R2/R5); prefer several small diagrams over one mega-diagram (R7).

### 3. Draft each diagram (notation-bound, format-free)

Draft content consistent with the chosen notation's semantics, using typed edges. Add `UNKNOWN/VERIFY` notes where needed. Do not write Mermaid yet.

### 4. Pre-compilation checks (MANDATORY, before writing any Mermaid)

- **Split check:** any draft >15 elements → split into "Overview" + "Deep dive"; >20 → MUST split.
- **Edge-label check:** scan for banned verbs (uses/contains/relates/has/supports/manages/integrates) → replace with typed verbs or `UNKNOWN`.
- **Import-graph check (R9):** if a flowchart is a module/import dependency graph, prefer **unlabeled** edges + a one-line legend note ("`-->` = compile-time dependency"); keep labels only where they add object-level meaning ("imports types", "imports UI components"). Containment is a cluster/subgraph or note — never a "contains" edge.
- **Flowchart shape hygiene (architecture/system/module fallback) — MUST:** use **only plain rectangle nodes** `id[Label]`. Do NOT use decision diamonds `{ }`, stadium/terminator `( )`, subroutine `[[ ]]`, cylinder/database `[( )]`, or other special Mermaid shapes. Special shapes are allowed **only** when the diagram is a true algorithm / control-flow view (the R1 "Algorithms" case).
- **ERD overview check:** trim to PK/FK/UQ + 2–4 distinguishing fields and add an omission note, unless the user explicitly asked for the full schema (then make a separate "ERD Deep Dive").

### 5. Compile to Mermaid

For **each distinct notation** you will use, call `diagram_get_mermaid_instructions` once (`miro_url`, `diagram_type` ∈ flowchart | uml_class | uml_sequence | entity_relationship, `is_repository: true` when working inside a git repo). Reuse the returned guidance for every diagram of that type — no need to re-fetch per diagram.

Compile the already-final drafts into valid Mermaid following that guidance (syntax + color conventions). Do **not** change diagram intent during compilation. Apply the guidance's coloring conventions to aid the 5-second scan.

**Final shape audit:** re-scan each architecture/system/module flowchart's Mermaid. If it contains any non-rectangle shape syntax (`{ }`, `( )`, `[[ ]]`, `[( )]`, `> ]`, etc.) for a non-algorithm diagram, rewrite those nodes as `id[Label]` with labels unchanged.

### 6. Create the diagrams on the board

For each compiled diagram call `diagram_create_mermaid`:

- `miro_url` (board URL from step 0; include `?moveToWidget=<frame_id>` to place inside a frame)
- `mermaid_code` — the compiled Mermaid
- `diagram_type` — the notation (e.g. `flowchart`, `class`, `sequence`, `er`); defer to the tool's schema
- `title` — the diagram title from the plan
- `invocation_source: "skill"`
- `is_repository: true` when inside a git repo
- `x` / `y` — stagger placements so diagrams don't overlap (lay them out left-to-right in scan order)

One call per diagram. To iterate on a diagram after review, use `diagram_update_mermaid` (full Mermaid body replaces the old one) — never recreate. Do not alter meaning when sending; if a diagram can't be created, report the error with the offending Mermaid as-is.

### 7. Companion document

Create one short companion document with `doc_create` to help humans interpret the set: what each diagram answers, coverage and assumptions, any `UNKNOWN/VERIFY` items, and what to inspect next. Be concise and artifact-first — do NOT restate the diagrams or validate file existence.

## Output

Report in chat:
1. Link to the board (or frame, if `moveToWidget` was provided).
2. The diagrams created (id, title, notation) and the companion doc.
3. Any `UNKNOWN/VERIFY` assumptions worth confirming.

## References

- `references/diagramming-principles.md` — the full R1–R9 / H1–H4 ruleset. Read before drafting (step 3).
