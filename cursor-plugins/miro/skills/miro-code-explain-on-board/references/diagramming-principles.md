# Diagramming principles (apply throughout)

These rules govern every diagram produced by `miro-code-explain-on-board`. They are notation-/format-independent — they constrain *what* you draw and *how you label it*, then the Mermaid compilation step renders them.

## Core principles (R1–R9)

### R1 — Separate views (do NOT mix abstraction levels)
Keep these concerns separate; use multiple diagrams if needed:
- System context (external world)
- Runtime architecture (deployables / services / datastores / integrations)
- Module decomposition (packages / modules / bounded contexts)
- Static structure (types / data models)
- Runtime behavior (interactions over time)
- Algorithms (local control flow)
- UX / user flow (if relevant)

### R2 — One diagram = one question + one zoom level
Each diagram answers ONE clear question at ONE abstraction level. If it gets dense or mixes concerns, split.

### R3 — Notation must match semantics (no "by vibe" naming)
Choose ONE of:
- **UML CLASS** — only for real code types (classes/interfaces) with members; evidence-based relations only.
- **UML SEQUENCE** — only for one concrete scenario with time-ordered messages between evidenced actors.
- **ERD** — only for persistent entities (tables/models) with evidence-based relationships.
- **FLOWCHART** — universal fallback for architecture / modules / processes when UML/ERD semantics don't fit.

Misuse to avoid:
- Do NOT use UML CLASS for packages/services/deployables.
- Do NOT use UML SEQUENCE for static structure / import graphs.
- Do NOT use ERD for in-memory / request DTOs.

### R4 — Avoid inventories
No "lists of key files/types" unless connected by typed relationships AND answering a question. Every diagram should have typed edges (reads/writes/calls/publishes/etc.) where applicable; for module dependency/import graphs, UNLABELED edges + a one-line legend is acceptable (see R9).

### R5 — Avoid duplication
Each diagram must add unique value (different question or zoom). If two diagrams overlap heavily, keep one.

### R6 — Truthfulness over completeness
If something can't be grounded from available context, mark it `UNKNOWN/VERIFY` (in notes); don't fabricate. Avoid precise quantitative claims ("100+ models", "150 integrations") unless you can cite an anchor (file/module/symbol) or explicitly mark it `UNKNOWN/VERIFY`.

### R7 — Audience-fit granularity
Prefer high-signal elements. Avoid exhaustive member listings by default. Aim for "5-second scan" comprehension.

### R8 — Edge labeling policy (STRICT)
Edge labels MUST NOT be generic. BANNED as default labels: "uses", "contains", "relates", "has", "supports", "manages", "integrates". Prefer typed verbs (calls/reads/writes/publishes/subscribes/etc.). If you cannot be specific, label the edge "UNKNOWN" and add an UNKNOWN/VERIFY note.

### R9 — Dependency / import graph convention (module structure diagrams)
If a diagram's purpose is "module/package dependency" or "import graph" (compile-time structure):
- Prefer UNLABELED edges plus a one-line legend in notes, e.g. "Legend: `-->` means compile-time dependency (imports / TS references)".
- Do NOT repeat the word "imports" on every edge unless adding meaningful object-level detail ("imports types", "imports UI components", "imports Prisma client").
- "contains" is NOT a dependency edge. Represent containment/ownership with clusters (Mermaid `subgraph`) or a note, not an edge.
- Do NOT mix runtime calls into an import graph. If runtime communication matters, create a separate "Runtime Calls" diagram and label edges with HTTP/gRPC/publishes/reads/writes.

## Practical heuristics (H1–H4)

### H1 — Granularity thresholds (fight over-detail / inventories)
- "5-second scan" target: each diagram understandable in 5–10 seconds.
- Element budget (default): ~10–15 nodes/entities/classes/actors per diagram. >15 → SPLIT ("Overview" + "Deep dive"). >20 → MUST split.
- Diagram count budget (default): ~4–6 diagrams total. If proposing >6, justify each additional diagram answers a distinct question (R5), else merge/split differently.
- UML SEQUENCE budgets: ~5–8 lifelines (>8 → split by scenario/subsystem); ~12–20 messages is fine if mostly linear (branch-heavy or >20 → split into Overview + Deep dive).
- UML CLASS member budget: ~3–5 high-signal attributes and ~3–5 high-signal methods per class; prefer public/exported API and domain-significant members. Deeper detail → separate "Class Deep Dive".
- Module/package diagrams: avoid flat lists of folders/files; group by bounded context/layer and show typed edges.
- ERD field budget (OVERVIEW): PK/FK/UQ + ~2–4 distinguishing fields only; add note "Non-key attributes omitted for readability". If the user asks for full schema/all columns, create a separate "ERD Deep Dive".

### H2 — Anti-patterns (mixing abstraction levels)
Do NOT mix these in one diagram; split:
- User journey / product flow + internal method-level calls.
- Runtime deployables/services/datastores + class internals.
- Module/package decomposition + function/algorithm control flow.
- Static structure (types) + runtime temporal behavior (sequence).

### H3 — Edge label palette (avoid vague edges)
- STRICT ban: never use "uses", "contains", "relates", "has", "supports", "manages", "integrates" as connector text.
- Avoid "depends on" unless qualified ("imports types", "build-time depends on"). For import graphs, prefer UNLABELED edges + legend (R9).
- Prefer typed verbs (pick the most precise you can justify):
  - compile-time: unlabeled (preferred for import graphs, with legend), "imports types", "imports runtime module", "build-time depends on"
  - calls: "calls", "invokes"
  - API/integration: "HTTP", "REST", "gRPC", "API call"
  - async: "publishes", "subscribes", "enqueues", "dequeues"
  - data: "reads", "writes", "queries", "persists"
  - config/lifecycle: "configures", "initializes", "mounts"
- If the relationship type cannot be grounded, label it "UNKNOWN" (+ short UNKNOWN/VERIFY note) rather than a vague verb.

### H4 — Lightweight traceability (do NOT turn into repo validation)
- Optional: add 1–3 code anchors per diagram (file/module/function names) to justify key nodes/edges.
- Do NOT check whether files exist; anchors are for human navigation only.
- If unsure, use UNKNOWN/VERIFY notes instead of guessing.

## Mermaid compilation guardrails

The original workflow targeted a strict DSL; with Mermaid the same intent maps as follows:

- **Flowchart shape hygiene (architecture/system/module fallback) — MUST.** Use only plain rectangle nodes `id[Label]`. Do NOT decorate nodes with special shapes (`{ }` decision, `( )` stadium/terminator, `[[ ]]` subroutine, `[( )]` cylinder/database, `> ]` flag, etc.) even when they seem semantically fitting — it breaks layout consistency and is invalid output. Special shapes are allowed ONLY for true algorithm/control-flow diagrams (the R1 "Algorithms" view).
- **Final shape audit.** After compiling each architecture/system flowchart, re-scan the Mermaid; replace any non-rectangle shape syntax with `id[Label]`, labels unchanged.
- **Containment** → Mermaid `subgraph` clusters or a note, never a "contains" edge.
- **Import graphs** → unlabeled `-->` edges + a legend note; object-level labels only where they add meaning.
- **Color** → follow the conventions returned by `diagram_get_mermaid_instructions` for the chosen notation; use color to support the 5-second scan, not decoration.
