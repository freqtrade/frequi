export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export interface AlertType {
  message: string;
  title: string;
  severity: AlertSeverity;
  timeout: number;
}
