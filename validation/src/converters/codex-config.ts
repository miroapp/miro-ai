export const SHARED_GENERATED_PLUGIN_ORDER = [
  "miro",
  "miro-tasks",
  "miro-review",
  "miro-spec",
] as const;

export type SharedGeneratedPluginName =
  (typeof SHARED_GENERATED_PLUGIN_ORDER)[number];

export const SHARED_GENERATED_PLUGIN_SET = new Set<string>(
  SHARED_GENERATED_PLUGIN_ORDER
);

export const CODEX_PLUGIN_ORDER = ["miro"] as const;

export type CodexGeneratedPluginName = (typeof CODEX_PLUGIN_ORDER)[number];

export const CODEX_PLUGIN_SET = new Set<string>(CODEX_PLUGIN_ORDER);

export function isSharedGeneratedPlugin(name: string): boolean {
  return SHARED_GENERATED_PLUGIN_SET.has(name);
}

export function isCodexGeneratedPlugin(name: string): boolean {
  return CODEX_PLUGIN_SET.has(name);
}

export const CODEX_PLUGIN_CATEGORIES: Record<CodexGeneratedPluginName, string> =
  {
    miro: "Productivity",
  };

export const CODEX_PLUGIN_CAPABILITIES: Record<
  CodexGeneratedPluginName,
  string[]
> = {
  miro: ["Interactive", "Read", "Write"],
};

export const CODEX_PLUGIN_DEFAULT_PROMPTS: Record<
  CodexGeneratedPluginName,
  string[]
> = {
  miro: [
    "Explore a Miro board and summarize it",
    "Create a diagram or doc on a Miro board",
    "Create a task or decision table on a Miro board",
  ],
};

/**
 * Optional per-skill default-prompt overrides for Codex agent YAML.
 * Empty by default — codex-writer falls back to a generic prompt derived
 * from the skill name when no override is set.
 */
export const CODEX_SKILL_AGENT_PROMPTS: Record<string, string> = {};
