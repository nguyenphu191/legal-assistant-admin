'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chunk } from '../../types';
import QualityIndicator from './QualityIndicator';
import ValidationIssues from './ValidationIssues';
import styles from './ChunkCard.module.css';

interface ChunkCardProps {
  chunk: Chunk;
  isSelected: boolean;
  onSelect: (chunkId: string, selected: boolean) => void;
  onEdit: (chunkId: string) => void;
}

const ChunkCard = ({ chunk, isSelected, onSelect, onEdit }: ChunkCardProps) => {
  const router = useRouter();

  const getStatusIcon = (status: Chunk['status']) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'rejected':
        return '❌';
      case 'needs_review':
        return '⚠️';
      default:
        return '⏳';
    }
  };

  const getStatusText = (status: Chunk['status']) => {
    switch (status) {
      case 'approved':
        return 'ĐÃ DUYỆT';
      case 'rejected':
        return 'TỪ CHỐI';
      case 'needs_review':
        return 'CẦN SỬA';
      default:
        return 'CHỜ DUYỆT';
    }
  };

  const getStatusClass = (status: Chunk['status']) => {
    switch (status) {
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'needs_review':
        return styles.statusNeedsReview;
      default:
        return styles.statusPending;
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(chunk.id, e.target.checked);
  };

  const handleEditClick = () => {
    console.log('Navigating to chunk edit:', chunk.id);
    // Navigate to chunk edit page
    router.push(`/chunks/${chunk.id}/edit`);
  };

  const formatContent = (content: string) => {
    if (content.length > 200) {
      return content.substring(0, 200) + '...';
    }
    return content;
  };

  return (
    <div className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}>
      <div className={styles.header}>
        <div className={styles.selectArea}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxChange}
            className={styles.checkbox}
          />
          <span className={styles.chunkId}>#{chunk.id}</span>
        </div>
        
        <div className={styles.statusArea}>
          {chunk.qualityScore && (
            <QualityIndicator score={chunk.qualityScore} />
          )}
          <div className={`${styles.status} ${getStatusClass(chunk.status)}`}>
            <span className={styles.statusIcon}>{getStatusIcon(chunk.status)}</span>
            <span>{getStatusText(chunk.status)}</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.chunkContent}>
          {formatContent(chunk.content)}
        </div>
      </div>

      {chunk.validationIssues && chunk.validationIssues.length > 0 && (
        <ValidationIssues issues={chunk.validationIssues} />
      )}

      <div className={styles.footer}>
        <div className={styles.timestamps}>
          <span>Tạo: {new Date(chunk.createdAt).toLocaleString('vi-VN')}</span>
          <span>Sửa: {new Date(chunk.updatedAt).toLocaleString('vi-VN')}</span>
        </div>
        
        <div className={styles.actions}>
          <button 
            onClick={handleEditClick}
            className={`${styles.button} ${styles.buttonEdit}`}
            title={`Chỉnh sửa chunk ${chunk.id}`}
          >
            ✏️ CHỈNH SỬA
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChunkCard;