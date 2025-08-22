import type { BackgroundTaskStatus } from '@/types';
import type { ShowAlertType } from '@/utils/alerts';
import type { AxiosInstance } from 'axios';

const jobs = ref<Record<string, { jobType: string; taskStatus?: BackgroundTaskStatus }>>({});

function startBgJob(api: AxiosInstance, showAlert: ShowAlertType, jobId: string, jobType: string) {
  async function getBackgroundJobStatus(jobId: string) {
    try {
      const { data } = await api.get<BackgroundTaskStatus>(`/background/${jobId}`);
      return Promise.resolve(data);
    } catch (error) {
      console.error(error);
      return Promise.reject(error);
    }
  }

  const evaluating = ref(false);
  const result = ref<BackgroundTaskStatus | null>(null);
  jobs.value[jobId] = { jobType };

  const interval = window.setInterval(async () => {
    try {
      result.value = await getBackgroundJobStatus(jobId);
      if (!result.value.running) {
        clearJobFromRunningList();
      }
      jobs.value[jobId] = { ...jobs.value[jobId]!, taskStatus: result.value };
    } catch (error) {
      console.error(error);
      showAlert('Failed to get background job status', 'error');
      clearJobFromRunningList();
    }
  }, 500);

  function clearJobFromRunningList() {
    if (interval) {
      clearInterval(interval);
    }
    evaluating.value = false;
  }

  return {
    evaluating,
    result,
  };
}

async function recoverBgJobs(api: AxiosInstance, showAlert: ShowAlertType) {
  try {
    const { data } = await api.get<BackgroundTaskStatus[]>('/background');

    for (const job of data) {
      if (job.running) {
        startBgJob(api, showAlert, job.job_id, job.job_category);
      } else {
        jobs.value[job.job_id] = { jobType: job.job_category, taskStatus: job };
      }
    }
  } catch (error) {
    console.error(error);
  }
}

export function useBackgroundJob() {
  const runningJobs = computed(() => jobs.value);

  function clearJobs() {
    // Clear all jobs that are not running
    for (const [jobId, job] of Object.entries(jobs.value)) {
      if (job.taskStatus?.status !== 'running') {
        delete jobs.value[jobId];
      }
    }
  }

  return {
    runningJobs,
    startBgJob,
    clearJobs,
    recoverBgJobs,
  };
}
