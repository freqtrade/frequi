import { AlertSeverity } from '@/types/alertTypes';
import { useToast } from 'bootstrap-vue-next';

export function showAlert(message: string, severity: AlertSeverity = 'warning') {
  const { show } = useToast();

  show(message, { title: 'Msg', variant: severity, animation: true, value: true });
}
