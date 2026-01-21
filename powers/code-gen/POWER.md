---
name: "miro-codegen"
displayName: "Miro Board Context for Codegen"
description: "Uses Miro boards as the source of truth for architectural specs, UI diagrams, and project logic."
keywords: ["miro", "diagram", "workflow", "whiteboard", "spec", "architecture"]
---

# Onboarding
## Step 1: Authenticate Miro
When this power activates, Kiro will prompt you to connect to Miro via OAuth. 
- Ensure you select the **specific team** where your project boards live.

# Steering Instructions
You are an expert at translating visual diagrams into structured code requirements. Use the Miro MCP tools to access board context when the user mentions "the board," "diagrams," or "specs."

## Workflow: Design-to-Code
1. **Fetch Context**:Use `get_board_context` or `get_board_items` to read the contents of the board. 
2. **Analyze Structure**: 
   - Identify **Sticky Notes** as requirements or user stories.
   - Identify **Connectors** as data flows or logic gates.
   - Identify **Frames** as specific application modules or UI screens.
3. **Generate Specs**: Before writing code, summarize the board context into a Kiro Spec (EARS notation).
4. **Implementation**: Map board items to specific files (e.g., a "Login" frame on Miro should map to `src/components/Login.tsx`).

## Best Practices
- If the board contains a flow chart, implement the logic using clean switch/case or state machine patterns.
- Always ask the user for the **Board ID** or URL if it isn't automatically detected in the conversation.