# Subsystem Specification: Team 06 - CampusBot (Context-Aware RAG & AI Knowledge Base)

## 1. Executive Summary & Functional Scope
CampusBot is the official academic assistant, institutional regulation oracle, and pedagogical companion of Chanakya University. Engineered using Retrieval-Augmented Generation (RAG) and dense vector search, CampusBot answers student and faculty queries with authoritative citations directly referencing University Ordinances, NEP 2020 Guidelines, and Course Syllabi.

### Key Capabilities
- **Institutional Regulation RAG**: Ingested knowledge base referencing Chanakya University Student Handbook, Examination Bye-Laws, and Hostel Rules with verbatim page and section citations.
- **Socratic Tutoring Engine**: Pedagogical assistance mode that guides students to discover answers iteratively rather than generating raw copy-paste solutions.
- **Department Vector Indexing**: Granular vector namespaces partitioning institutional policies, course syllabi, and administrative circulars.
- **Audited Query Forensics**: Strict logging and hallucination safeguards preventing unauthorized academic advisory or examination leaks.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team06_campusbot/
|-- components/
|   |-- ChatInterface.tsx        # Interactive conversational portal with markdown rendering
|   |-- KnowledgeIngestor.tsx    # PDF/Document parser and vector chunking inspector
|   |-- SocraticTutorCard.tsx    # Pedagogical guidance mode with step-by-step hints
|   \-- OrdinanceViewer.tsx      # Verified statutory regulation citation drawer
|-- services/
|   \-- campusBotService.ts      # Semantic vector search and LLM orchestration service
|-- types/
|   \-- campusbot.types.ts       # Query and vector chunking type definitions
|-- index.tsx                    # Subsystem entrypoint with ModuleErrorBoundary
\-- README.md                    # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16 with pgvector)
```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE campusbot_knowledge_documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(128) NOT NULL,
    document_type VARCHAR(32) CHECK (document_type IN ('UNIVERSITY_ACT', 'EXAM_ORDINANCE', 'SYLLABUS', 'HOSTEL_MANUAL', 'FEE_SCHEDULE')),
    version VARCHAR(16) NOT NULL,
    total_pages INT NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE campusbot_vector_chunks (
    chunk_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID REFERENCES campusbot_knowledge_documents(doc_id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    page_number INT NOT NULL,
    chunk_content TEXT NOT NULL,
    embedding vector(1536),
    source_reference VARCHAR(128) NOT NULL
);

CREATE TABLE campusbot_query_logs (
    query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    user_role VARCHAR(32) NOT NULL,
    query_text TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    cited_chunk_ids UUID[],
    mode VARCHAR(16) DEFAULT 'RAG_ORDINANCE' CHECK (mode IN ('RAG_ORDINANCE', 'SOCRATIC_TUTOR')),
    latency_ms INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. Resilience & Fault-Isolation Architecture
- **Graceful Vector Fallback**: If embedding microservice is unreachable, CampusBot falls back to BM25 keyword matching across ordinance titles.
- **Subsystem Boundary**: Errors in query processing cannot trigger unhandled exceptions in parent ERP modules.
