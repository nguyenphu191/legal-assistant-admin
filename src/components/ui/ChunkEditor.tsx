'use client';
import { useState, useEffect, useCallback } from 'react';
import { ValidationIssue } from '../../types';
import styles from './ChunkEditor.module.css';

interface ChunkEditorProps {
  initialContent: string;
  onContentChange: (content: string) => void;
  onValidate: (content: string) => void;
  validationIssues: ValidationIssue[];
  qualityScore: number;
  isValidating: boolean;
}

const ChunkEditor = ({ 
  initialContent, 
  onContentChange, 
  onValidate,
  validationIssues,
  qualityScore,
  isValidating 
}: ChunkEditorProps) => {
  const [content, setContent] = useState(initialContent);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  // Debounce validation
  const debouncedValidate = useCallback(
    debounce((content: string) => {
      if (content.trim()) {
        onValidate(content);
      }
    }, 1000),
    [onValidate]
  );

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setIsDirty(true);
    onContentChange(newContent);
    
    // Auto validate after user stops typing
    debouncedValidate(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.target as HTMLTextAreaElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const newContent = content.substring(0, start) + '  ' + content.substring(end);
      setContent(newContent);
      onContentChange(newContent);
      
      // Set cursor position after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return '#059669'; // green
    if (score >= 60) return '#d97706'; // orange
    return '#dc2626'; // red
  };

  const getQualityText = (score: number) => {
    if (score >= 80) return 'Tốt';
    if (score >= 60) return 'Cần cải thiện';
    return 'Cần sửa nhiều';
  };

  return (
    <div className={styles.editor}>
      <div className={styles.editorHeader}>
        <div className={styles.qualityInfo}>
          <span className={styles.qualityLabel}>Quality Score:</span>
          <div 
            className={styles.qualityScore}
            style={{ color: getQualityColor(qualityScore) }}
          >
            {qualityScore}/100 
            <span className={styles.qualityText}>
              ({getQualityText(qualityScore)})
            </span>
          </div>
          {isValidating && (
            <span className={styles.validatingIndicator}>🔄 Đang kiểm tra...</span>
          )}
        </div>
        
        <div className={styles.editorStats}>
          <span>Ký tự: {content.length}</span>
          <span>Dòng: {content.split('\n').length}</span>
          {isDirty && <span className={styles.dirtyIndicator}>● Chưa lưu</span>}
        </div>
      </div>

      <div className={styles.editorBody}>
        <textarea
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          className={styles.textarea}
          placeholder="Nhập nội dung chunk tại đây..."
          spellCheck={false}
        />
      </div>

      {validationIssues.length > 0 && (
        <div className={styles.validationPanel}>
          <h4 className={styles.validationTitle}>🔍 VẤN ĐỀ PHÁT HIỆN:</h4>
          <div className={styles.validationList}>
            {validationIssues.map((issue, index) => (
              <div 
                key={index}
                className={`${styles.validationItem} ${styles[`validation${capitalize(issue.type)}`]}`}
              >
                <span className={styles.validationIcon}>
                  {issue.type === 'error' ? '❌' : issue.type === 'warning' ? '⚠️' : '💡'}
                </span>
                <div className={styles.validationContent}>
                  <span className={styles.validationMessage}>{issue.message}</span>
                  {issue.line && (
                    <span className={styles.validationLocation}>
                      Dòng {issue.line}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Utility functions
function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default ChunkEditor;