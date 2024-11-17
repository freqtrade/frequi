export interface BgTaskStarted {
  job_id: string;
}

export interface BackgroundTaskStatus {
  job_id: string;
  job_category: string;
  status: string;
  running: boolean;
  progress?: number;
  // TODO: type this properly
  progress_tasks?: Record<string, any>;
}

export interface BackgroundTaskResult {
  error?: string;
  status: string;
}
