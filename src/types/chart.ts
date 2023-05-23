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
