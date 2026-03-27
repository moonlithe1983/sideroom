import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { ModerationReportCard } from '@/components/moderation/moderation-report-card';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getModerationQueue, resolveReport } from '@/lib/moderation/api';
import type { ModerationAction, ModerationQueueItem, ModerationQueueStatus } from '@/types/moderation';

const FILTERS: { label: string; value: ModerationQueueStatus }[] = [
  { label: 'Open', value: 'open' },
  { label: 'Actioned', value: 'actioned' },
  { label: 'Dismissed', value: 'dismissed' },
  { label: 'All', value: 'all' },
];

function buildActionCopy(action: ModerationAction, item: ModerationQueueItem) {
  switch (action) {
    case 'dismiss':
      return {
        buttonLabel: 'Dismiss report',
        description: 'This will close the report without removing content.',
        title: 'Dismiss this report?',
      };
    case 'remove_post':
      return {
        buttonLabel: 'Remove post',
        description: 'This will remove the post from the community and close related reports.',
        title: 'Remove this post?',
      };
    case 'lock_post':
      return {
        buttonLabel: 'Lock post',
        description: 'This will freeze new discussion on the post and close related reports.',
        title: 'Lock this post?',
      };
    case 'remove_comment':
      return {
        buttonLabel: 'Remove comment',
        description: 'This will hide the comment and close related reports.',
        title: 'Remove this comment?',
      };
    case 'suspend_author':
      return {
        buttonLabel: 'Suspend author',
        description: `This will suspend @${item.target_author_label} and hide their content from public surfaces.`,
        title: 'Suspend this author?',
      };
    case 'ban_author':
      return {
        buttonLabel: 'Ban author',
        description: `This will ban @${item.target_author_label} and remove their public posts and comments.`,
        title: 'Ban this author?',
      };
    default:
      return {
        buttonLabel: 'Continue',
        description: 'This action will update the report.',
        title: 'Continue?',
      };
  }
}

export default function ModerationScreen() {
  const auth = useAppAuth();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [selectedStatus, setSelectedStatus] = useState<ModerationQueueStatus>('open');
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingReportId, setWorkingReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadQueue = useCallback(async () => {
    if (!auth.isStaff) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextItems = await getModerationQueue(selectedStatus);
      setItems(nextItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the moderation queue.');
    } finally {
      setLoading(false);
    }
  }, [auth.isStaff, selectedStatus]);

  useFocusEffect(
    useCallback(() => {
      void loadQueue();
    }, [loadQueue])
  );

  function confirmAction(item: ModerationQueueItem, action: ModerationAction) {
    const actionCopy = buildActionCopy(action, item);

    Alert.alert(actionCopy.title, actionCopy.description, [
      {
        style: 'cancel',
        text: 'Cancel',
      },
      {
        style: action === 'dismiss' ? 'default' : 'destructive',
        text: actionCopy.buttonLabel,
        onPress: () => {
          void handleResolve(item, action);
        },
      },
    ]);
  }

  async function handleResolve(item: ModerationQueueItem, action: ModerationAction) {
    setWorkingReportId(item.report_id);
    setError(null);
    setNotice(null);

    try {
      await resolveReport(item.report_id, action);
      setNotice(`Action applied: ${buildActionCopy(action, item).buttonLabel}.`);
      await loadQueue();
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : 'Could not apply that moderation action.');
    } finally {
      setWorkingReportId(null);
    }
  }

  if (!auth.isStaff) {
    return (
      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
        <SectionCard eyebrow="Restricted" title="Moderator access required">
          <ThemedText style={{ color: muted }}>
            This workspace is reserved for SideRoom staff. Sign in with a moderator or admin account
            to review reports and manage safety actions.
          </ThemedText>
        </SectionCard>
      </ScrollView>
    );
  }

  const openItemsCount = items.filter((item) => item.report_status === 'open').length;

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill
          label={selectedStatus === 'open' ? `${openItemsCount} open now` : `Viewing ${selectedStatus}`}
          tone={openItemsCount > 0 ? 'warning' : 'success'}
        />
        <ThemedText type="title" style={styles.heroTitle}>
          Review safety reports and close the loop.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Staff actions here write moderation audit entries and run through protected server-side
          paths instead of direct table edits.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Queue" title="Choose the report state you want to review">
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <SelectableChip
              key={filter.value}
              label={filter.label}
              onPress={() => setSelectedStatus(filter.value)}
              selected={selectedStatus === filter.value}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard eyebrow="Reports" title="Moderation decisions">
        {loading ? <ThemedText style={{ color: muted }}>Loading reports and safety metadata...</ThemedText> : null}
        {error ? <ThemedText style={{ color: danger }}>{error}</ThemedText> : null}
        {notice ? <ThemedText style={{ color: muted }}>{notice}</ThemedText> : null}
        {!loading && !error && items.length === 0 ? (
          <ThemedText style={{ color: muted }}>
            No reports match this filter right now.
          </ThemedText>
        ) : null}
        {items.map((item) => (
          <ModerationReportCard
            key={item.report_id}
            disabled={workingReportId === item.report_id}
            item={item}
            onAction={(action) => confirmAction(item, action)}
            onOpenPost={
              item.post_id
                ? () => {
                    router.push(`/post/${item.post_id}`);
                  }
                : undefined
            }
          />
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 24,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
});
