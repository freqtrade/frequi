export interface BgTaskStarted {
  job_id: string;
}

export interface ProgressTask {
  progress: number;
  total: number;
  description: string;
}

export type JobCategory =
  | 'pairlist'
  | 'download_data'
  | 'backtest'
  | 'lookahead_analysis'
  | 'recursive_analysis';

export interface BackgroundTaskStatus {
  job_id: string;
  job_category: JobCategory;
  status: string;
  running: boolean;
  progress?: number;
  progress_tasks?: Record<string, ProgressTask>;
  error?: string;
}

export interface BackgroundTaskResult {
  error?: string;
  status: string;
}
