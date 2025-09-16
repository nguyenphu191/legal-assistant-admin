import { apiClient } from '../configs/api';
import { Document, Chunk, ApiResponse, PaginatedResponse } from '../types';

export const documentService = {
  // Lấy chi tiết tài liệu
  async getDocumentById(documentId: string): Promise<Document> {
    try {
      const response = await apiClient.get(`/api/v1/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      // Return mock data for development
      return {
        id: documentId,
        filename: `Document ${documentId}`,
        uploadDate: '2024-01-15',
        totalChunks: 24,
        approvedChunks: 2,
        pendingChunks: 22,
        status: 'pending_review'
      };
    }
  },

  // Lấy tất cả chunks của một tài liệu
  async getDocumentChunks(documentId: string): Promise<Chunk[]> {
    try {
      const response = await apiClient.get(`/api/v1/chunk-management/documents/${documentId}/chunks`);
      return response.data?.chunks || [];
    } catch (error) {
      console.error('Error fetching document chunks:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          documentId: documentId,
          content: 'Điều 1. Phạm vi điều chỉnh\n\nNghị định này quy định về việc thực hiện các quy định của pháp luật về lao động...',
          status: 'pending',
          qualityScore: 85,
          validationIssues: [
            {
              type: 'warning',
              message: 'Có thể cần thêm dấu phẩy sau "pháp luật"',
              line: 3,
              column: 45
            }
          ],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          documentId: documentId,
          content: 'Điều 2. Đối tượng áp dụng\n\n1. Nghị định này áp dụng đối với:\na) Người lao động làm việc theo hợp đồng lao động;',
          status: 'approved',
          qualityScore: 92,
          createdAt: '2024-01-15T10:31:00Z',
          updatedAt: '2024-01-15T10:31:00Z'
        },
        {
          id: '3',
          documentId: documentId,
          content: 'b) Người sử dụng lao động là cơ quan nhà nước, đơn vị sự nghiệp công lập, đơn vị vũ trang nhân dân;',
          status: 'needs_review',
          qualityScore: 78,
          validationIssues: [
            {
              type: 'error',
              message: 'Thiếu dấu chấm cuối câu',
              line: 1,
              column: 95
            }
          ],
          createdAt: '2024-01-15T10:32:00Z',
          updatedAt: '2024-01-15T10:32:00Z'
        }
      ];
    }
  },

  // Duyệt hàng loạt chunks
  async approveChunks(chunkIds: string[]): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/chunk-management/chunks/approve', {
        chunk_ids: chunkIds
      });
      return true;
    } catch (error) {
      console.error('Error approving chunks:', error);
      return false;
    }
  },

  // Import chunks vào RAG
  async importChunks(chunkIds: string[]): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/chunk-management/chunks/import', {
        chunk_ids: chunkIds
      });
      return true;
    } catch (error) {
      console.error('Error importing chunks:', error);
      return false;
    }
  }
};