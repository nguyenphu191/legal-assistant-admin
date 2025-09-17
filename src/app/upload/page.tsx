'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadService, UploadResponse, ProcessingStatus } from '../../services/uploadService';
import { UploadProgress } from '../../types';
import FileDropzone from '../../components/ui/FileDropzone';
import ProgressBar from '../../components/ui/ProgressBar';
import styles from './upload.module.css';

interface DocumentInfo {
  filename: string;
  documentType: string;
  documentNumber: string;
  issuingAgency: string;
  effectiveDate: string;
}

const UploadPage = () => {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo>({
    filename: '',
    documentType: 'Thông tư',
    documentNumber: '',
    issuingAgency: 'Bộ Lao động - Thương binh và Xã hội',
    effectiveDate: ''
  });
  const [isEditingInfo, setIsEditingInfo] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-extract document info from filename
  useEffect(() => {
    if (selectedFile) {
      const filename = selectedFile.name.replace('.pdf', '');
      setDocumentInfo(prev => ({
        ...prev,
        filename: filename,
        // Auto-detect document info from filename
        documentNumber: extractDocumentNumber(filename),
        effectiveDate: extractDate(filename) || getCurrentDate()
      }));
    }
  }, [selectedFile]);

  // Helper functions to extract info from filename
  const extractDocumentNumber = (filename: string): string => {
    const patterns = [
      /(\d+\/\d+\/[A-Z-]+)/,  // Pattern: 10/2020/TT-BLDTBXH
      /([A-Z]+\s+\d+\/\d+)/,  // Pattern: TT 10/2020
    ];
    
    for (const pattern of patterns) {
      const match = filename.match(pattern);
      if (match) return match[1];
    }
    return '';
  };

  const extractDate = (filename: string): string => {
    const datePattern = /(\d{1,2}\/\d{1,2}\/\d{4})/;
    const match = filename.match(datePattern);
    return match ? match[1] : '';
  };

  const getCurrentDate = (): string => {
    const today = new Date();
    return today.toLocaleDateString('vi-VN');
  };

  // Poll processing status when document is processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (uploadResult?.documentId && uploadProgress?.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const status = await uploadService.getProcessingStatus(uploadResult.documentId);
          setProcessingStatus(status);
          
          setUploadProgress(prev => prev ? {
            ...prev,
            progress: status.progress,
            status: status.status
          } : null);
          
          if (status.status === 'completed' || status.status === 'error') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Failed to get processing status:', err);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [uploadResult?.documentId, uploadProgress?.status]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setUploadProgress(null);
    setUploadResult(null);
    setProcessingStatus(null);
    setIsEditingInfo(true); // Enable editing when new file selected
  };

  const handleDocumentInfoChange = (field: keyof DocumentInfo, value: string) => {
    setDocumentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    // Validate required fields
    if (!documentInfo.documentNumber.trim()) {
      setError('Vui lòng nhập số văn bản');
      return;
    }

    if (!documentInfo.effectiveDate.trim()) {
      setError('Vui lòng nhập ngày hiệu lực');
      return;
    }

    setIsEditingInfo(false);
    setIsUploading(true);
    setError(null);

    try {
      // Validate file
      const validation = uploadService.validateFile(selectedFile);
      if (!validation.valid) {
        setError(validation.error || 'File không hợp lệ');
        setIsUploading(false);
        setIsEditingInfo(true);
        return;
      }

      // Start upload with document info
      const result = await uploadService.uploadPDF(selectedFile, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadResult(result);
      
      if (result.success) {
        setUploadProgress(prev => prev ? {
          ...prev,
          status: 'processing'
        } : {
          filename: selectedFile.name,
          progress: 100,
          status: 'processing'
        });
      }
      
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Có lỗi xảy ra trong quá trình upload. Vui lòng thử lại.');
      setUploadProgress(prev => prev ? {
        ...prev,
        status: 'error'
      } : null);
      setIsEditingInfo(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setDocumentInfo({
      filename: '',
      documentType: 'Thông tư',
      documentNumber: '',
      issuingAgency: 'Bộ Lao động - Thương binh và Xã hội',
      effectiveDate: ''
    });
    setUploadProgress(null);
    setUploadResult(null);
    setProcessingStatus(null);
    setError(null);
    setIsUploading(false);
    setIsEditingInfo(true);
  };

  const handleEditInfo = () => {
    setIsEditingInfo(true);
  };

  const handleViewDocument = () => {
    if (uploadResult?.documentId) {
      router.push(`/documents/${uploadResult.documentId}`);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const isProcessingComplete = uploadProgress?.status === 'completed';
  const hasError = uploadProgress?.status === 'error' || error;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button 
          onClick={handleBackToDashboard}
          className={styles.backButton}
        >
          ← Quay lại Dashboard
        </button>
        <h1 className={styles.title}>📤 UPLOAD TÀI LIỆU PHÁP LÝ</h1>
        <p className={styles.subtitle}>
          Tải lên file PDF và điều chỉnh thông tin tài liệu trước khi xử lý
        </p>
      </div>

      {/* Upload Area */}
      <div className={styles.uploadSection}>
        <div className={styles.sectionTitle}>
          <h2>📋 KÉO THẢ FILE PDF VÀO ĐÂY</h2>
          <p>hoặc <strong>CHỌN FILE</strong></p>
        </div>
        
        <FileDropzone
          onFileSelect={handleFileSelect}
          disabled={isUploading}
        />
      </div>

      {/* Editable File Info */}
      {selectedFile && (
        <div className={styles.fileInfoSection}>
          <div className={styles.sectionHeader}>
            <h2>📄 THÔNG TIN TÀI LIỆU:</h2>
            {!isEditingInfo && !isUploading && (
              <button 
                onClick={handleEditInfo}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                ✏️ CHỈNH SỬA
              </button>
            )}
          </div>
          
          <div className={styles.fileInfoCard}>
            <div className={styles.fileDetails}>
              <div className={styles.fileDetailRow}>
                <label className={styles.label}>Tên file:</label>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={documentInfo.filename}
                    onChange={(e) => handleDocumentInfoChange('filename', e.target.value)}
                    className={styles.input}
                    placeholder="Nhập tên tài liệu..."
                  />
                ) : (
                  <span className={styles.value}>{documentInfo.filename}</span>
                )}
              </div>

              <div className={styles.fileDetailRow}>
                <label className={styles.label}>Loại văn bản:</label>
                {isEditingInfo ? (
                  <select
                    value={documentInfo.documentType}
                    onChange={(e) => handleDocumentInfoChange('documentType', e.target.value)}
                    className={styles.select}
                  >
                    <option value="Thông tư">Thông tư</option>
                    <option value="Nghị định">Nghị định</option>
                    <option value="Quyết định">Quyết định</option>
                    <option value="Luật">Luật</option>
                    <option value="Pháp lệnh">Pháp lệnh</option>
                    <option value="Chỉ thị">Chỉ thị</option>
                  </select>
                ) : (
                  <span className={styles.value}>{documentInfo.documentType}</span>
                )}
              </div>

              <div className={styles.fileDetailRow}>
                <label className={styles.label}>Số văn bản: <span className={styles.required}>*</span></label>
                {isEditingInfo ? (
                  <input
                    type="text"
                    value={documentInfo.documentNumber}
                    onChange={(e) => handleDocumentInfoChange('documentNumber', e.target.value)}
                    className={styles.input}
                    placeholder="VD: 10/2020/TT-BLDTBXH"
                    required
                  />
                ) : (
                  <span className={styles.value}>{documentInfo.documentNumber}</span>
                )}
              </div>

              <div className={styles.fileDetailRow}>
                <label className={styles.label}>Cơ quan ban hành:</label>
                {isEditingInfo ? (
                  <select
                    value={documentInfo.issuingAgency}
                    onChange={(e) => handleDocumentInfoChange('issuingAgency', e.target.value)}
                    className={styles.select}
                  >
                    <option value="Bộ Lao động - Thương binh và Xã hội">Bộ Lao động - Thương binh và Xã hội</option>
                    <option value="Chính phủ">Chính phủ</option>
                    <option value="Quốc hội">Quốc hội</option>
                    <option value="Thủ tướng Chính phủ">Thủ tướng Chính phủ</option>
                    <option value="Bộ Tư pháp">Bộ Tư pháp</option>
                    <option value="Bộ Nội vụ">Bộ Nội vụ</option>
                  </select>
                ) : (
                  <span className={styles.value}>{documentInfo.issuingAgency}</span>
                )}
              </div>

              <div className={styles.fileDetailRow}>
                <label className={styles.label}>Ngày hiệu lực: <span className={styles.required}>*</span></label>
                {isEditingInfo ? (
                  <input
                    type="date"
                    value={documentInfo.effectiveDate ? 
                      new Date(documentInfo.effectiveDate.split('/').reverse().join('-')).toISOString().split('T')[0] : ''
                    }
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      handleDocumentInfoChange('effectiveDate', date.toLocaleDateString('vi-VN'));
                    }}
                    className={styles.input}
                    required
                  />
                ) : (
                  <span className={styles.value}>{documentInfo.effectiveDate}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing Status */}
      {uploadProgress && (
        <div className={styles.processingSection}>
          <div className={styles.sectionTitle}>
            <h2>⚙️ CÁI ĐẶT XỬ LÝ:</h2>
          </div>
          
          <div className={styles.processingCard}>
            <div className={styles.processingSettings}>
              <div className={styles.settingItem}>
                <span className={styles.settingIcon}>✅</span>
                <span>Kiểm tra chất lượng chunks</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingIcon}>✅</span>
                <span>Điểm chất lượng tối thiểu: 70/100</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingIcon}>✅</span>
                <span>Kích thước chunk tối đa: 512 tokens</span>
              </div>
              <div className={styles.settingItem}>
                <span className={styles.settingIcon}>✅</span>
                <span>Overlap giữa chunks: 10% tokens</span>
              </div>
            </div>
          </div>

          <ProgressBar
            progress={uploadProgress.progress}
            status={uploadProgress.status}
            filename={uploadProgress.filename || selectedFile?.name || ''}
            currentStep={processingStatus?.currentStep}
            chunksCreated={processingStatus?.chunksCreated}
            totalChunks={processingStatus?.totalChunks}
          />
        </div>
      )}

      {/* Actions */}
      <div className={styles.actionsSection}>
        <div className={styles.sectionTitle}>
          <h2>📤 UPLOAD VÀ XỬ LÝ:</h2>
        </div>
        
        <div className={styles.actionButtons}>
          {selectedFile && isEditingInfo && !isUploading && (
            <button
              onClick={handleStartUpload}
              className={`${styles.button} ${styles.buttonPrimary}`}
            >
              🚀 BẮT ĐẦU UPLOAD
            </button>
          )}

          {!isProcessingComplete && !hasError && (
            <button
              onClick={handleReset}
              disabled={isUploading}
              className={`${styles.button} ${styles.buttonSecondary}`}
            >
              ❌ HỦY
            </button>
          )}
          
          {isProcessingComplete && (
            <>
              <button
                onClick={handleViewDocument}
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                👁️ XEM TÀI LIỆU
              </button>
              
              <button
                onClick={handleReset}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                📤 UPLOAD TIẾP
              </button>
            </>
          )}
          
          {hasError && (
            <button
              onClick={handleReset}
              className={`${styles.button} ${styles.buttonWarning}`}
            >
              🔄 THỬ LẠI
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorSection}>
          <div className={styles.errorCard}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorMessage}>{error}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {isProcessingComplete && uploadResult && (
        <div className={styles.successSection}>
          <div className={styles.successCard}>
            <span className={styles.successIcon}>🎉</span>
            <div className={styles.successContent}>
              <h3>Upload thành công!</h3>
              <p>
                Tài liệu <strong>{documentInfo.filename}</strong> đã được xử lý thành công.
                {uploadResult.processingInfo && (
                  <span>
                    {' '}Tạo được <strong>{uploadResult.processingInfo.totalChunks}</strong> chunks.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;