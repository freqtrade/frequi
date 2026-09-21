export interface StrategyListResult {
  strategies: string[];
}

export enum ParameterType {
  IntParameter = 'IntParameter',
  RealParameter = 'RealParameter',
  DecimalParameter = 'DecimalParameter',
  BooleanParameter = 'BooleanParameter',
  CategoricalParameter = 'CategoricalParameter',
}

export interface BaseParameter {
  param_type: ParameterType;
  name: string;
  space: string;
  load: boolean;
  optimize: boolean;
}

export interface IntParameter extends BaseParameter {
  param_type: ParameterType.IntParameter;
  value: number;
  low: number;
  high: number;
}
export interface RealParameter extends BaseParameter {
  param_type: ParameterType.RealParameter;
  value: number;
  low: number;
  high: number;
}

export interface DecimalParameter extends BaseParameter {
  param_type: ParameterType.DecimalParameter;
  decimals: number;
  value: number;
  low: number;
  high: number;
}

/** Categorical options - strings, numbers and booleans are common. */
export type StrategyCategoricalValue = string | number | boolean;

export interface CategoricalParameter extends BaseParameter {
  param_type: ParameterType.CategoricalParameter;
  value: StrategyCategoricalValue;
  opt_range: StrategyCategoricalValue[];
}

export interface BooleanParameter extends BaseParameter {
  param_type: ParameterType.BooleanParameter;
  value: boolean | null;
  opt_range: boolean[];
}

export type AllStrategyParameter =
  IntParameter | RealParameter | DecimalParameter | CategoricalParameter | BooleanParameter;

export type StrategyParameterValue = Exclude<AllStrategyParameter['value'], null>;

export type StrategyParameterInputs = Pick<
  AllStrategyParameter,
  'name' | 'space' | 'param_type' | 'value'
>;

export interface StrategyResult {
  /** Strategy name */
  strategy: string;
  timeframe: string;
  /** Code of the strategy class */
  code: string;
  params: AllStrategyParameter[];
}
