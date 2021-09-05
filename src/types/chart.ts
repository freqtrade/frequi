export interface CumProfitData {
  [date: string]: number;
  profit: number;
}

export interface CumProfitDataPerDate {
  [key: number]: CumProfitData;
}
