// import { apiClient } from '../configs/api';
// import { Statistics, Document, Chunk, ApiResponse, PaginatedResponse } from '../types';

// export const dashboardService = {
//   // Lấy thống kê tổng quan
//   async getStatistics(): Promise<Statistics> {
//     try {
//       const response = await apiClient.get('/api/v1/chunk-management/statistics');
//       const data = response.data;
  
//       return {
//         totalDocuments: data.total_documents,
//         totalChunks: data.total_chunks,
//         approvedChunks: data.approved_chunks,
//         pendingChunks: data.pending_chunks,
//         processingProgress: data.average_quality_score // nếu muốn gán vào
//       };
//     } catch (error) {
//       console.error('Error fetching statistics:', error);
//       return {
//         totalDocuments: 0,
//         totalChunks: 0,
//         approvedChunks: 0,
//         pendingChunks: 0,
//         processingProgress: 0
//       };
//     }
//   },

//   // Lấy danh sách chunks chờ duyệt
//   async getPendingChunks(limit: number = 10): Promise<Chunk[]> {
//     try {
//       const response = await apiClient.get(`/api/v1/chunk-management/chunks/pending`);
//       return response.data?.chunks || [];
//     } catch (error) {
//       console.error('Error fetching pending chunks:', error);
//       return [];
//     }
//   },

//   // Lấy danh sách tài liệu gần đây
//   async getRecentDocuments(limit: number = 5): Promise<Document[]> {
//     try {
//       const response = await apiClient.get(`/api/v1/documents/recent?limit=${limit}`);
//       return response.data || [];
//     } catch (error) {
//       console.error('Error fetching recent documents:', error);
//       // Return mock data for development
//       return [
//         {
//           id: '1',
//           filename: 'Thông tư 10/2020/BLDTBXH',
//           uploadDate: '2024-01-15',
//           totalChunks: 24,
//           approvedChunks: 2,
//           pendingChunks: 22,
//           status: 'pending_review'
//         },
//         {
//           id: '2',
//           filename: 'Nghị định 63/2022/NĐ-CP',
//           uploadDate: '2024-01-14',
//           totalChunks: 5,
//           approvedChunks: 5,
//           pendingChunks: 0,
//           status: 'completed'
//         }
//       ];
//     }
//   },

//   // Health check
//   async checkHealth(): Promise<boolean> {
//     try {
//       await apiClient.get('/api/v1/documents/health');
//       return true;
//     } catch (error) {
//       console.error('Health check failed:', error);
//       return false;
//     }
//   }
// };
import { apiClient } from '../configs/api';
import { Statistics, Document, Chunk, ApiResponse, PaginatedResponse } from '../types';

// Mock data cho demo dashboard
const mockStatistics: Statistics = {
  totalDocuments: 25,
  totalChunks: 487,
  approvedChunks: 324,
  pendingChunks: 163
};

const mockRecentDocuments: Document[] = [
  {
    id: '1',
    filename: 'Thông tư 10/2020/TT-BLDTBXH',
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
    totalChunks: 15,
    approvedChunks: 12,
    pendingChunks: 3,
    status: 'pending_review'
  },
  {
    id: '3',
    filename: 'Luật Lao động số 45/2019/QH14',
    uploadDate: '2024-01-13',
    totalChunks: 45,
    approvedChunks: 45,
    pendingChunks: 0,
    status: 'completed'
  },
  {
    id: '4',
    filename: 'Quyết định 1073/QĐ-LDTBXH',
    uploadDate: '2024-01-12',
    totalChunks: 8,
    approvedChunks: 0,
    pendingChunks: 8,
    status: 'processing'
  },
  {
    id: '5',
    filename: 'Thông tư 26/2020/TT-BLDTBXH',
    uploadDate: '2024-01-11',
    totalChunks: 18,
    approvedChunks: 15,
    pendingChunks: 3,
    status: 'pending_review'
  }
];

