export type AlertSeverity = 'danger' | 'warning' | 'info' | 'success';

export interface AlertType {
  message: string;
  title: string;
  severity: AlertSeverity;
  timeout: number;
}
