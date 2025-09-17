import { apiClient } from '../configs/api';
import { Chunk, ValidationIssue, ApiResponse } from '../types';

export const chunkService = {
  // Lấy chi tiết chunk
  async getChunkById(chunkId: string): Promise<Chunk> {
    try {
      const response = await apiClient.get(`/api/v1/chunk-management/chunks/${chunkId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chunk:', error);
      // Return mock data for development
      return {
        id: chunkId,
        documentId: 'TT_10-2020-BLDTBXH',
        content: `Điều 3. Nội dung chủ yếu của hợp đồng lao động. Thông tin về họ tên, ngày tháng năm sinh, giới tính, nơi cư trú, số thẻ căn cước công dân hoặc chứng minh nhân dân hoặc hộ chiếu của người lao động.\n\nThiếu câu trúc pháp lý rõ ràng`,
        status: 'needs_review',
        qualityScore: 45,
        validationIssues: [
          {
            type: 'warning',
            message: 'Chunk bất đầu không từ nội "ngày" - thiếu context',
            line: 1
          },
          {
            type: 'error', 
            message: 'Thiếu câu trúc pháp lý rõ ràng',
            line: 3
          }
        ],
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:45:00Z'
      };
    }
  },

  // Lưu chỉnh sửa chunk
  async updateChunk(chunkId: string, content: string): Promise<boolean> {
    try {
      await apiClient.put(`/api/v1/chunk-management/chunks/${chunkId}/edit`, {
        content: content
      });
      return true;
    } catch (error) {
      console.error('Error updating chunk:', error);
      return false;
    }
  },

  // Validate nội dung chunk
  async validateChunk(content: string): Promise<{
    qualityScore: number;
    validationIssues: ValidationIssue[];
  }> {
    try {
      const response = await apiClient.post('/api/v1/chunk-management/chunks/validate', {
        content: content
      });
      return response.data;
    } catch (error) {
      console.error('Error validating chunk:', error);
      // Return mock validation data
      return {
        qualityScore: Math.floor(Math.random() * 40) + 60, // 60-100
        validationIssues: content.length < 50 ? [
          {
            type: 'warning',
            message: 'Nội dung quá ngắn, có thể thiếu thông tin quan trọng'
          }
        ] : []
      };
    }
  },

  // Approve chunk
  async approveChunk(chunkId: string): Promise<boolean> {
    try {
      await apiClient.post('/api/v1/chunk-management/chunks/approve', {
        chunk_ids: [chunkId]
      });
      return true;
    } catch (error) {
      console.error('Error approving chunk:', error);
      return false;
    }
  }
};