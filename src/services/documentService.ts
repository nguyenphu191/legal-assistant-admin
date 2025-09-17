import { apiClient } from '../configs/api';
import { Document, Chunk, ApiResponse, PaginatedResponse } from '../types';

// Mock data cho demo
const mockDocuments: Document[] = [
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
  }
];

const mockChunks: Record<string, Chunk[]> = {
  '1': [
    {
      id: 'TT_10-2020-BLDTBXH_1',
      documentId: '1',
      content: 'Điều 1. Phạm vi điều chỉnh\n\nThông tư này hướng dẫn thực hiện một số điều của Nghị định số 145/2020/NĐ-CP ngày 14 tháng 12 năm 2020 của Chính phủ quy định chi tiết thi hành một số điều của Luật An toàn, vệ sinh lao động về quản lý an toàn, vệ sinh lao động.',
      status: 'needs_review',
      qualityScore: 45,
      validationIssues: [
        {
          type: 'warning',
          message: 'Chunk bắt đầu không từ nội "ngày" - thiếu context',
          line: 1
        },
        {
          type: 'error',
          message: 'Thiếu câu trúc pháp lý rõ ràng',
          line: 3
        }
      ],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'TT_10-2020-BLDTBXH_2',
      documentId: '1',
      content: 'Điều 2. Đối tượng áp dụng\n\n1. Thông tư này áp dụng đối với:\na) Người lao động làm việc theo hợp đồng lao động;\nb) Người sử dụng lao động là cơ quan nhà nước, đơn vị sự nghiệp công lập, đơn vị vũ trang nhân dân, tổ chức chính trị, tổ chức chính trị - xã hội, tổ chức chính trị xã hội - nghề nghiệp, tổ chức xã hội - nghề nghiệp và tổ chức xã hội khác, doanh nghiệp, hợp tác xã, hộ kinh doanh cá thể, tổ hợp tác và tổ chức khác có sử dụng lao động theo hợp đồng lao động.',
      status: 'approved',
      qualityScore: 92,
      createdAt: '2024-01-15T10:31:00Z',
      updatedAt: '2024-01-15T10:31:00Z'
    },
    {
      id: 'TT_10-2020-BLDTBXH_3',
      documentId: '1',
      content: '2. Thông tư này không áp dụng đối với:\na) Công chức;\nb) Viên chức;\nc) Người lao động quy định tại các khoản 2, 3, 4 và 5 Điều 3 của Luật Lao động.',
      status: 'pending',
      qualityScore: 78,
      validationIssues: [
        {
          type: 'suggestion',
          message: 'Nên thêm giải thích rõ hơn về các khoản được tham chiếu',
          line: 3
        }
      ],
      createdAt: '2024-01-15T10:32:00Z',
      updatedAt: '2024-01-15T10:32:00Z'
    },
    {
      id: 'TT_10-2020-BLDTBXH_4',
      documentId: '1',
      content: 'Điều 3. Giải thích từ ngữ\n\nTrong Thông tư này, các từ ngữ dưới đây được hiểu như sau:\n1. An toàn lao động là việc bảo đảm an toàn tính mạng, sức khỏe của người lao động trong quá trình lao động bằng các biện pháp kỹ thuật, tổ chức, giáo dục và các biện pháp khác.',
      status: 'approved',
      qualityScore: 88,
      createdAt: '2024-01-15T10:33:00Z',
      updatedAt: '2024-01-15T10:33:00Z'
    },
    {
      id: 'TT_10-2020-BLDTBXH_5',
      documentId: '1',
      content: '2. Vệ sinh lao động là việc bảo đảm sức khỏe của người lao động bằng các biện pháp phòng, chống tác hại của môi trường lao động, cải thiện điều kiện lao động, chăm sóc sức khỏe và dinh dưỡng của người lao động.',
      status: 'needs_review',
      qualityScore: 65,
      validationIssues: [
        {
          type: 'warning',
          message: 'Thiếu dấu chấm câu ở cuối định nghĩa',
          line: 1,
          column: 198
        }
      ],
      createdAt: '2024-01-15T10:34:00Z',
      updatedAt: '2024-01-15T10:34:00Z'
    }
  ],
  '2': [
    {
      id: 'ND_63-2022-NDCP_1',
      documentId: '2',
      content: 'Điều 1. Phạm vi điều chỉnh\n\nNghị định này quy định chi tiết thi hành một số điều của Luật Lao động về thời giờ làm việc, thời giờ nghỉ ngơi; làm thêm giờ; làm việc vào ban đêm; nghỉ hàng tuần; nghỉ lễ, tết; nghỉ phép hàng năm; nghỉ việc riêng.',
      status: 'approved',
      qualityScore: 95,
      createdAt: '2024-01-14T09:00:00Z',
      updatedAt: '2024-01-14T09:00:00Z'
    },
    {
      id: 'ND_63-2022-NDCP_2',
      documentId: '2',
      content: 'Điều 2. Đối tượng áp dụng\n\nNghị định này áp dụng đối với người lao động, người sử dụng lao động, cơ quan, tổ chức, cá nhân có liên quan đến việc thực hiện thời giờ làm việc, thời giờ nghỉ ngơi quy định tại Luật Lao động.',
      status: 'approved',
      qualityScore: 90,
      createdAt: '2024-01-14T09:01:00Z',
      updatedAt: '2024-01-14T09:01:00Z'
    },
    {
      id: 'ND_63-2022-NDCP_3',
      documentId: '2',
      content: 'Điều 3. Thời giờ làm việc bình thường\n\n1. Thời giờ làm việc bình thường không quá 8 giờ một ngày và không quá 48 giờ một tuần.\n2. Người sử dụng lao động có quyền quy định thời giờ làm việc cụ thể phù hợp với đặc thù sản xuất, kinh doanh của mình nhưng phải bảo đảm thời giờ làm việc bình thường quy định tại khoản 1 Điều này.',
      status: 'needs_review',
      qualityScore: 72,
      validationIssues: [
        {
          type: 'suggestion',
          message: 'Nên bổ sung ví dụ cụ thể về cách tính thời gian làm việc',
          line: 4
        }
      ],
      createdAt: '2024-01-14T09:02:00Z',
      updatedAt: '2024-01-14T09:02:00Z'
    }
  ],
  '3': [
    {
      id: 'LUAT_45-2019-QH14_1',
      documentId: '3',
      content: 'Điều 1. Phạm vi điều chỉnh\n\nLuật này quy định về người lao động, người sử dụng lao động, tổ chức đại diện người lao động, tổ chức đại diện người sử dụng lao động trong quan hệ lao động; quản lý lao động; giải quyết tranh chấp lao động.',
      status: 'approved',
      qualityScore: 98,
      createdAt: '2024-01-13T08:00:00Z',
      updatedAt: '2024-01-13T08:00:00Z'
    },
    {
      id: 'LUAT_45-2019-QH14_2',
      documentId: '3',
      content: 'Điều 2. Đối tượng áp dụng\n\n1. Luật này áp dụng đối với người lao động, người sử dụng lao động trong quan hệ lao động; cơ quan nhà nước, tổ chức, cá nhân khác có liên quan đến quan hệ lao động.\n2. Trường hợp điều ước quốc tế mà Cộng hòa xã hội chủ nghĩa Việt Nam là thành viên có quy định khác với quy định của Luật này thì áp dụng quy định của điều ước quốc tế đó.',
      status: 'approved',
      qualityScore: 96,
      createdAt: '2024-01-13T08:01:00Z',
      updatedAt: '2024-01-13T08:01:00Z'
    }
  ]
};

