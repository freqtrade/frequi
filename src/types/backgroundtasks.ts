export interface BgTaskStarted {
  job_id: string;
}

export interface ProgressTask {
  progress: number;
  total: number;
  description: string;
}

export interface BackgroundTaskStatus {
  job_id: string;
  job_category: string;
  status: string;
  running: boolean;
  progress?: number;
  progress_tasks?: Record<string, ProgressTask>;
}

export interface BackgroundTaskResult {
  error?: string;
  status: string;
}
