export interface BgTaskStarted {
  job_id: string;
}

export interface BackgroundTaskStatus {
  job_id: string;
  job_category: string;
  status: string;
  running: boolean;
  progress?: number;
}

export interface BackgroundTaskResult {
  error?: string;
  status: string;
}