const mockPendingChunks: Chunk[] = [
  {
    id: 'TT_10-2020-1',
    documentId: '1',
    content: 'Điều 5. Nghĩa vụ của người sử dụng lao động về bảo đảm an toàn, vệ sinh lao động\n\n1. Thực hiện đầy đủ quy định của pháp luật về an toàn, vệ sinh lao động.\n2. Xây dựng và thực hiện nội quy, quy trình về an toàn, vệ sinh lao động phù hợp với đặc điểm sản xuất, kinh doanh của mình.',
    status: 'pending',
    qualityScore: 67,
    validationIssues: [
      {
        type: 'warning',
        message: 'Nội dung có thể thiếu phần giải thích chi tiết về quy trình thực hiện'
      }
    ],
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'ND_63-2022-3',
    documentId: '2',
    content: 'Điều 8. Thời giờ làm việc linh hoạt theo tuần\n\nNgười sử dụng lao động được áp dụng thời giờ làm việc linh hoạt theo tuần nhưng phải bảo đảm thời giờ làm việc trung bình không quá 48 giờ một tuần và thông báo trước cho người lao động ít nhất 30 ngày.',
    status: 'needs_review',
    qualityScore: 45,
    validationIssues: [
      {
        type: 'error',
        message: 'Thiếu dấu chấm cuối câu và cấu trúc chưa rõ ràng'
      },
      {
        type: 'suggestion',
        message: 'Nên thêm ví dụ minh họa cách tính thời gian trung bình'
      }
    ],
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-14T09:15:00Z'
  },
  {
    id: 'QD_1073-1',
    documentId: '4',
    content: 'Điều 1. Ban hành Quy chuẩn kỹ thuật quốc gia về an toàn lao động đối với máy, thiết bị, chất nguy hiểm trong sản xuất\n\nQuy chuẩn kỹ thuật quốc gia QCVN 01:2019/BLDTBXH về An toàn lao động đối với máy, thiết bị nguy hiểm trong sản xuất được ban hành kèm theo Quyết định này.',
    status: 'needs_review',
    qualityScore: 72,
    validationIssues: [
      {
        type: 'warning',
        message: 'Nên kiểm tra lại mã số quy chuẩn có chính xác không'
      }
    ],
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-12T14:20:00Z'
  },
  {
    id: 'LUAT_45-2019-15',
    documentId: '3',
    content: 'Điều 104. Thời giờ làm việc bình thường\n\n1. Thời giờ làm việc bình thường không quá 8 giờ một ngày và không quá 48 giờ một tuần.\n2. Đối với một số ngành, nghề, công việc hoặc địa bàn có điều kiện đặc biệt, Chính phủ quy định thời giờ làm việc bình thường ít hơn quy định tại khoản 1 Điều này.',
    status: 'pending',
    qualityScore: 85,
    validationIssues: [],
    createdAt: '2024-01-13T11:45:00Z',
    updatedAt: '2024-01-13T11:45:00Z'
  },
  {
    id: 'TT_26-2020-7',
    documentId: '5',
    content: 'Điều 12. Trách nhiệm của người lao động về bảo hộ lao động\n\nNgười lao động có trách nhiệm sử dụng đúng, đầy đủ phương tiện bảo hộ cá nhân do người sử dụng lao động cung cấp; tuân thủ quy trình, biện pháp an toàn lao động; thông báo kịp thời cho người có thẩm quyền về tình huống nguy hiểm...',
    status: 'needs_review',
    qualityScore: 55,
    validationIssues: [
      {
        type: 'error',
        message: 'Nội dung bị cắt giữa chừng, thiếu phần kết thúc'
      },
      {
        type: 'warning',
        message: 'Dấu "..." không phù hợp trong văn bản pháp luật'
      }
    ],
    createdAt: '2024-01-11T16:10:00Z',
    updatedAt: '2024-01-11T16:10:00Z'
  }
];

export const dashboardService = {
  // Lấy thống kê tổng quan
  async getStatistics(): Promise<Statistics> {
    try {
      const response = await apiClient.get('/api/v1/chunk-management/statistics');
      
      // Nếu API trả về dữ liệu hợp lệ
      if (response && response.data && typeof response.data.totalDocuments === 'number') {
        return response.data;
      }
      
      throw new Error('Invalid statistics data from API');
    } catch (error) {
      console.warn('API failed, using mock statistics data');
      // Return mock data for development
      return mockStatistics;
    }
  },

  // Lấy danh sách chunks chờ duyệt
  async getPendingChunks(limit: number = 10): Promise<Chunk[]> {
    try {
      const response = await apiClient.get(`/api/v1/chunk-management/chunks/pending?limit=${limit}`);
      
      // Nếu API trả về dữ liệu và có chunks
      if (response && response.data && response.data.chunks && Array.isArray(response.data.chunks) && response.data.chunks.length > 0) {
        return response.data.chunks;
      }
      
      throw new Error('No pending chunks from API');
    } catch (error) {
      console.warn('API failed, using mock pending chunks');
      return mockPendingChunks.slice(0, limit);
    }
  },

  // Lấy danh sách tài liệu gần đây
  async getRecentDocuments(limit: number = 5): Promise<Document[]> {
    try {
      const response = await apiClient.get(`/api/v1/documents/recent?limit=${limit}`);
      
      // Nếu API trả về dữ liệu và có documents
      if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      
      throw new Error('No recent documents from API');
    } catch (error) {
      console.warn('API failed, using mock recent documents');
      return mockRecentDocuments.slice(0, limit);
    }
  },

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await apiClient.get('/api/v1/documents/health');
      return response && response.status === 200;
    } catch (error) {
      console.warn('Health check failed, API may be down');
      return false;
    }
  }
};