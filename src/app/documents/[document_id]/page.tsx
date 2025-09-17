'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Document, Chunk } from '../../../types';
import { documentService } from '../../../services/documentService';
import ChunkCard from '../../../components/ui/ChunkCard';
import styles from './document.module.css';

interface DocumentDetailPageProps {
  params: {
    document_id: string;
  };
}

const DocumentDetailPage = ({ params }: DocumentDetailPageProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [selectedChunks, setSelectedChunks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'needs_review'>('all');

  useEffect(() => {
    loadDocumentData();
  }, [params.document_id]);

  const loadDocumentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [docData, chunksData] = await Promise.all([
        documentService.getDocumentById(params.document_id),
        documentService.getDocumentChunks(params.document_id)
      ]);
      
      setDocument(docData);
      setChunks(chunksData);
    } catch (err) {
      setError('Không thể tải dữ liệu tài liệu');
      console.error('Document loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChunkSelect = (chunkId: string, selected: boolean) => {
    const newSelected = new Set(selectedChunks);
    if (selected) {
      newSelected.add(chunkId);
    } else {
      newSelected.delete(chunkId);
    }
    setSelectedChunks(newSelected);
  };

  const handleSelectAll = () => {
    const filteredChunks = getFilteredChunks();
    if (selectedChunks.size === filteredChunks.length) {
      setSelectedChunks(new Set());
    } else {
      setSelectedChunks(new Set(filteredChunks.map(chunk => chunk.id)));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedChunks.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const success = await documentService.approveChunks(Array.from(selectedChunks));
      if (success) {
        await loadDocumentData();
        setSelectedChunks(new Set());
      }
    } catch (err) {
      console.error('Bulk approve error:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (selectedChunks.size === 0) return;
    
    setBulkActionLoading(true);
    try {
      const success = await documentService.importChunks(Array.from(selectedChunks));
      if (success) {
        await loadDocumentData();
        setSelectedChunks(new Set());
      }
    } catch (err) {
      console.error('Bulk import error:', err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleChunkEdit = (chunkId: string) => {
    router.push(`/chunks/${chunkId}/edit`);
  };

  const getFilteredChunks = () => {
    if (filter === 'all') return chunks;
    return chunks.filter(chunk => chunk.status === filter);
  };

  const getStatusStats = () => {
    return {
      total: chunks.length,
      pending: chunks.filter(c => c.status === 'pending').length,
      approved: chunks.filter(c => c.status === 'approved').length,
      needsReview: chunks.filter(c => c.status === 'needs_review').length,
      rejected: chunks.filter(c => c.status === 'rejected').length
    };
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>⚠️ Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={loadDocumentData} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const filteredChunks = getFilteredChunks();
  const stats = getStatusStats();

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.documentInfo}>
          <button 
            onClick={() => router.push('/dashboard')}
            className={styles.backButton}
          >
            ← Quay lại Dashboard
          </button>
          <h1 className={styles.title}>{document.filename}</h1>
          <div className={styles.documentStats}>
            <span>📅 Tải lên: {new Date(document.uploadDate).toLocaleDateString('vi-VN')}</span>
            <span>📊 {document.totalChunks} chunks tổng cộng</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className={styles.statsBar}>
        <div className={styles.statsGrid}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{stats.total}</span>
            <span className={styles.statLabel}>Tổng cộng</span>
          </div>
          <div className={`${styles.statItem} ${styles.statPending}`}>
            <span className={styles.statNumber}>{stats.pending}</span>
            <span className={styles.statLabel}>Chờ duyệt</span>
          </div>
          <div className={`${styles.statItem} ${styles.statApproved}`}>
            <span className={styles.statNumber}>{stats.approved}</span>
            <span className={styles.statLabel}>Đã duyệt</span>
          </div>
          <div className={`${styles.statItem} ${styles.statNeedsReview}`}>
            <span className={styles.statNumber}>{stats.needsReview}</span>
            <span className={styles.statLabel}>Cần sửa</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <div className={styles.filterControls}>
          <label>Lọc theo trạng thái:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value as any)}
            className={styles.filterSelect}
          >
            <option value="all">Tất cả ({stats.total})</option>
            <option value="pending">Chờ duyệt ({stats.pending})</option>
            <option value="approved">Đã duyệt ({stats.approved})</option>
            <option value="needs_review">Cần sửa ({stats.needsReview})</option>
          </select>
        </div>

        <div className={styles.bulkActions}>
          <button
            onClick={handleSelectAll}
            className={`${styles.button} ${styles.buttonSecondary}`}
          >
            {selectedChunks.size === filteredChunks.length ? '❌ Bỏ chọn tất cả' : '✅ Chọn tất cả'}
          </button>
          
          {selectedChunks.size > 0 && (
            <>
              <button
                onClick={handleBulkApprove}
                disabled={bulkActionLoading}
                className={`${styles.button} ${styles.buttonSuccess}`}
              >
                ✅ Duyệt {selectedChunks.size} chunks
              </button>
              
              <button
                onClick={handleBulkImport}
                disabled={bulkActionLoading}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                📤 Import {selectedChunks.size} chunks
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chunks List */}
      <div className={styles.chunksList}>
        {filteredChunks.length > 0 ? (
          filteredChunks.map((chunk) => (
            <ChunkCard
              key={chunk.id}
              chunk={chunk}
              isSelected={selectedChunks.has(chunk.id)}
              onSelect={handleChunkSelect}
              onEdit={handleChunkEdit}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>Không có chunks nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentDetailPage;