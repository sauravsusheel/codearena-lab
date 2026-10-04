from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE EXTENSION IF NOT EXISTS vector;\n'
    'CREATE TABLE bot_documents (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(256) NOT NULL,\n'
    '  source_type VARCHAR(32) NOT NULL, category VARCHAR(64),\n'
    '  uploaded_by UUID NOT NULL, version INT DEFAULT 1,\n'
    '  is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE bot_chunks (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  document_id UUID NOT NULL REFERENCES bot_documents(id) ON DELETE CASCADE,\n'
    '  chunk_index INT NOT NULL, chunk_text TEXT NOT NULL,\n'
    '  embedding vector(768), token_count INT, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE INDEX idx_chunks_embedding ON bot_chunks\n'
    '  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);\n'
    'CREATE TABLE bot_conversations (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  user_id UUID NOT NULL, started_at TIMESTAMPTZ DEFAULT NOW(), ended_at TIMESTAMPTZ\n'
    ');\n'
    'CREATE TABLE bot_messages (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n'
    '  conversation_id UUID NOT NULL REFERENCES bot_conversations(id) ON DELETE CASCADE,\n'
    '  role VARCHAR(16) NOT NULL, content TEXT NOT NULL,\n'
    '  source_chunks UUID[], feedback SMALLINT, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');'
)
doc=nd()
cv(doc,6,"CampusBot","RAG-Powered Campus AI Assistant",4006,"bot_db",5437)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Chat widget, conversation history UI, admin knowledge management panel","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","RAG pipeline, Gemini API integration, intent detection, vector similarity search","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL with pgvector extension, Docker, SSE streaming setup","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The CampusBot module is a Retrieval-Augmented Generation (RAG) powered conversational AI assistant embedded across all modules of the UniSphere portal. It answers student queries related to attendance, exam schedules, course materials, fee structure, library resources, and academic procedures by retrieving relevant context from a curated university knowledge base before generating a response via the Google Gemini API.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (bot_db) on port 5437, extended with the pgvector extension for semantic similarity search. The module API is served on port 4006. The Central API Gateway routes all /bot/* requests to this service.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Knowledge Base Management",2)
for x in ["Admin panel to upload documents: PDF, DOCX, and TXT including university circulars, syllabi, and timetables.","Document chunking pipeline: splits documents into 512-token overlapping chunks with 64-token overlap.","Embedding generation using Google text-embedding-004 model.","Vectors stored in the pgvector extension for semantic cosine similarity search.","Document versioning: uploading a new version automatically retires old chunks."]: bl(doc,x)
hd(doc,"3.2 RAG Query Pipeline",2)
for x in ["User query is embedded using the same model as the knowledge base to ensure vector space consistency.","Top-5 semantically similar chunks are retrieved from pgvector using cosine similarity index.","Retrieved chunks are assembled into a context window and passed to Gemini with a structured system prompt.","Response is streamed back to the client using Server-Sent Events (SSE) for real-time display.","Hallucination guard: responses are prefixed with the source document reference."]: bl(doc,x)
hd(doc,"3.3 Conversation and Context Management",2)
for x in ["Each user session maintains a rolling 10-message conversation history for multi-turn coherence.","Conversation history is stored in PostgreSQL and can be reviewed by students at any time.","Feedback thumbs-up or thumbs-down per response to guide knowledge base curation priorities.","Admin can review aggregate conversation logs to identify unresolved query categories."]: bl(doc,x)
hd(doc,"3.4 Cross-Module Integration",2)
for x in ["Bot can query the Attendance module API to answer questions such as: What is my attendance in MCA301?","Bot can query the Exam module API to answer questions such as: When is my next scheduled exam?","Bot can query the TrackIt module API to answer questions about project deadlines and internship status.","All cross-module queries use the internal Gateway token and never expose student credentials."]: bl(doc,x)
hd(doc,"4. Database Schema (bot_db -- PostgreSQL 16 with pgvector)")
bd(doc,"Execute the following DDL statements on the bot_db instance (Port 5437). The pgvector extension must be installed.")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/documents","ADMIN","Upload and ingest a new document into the knowledge base"],
    ["GET","/api/v1/documents","ADMIN","List all knowledge base documents with status"],
    ["DELETE","/api/v1/documents/:id","ADMIN","Retire a document and all its associated chunks"],
    ["POST","/api/v1/chat","Any","Send a user message; returns streamed AI response via SSE"],
    ["GET","/api/v1/conversations/:id","Self","Retrieve full conversation history"],
    ["POST","/api/v1/messages/:id/feedback","Any","Submit positive or negative feedback on a response"],
    ["GET","/api/v1/admin/analytics","ADMIN","Aggregate unanswered or low-rated query report"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.8,2.8,1.2,2.9])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service scaffolding, bot_db schema with pgvector, document upload and parsing pipeline, embedding generation."],
    ["Sprint 2","3-4","Semantic vector search using IVFFlat index, basic RAG pipeline with Gemini API, SSE streaming response."],
    ["Sprint 3","5-6","Chat widget frontend, conversation history storage and display, multi-turn context window management."],
    ["Sprint 4","7-8","Cross-module queries to Attendance, Exam, and TrackIt, hallucination guard with source citation, feedback collection."],
    ["Sprint 5","9-10","Admin knowledge base management panel, document versioning, unanswered query analytics dashboard."],
    ["Sprint 6","11-12","Integration across all module sidebars, API Gateway registration at /bot, end-to-end tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["Document ingestion is restricted to users with the ADMIN role only.","Cross-module API calls use a dedicated INTERNAL_GATEWAY_TOKEN never exposed to browser clients.","Conversation history for each user is accessible only to that user and ADMIN role.","The Gemini API key is stored exclusively as a server-side environment variable."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/campusbot-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://bot_user:pass@localhost:5437/bot_db\n# GEMINI_API_KEY=<key>  |  INTERNAL_GATEWAY_TOKEN=<shared_secret>\npnpm prisma migrate dev --name init\npnpm dev   # Port 4006")
out=os.path.join(BASE,"team06_CampusAIBot"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 6 CampusBot dossier saved.")
