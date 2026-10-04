// Team 06 (EduAssist AI) Domain Types
// Aligned with PostgreSQL 16 schema: rag_documents, rag_chunks, rag_chat_sessions, rag_escalations

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  citations?: DocumentCitation[];
  isTutorMode?: boolean;
}

export interface DocumentCitation {
  documentTitle: string;
  pageNumber: number;
  sectionHeader: string;
  relevanceScore: number;
}

export interface IngestedDocument {
  id: string;
  fileName: string;
  category: 'REGULATIONS' | 'SYLLABUS' | 'EXAMS' | 'HR_POLICY' | 'RESEARCH' | 'INFRASTRUCTURE';
  chunkCount: number;
  uploadedAt: string;
  status: 'INDEXED' | 'PROCESSING' | 'FAILED';
}

export interface HelpdeskEscalationTicket {
  ticketId: string;
  userEmail: string;
  unresolvedQuery: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: string;
}
