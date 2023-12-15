import { PlotConfig } from './plot';
import { Trade } from './trades';
import { PairHistory } from './types';

export interface CumProfitData {
  [date: string]: number;
  profit: number;
}

export interface CumProfitDataPerDate {
  [key: number]: CumProfitData;
}

export type CumProfitChartData = {
  date: number;
  profit?: number;
  currentProfit?: number;
};

export interface ChartSliderPosition {
  startValue: number;
  endValue: number | undefined;
}

export interface CandleChartProps {
  trades?: Trade[];
  dataset: PairHistory;
  heikinAshi?: boolean;
  useUTC?: boolean;
  plotConfig: PlotConfig;
  theme: string;
  sliderPosition?: ChartSliderPosition;
  colorUp?: string;
  colorDown?: string;
}
