import { useEffect, useRef, useState, type ReactElement } from 'react';
import { useReviewStore } from '../store/reviewStore';
import type { Card, ReviewFeedback } from '../types/card.type';
import CardFlip from '../components/card/CardFlip';
import Button from '../components/common/Button';
import ErrorMessage from '../components/common/ErrorMessage';
import styles from './TodayReviewPage.module.css';

// 复习统计视图模型（types 层未登记，仅本页用于展示；形状对齐 contracts.md #17）。
interface ReviewStats {
  byFeedback: { feedback: ReviewFeedback; count: number }[];
  byDay: { date: string; count: number }[];
}

const FEEDBACK_LABELS: Record<ReviewFeedback, string> = {
  forget: '忘记',
  fuzzy: '模糊',
  remember: '记住',
};

// 今日复习页：拉取待复习 → 翻卡 → 计时反馈 → 推进 → 完成态 + 统计。
// 所有数据操作经 reviewStore，不直接调 service；复习间隔与难度系数仅在后端计算，前端不触碰。
function TodayReviewPage(): ReactElement {
  const todayCards = useReviewStore((s) => s.todayCards);
  const currentIndex = useReviewStore((s) => s.currentIndex);
  const stats = useReviewStore((s) => s.stats);
  const submitting = useReviewStore((s) => s.submitting);
  const loading = useReviewStore((s) => s.loading);
  const error = useReviewStore((s) => s.error);
  const fetchToday = useReviewStore((s) => s.fetchToday);
  const submitReview = useReviewStore((s) => s.submitReview);
  const fetchStats = useReviewStore((s) => s.fetchStats);

  const [flipped, setFlipped] = useState(false);

  // 计时起点：每张卡 front 展示时记录；本轮已复习计数与初始总量用于 mock 完成态判定。
  const startRef = useRef<number>(Date.now());
  const reviewedCountRef = useRef<number>(0);
  const initialTotalRef = useRef<number | null>(null);

  const currentCard: Card | undefined = todayCards[currentIndex];

  // 进入页面：拉取今日待复习 + 当日统计。
  useEffect(() => {
    void fetchToday();
    void fetchStats();
  }, [fetchToday, fetchStats]);

  // 捕获本轮初始卡片总量（mock 数据静态，完成态靠本地计数判定）。
  useEffect(() => {
    if (initialTotalRef.current === null && todayCards.length > 0) {
      initialTotalRef.current = todayCards.length;
    }
  }, [todayCards]);

  // 切换卡片（id 变化）：翻面复位 + 计时起点重置。
  useEffect(() => {
    if (!currentCard) return;
    setFlipped(false);
    startRef.current = Date.now();
  }, [currentCard?.id]);

  // 进入完成态时补拉一次统计，保证摘要为最新。
  const isComplete =
    todayCards.length === 0 ||
    (initialTotalRef.current !== null && reviewedCountRef.current >= initialTotalRef.current);
  useEffect(() => {
    if (isComplete && !stats) void fetchStats();
  }, [isComplete, stats, fetchStats]);

  const handleFeedback = (feedback: ReviewFeedback): void => {
    if (submitting || isComplete || !currentCard) return;
    // 计时：从 front 展示到反馈点击（毫秒）。
    const durationMs = Date.now() - startRef.current;
    reviewedCountRef.current += 1;
    void submitReview(currentCard.id, feedback, durationMs);
  };

  // 快捷键 1/2/3 对应 忘记/模糊/记住（非花哨交互，仅键盘可达性）。
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === '1') handleFeedback('forget');
      else if (e.key === '2') handleFeedback('fuzzy');
      else if (e.key === '3') handleFeedback('remember');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [submitting, isComplete, currentCard]);

  const handleRestart = (): void => {
    reviewedCountRef.current = 0;
    initialTotalRef.current = null;
    void fetchToday();
  };

  const renderStatsSummary = (s: ReviewStats | null): ReactElement => {
    if (!s) return <p className={styles.statsHint}>（暂无统计数据）</p>;
    const totalReviews = s.byFeedback.reduce((sum, item) => sum + item.count, 0);
    return (
      <div className={styles.statsBox}>
        <div className={styles.statsRow}>
          <span>今日复习总次数</span>
          <strong>{totalReviews}</strong>
        </div>
        {(['remember', 'fuzzy', 'forget'] as ReviewFeedback[]).map((fb) => {
          const item = s.byFeedback.find((it) => it.feedback === fb);
          return (
            <div key={fb} className={styles.statsRow}>
              <span>{FEEDBACK_LABELS[fb]}</span>
              <strong>{item ? item.count : 0}</strong>
            </div>
          );
        })}
      </div>
    );
  };

  // 完成态。空队列（无待复习）也走此分支。
  if (isComplete) {
    return (
      <div className={styles.page}>
        <div className={styles.complete}>
          <h2 className={styles.completeTitle}>
            {todayCards.length === 0 ? '今日没有待复习的卡片 🎉' : '本轮复习完成！🎉'}
          </h2>
          {renderStatsSummary(stats)}
          <Button onClick={handleRestart} className={styles.restartBtn}>
            再来一轮
          </Button>
        </div>
      </div>
    );
  }

  // 加载中且无卡片可显示。
  if (!currentCard) {
    return (
      <div className={styles.page}>
        <div className={styles.center}>{loading ? '加载中…' : '暂无数据'}</div>
      </div>
    );
  }

  const total = todayCards.length;
  const progressNow = currentIndex + 1;

  return (
    <div className={styles.page}>
      <ErrorMessage message={error} />

      <div className={styles.progressHead}>
        <span className={styles.progressText}>
          进度 {progressNow} / {total}
        </span>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(progressNow / total) * 100}%` }} />
        </div>
      </div>

      <CardFlip card={currentCard} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <p className={styles.hint}>{flipped ? '点击下方按钮记录掌握程度' : '点击卡片查看答案'}</p>

      <div className={styles.feedbackBar}>
        {(['forget', 'fuzzy', 'remember'] as ReviewFeedback[]).map((fb) => (
          <Button
            key={fb}
            onClick={() => handleFeedback(fb)}
            loading={submitting}
            disabled={submitting}
            className={`${styles.feedbackBtn} ${styles[`fb_${fb}`]}`}
          >
            {FEEDBACK_LABELS[fb]}
          </Button>
        ))}
      </div>

      {error && (
        <div className={styles.retryRow}>
          <Button onClick={() => void fetchToday()}>重试加载</Button>
        </div>
      )}
    </div>
  );
}

export default TodayReviewPage;
