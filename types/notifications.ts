export type AppNotificationType =
  | 'new_comment'
  | 'comment_reply'
  | 'post_helpful'
  | 'post_upvote';

export type AppNotification = {
  actor_label: string;
  created_at: string;
  entity_id: string;
  entity_type: string;
  is_read: boolean;
  message_preview: string | null;
  message_title: string;
  notification_id: string;
  notification_type: AppNotificationType;
  post_id: string;
  post_title: string | null;
};
