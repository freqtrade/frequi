import type {
  AllStrategyParameter,
  StrategyParameterInputs,
  StrategyParameterValue,
  StrategyResult,
} from '@/types';
import { ParameterType } from '@/types';

/**
 * Default (editable) value of a strategy parameter.
 */
export function normalizeParameterValue(param: AllStrategyParameter): StrategyParameterValue {
  if (param.param_type === ParameterType.BooleanParameter) {
    // A null default (unset) is treated as false, as the switch needs a concrete value.
    return param.value ?? false;
  }
  return param.value;
}

/**
 * Check whether any of the given values differ from the strategy's defaults.
 */
export function hasModifiedStrategyParams(
  strategy: StrategyResult | undefined,
  values: Record<string, StrategyParameterValue>,
): boolean {
  if (!strategy) {
    return false;
  }
  return strategy.params.some(
    (param) =>
      values[param.name] !== undefined && values[param.name] !== normalizeParameterValue(param),
  );
}

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
