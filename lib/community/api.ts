import { getSupabaseClient } from '@/lib/supabase/client';
import type {
  CommunityComment,
  CommunityFeedPost,
  CommunityPostDetail,
  CommunityProfilePost,
  VoteType,
} from '@/types/community';

type RawCommunityFeedPost = Omit<CommunityFeedPost, 'comment_count' | 'helpful_count' | 'net_votes'> & {
  comment_count: number | string | null;
  helpful_count: number | string | null;
  net_votes: number | string | null;
};

type RawCommunityPostDetail = Omit<CommunityPostDetail, 'comment_count' | 'helpful_count' | 'net_votes'> & {
  comment_count: number | string | null;
  helpful_count: number | string | null;
  net_votes: number | string | null;
};

type RawCommunityProfilePost = Omit<
  CommunityProfilePost,
  'comment_count' | 'helpful_count' | 'net_votes'
> & {
  comment_count: number | string | null;
  helpful_count: number | string | null;
  net_votes: number | string | null;
};

function requireSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  return supabase;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === 'number') {
    return value;
  }

  return Number(value ?? 0);
}

function normalizeFeedPost(post: RawCommunityFeedPost): CommunityFeedPost {
  return {
    ...post,
    comment_count: toNumber(post.comment_count),
    helpful_count: toNumber(post.helpful_count),
    net_votes: toNumber(post.net_votes),
  };
}

function normalizePostDetail(post: RawCommunityPostDetail): CommunityPostDetail {
  return {
    ...post,
    comment_count: toNumber(post.comment_count),
    helpful_count: toNumber(post.helpful_count),
    net_votes: toNumber(post.net_votes),
  };
}

function normalizeProfilePost(post: RawCommunityProfilePost): CommunityProfilePost {
  return {
    ...post,
    comment_count: toNumber(post.comment_count),
    helpful_count: toNumber(post.helpful_count),
    net_votes: toNumber(post.net_votes),
  };
}

export async function getFeedPosts(topicId?: string | null) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_feed_posts', {
    input_limit: 25,
    input_offset: 0,
    input_topic_id: topicId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RawCommunityFeedPost[]).map(normalizeFeedPost);
}

export async function getSavedPosts() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_saved_posts', {
    input_limit: 20,
    input_offset: 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RawCommunityProfilePost[]).map(normalizeProfilePost);
}

export async function getMyPosts() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_my_posts', {
    input_limit: 20,
    input_offset: 0,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RawCommunityProfilePost[]).map(normalizeProfilePost);
}

export async function searchPosts(query: string, topicId?: string | null) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('search_posts', {
    input_limit: 25,
    input_query: query,
    input_topic_id: topicId ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as RawCommunityFeedPost[]).map(normalizeFeedPost);
}

export async function getPostDetail(postId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_post_detail', {
    input_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  const [post] = ((data ?? []) as RawCommunityPostDetail[]).map(normalizePostDetail);

  if (!post) {
    throw new Error('That post is unavailable.');
  }

  return post;
}

export async function getPostComments(postId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_post_comments', {
    input_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CommunityComment[];
}

export async function createPost(input: {
  body: string;
  isAnonymous: boolean;
  postType: CommunityFeedPost['post_type'];
  title: string;
  topicId: string;
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('create_post', {
    input_body: input.body,
    input_is_anonymous: input.isAnonymous,
    input_post_type: input.postType,
    input_title: input.title,
    input_topic_id: input.topicId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createComment(input: {
  body: string;
  parentCommentId?: string | null;
  postId: string;
}) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('create_comment', {
    input_body: input.body,
    input_parent_comment_id: input.parentCommentId ?? null,
    input_post_id: input.postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function setMyPostStatus(postId: string, status: 'open' | 'resolved') {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('set_my_post_status', {
    input_post_id: postId,
    input_status: status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data as 'open' | 'resolved';
}

export async function reportPost(postId: string, reason: string, details?: string | null) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('report_post', {
    input_details: details?.trim() ? details.trim() : null,
    input_post_id: postId,
    input_reason: reason,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function reportComment(commentId: string, reason: string, details?: string | null) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('report_comment', {
    input_comment_id: commentId,
    input_details: details?.trim() ? details.trim() : null,
    input_reason: reason,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function blockPostAuthor(postId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('block_post_author', {
    input_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function blockCommentAuthor(commentId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('block_comment_author', {
    input_comment_id: commentId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function toggleSavePost(postId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('toggle_save_post', {
    input_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function setPostVote(postId: string, voteType: VoteType) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('set_post_vote', {
    input_post_id: postId,
    input_vote_type: voteType,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as VoteType;
}

export async function togglePostHelpful(postId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('toggle_post_helpful', {
    input_post_id: postId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
