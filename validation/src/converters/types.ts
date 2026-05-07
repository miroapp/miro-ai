export interface PluginManifest {
  name: string;
  version?: string;
  description?: string;
  author?: { name: string; email?: string; url?: string };
  homepage?: string;
  repository?: string | { type?: string; url?: string };
  license?: string;
  keywords?: string[];
  skills?: string;
}

export interface McpServer {
  type?: string;
  url?: string;
  httpUrl?: string;
  description?: string;
  headers?: Record<string, string>;
  oauth?: { enabled: boolean };
  disabled?: boolean;
  autoApprove?: string[];
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

export interface ClaudePlugin {
  /** Directory name (e.g. "miro") */
  dirName: string;
  /** Absolute path to plugin directory */
  absPath: string;
  manifest: PluginManifest;
  /** Top-level MCP servers from .mcp.json (key = server name) */
  mcp: Record<string, McpServer> | null;
  skills: SkillFile[];
}

export interface ConversionWarning {
  plugin: string;
  message: string;
}

export interface ConversionResult {
  plugin: string;
  target: "gemini" | "skills" | "cursor" | "codex" | "copilot-cowork";
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
