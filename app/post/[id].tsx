import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { CommentRow } from '@/components/community/comment-row';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  blockCommentAuthor,
  blockPostAuthor,
  createComment,
  getPostComments,
  getPostDetail,
  reportComment,
  reportPost,
  setMyPostStatus,
  setPostVote,
  togglePostHelpful,
  toggleSavePost,
} from '@/lib/community/api';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { CommunityComment, CommunityPostDetail, VoteType } from '@/types/community';

const REPORT_REASONS = ['Harassment', 'Unsafe advice', 'Privacy concern', 'Spam', 'Other'];

type SafetyTarget = {
  authorLabel: string;
  id: string;
  type: 'post' | 'comment';
};

function buildPostSafetyTarget(post: CommunityPostDetail): SafetyTarget | null {
  if (post.viewer_is_owner) {
    return null;
  }

  return {
    authorLabel: post.is_anonymous ? 'Anonymous author' : `@${post.author_label}`,
    id: post.post_id,
    type: 'post',
  };
}

function getPostStatusMeta(status: CommunityPostDetail['status']) {
  if (status === 'resolved') {
    return {
      description:
        'This author marked the post resolved, but helpful follow-up comments can still be added.',
      label: 'Resolved',
      tone: 'success' as const,
    };
  }

  if (status === 'locked') {
    return {
      description: 'Replies are locked on this post.',
      label: 'Locked',
      tone: 'warning' as const,
    };
  }

  return {
    description: 'This post is open for new replies.',
    label: 'Open',
    tone: 'default' as const,
  };
}

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const background = useThemeColor({}, 'background');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [post, setPost] = useState<CommunityPostDetail | null>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionTone, setActionTone] = useState<'default' | 'danger'>('default');
  const [working, setWorking] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [safetyTarget, setSafetyTarget] = useState<SafetyTarget | null>(null);
  const [safetySectionY, setSafetySectionY] = useState(0);

  const loadPost = useCallback(async () => {
    if (!id) {
      setError('This post link is incomplete.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [nextPost, nextComments] = await Promise.all([getPostDetail(id), getPostComments(id)]);
      setPost(nextPost);
      setComments(nextComments);
      setSafetyTarget(buildPostSafetyTarget(nextPost));
    } catch (loadError) {
      setPost(null);
      setComments([]);
      setSafetyTarget(null);
      setError(loadError instanceof Error ? loadError.message : 'Could not load this post.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void loadPost();
    }, [loadPost])
  );

  function scrollToSafetyTools() {
    scrollViewRef.current?.scrollTo({
      animated: true,
      y: Math.max(safetySectionY - 18, 0),
    });
  }

  function selectReportTarget(nextTarget: SafetyTarget) {
    setActionMessage(null);
    setActionTone('default');
    setSafetyTarget(nextTarget);
    scrollToSafetyTools();
  }

  async function handleOwnPostStatus(nextStatus: 'open' | 'resolved') {
    if (!post || !post.viewer_is_owner) {
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      const resolvedStatus = await setMyPostStatus(post.post_id, nextStatus);
      setPost({
        ...post,
        status: resolvedStatus,
      });
      setActionMessage(
        resolvedStatus === 'resolved'
          ? 'Post marked resolved. People can still read it and leave thoughtful follow-up replies.'
          : 'Post reopened. New replies can keep the conversation going.'
      );
    } catch (statusError) {
      setActionTone('danger');
      setActionMessage(
        statusError instanceof Error ? statusError.message : 'Could not update post status.'
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleVote(nextVote: VoteType) {
    if (!post) {
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      const previousVote = post.viewer_vote;
      const resolvedVote = await setPostVote(post.post_id, nextVote);
      const previousScore = previousVote === 'upvote' ? 1 : previousVote === 'downvote' ? -1 : 0;
      const nextScore = resolvedVote === 'upvote' ? 1 : resolvedVote === 'downvote' ? -1 : 0;

      setPost({
        ...post,
        net_votes: post.net_votes - previousScore + nextScore,
        viewer_vote: resolvedVote,
      });
    } catch (voteError) {
      setActionTone('danger');
      setActionMessage(voteError instanceof Error ? voteError.message : 'Vote failed.');
    } finally {
      setWorking(false);
    }
  }

  async function handleHelpfulToggle() {
    if (!post) {
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      const nextHelpfulState = await togglePostHelpful(post.post_id);
      setPost({
        ...post,
        helpful_count: post.helpful_count + (nextHelpfulState ? 1 : -1),
        viewer_marked_helpful: nextHelpfulState,
      });
    } catch (helpfulError) {
      setActionTone('danger');
      setActionMessage(
        helpfulError instanceof Error ? helpfulError.message : 'Helpful reaction failed.'
      );
    } finally {
      setWorking(false);
    }
  }

  async function handleSaveToggle() {
    if (!post) {
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      const nextSavedState = await toggleSavePost(post.post_id);
      setPost({
        ...post,
        viewer_has_saved: nextSavedState,
      });
    } catch (saveError) {
      setActionTone('danger');
      setActionMessage(saveError instanceof Error ? saveError.message : 'Save failed.');
    } finally {
      setWorking(false);
    }
  }

  async function handleCommentSubmit() {
    if (!post || commentBody.trim().length === 0) {
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      await createComment({
        body: commentBody.trim(),
        postId: post.post_id,
      });
      setCommentBody('');
      const nextComments = await getPostComments(post.post_id);
      setComments(nextComments);
      setPost({
        ...post,
        comment_count: nextComments.length,
      });
    } catch (commentError) {
      setActionTone('danger');
      setActionMessage(commentError instanceof Error ? commentError.message : 'Comment failed.');
    } finally {
      setWorking(false);
    }
  }

  async function handleReportSubmit() {
    if (!safetyTarget) {
      setActionTone('danger');
      setActionMessage('Choose the post or a comment before submitting a report.');
      return;
    }

    if (!reportReason) {
      setActionTone('danger');
      setActionMessage('Choose a report reason before submitting.');
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      if (safetyTarget.type === 'post') {
        await reportPost(safetyTarget.id, reportReason, reportDetails);
        Alert.alert(
          'Report received',
          'Thanks. This post has been sent to moderation and removed from your view.'
        );
        router.replace('/');
        return;
      }

      await reportComment(safetyTarget.id, reportReason, reportDetails);
      setReportDetails('');
      setReportReason('');
      await loadPost();
      setActionMessage('Comment reported. It will stay out of your view while it is reviewed.');
    } catch (reportError) {
      setActionTone('danger');
      setActionMessage(reportError instanceof Error ? reportError.message : 'Report failed.');
    } finally {
      setWorking(false);
    }
  }

  async function confirmPostAuthorBlock() {
    if (!post || post.viewer_is_owner) {
      return;
    }

    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      await blockPostAuthor(post.post_id);
      Alert.alert(
        'Author blocked',
        "You will no longer see this member's posts or comments in SideRoom."
      );
      router.replace('/');
    } catch (blockError) {
      setActionTone('danger');
      setActionMessage(blockError instanceof Error ? blockError.message : 'Block failed.');
    } finally {
      setWorking(false);
    }
  }

  function promptPostAuthorBlock() {
    if (!post || post.viewer_is_owner) {
      return;
    }

    Alert.alert('Block this author?', 'You will stop seeing their posts and comments across SideRoom.', [
      {
        style: 'cancel',
        text: 'Cancel',
      },
      {
        style: 'destructive',
        text: 'Block author',
        onPress: () => {
          void confirmPostAuthorBlock();
        },
      },
    ]);
  }

  async function confirmCommentAuthorBlock(comment: CommunityComment) {
    setWorking(true);
    setActionMessage(null);
    setActionTone('default');

    try {
      await blockCommentAuthor(comment.comment_id);
      setReportDetails('');
      setReportReason('');
      await loadPost();
      setActionMessage('Author blocked. Their content is now hidden from your view.');
    } catch (blockError) {
      setActionTone('danger');
      setActionMessage(blockError instanceof Error ? blockError.message : 'Block failed.');
    } finally {
      setWorking(false);
    }
  }

  function promptCommentAuthorBlock(comment: CommunityComment) {
    Alert.alert(
      'Block this author?',
      `You will stop seeing posts and comments from ${comment.author_label}.`,
      [
        {
          style: 'cancel',
          text: 'Cancel',
        },
        {
          style: 'destructive',
          text: 'Block author',
          onPress: () => {
            void confirmCommentAuthorBlock(comment);
          },
        },
      ]
    );
  }

  const actionMessageColor = actionTone === 'danger' ? danger : muted;
  const postSafetyTarget = post ? buildPostSafetyTarget(post) : null;
  const postStatusMeta = post ? getPostStatusMeta(post.status) : null;

  return (
    <>
      <Stack.Screen options={{ title: post?.topic_name ?? 'Post' }} />
      <ScrollView
        contentContainerStyle={[styles.content, { backgroundColor: background }]}
        ref={scrollViewRef}>
        {loading ? (
          <SectionCard eyebrow="Loading" title="Pulling the conversation into view">
            <ThemedText style={{ color: muted }}>Loading post details and comments...</ThemedText>
          </SectionCard>
        ) : null}
        {error ? (
          <SectionCard eyebrow="Unavailable" title="This post could not be loaded">
            <ThemedText style={{ color: danger }}>{error}</ThemedText>
          </SectionCard>
        ) : null}
        {post ? (
          <>
            <SectionCard eyebrow={post.topic_name} title={post.title}>
              {postStatusMeta ? (
                <View style={styles.statusRow}>
                  <StatusPill label={postStatusMeta.label} tone={postStatusMeta.tone} />
                  <ThemedText style={[styles.metaText, { color: muted }]}>
                    {postStatusMeta.description}
                  </ThemedText>
                </View>
              ) : null}
              <View style={styles.metaRow}>
                <StatusPill label={post.is_anonymous ? 'Anonymous' : post.author_label} tone="default" />
                <ThemedText style={[styles.metaText, { color: muted }]}>
                  {post.author_trust_hint} | {formatRelativeTime(post.created_at)}
                </ThemedText>
              </View>
              {post.body ? <ThemedText>{post.body}</ThemedText> : null}
              <View style={styles.chipGrid}>
                <SelectableChip
                  label={post.viewer_vote === 'upvote' ? 'Upvoted' : 'Upvote'}
                  onPress={() => void handleVote(post.viewer_vote === 'upvote' ? null : 'upvote')}
                  selected={post.viewer_vote === 'upvote'}
                />
                <SelectableChip
                  label={post.viewer_vote === 'downvote' ? 'Downvoted' : 'Downvote'}
                  onPress={() => void handleVote(post.viewer_vote === 'downvote' ? null : 'downvote')}
                  selected={post.viewer_vote === 'downvote'}
                />
                <SelectableChip
                  label={post.viewer_marked_helpful ? 'Helpful saved' : 'Mark helpful'}
                  onPress={() => void handleHelpfulToggle()}
                  selected={post.viewer_marked_helpful}
                />
                <SelectableChip
                  label={post.viewer_has_saved ? 'Saved' : 'Save'}
                  onPress={() => void handleSaveToggle()}
                  selected={post.viewer_has_saved}
                />
              </View>
              <View style={styles.statsRow}>
                <ThemedText style={[styles.metaText, { color: muted }]}>
                  {post.net_votes} score
                </ThemedText>
                <ThemedText style={[styles.metaText, { color: muted }]}>
                  {post.helpful_count} helpful
                </ThemedText>
                <ThemedText style={[styles.metaText, { color: muted }]}>
                  {post.comment_count} comments
                </ThemedText>
              </View>
              {postSafetyTarget ? (
                <View style={styles.safetyQuickRow}>
                  <SelectableChip
                    label={safetyTarget?.type === 'post' ? 'Reporting this post' : 'Report post'}
                    onPress={() => selectReportTarget(postSafetyTarget)}
                    selected={safetyTarget?.type === 'post'}
                  />
                  <SelectableChip label="Block author" onPress={promptPostAuthorBlock} selected={false} />
                </View>
              ) : (
                <View style={styles.safetyQuickRow}>
                  {post.status !== 'locked' ? (
                    <SelectableChip
                      label={post.status === 'resolved' ? 'Reopen post' : 'Mark resolved'}
                      onPress={() =>
                        void handleOwnPostStatus(post.status === 'resolved' ? 'open' : 'resolved')
                      }
                      selected={post.status === 'resolved'}
                    />
                  ) : null}
                  <ThemedText style={{ color: muted }}>
                    {post.status === 'locked'
                      ? 'This post is locked by moderation and cannot be reopened here.'
                      : 'You own this post and can close the loop once the question feels answered.'}
                  </ThemedText>
                </View>
              )}
            </SectionCard>

            <View onLayout={(event) => setSafetySectionY(event.nativeEvent.layout.y)}>
              <SectionCard eyebrow="Safety Tools" title="Report content or block an author">
                {safetyTarget ? (
                  <>
                    <StatusPill
                      label={
                        safetyTarget.type === 'post'
                          ? 'Selected target: this post'
                          : 'Selected target: comment'
                      }
                      tone="warning"
                    />
                    <ThemedText style={{ color: muted }}>
                      {safetyTarget.type === 'post'
                        ? `You are reporting this post by ${safetyTarget.authorLabel}.`
                        : `You are reporting a comment by ${safetyTarget.authorLabel}.`}
                    </ThemedText>
                  </>
                ) : (
                  <ThemedText style={{ color: muted }}>
                    Choose a comment below if you need to report or block a reply.
                  </ThemedText>
                )}
                {safetyTarget?.type === 'comment' && postSafetyTarget ? (
                  <SelectableChip
                    label="Switch back to this post"
                    onPress={() => selectReportTarget(postSafetyTarget)}
                    selected={false}
                  />
                ) : null}
                <View style={styles.reasonGrid}>
                  {REPORT_REASONS.map((reason) => (
                    <SelectableChip
                      key={reason}
                      label={reason}
                      onPress={() => setReportReason(reason)}
                      selected={reportReason === reason}
                    />
                  ))}
                </View>
                <ThemedTextInput
                  multiline
                  onChangeText={setReportDetails}
                  placeholder="Optional details for moderators"
                  style={styles.detailsInput}
                  textAlignVertical="top"
                  value={reportDetails}
                />
                <PrimaryButton
                  disabled={working || !safetyTarget || reportReason.length === 0}
                  label={
                    working
                      ? 'Submitting...'
                      : safetyTarget?.type === 'comment'
                        ? 'Submit comment report'
                        : 'Submit report'
                  }
                  onPress={() => void handleReportSubmit()}
                />
                <ThemedText style={{ color: muted }}>
                  Blocking removes an author&apos;s future posts and replies from your view. Reporting
                  sends the content to moderation.
                </ThemedText>
                {actionMessage ? (
                  <ThemedText style={{ color: actionMessageColor }}>{actionMessage}</ThemedText>
                ) : null}
              </SectionCard>
            </View>

            <SectionCard eyebrow="Reply" title="Add your perspective">
              {post.status === 'locked' ? (
                <ThemedText style={{ color: muted }}>
                  Replies are locked on this post, so no new comments can be added.
                </ThemedText>
              ) : (
                <>
                  <ThemedTextInput
                    multiline
                    onChangeText={setCommentBody}
                    placeholder="Share practical advice or a useful perspective."
                    style={styles.commentInput}
                    textAlignVertical="top"
                    value={commentBody}
                  />
                  <PrimaryButton
                    disabled={working || commentBody.trim().length === 0}
                    label={working ? 'Posting...' : 'Post comment'}
                    onPress={() => void handleCommentSubmit()}
                  />
                </>
              )}
            </SectionCard>

            <SectionCard eyebrow="Discussion" title="Replies on this post">
              {comments.length === 0 ? (
                <ThemedText style={{ color: muted }}>
                  No comments yet. Be the first helpful reply.
                </ThemedText>
              ) : null}
              {comments.map((comment) => (
                <CommentRow
                  key={comment.comment_id}
                  comment={comment}
                  disabled={working}
                  onBlockAuthor={
                    comment.viewer_is_owner
                      ? undefined
                      : () => {
                          promptCommentAuthorBlock(comment);
                        }
                  }
                  onReport={
                    comment.viewer_is_owner
                      ? undefined
                      : () => {
                          selectReportTarget({
                            authorLabel: `@${comment.author_label}`,
                            id: comment.comment_id,
                            type: 'comment',
                          });
                        }
                  }
                  selectedForSafety={
                    safetyTarget?.type === 'comment' && safetyTarget.id === comment.comment_id
                  }
                />
              ))}
            </SectionCard>
          </>
        ) : null}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  commentInput: {
    minHeight: 140,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  detailsInput: {
    minHeight: 110,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  safetyQuickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
