export type NotificationKind =
  | 'problem_status_changed'
  | 'problem_assigned'
  | 'problem_routed';

export interface INotification {
  id: string;
  recipientId: string;
  kind: NotificationKind;
  problemId: string;
  problemTitle: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
