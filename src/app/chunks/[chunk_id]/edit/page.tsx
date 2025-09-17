'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Chunk, ValidationIssue } from '../../../../types';
import { chunkService } from '../../../../services/chunkService';
import ChunkEditor from '../../../../components/ui/ChunkEditor';
import styles from './edit.module.css';

interface EditChunkPageProps {
  params: {
    chunk_id: string;
  };
}

const EditChunkPage = ({ params }: EditChunkPageProps) => {
  const router = useRouter();
  const [chunk, setChunk] = useState<Chunk | null>(null);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
  const [qualityScore, setQualityScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadChunkData();
  }, [params.chunk_id]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges && content !== originalContent) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, content, originalContent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // Ctrl+Enter to approve
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleApprove();
      }
      // Esc to go back
      if (e.key === 'Escape') {
        handleBack();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadChunkData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const chunkData = await chunkService.getChunkById(params.chunk_id);
      
      setChunk(chunkData);
      setContent(chunkData.content);
      setOriginalContent(chunkData.content);
      setValidationIssues(chunkData.validationIssues || []);
      setQualityScore(chunkData.qualityScore || 0);
    } catch (err) {
      setError('Không thể tải dữ liệu chunk');
      console.error('Chunk loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== originalContent);
  };

  const handleValidate = async (content: string) => {
    try {
      setValidating(true);
      const result = await chunkService.validateChunk(content);
      setValidationIssues(result.validationIssues);
      setQualityScore(result.qualityScore);
    } catch (err) {
      console.error('Validation error:', err);
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!chunk || content === originalContent) return;
    
    try {
      setSaving(true);
      const success = await chunkService.updateChunk(chunk.id, content);
      
      if (success) {
        setOriginalContent(content);
        setHasUnsavedChanges(false);
        // Show success message
        console.log('Chunk saved successfully');
      } else {
        throw new Error('Failed to save chunk');
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('Không thể lưu chunk. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSave = async () => {
    if (!chunk || content === originalContent) return;
    
    try {
      await chunkService.updateChunk(chunk.id, content);
      setOriginalContent(content);
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  };

  const handleApprove = async () => {
    if (!chunk) return;
    
    try {
      // Save first if there are changes
      if (hasUnsavedChanges) {
        await handleSave();
      }
      
      const success = await chunkService.approveChunk(chunk.id);
      if (success) {
        router.push(`/documents/${chunk.documentId}`);
      }
    } catch (err) {
      console.error('Approve error:', err);
      alert('Không thể duyệt chunk. Vui lòng thử lại.');
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      const confirmLeave = confirm('Bạn có thay đổi chưa lưu. Bạn có muốn rời khỏi trang?');
      if (!confirmLeave) return;
    }
    
    if (chunk) {
      router.push(`/documents/${chunk.documentId}`);
    } else {
      router.push('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu chunk...</p>
        </div>
      </div>
    );
  }

  if (error || !chunk) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>⚠️ Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={loadChunkData} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <button 
            onClick={handleBack}
            className={styles.backButton}
          >
            ← Quay lại
          </button>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>
              🔧 CHỈNH SỬA CHUNK - Thông tự 10/2020/BLDTBXH
            </h1>
            <div className={styles.chunkInfo}>
              <span className={styles.chunkId}>📑 Chunk ID: {chunk.id}</span>
              <span className={styles.chunkStatus}>
                Trạng thái: {chunk.status === 'needs_review' ? '❌ Cần sửa' : chunk.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Section */}
      <div className={styles.editorSection}>
        <ChunkEditor
          initialContent={content}
          onContentChange={handleContentChange}
          onValidate={handleValidate}
          validationIssues={validationIssues}
          qualityScore={qualityScore}
          isValidating={validating}
        />
      </div>

      {/* Suggestions Panel */}
      <div className={styles.suggestionsPanel}>
        <h3 className={styles.suggestionsTitle}>💡 GỢI Ý CHỈNH SỬA:</h3>
        <div className={styles.suggestionsList}>
          <div className={styles.suggestionItem}>
            <strong>Thêm context:</strong> "Điều 3. Nội dung chủ yếu của hợp đồng lao động. Thông tin về họ tên, ngày tháng năm..."
          </div>
          <div className={styles.suggestionItem}>
            <strong>Thiếu câu trúc pháp lý rõ ràng</strong>
          </div>
        </div>
      </div>

      {/* Actions Panel */}
      <div className={styles.actionsPanel}>
        <h3 className={styles.actionsTitle}>⚡ NỘI DUNG CHUNK:</h3>
        <div className={styles.contentPreview}>
          {content || '[Nhập lý do chỉnh sửa...]'}
        </div>
        
        <div className={styles.actionButtons}>
          <button 
            onClick={handleSave}
            disabled={saving || !hasUnsavedChanges}
            className={`${styles.button} ${styles.saveButton}`}
          >
            💾 {saving ? 'Đang lưu...' : 'LƯU'}
          </button>
          
          <button 
            onClick={() => router.push(`/documents/${chunk.documentId}`)}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            🔄 HOÀN TÁC
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className={`${styles.button} ${styles.previewButton}`}
          >
            👁️ XEM TRƯỚC
          </button>
          
          <button 
            onClick={handleApprove}
            className={`${styles.button} ${styles.approveButton}`}
          >
            ✅ DUYỆT
          </button>
        </div>
      </div>

      {/* Keyboard shortcuts info */}
      <div className={styles.shortcutsInfo}>
        <span>💡 Phím tắt: Ctrl+S (Lưu) | Ctrl+Enter (Duyệt) | Esc (Quay lại)</span>
      </div>
    </div>
  );
};

export default EditChunkPage;