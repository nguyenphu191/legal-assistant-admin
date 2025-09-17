import { apiClient } from '../configs/api';
import { UploadProgress } from '../types';

export interface UploadResponse {
  success: boolean;
  documentId: string;
  filename: string;
  message: string;
  processingInfo?: {
    totalChunks: number;
    estimatedTime: string;
  };
}

export interface ProcessingStatus {
  documentId: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  chunksCreated: number;
  totalChunks: number;
  errorMessage?: string;
}

export const uploadService = {
  // Upload PDF file
  async uploadPDF(
    file: File, 
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'legal');
      formData.append('auto_process', 'true');

      const response = await apiClient.post('/api/v1/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress({
              filename: file.name,
              progress,
              status: 'uploading'
            });
          }
        }
      });

      if (response && response.data) {
        return response.data;
      }

      throw new Error('No response data from API');
    } catch (error) {
      console.warn('API upload failed, simulating upload process');
      
      // Simulate upload progress for demo
      return new Promise((resolve, reject) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 20;
          if (progress > 100) progress = 100;
          
          if (onProgress) {
            onProgress({
              filename: file.name,
              progress: Math.round(progress),
              status: progress < 100 ? 'uploading' : 'processing'
            });
          }
          
          if (progress >= 100) {
            clearInterval(interval);
            
            // Simulate processing result
            setTimeout(() => {
              resolve({
                success: true,
                documentId: `doc_${Date.now()}`,
                filename: file.name,
                message: 'Tải lên và xử lý thành công',
                processingInfo: {
                  totalChunks: Math.floor(Math.random() * 30) + 10, // 10-40 chunks
                  estimatedTime: '2-3 phút'
                }
              });
            }, 1000);
          }
        }, 200);
      });
    }
  },

  // Get processing status
  async getProcessingStatus(documentId: string): Promise<ProcessingStatus> {
    try {
      const response = await apiClient.get(`/api/v1/documents/${documentId}/status`);
      
      if (response && response.data) {
        return response.data;
      }
      
      throw new Error('No status data from API');
    } catch (error) {
      console.warn('API status check failed, simulating status');
      
      // Simulate processing status
      const statuses = ['processing', 'completed'];
      const currentStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const progress = currentStatus === 'completed' ? 100 : Math.floor(Math.random() * 80) + 10;
      
      return {
        documentId,
        status: currentStatus as any,
        progress,
        currentStep: currentStatus === 'completed' ? 'Hoàn thành' : 'Đang tạo chunks...',
        chunksCreated: Math.floor((progress / 100) * 25),
        totalChunks: 25
      };
    }
  },

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        valid: false,
        error: 'Chỉ chấp nhận file PDF'
      };
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File quá lớn. Kích thước tối đa 50MB'
      };
    }

    // Check filename
    const allowedExtensions = ['.pdf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'Định dạng file không được hỗ trợ'
      };
    }

    return { valid: true };
  },

  // Get upload history
  async getUploadHistory(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/v1/documents/upload-history');
      return response.data || [];
    } catch (error) {
      console.warn('Failed to get upload history');
      return [];
    }
  }
};