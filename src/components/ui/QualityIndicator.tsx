'use client';
import styles from './QualityIndicator.module.css';

interface QualityIndicatorProps {
  score: number;
  showLabel?: boolean;
}

const QualityIndicator = ({ score, showLabel = true }: QualityIndicatorProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#059669'; // green
    if (score >= 75) return '#d97706'; // orange
    return '#dc2626'; // red
  };

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Tốt';
    if (score >= 75) return 'Khá';
    return 'Cần sửa';
  };

  return (
    <div className={styles.indicator}>
      <div 
        className={styles.scoreCircle}
        style={{ borderColor: getScoreColor(score) }}
      >
        <span 
          className={styles.scoreNumber}
          style={{ color: getScoreColor(score) }}
        >
          {score}
        </span>
      </div>
      {showLabel && (
        <span 
          className={styles.scoreLabel}
          style={{ color: getScoreColor(score) }}
        >
          {getScoreText(score)}
        </span>
      )}
    </div>
  );
};

export default QualityIndicator;