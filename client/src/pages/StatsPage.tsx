import { useEffect, type ReactElement } from 'react';
import { useReviewStore } from '../store/reviewStore';
import type { ReviewFeedback } from '../types/card.type';
import EmptyState from '../components/common/EmptyState';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import styles from './StatsPage.module.css';

const FEEDBACK_META: { key: ReviewFeedback; label: string; color: string }[] = [
  { key: 'remember', label: '记住', color: '#16a34a' },
  { key: 'fuzzy', label: '模糊', color: '#d97706' },
  { key: 'forget', label: '忘记', color: '#dc2626' },
];

// 统计页：消费 reviewStore.fetchStats，渲染四块——今日/累计复习数、反馈占比、近 7 天每日复习数。
// 数据条形均用 CSS 宽度实现，不引图表库；三态（loading/error/空）齐备。
function StatsPage(): ReactElement {
  const stats = useReviewStore((s) => s.stats);
  const loading = useReviewStore((s) => s.loading);
  const error = useReviewStore((s) => s.error);
  const fetchStats = useReviewStore((s) => s.fetchStats);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const byFeedback = stats?.byFeedback ?? [];
  const byDay = stats?.byDay ?? [];
  const todayCount = byDay.find((d) => d.date === todayStr)?.count ?? 0;
  const totalCount = byFeedback.reduce((sum, it) => sum + it.count, 0);
  const maxFeedback = Math.max(1, ...byFeedback.map((it) => it.count));
  const maxDay = Math.max(1, ...byDay.map((it) => it.count));

  const noData = !loading && !error && stats === null;
  const isEmpty = !loading && !error && stats !== null && byFeedback.length === 0 && byDay.length === 0;

  let body: ReactElement;
  if (loading) {
    body = <div className={styles.hint}>加载中…</div>;
  } else if (error) {
    body = (
      <div className={styles.errorBox}>
        <ErrorMessage message={error} />
        <div className={styles.retry}>
          <Button onClick={() => void fetchStats()}>重试</Button>
        </div>
      </div>
    );
  } else if (noData || isEmpty) {
    body = (
      <EmptyState message="暂无统计数据" action={<Button onClick={() => void fetchStats()}>重试</Button>} />
    );
  } else {
    body = (
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>今日复习</div>
          <div className={styles.bigNum}>{todayCount}</div>
          <div className={styles.cardSub}>次</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>累计复习</div>
          <div className={styles.bigNum}>{totalCount}</div>
          <div className={styles.cardSub}>次</div>
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <div className={styles.cardLabel}>反馈占比</div>
          <div className={styles.barList}>
            {FEEDBACK_META.map((m) => {
              const item = byFeedback.find((it) => it.feedback === m.key);
              const count = item ? item.count : 0;
              const pct = Math.round((count / maxFeedback) * 100);
              return (
                <div key={m.key} className={styles.barRow}>
                  <span className={styles.barLabel}>{m.label}</span>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${pct}%`, backgroundColor: m.color }}
                    />
                  </div>
                  <span className={styles.barValue}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={`${styles.card} ${styles.wide}`}>
          <div className={styles.cardLabel}>近 7 天每日复习</div>
          <div className={styles.barList}>
            {byDay.length === 0 ? (
              <span className={styles.hint}>暂无数据</span>
            ) : (
              byDay.map((d) => {
                const pct = Math.round((d.count / maxDay) * 100);
                return (
                  <div key={d.date} className={styles.barRow}>
                    <span className={styles.barLabel}>{d.date.slice(5)}</span>
                    <div className={styles.barTrack}>
                      <div
                        className={styles.barFill}
                        style={{ width: `${pct}%`, backgroundColor: '#2563eb' }}
                      />
                    </div>
                    <span className={styles.barValue}>{d.count}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>统计</h2>
      {body}
    </div>
  );
}

export default StatsPage;
