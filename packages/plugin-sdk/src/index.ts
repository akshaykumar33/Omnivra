import type { OmnivraRule } from "@omnivra/types";

export interface PluginManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface PluginContext {
  registerRule(rule: OmnivraRule): void;
  logger: {
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string): void;
  };
}

export interface PluginDefinition {
  manifest: PluginManifest;
  setup(ctx: PluginContext): Promise<void> | void;
}

export function definePlugin(def: PluginDefinition): PluginDefinition {
  return def;
}
