export type VoteType = 'upvote' | 'downvote' | null;

export type CommunityFeedPost = {
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
  viewer_vote: VoteType;
};

export type CommunityProfilePost = CommunityFeedPost & {
  moderation_status: 'clean' | 'flagged' | 'under_review' | 'removed';
  saved_at: string | null;
  updated_at: string | null;
};

export type CommunityPostDetail = {
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
  viewer_vote: VoteType;
};

export type CommunityComment = {
  author_label: string;
  author_trust_hint: string;
  body: string;
  comment_id: string;
  created_at: string;
  parent_comment_id: string | null;
  viewer_is_owner: boolean;
};