export const documentService = {
  // Lấy chi tiết tài liệu
  async getDocumentById(documentId: string): Promise<Document> {
    try {
      const response = await apiClient.get(`/api/v1/documents/${documentId}`);
      
      // Nếu API trả về dữ liệu
      if (response && response.data) {
        return response.data;
      }
      
      throw new Error('No data from API');
    } catch (error) {
      console.warn('API failed, using mock data for document:', documentId);
      
      // Fallback to mock data
      const mockDoc = mockDocuments.find(doc => doc.id === documentId);
      if (mockDoc) {
        return mockDoc;
      }
      
      // Default mock document
      return {
        id: documentId,
        filename: `Document ${documentId}`,
        uploadDate: '2024-01-15',
        totalChunks: 10,
        approvedChunks: 3,
        pendingChunks: 7,
        status: 'pending_review'
      };
    }
  },

  // Lấy tất cả chunks của một tài liệu
  async getDocumentChunks(documentId: string): Promise<Chunk[]> {
    try {
      const response = await apiClient.get(`/api/v1/chunk-management/documents/${documentId}/chunks`);
      
      // Nếu API trả về dữ liệu và có chunks
      if (response && response.data && response.data.chunks && response.data.chunks.length > 0) {
        return response.data.chunks;
      }
      
      throw new Error('No chunks from API');
    } catch (error) {
      console.warn('API failed, using mock chunks for document:', documentId);
      
      // Fallback to mock data
      if (mockChunks[documentId]) {
        return mockChunks[documentId];
      }
      
      // Default mock chunks nếu không có documentId specific
      return [
        {
          id: `${documentId}_chunk_1`,
          documentId: documentId,
          content: `Đây là nội dung chunk mẫu cho tài liệu ${documentId}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
          status: 'pending',
          qualityScore: 75,
          validationIssues: [
            {
              type: 'warning',
              message: 'Đây là dữ liệu mẫu, cần thay thế bằng dữ liệu thật',
              line: 1
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
  },

  // Duyệt hàng loạt chunks
  async approveChunks(chunkIds: string[]): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/v1/chunk-management/chunks/approve', {
        chunk_ids: chunkIds
      });
      return true;
    } catch (error) {
      console.warn('API failed, simulating approve success');
      // Simulate success for demo
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 1000);
      });
    }
  },

  // Import chunks vào RAG
  async importChunks(chunkIds: string[]): Promise<boolean> {
    try {
      const response = await apiClient.post('/api/v1/chunk-management/chunks/import', {
        chunk_ids: chunkIds
      });
      return true;
    } catch (error) {
      console.warn('API failed, simulating import success');
      // Simulate success for demo
      return new Promise(resolve => {
        setTimeout(() => resolve(true), 1500);
      });
    }
  }
};