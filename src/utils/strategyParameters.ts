import type { StrategyParameterInputs, StrategyParameterValue, StrategyResult } from '@/types';

/**
 * Build the `strategy_params` payload from user-edited parameter values.
 * Only parameters that exist in the given strategy are included, so stale values
 * left over from a previously selected strategy are ignored.
 * Returns undefined when there is no strategy or nothing to send.
 */
export function buildStrategyParamsPayload(
  strategy: StrategyResult | undefined,
  values: Record<string, StrategyParameterValue>,
): StrategyParameterInputs[] | undefined {
  if (!strategy) {
    return undefined;
  }
  const result: StrategyParameterInputs[] = [];
  for (const param of strategy.params) {
    const value = values[param.name];
    if (value !== undefined) {
      result.push({ name: param.name, param_type: param.param_type, space: param.space, value });
    }
  }
  return result.length > 0 ? result : undefined;
}
