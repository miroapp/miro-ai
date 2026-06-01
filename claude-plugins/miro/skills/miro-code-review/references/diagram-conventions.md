# Diagram marking convention

Detail for §5 "Marking convention". Primary signal is the **label prefix**, because per-element styling is not guaranteed by the Miro Mermaid renderer:

- `[ADDED] <name>` — element introduced in this change. In an *after* diagram only (omitted from before).
- `[REMOVED] <name>` — element deleted in this change. In a *before* diagram only (omitted from after).
- `[UPDATED] <name>` — element kept but with a meaningful change to signature, body, or relationships. Present in both diagrams; prefix appears in the *after* only.
- Unmarked elements are unchanged context.

Also emit Mermaid `classDef` directives as a best-effort visual layer — a renderer that honours them produces colour:

```mermaid
classDef added    fill:#dcfce7,stroke:#16a34a,stroke-width:2px;
classDef removed  fill:#fee2e2,stroke:#dc2626,stroke-width:2px,stroke-dasharray:5 5;
classDef updated  fill:#fef3c7,stroke:#d97706,stroke-width:2px;
class A,B added
class C removed
class D updated
```

Prefixes alone must be self-sufficient: if Miro drops the classDef block, the reviewer still sees what changed from the label text.
