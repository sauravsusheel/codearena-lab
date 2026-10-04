# Subsystem Specification: Team 07 - UniHub (Research Archive & Git Repositories)

## 1. Executive Summary & Functional Scope
UniHub is the academic research repository, digital thesis archive, and student software codebase explorer for Chanakya University. Designed to foster open science and collaborative software engineering, UniHub integrates Git repository browsing with syntactic code diffing and citation-indexed academic publications.

### Key Capabilities
- **Integrated Git Code Explorer**: Tree-structured directory browser, commit history inspector, and branch navigator for student project repositories.
- **Syntactic Code Diff Viewer**: Unified side-by-side syntactic diff visualization displaying additions, deletions, and line-level changes.
- **Institutional Research Repository**: Preprints, peer-reviewed journal papers, and conference proceedings archive with DOI allocation and BibTeX citation generators.
- **Dataset Catalog**: Open academic datasets with license descriptors, download bandwidth telemetry, and usage attribution trackers.

---

## 2. Component Hierarchy & Module Layout
```
src/modules/team07_unihub/
|-- components/
|   |-- GitTreeExplorer.tsx      # Interactive file tree and repository commit navigator
|   |-- CodeDiffViewer.tsx       # Side-by-side syntactic git diff and changeset viewer
|   |-- ResearchPaperArchive.tsx # Academic preprint repository and BibTeX generator
|   \-- DatasetCatalog.tsx       # Institutional research datasets and license manager
|-- services/
|   \-- unihubService.ts         # Git proxy and research repository data service
|-- types/
|   \-- unihub.types.ts          # Repository and publication schema types
|-- index.tsx                    # Subsystem entrypoint with ModuleErrorBoundary
\-- README.md                    # Technical specification and onboarding guide
```

---

## 3. Normalized Database Schema (PostgreSQL 16)
```sql
CREATE TABLE unihub_repositories (
    repo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    repo_name VARCHAR(64) NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    default_branch VARCHAR(32) DEFAULT 'main',
    stars_count INT DEFAULT 0,
    forks_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_owner_repo UNIQUE (owner_id, repo_name)
);

CREATE TABLE unihub_research_papers (
    paper_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(256) NOT NULL,
    abstract TEXT NOT NULL,
    authors_json JSONB NOT NULL,
    school_id VARCHAR(32) NOT NULL,
    doi_identifier VARCHAR(64) UNIQUE,
    pdf_storage_uri TEXT NOT NULL,
    citation_count INT DEFAULT 0,
    published_date DATE NOT NULL,
    bibtex_citation TEXT NOT NULL
);
```

---

## 4. Resilience & Fault-Isolation Architecture
- **Git Object Caching**: Repository tree snapshots and commit logs are cached locally; transient network failures during tree traversal do not disrupt portal stability.
- **Fault Boundary**: Large file uploads or parser failures are trapped within the UniHub container without affecting other team modules.
