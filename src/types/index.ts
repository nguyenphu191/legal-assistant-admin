// Statistics types
export interface Statistics {
  totalDocuments: number;
  totalChunks: number;
  approvedChunks: number;
  pendingChunks: number;
  processingProgress?: number;
}

// Document types
export interface Document {
  id: string;
  filename: string;
  uploadDate: string;
  totalChunks: number;
  approvedChunks: number;
  pendingChunks: number;
  status: 'processing' | 'completed' | 'error' | 'pending_review';
  processingProgress?: number;
}

// Chunk types
export interface Chunk {
  id: string;
  documentId: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  qualityScore?: number;
  validationIssues?: ValidationIssue[];
  createdAt: string;
  updatedAt: string;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'suggestion';
  message: string;
  line?: number;
  column?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Upload types
export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}