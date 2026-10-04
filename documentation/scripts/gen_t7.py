from helpers import *
SQL = (
    'CREATE EXTENSION IF NOT EXISTS "pgcrypto";\n'
    'CREATE EXTENSION IF NOT EXISTS pg_trgm;\n'
    'CREATE TYPE project_status  AS ENUM (\'IDEATION\',\'IN_PROGRESS\',\'COMPLETED\',\'PUBLISHED\');\n'
    'CREATE TYPE paper_visibility AS ENUM (\'DRAFT\',\'PUBLIC\',\'RESTRICTED\');\n'
    'CREATE TABLE hub_projects (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(256) NOT NULL,\n'
    '  description TEXT, department VARCHAR(64) NOT NULL, academic_year VARCHAR(16) NOT NULL,\n'
    '  tech_stack TEXT[], status project_status DEFAULT \'IN_PROGRESS\',\n'
    '  gitea_repo_url VARCHAR(512), gitea_repo_id INT, star_count INT DEFAULT 0,\n'
    '  is_public BOOLEAN DEFAULT TRUE, created_by UUID NOT NULL,\n'
    '  created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE hub_project_members (\n'
    '  project_id UUID NOT NULL REFERENCES hub_projects(id) ON DELETE CASCADE,\n'
    '  user_id UUID NOT NULL, role VARCHAR(32) DEFAULT \'CONTRIBUTOR\',\n'
    '  joined_at TIMESTAMPTZ DEFAULT NOW(), PRIMARY KEY(project_id, user_id)\n'
    ');\n'
    'CREATE TABLE hub_papers (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), title VARCHAR(512) NOT NULL,\n'
    '  abstract TEXT NOT NULL, keywords TEXT[], doi VARCHAR(128),\n'
    '  journal_name VARCHAR(256), published_year SMALLINT, pdf_url VARCHAR(512),\n'
    '  visibility paper_visibility DEFAULT \'PUBLIC\', citation_count INT DEFAULT 0,\n'
    '  uploaded_by UUID NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE TABLE hub_activity_feed (\n'
    '  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), actor_id UUID NOT NULL,\n'
    '  event_type VARCHAR(32) NOT NULL, entity_id UUID, entity_type VARCHAR(32),\n'
    '  summary TEXT NOT NULL, created_at TIMESTAMPTZ DEFAULT NOW()\n'
    ');\n'
    'CREATE INDEX idx_projects_trgm ON hub_projects USING gin (title gin_trgm_ops);\n'
    'CREATE INDEX idx_papers_trgm   ON hub_papers   USING gin (title gin_trgm_ops);'
)
doc=nd()
cv(doc,7,"UniHub","University Research and Project Repository Portal",4007,"hub_db",5438)
hd(doc,"1. Team Composition and Role Assignments")
tb(doc,RH,[
    ["Student 1 -- Frontend and UX Lead","Repository browser, research feed, project showcase, search and discovery UI","Sprints 1 to 6"],
    ["Student 2 -- Backend and API Lead","Repository metadata API, research paper indexing, activity feed engine","Sprints 1 to 6"],
    ["Student 3 -- DevOps, Database and Security","PostgreSQL schema, Gitea CE integration, Docker, MinIO storage","Sprints 1 to 6"],
],ws=RW)
hd(doc,"2. Module Scope")
bd(doc,"The UniHub module is the university-wide academic repository portal: a GitHub-inspired platform where students and faculty can publish project source code repositories, research papers, and technical reports. It integrates with a self-hosted Gitea instance to manage actual Git repositories, while UniHub provides the discovery layer: search, metadata enrichment, citation tracking, and an activity feed of ongoing research and student projects across the institution.")
nt(doc,"Database Strategy: This team operates its own isolated PostgreSQL instance (hub_db) on port 5438. The module API is served on port 4007. The Central API Gateway routes all /unihub/* requests to this service. A self-hosted Gitea Community Edition instance runs on port 3030 and is managed by this team.")
hd(doc,"3. Feature List")
hd(doc,"3.1 Project Repository Browser",2)
for x in ["Public listing of all student and faculty project repositories hosted on Gitea.","Repository metadata: title, description, programming languages, department, academic year, team members.","Star and bookmark functionality for repositories.","Filter by department, technology stack, academic year, or project status."]: bl(doc,x)
hd(doc,"3.2 Research Paper Repository",2)
for x in ["Faculty and students can upload published or preprint research papers in PDF format (maximum 20 MB).","Metadata: title, authors, abstract, keywords, journal or conference name, DOI, publication year.","Citation tracking: references between university papers are linked and counted automatically.","Full-text trigram search across all abstracts and keywords using pg_trgm."]: bl(doc,x)
hd(doc,"3.3 Ongoing Projects and Activity Feed",2)
for x in ["Real-time activity feed: recent repository pushes, new papers uploaded, project milestones.","Faculty can post research updates and call-for-collaborators announcements.","Project status tracking: Ideation, In Progress, Completed, Published."]: bl(doc,x)
hd(doc,"3.4 TrackIt Integration",2)
for x in ["When a project is marked Completed in the TrackIt module, a repository entry is automatically created in UniHub.","TrackIt project metadata (title, team members, technology stack) is pre-populated in the UniHub entry.","Students can manually update the UniHub entry with additional metadata after the initial sync."]: bl(doc,x)
hd(doc,"4. Database Schema (hub_db -- PostgreSQL 16)")
bd(doc,"Execute the following DDL statements on the hub_db instance (Port 5438). The pg_trgm extension is required for full-text search.")
cb(doc,SQL)
hd(doc,"5. REST API Endpoints")
tb(doc,AH,[
    ["POST","/api/v1/projects","Any","Register a new project repository in UniHub"],
    ["GET","/api/v1/projects","Any","Search and filter project repositories"],
    ["GET","/api/v1/projects/:id","Any","Project details with live Gitea statistics"],
    ["POST","/api/v1/projects/:id/star","Any","Star a repository"],
    ["POST","/api/v1/papers","Any","Upload a research paper with metadata"],
    ["GET","/api/v1/papers","Any","Search papers by keyword, author, or DOI"],
    ["GET","/api/v1/papers/:id","Any","Paper detail with citation list"],
    ["GET","/api/v1/feed","Any","University-wide activity feed"],
    ["POST","/api/v1/feed/post","FACULTY","Post a research update or announcement"],
    ["GET","/api/v1/trending","Any","Trending repositories and papers"],
    ["GET","/api/v1/health","Public","Service health check"],
],ws=[0.7,2.7,1.0,3.3])
hd(doc,"6. 16-Week Sprint Plan")
tb(doc,SH,[
    ["Sprint 1","1-2","Service scaffolding, hub_db schema, Gitea CE Docker setup, OAuth2 SSO configuration, project registration API."],
    ["Sprint 2","3-4","Project browser UI with search and filter, Gitea live statistics integration, star functionality."],
    ["Sprint 3","5-6","Research paper upload, metadata form, PDF storage to MinIO, full-text trigram search index."],
    ["Sprint 4","7-8","Activity feed: repository push webhooks from Gitea, paper upload events, faculty announcement posts."],
    ["Sprint 5","9-10","Citation tracking, trending algorithm using star count and recency, project member join requests."],
    ["Sprint 6","11-12","TrackIt integration (auto-create on project completion), API Gateway at /unihub, end-to-end tests."],
],ws=SW)
hd(doc,"7. Security Requirements")
for x in ["Papers marked as RESTRICTED are accessible only to authenticated university users.","Gitea provisioning uses a service-account token stored as a server-side environment variable.","PDF uploads are scanned for malware via ClamAV before being stored in MinIO.","Repository write access is managed entirely within Gitea; UniHub only reads statistics via the Gitea API."]: bl(doc,x)
hd(doc,"8. Local Development Setup")
cb(doc,"cd apps/unihub-service && pnpm install\ncp .env.example .env\n# DATABASE_URL=postgresql://hub_user:pass@localhost:5438/hub_db\n# GITEA_URL=http://localhost:3030  |  GITEA_SERVICE_TOKEN=<token>\n# MINIO_ENDPOINT=localhost:9000\npnpm prisma migrate dev --name init\npnpm dev   # Port 4007")
out=os.path.join(BASE,"team07_UniHub"); os.makedirs(out,exist_ok=True)
doc.save(os.path.join(out,"MODULE_DOSSIER.docx")); print("Team 7 UniHub dossier saved.")
