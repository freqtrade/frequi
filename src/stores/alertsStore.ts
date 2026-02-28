import type { AlertType } from '@/types/alertTypes';

export const useAlertsStore = defineStore('alerts', () => {
  const activeMessages = ref<AlertType[]>([]);

  const toast = useToast();

  function addAlert(message: AlertType) {
    // TODO: is this store still necessary??
    toast.add({
      title: message.title,
      description: message.message,
      color: message.severity,
      duration: message.timeout,
    });
  }

  function removeAlert(alert: AlertType) {
    activeMessages.value = activeMessages.value.filter((v) => v !== alert);
  }

  return {
    activeMessages,
    addAlert,
    removeAlert,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAlertsStore, import.meta.hot));
}
