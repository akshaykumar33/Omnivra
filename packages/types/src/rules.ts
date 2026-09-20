export type TriggerType =
  | "gesture"
  | "voice"
  | "gaze"
  | "hotkey"
  | "state"
  | "plugin";

export interface TriggerDescriptor {
  type: TriggerType;
  name: string;
  parameters?: Record<string, unknown>;
}

export interface ConditionPredicate {
  field: string;
  operator: "equals" | "contains" | "matches" | "greaterThan" | "lessThan";
  value: unknown;
}

export interface ActionDescriptor {
  id: string;
  type: string;
  capabilityRequired: string;
  payload?: Record<string, unknown>;
}

export interface OmnivraRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  trigger: TriggerDescriptor;
  conditions?: ConditionPredicate[];
  actions: ActionDescriptor[];
}
