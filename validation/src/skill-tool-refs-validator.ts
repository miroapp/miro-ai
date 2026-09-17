import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";

/**
 * Tool-name families exposed by the Miro MCP server. A `<family>_<verb>` token
 * in skill prose is almost always a literal tool name rather than an ordinary
 * snake_case word.
 *
 * Mirrors the server names under `src/server_mcp/servers/` in the mcp-server
 * repo, plus prefixes only visible on the live surface (`space_`, `section_`,
 * `blog_post_`). Refresh it when the server adds a family.
 *
 * Retired families stay on the list on purpose. `diagram_`, `doc_`, `context_`,
 * and `layout_` are the ones skills used to call; keeping them is what stops a
 * future change from reintroducing `doc_create` unnoticed.
 */
const TOOL_FAMILIES = [
  "agentic_board",
  "blog_post",
  "board",
  "boards",
  "canvas",
  "claude_design",
  "code_widget",
  "comment",
  "content_item",
  "content_items",
  "context",
  "diagram",
  "doc",
  "entity_context_graph",
  "feedback",
  "frame",
  "image",
  "item",
  "items",
  "layout",
  "preview_resource",
  "prototype",
  "roadmapping",
  "role_assignments",
  "section",
  "slide_templates",
  "slides",
  "space",
  "table",
  "talktrack",
  "user",
  "widget",
  "work_items",
];

/**
 * Tokens that match the tool-name shape but are not tool references: parameter,
 * field, and attribute names that a skill legitimately states.
 *
 * Deliberately holds no tool names. A skill that needs the agent to call
 * something describes it by role ("the Miro MCP table tool", "the canvas
 * update tool") so it survives the tool being renamed or replaced — including
 * the canvas tools, which are still flag-gated and changing. Ordering does not
 * justify an exception: the tools state their own prerequisites.
 */
const ALLOWED = new Set([
  "board_id",
  "board_url",
  "frame_id",
  "item_id",
  "item_url",
  "space_id",
  "table_id",
  "user_id",
]);

const TOOL_TOKEN = new RegExp(
  `\\b(?:${TOOL_FAMILIES.join("|")})_[a-z][a-z0-9_]*\\b`,
  "g"
);

export interface SkillToolRefResult {
  file: string;
  valid: boolean;
  errors: string[];
}

export interface SkillToolRefsResults {
  hasErrors: boolean;
  results: SkillToolRefResult[];
}

/**
 * Flags hardcoded MCP tool names in skill content.
 *
 * Skills that name tools directly break silently when the tool surface moves —
 * the agent is told to call something that no longer exists. Describing the
 * tool by role instead keeps the skill working across server changes.
 */
export async function validateSkillToolRefs(
  root: string
): Promise<SkillToolRefsResults> {
  const results: SkillToolRefResult[] = [];

  const files = await fg(
    ["**/skills/*/SKILL.md", "**/skills/*/references/*.md"],
    { cwd: root, ignore: ["**/node_modules/**"], dot: true }
  );

  for (const file of files) {
    const filePath = path.join(root, file);
    const errors: string[] = [];

    try {
      const lines = (await readFile(filePath, "utf-8")).split("\n");

      lines.forEach((line, i) => {
        for (const match of line.matchAll(TOOL_TOKEN)) {
          if (ALLOWED.has(match[0])) continue;
          errors.push(
            `line ${i + 1}: hardcoded MCP tool name "${match[0]}" — describe ` +
              `the tool by role instead, or add it to ALLOWED in ` +
              `validation/src/skill-tool-refs-validator.ts if the skill must name it`
          );
        }
      });
    } catch (e) {
      errors.push((e as Error).message);
    }

    results.push({ file: filePath, valid: errors.length === 0, errors });
  }

  return { hasErrors: results.some((r) => !r.valid), results };
}
