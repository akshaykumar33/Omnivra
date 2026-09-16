import type { OmnivraRule, OmnivraEvent, ActionDescriptor } from '@omnivra/types';
import { logger } from '@omnivra/logger';

export class RuleEvaluator {
  private rules: Map<string, OmnivraRule> = new Map();

  registerRule(rule: OmnivraRule): void {
    this.rules.set(rule.id, rule);
    logger.info(`Registered rule: ${rule.name} (${rule.id})`);
  }

  unregisterRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  evaluate(event: OmnivraEvent): ActionDescriptor[] {
    const matchedActions: ActionDescriptor[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      if (rule.trigger.name !== event.type && rule.trigger.name !== '*') continue;

      let conditionsPass = true;
      if (rule.conditions && rule.conditions.length > 0) {
        for (const cond of rule.conditions) {
          const val = (event.context as Record<string, unknown>)?.[cond.field];
          if (cond.operator === 'equals' && val !== cond.value) {
            conditionsPass = false;
            break;
          }
        }
      }

      if (conditionsPass) {
        logger.debug(`Rule matched: ${rule.name}`);
        matchedActions.push(...rule.actions);
      }
    }

    return matchedActions;
  }
}
