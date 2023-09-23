import { AlertSeverity } from '@/types/alertTypes';
import { useToast } from 'bootstrap-vue-next';

export function showAlert(message: string, severity: AlertSeverity = 'warning', bot: string = '') {
  const { show } = useToast();

  show(message, { title: `${bot ? 'Bot: ' + bot : 'Notification'}`, variant: severity });
}

export function useAlertForBot(botName: string) {
  return {
    showAlert: (message: string, severity: AlertSeverity = 'warning') => {
      showAlert(message, severity, botName);
    },
  };
}
