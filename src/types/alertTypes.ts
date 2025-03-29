export type AlertSeverity = 'error' | 'warn' | 'info' | 'success';

export interface AlertType {
  message: string;
  title: string;
  severity: AlertSeverity;
  timeout: number;
}
