'use client';
import { useEffect, useState } from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // 0-100
  status: 'uploading' | 'processing' | 'completed' | 'error';
  filename: string;
  currentStep?: string;
  chunksCreated?: number;
  totalChunks?: number;
}

const ProgressBar = ({ 
  progress, 
  status, 
  filename, 
  currentStep,
  chunksCreated = 0,
  totalChunks = 0 
}: ProgressBarProps) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Animate progress change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return '📤';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '📄';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Đang tải lên...';
      case 'processing':
        return 'Đang xử lý...';
      case 'completed':
        return 'Hoàn thành';
      case 'error':
        return 'Có lỗi xảy ra';
      default:
        return 'Đang chuẩn bị...';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'uploading':
        return styles.statusUploading;
      case 'processing':
        return styles.statusProcessing;
      case 'completed':
        return styles.statusCompleted;
      case 'error':
        return styles.statusError;
      default:
        return '';
    }
  };

  const getProgressColor = () => {
    switch (status) {
      case 'uploading':
        return '#3b82f6'; // blue
      case 'processing':
        return '#f59e0b'; // amber
      case 'completed':
        return '#10b981'; // green
      case 'error':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.fileInfo}>
          <span className={styles.statusIcon}>{getStatusIcon()}</span>
          <div className={styles.details}>
            <div className={styles.filename}>{filename}</div>
            <div className={`${styles.status} ${getStatusClass()}`}>
              {getStatusText()}
              {currentStep && (
                <span className={styles.step}> - {currentStep}</span>
              )}
            </div>
          </div>
        </div>
        <div className={styles.progressText}>
          {displayProgress}%
        </div>
      </div>

      <div className={styles.progressBarContainer}>
        <div 
          className={styles.progressBar}
          style={{
            width: `${displayProgress}%`,
            backgroundColor: getProgressColor()
          }}
        >
          <div className={styles.progressBarGlow}></div>
        </div>
      </div>

      {status === 'processing' && totalChunks > 0 && (
        <div className={styles.processingInfo}>
          <div className={styles.chunksInfo}>
            <span className={styles.chunksIcon}>📝</span>
            <span>
              Đã tạo {chunksCreated}/{totalChunks} chunks
            </span>
          </div>
          <div className={styles.processingDetails}>
            <div className={styles.processingStep}>
              {currentStep || 'Đang phân tích nội dung...'}
            </div>
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className={styles.completedInfo}>
          <div className={styles.successMessage}>
            <span className={styles.successIcon}>🎉</span>
            <span>Tải lên và xử lý thành công!</span>
          </div>
          {totalChunks > 0 && (
            <div className={styles.resultStats}>
              <span>📊 Tạo được {totalChunks} chunks</span>
              <span>⏱️ Thời gian xử lý: {Math.round(totalChunks * 0.1)}s</span>
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorInfo}>
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <span>Không thể xử lý file. Vui lòng thử lại.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;