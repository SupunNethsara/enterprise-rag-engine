export type IngestionStatus = 'INDEXING' | 'COMPLETED' | 'FAILED';

export interface DocumentRecord {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  chunkCount: number;
  status: IngestionStatus;
  createdAt: string;
}

export interface Citation {
  content: string;
  sourceFilename: string;
  pageNumber?: number | null;
  score?: number | null;
  metadata?: Record<string, unknown>;
}

export interface ChatResponse {
  answer: string;
  citations: Citation[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  timestamp: string;
}
