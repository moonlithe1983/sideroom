export type ModerationQueueStatus = 'open' | 'reviewed' | 'actioned' | 'dismissed' | 'all';

export type ModerationAction =
  | 'dismiss'
  | 'remove_post'
  | 'lock_post'
  | 'remove_comment'
  | 'suspend_author'
  | 'ban_author';

export type ModerationQueueItem = {
  open_reports_for_target: number;
  post_id: string | null;
  post_title: string | null;
  report_details: string | null;
  report_id: string;
  report_reason: string;
  report_status: Exclude<ModerationQueueStatus, 'all'>;
  reported_at: string;
  reporter_label: string;
  reporter_user_id: string;
  target_account_status: 'active' | 'suspended' | 'banned' | null;
  target_author_id: string | null;
  target_author_label: string;
  target_id: string;
  target_moderation_status: 'clean' | 'flagged' | 'under_review' | 'removed' | null;
  target_preview: string | null;
  target_type: 'post' | 'comment' | 'user';
};
