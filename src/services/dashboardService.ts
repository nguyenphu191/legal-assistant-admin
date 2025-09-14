import { apiClient } from '../configs/api';
import { Statistics, Document, Chunk, ApiResponse, PaginatedResponse } from '../types';

export const dashboardService = {
  // Lấy thống kê tổng quan
  async getStatistics(): Promise<Statistics> {
    try {
      const response = await apiClient.get('/api/v1/chunk-management/statistics');
      return response.data || {
        totalDocuments: 0,
        totalChunks: 0,
        approvedChunks: 0,
        pendingChunks: 0
      };
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Return mock data for development
      return {
        totalDocuments: 15,
        totalChunks: 450,
        approvedChunks: 380,
        pendingChunks: 70
      };
    }
  },

  // Lấy danh sách chunks chờ duyệt
  async getPendingChunks(limit: number = 10): Promise<Chunk[]> {
    try {
      const response = await apiClient.get(`/api/v1/chunk-management/chunks/pending`);
      return response.data?.chunks || [];
    } catch (error) {
      console.error('Error fetching pending chunks:', error);
      return [];
    }
  },

  // Lấy danh sách tài liệu gần đây
  async getRecentDocuments(limit: number = 5): Promise<Document[]> {
    try {
      const response = await apiClient.get(`/api/v1/documents/recent?limit=${limit}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent documents:', error);
      // Return mock data for development
      return [
        {
          id: '1',
          filename: 'Thông tư 10/2020/BLDTBXH',
          uploadDate: '2024-01-15',
          totalChunks: 24,
          approvedChunks: 2,
          pendingChunks: 22,
          status: 'pending_review'
        },
        {
          id: '2',
          filename: 'Nghị định 63/2022/NĐ-CP',
          uploadDate: '2024-01-14',
          totalChunks: 5,
          approvedChunks: 5,
          pendingChunks: 0,
          status: 'completed'
        }
      ];
    }
  },

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      await apiClient.get('/api/v1/documents/health');
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
};