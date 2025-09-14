'use client';
import { useRouter } from 'next/navigation';
import { Document } from '../../types';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard = ({ document }: DocumentCardProps) => {
  const router = useRouter();

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'pending_review':
        return '❌';
      case 'processing':
        return '⏳';
      case 'error':
        return '⚠️';
      default:
        return '📄';
    }
  };

  const getStatusText = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return 'ĐÃ DUYỆT TẤT CẢ';
      case 'pending_review':
        return 'CẦN SỬA';
      case 'processing':
        return 'ĐANG XỬ LÝ';
      case 'error':
        return 'LỖI';
      default:
        return 'CHƯA XỬ LÝ';
    }
  };

  const getStatusClass = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return styles.statusCompleted;
      case 'pending_review':
        return styles.statusPending;
      case 'processing':
        return styles.statusProcessing;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusDefault;
    }
  };

  const handleViewDetails = () => {
    router.push(`/documents/${document.id}`);
  };

  const handleReview = () => {
    router.push(`/documents/${document.id}?tab=review`);
  };

  const handleImport = () => {
    // Handle import functionality
    console.log('Import document:', document.id);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.documentInfo}>
          <span className={styles.icon}>📄</span>
          <div className={styles.details}>
            <h4 className={styles.filename}>{document.filename}</h4>
            <div className={styles.stats}>
              📊 {document.totalChunks} chunks | 
              ✅ {document.approvedChunks} hợp lệ | 
              ❌ {document.pendingChunks} cần sửa
            </div>
          </div>
        </div>
        
        <div className={`${styles.status} ${getStatusClass(document.status)}`}>
          <span className={styles.statusIcon}>{getStatusIcon(document.status)}</span>
          <span className={styles.statusText}>{getStatusText(document.status)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button 
          onClick={handleViewDetails}
          className={`${styles.button} ${styles.buttonPrimary}`}
        >
          XEM CHI TIẾT
        </button>
        
        {document.status === 'pending_review' && (
          <button 
            onClick={handleReview}
            className={`${styles.button} ${styles.buttonWarning}`}
          >
            DUYỆT TẤT CẢ
          </button>
        )}
        
        {document.status === 'completed' && (
          <button 
            onClick={handleImport}
            className={`${styles.button} ${styles.buttonSuccess}`}
          >
            IMPORT
          </button>
        )}
        
        <button className={`${styles.button} ${styles.buttonSecondary}`}>
          CÀI ĐẶT
        </button>
      </div>
    </div>
  );
};

export default DocumentCard;