export interface PluginManifest {
  name: string;
  version?: string;
  description?: string;
  author?: { name: string; email?: string };
  homepage?: string;
  repository?: string;
  license?: string;
  keywords?: string[];
  commands?: string[];
  skills?: string;
  hooks?: string;
}

export interface McpServer {
  type?: string;
  url?: string;
  httpUrl?: string;
  headers?: Record<string, string>;
  oauth?: { enabled: boolean };
  disabled?: boolean;
  autoApprove?: string[];
}

export interface CommandFile {
  /** Relative path within plugin dir (e.g. commands/diagram.md) */
  relPath: string;
  /** Frontmatter fields */
  description: string;
  argumentHint?: string;
  allowedTools?: string;
  /** Markdown body (after frontmatter) */
  body: string;
}

export interface SkillFile {
  /** Relative path within plugin dir (e.g. skills/miro-mcp/SKILL.md) */
  relPath: string;
  name: string;
  description: string;
  body: string;
  /** Paths to reference files relative to plugin dir */
  references: string[];
}

export interface AgentFile {
  relPath: string;
  name: string;
  description: string;
  tools?: string;
  model?: string;
  body: string;
}

export interface HooksConfig {
  hooks: Record<string, unknown[]>;
  /** Raw JSON string for re-serialization */
  raw: string;
}

export interface ScriptFile {
  relPath: string;
  content: string;
}

export interface TemplateFile {
  /** Relative path within plugin dir (e.g. templates/commands/sync-data.md.tmpl) */
  relPath: string;
  content: string;
}

export interface ClaudePlugin {
  /** Directory name (e.g. "miro", "miro-tasks") */
  dirName: string;
  /** Absolute path to plugin directory */
  absPath: string;
  manifest: PluginManifest;
  /** Top-level MCP servers from .mcp.json (key = server name) */
  mcp: Record<string, McpServer> | null;
  commands: CommandFile[];
  skills: SkillFile[];
  agents: AgentFile[];
  hooks: HooksConfig | null;
  scripts: ScriptFile[];
  templates: TemplateFile[];
}

export interface ConversionWarning {
  plugin: string;
  message: string;
}

export interface ConversionResult {
  plugin: string;
  target: "gemini" | "skills";
  success: boolean;
  filesWritten: string[];
  warnings: ConversionWarning[];
  errors: string[];
}

export interface ConversionSummary {
  results: ConversionResult[];
  totalPlugins: number;
  totalFiles: number;
  totalWarnings: number;
  totalErrors: number;
  hasErrors: boolean;
}
