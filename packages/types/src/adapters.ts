import type { ActionDescriptor } from "./rules.js";

export interface ActionResult {
  success: boolean;
  actionId: string;
  output?: unknown;
  error?: string;
}

export interface HostAdapter {
  id: string;
  name: string;
  capabilities: string[];
  initialize(): Promise<void>;
  supports(actionType: string): boolean;
  execute(action: ActionDescriptor): Promise<ActionResult>;
  shutdown(): Promise<void>;
}
