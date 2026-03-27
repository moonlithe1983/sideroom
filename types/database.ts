export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      blocked_users: {
        Row: {
          blocked_user_id: string;
          created_at: string;
          id: string;
          user_id: string;
        };
        Insert: {
          blocked_user_id: string;
          created_at?: string;
          id?: string;
          user_id: string;
        };
        Update: {
          blocked_user_id?: string;
          created_at?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          is_deleted: boolean;
          moderation_status: 'clean' | 'flagged' | 'under_review' | 'removed';
          parent_comment_id: string | null;
          post_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          moderation_status?: 'clean' | 'flagged' | 'under_review' | 'removed';
          parent_comment_id?: string | null;
          post_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          is_deleted?: boolean;
          moderation_status?: 'clean' | 'flagged' | 'under_review' | 'removed';
          parent_comment_id?: string | null;
          post_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      moderation_actions: {
        Row: {
          action_type: string;
          created_at: string;
          id: string;
          moderator_user_id: string;
          notes: string | null;
          reason: string;
          target_id: string;
          target_type: string;
        };
        Insert: {
          action_type: string;
          created_at?: string;
          id?: string;
          moderator_user_id: string;
          notes?: string | null;
          reason: string;
          target_id: string;
          target_type: string;
        };
        Update: {
          action_type?: string;
          created_at?: string;
          id?: string;
          moderator_user_id?: string;
          notes?: string | null;
          reason?: string;
          target_id?: string;
          target_type?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string;
          entity_id: string;
          entity_type: string;
          id: string;
          is_read: boolean;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          entity_id: string;
          entity_type: string;
          id?: string;
          is_read?: boolean;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          entity_id?: string;
          entity_type?: string;
          id?: string;
          is_read?: boolean;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      posts: {
        Row: {
          body: string | null;
          created_at: string;
          id: string;
          is_anonymous: boolean;
          moderation_status: 'clean' | 'flagged' | 'under_review' | 'removed';
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          status: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_anonymous?: boolean;
          moderation_status?: 'clean' | 'flagged' | 'under_review' | 'removed';
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          status?: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          body?: string | null;
          created_at?: string;
          id?: string;
          is_anonymous?: boolean;
          moderation_status?: 'clean' | 'flagged' | 'under_review' | 'removed';
          post_type?: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          status?: 'open' | 'resolved' | 'locked' | 'removed';
          title?: string;
          topic_id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      reactions: {
        Row: {
          created_at: string;
          id: string;
          reaction_type: 'upvote' | 'downvote' | 'helpful';
          target_id: string;
          target_type: 'post' | 'comment';
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          reaction_type: 'upvote' | 'downvote' | 'helpful';
          target_id: string;
          target_type: 'post' | 'comment';
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          reaction_type?: 'upvote' | 'downvote' | 'helpful';
          target_id?: string;
          target_type?: 'post' | 'comment';
          user_id?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          created_at: string;
          details: string | null;
          id: string;
          reason: string;
          reporter_user_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: 'open' | 'reviewed' | 'actioned' | 'dismissed';
          target_id: string;
          target_type: 'post' | 'comment' | 'user';
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason: string;
          reporter_user_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: 'open' | 'reviewed' | 'actioned' | 'dismissed';
          target_id: string;
          target_type: 'post' | 'comment' | 'user';
        };
        Update: {
          created_at?: string;
          details?: string | null;
          id?: string;
          reason?: string;
          reporter_user_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: 'open' | 'reviewed' | 'actioned' | 'dismissed';
          target_id?: string;
          target_type?: 'post' | 'comment' | 'user';
        };
        Relationships: [];
      };
      saves: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      topic_follows: {
        Row: {
          created_at: string;
          id: string;
          topic_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          topic_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          topic_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      topics: {
        Row: {
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          bio: string | null;
          created_at: string;
          handle: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          handle: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          handle?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          auth_provider: string;
          created_at: string;
          disclaimer_accepted_at: string | null;
          email: string;
          id: string;
          last_seen_at: string | null;
          onboarding_completed_at: string | null;
          role: 'user' | 'moderator' | 'admin';
          status: 'active' | 'suspended' | 'banned';
          updated_at: string;
        };
        Insert: {
          auth_provider?: string;
          created_at?: string;
          disclaimer_accepted_at?: string | null;
          email: string;
          id: string;
          last_seen_at?: string | null;
          onboarding_completed_at?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          status?: 'active' | 'suspended' | 'banned';
          updated_at?: string;
        };
        Update: {
          auth_provider?: string;
          created_at?: string;
          disclaimer_accepted_at?: string | null;
          email?: string;
          id?: string;
          last_seen_at?: string | null;
          onboarding_completed_at?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          status?: 'active' | 'suspended' | 'banned';
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      app_is_staff: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      create_comment: {
        Args: {
          input_body: string;
          input_parent_comment_id: string | null;
          input_post_id: string;
        };
        Returns: string;
      };
      create_post: {
        Args: {
          input_body: string;
          input_is_anonymous: boolean;
          input_post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          input_title: string;
          input_topic_id: string;
        };
        Returns: string;
      };
      complete_onboarding: {
        Args: {
          input_handle: string;
          input_topic_ids: string[];
        };
        Returns: Database['public']['Tables']['user_profiles']['Row'];
      };
      community_viewer_ready: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      get_feed_posts: {
        Args: {
          input_limit: number;
          input_offset: number;
          input_topic_id: string | null;
        };
        Returns: {
          author_label: string;
          author_trust_hint: string;
          body_preview: string | null;
          comment_count: number;
          created_at: string;
          helpful_count: number;
          is_anonymous: boolean;
          net_votes: number;
          post_id: string;
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          status: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          topic_name: string;
          topic_slug: string;
          viewer_has_saved: boolean;
          viewer_marked_helpful: boolean;
          viewer_vote: 'upvote' | 'downvote' | null;
        }[];
      };
      get_saved_posts: {
        Args: {
          input_limit: number;
          input_offset: number;
        };
        Returns: {
          author_label: string;
          author_trust_hint: string;
          body_preview: string | null;
          comment_count: number;
          created_at: string;
          helpful_count: number;
          is_anonymous: boolean;
          moderation_status: 'clean' | 'flagged' | 'under_review' | 'removed';
          net_votes: number;
          post_id: string;
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          saved_at: string | null;
          status: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          topic_name: string;
          topic_slug: string;
          updated_at: string | null;
          viewer_has_saved: boolean;
          viewer_marked_helpful: boolean;
          viewer_vote: 'upvote' | 'downvote' | null;
        }[];
      };
      get_my_posts: {
        Args: {
          input_limit: number;
          input_offset: number;
        };
        Returns: {
          author_label: string;
          author_trust_hint: string;
          body_preview: string | null;
          comment_count: number;
          created_at: string;
          helpful_count: number;
          is_anonymous: boolean;
          moderation_status: 'clean' | 'flagged' | 'under_review' | 'removed';
          net_votes: number;
          post_id: string;
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          saved_at: string | null;
          status: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          topic_name: string;
          topic_slug: string;
          updated_at: string | null;
          viewer_has_saved: boolean;
          viewer_marked_helpful: boolean;
          viewer_vote: 'upvote' | 'downvote' | null;
        }[];
      };
      set_my_post_status: {
        Args: {
          input_post_id: string;
          input_status: 'open' | 'resolved';
        };
        Returns: 'open' | 'resolved';
      };
      get_post_comments: {
        Args: {
          input_post_id: string;
        };
        Returns: {
          author_label: string;
          author_trust_hint: string;
          body: string;
          comment_id: string;
          created_at: string;
          parent_comment_id: string | null;
          viewer_is_owner: boolean;
        }[];
      };
      get_post_detail: {
        Args: {
          input_post_id: string;
        };
        Returns: {
          author_label: string;
          author_trust_hint: string;
          body: string | null;
          comment_count: number;
          created_at: string;
          helpful_count: number;
          is_anonymous: boolean;
          net_votes: number;
          post_id: string;
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          status: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          topic_name: string;
          topic_slug: string;
          updated_at: string;
          viewer_has_saved: boolean;
          viewer_is_owner: boolean;
          viewer_marked_helpful: boolean;
          viewer_vote: 'upvote' | 'downvote' | null;
        }[];
      };
      get_notifications: {
        Args: {
          input_limit: number;
          input_offset: number;
          input_unread_only: boolean;
        };
        Returns: {
          actor_label: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          is_read: boolean;
          message_preview: string | null;
          message_title: string;
          notification_id: string;
          notification_type: string;
          post_id: string;
          post_title: string | null;
        }[];
      };
      get_unread_notification_count: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_moderation_queue: {
        Args: {
          input_limit: number;
          input_offset: number;
          input_status: string;
        };
        Returns: {
          open_reports_for_target: number;
          post_id: string | null;
          post_title: string | null;
          report_details: string | null;
          report_id: string;
          report_reason: string;
          report_status: 'open' | 'reviewed' | 'actioned' | 'dismissed';
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
        }[];
      };
      search_posts: {
        Args: {
          input_limit: number;
          input_query: string;
          input_topic_id: string | null;
        };
        Returns: {
          author_label: string;
          author_trust_hint: string;
          body_preview: string | null;
          comment_count: number;
          created_at: string;
          helpful_count: number;
          is_anonymous: boolean;
          net_votes: number;
          post_id: string;
          post_type: 'question' | 'advice_request' | 'poll' | 'story' | 'update';
          status: 'open' | 'resolved' | 'locked' | 'removed';
          title: string;
          topic_id: string;
          topic_name: string;
          topic_slug: string;
          viewer_has_saved: boolean;
          viewer_marked_helpful: boolean;
          viewer_vote: 'upvote' | 'downvote' | null;
        }[];
      };
      report_post: {
        Args: {
          input_details: string | null;
          input_post_id: string;
          input_reason: string;
        };
        Returns: string;
      };
      report_comment: {
        Args: {
          input_comment_id: string;
          input_details: string | null;
          input_reason: string;
        };
        Returns: string;
      };
      block_post_author: {
        Args: {
          input_post_id: string;
        };
        Returns: boolean;
      };
      block_comment_author: {
        Args: {
          input_comment_id: string;
        };
        Returns: boolean;
      };
      mark_notification_read: {
        Args: {
          input_notification_id: string;
        };
        Returns: boolean;
      };
      mark_all_notifications_read: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      resolve_report: {
        Args: {
          input_action: string;
          input_notes: string | null;
          input_report_id: string;
        };
        Returns: boolean;
      };
      set_post_vote: {
        Args: {
          input_post_id: string;
          input_vote_type: 'upvote' | 'downvote' | null;
        };
        Returns: 'upvote' | 'downvote' | null;
      };
      touch_last_seen: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      toggle_post_helpful: {
        Args: {
          input_post_id: string;
        };
        Returns: boolean;
      };
      toggle_save_post: {
        Args: {
          input_post_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};

type PublicSchema = Database['public'];

export type TableName = keyof PublicSchema['Tables'];
export type TableRow<TTableName extends TableName> = PublicSchema['Tables'][TTableName]['Row'];
