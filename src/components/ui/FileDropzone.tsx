'use client';
import { useState, useRef, DragEvent } from 'react';
import styles from './FileDropzone.module.css';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

const FileDropzone = ({ 
  onFileSelect, 
  accept = '.pdf', 
  maxSize = 50,
  disabled = false 
}: FileDropzoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    setError(null);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSelectFile(files[0]);
    }
  };

  const validateAndSelectFile = (file: File) => {
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Chỉ chấp nhận file PDF');
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File quá lớn. Kích thước tối đa ${maxSize}MB`);
      return;
    }

    // File valid
    onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className={styles.fileInput}
          disabled={disabled}
        />
        
        <div className={styles.dropzoneContent}>
          <div className={styles.icon}>📄</div>
          <div className={styles.text}>
            <p className={styles.mainText}>
              {disabled ? 'Đang xử lý...' : 'Kéo thả file PDF vào đây'}
            </p>
            <p className={styles.subText}>
              hoặc <span className={styles.clickText}>chọn file</span>
            </p>
          </div>
          <div className={styles.requirements}>
            <p>📋 Yêu cầu:</p>
            <ul>
              <li>Định dạng: PDF</li>
              <li>Kích thước tối đa: {maxSize}MB</li>
              <li>Nội dung: Văn bản pháp lý tiếng Việt</li>
            </ul>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FileDropzone;