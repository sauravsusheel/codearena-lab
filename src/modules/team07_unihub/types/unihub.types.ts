// Team 07 (UniHub) Domain Types
// Aligned with PostgreSQL 16 schema: unihub_repositories, unihub_commits, unihub_research_papers, unihub_activities

export interface GitRepository {
  id: string;
  name: string;
  owner: string;
  department: string;
  description: string;
  stars: number;
  forks: number;
  primaryLanguage: string;
  visibility: 'PUBLIC' | 'DEPARTMENTAL' | 'PRIVATE';
  updatedAt: string;
  defaultBranch: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  filesChanged: number;
}

export interface CodeDiffFile {
  filename: string;
  status: 'MODIFIED' | 'ADDED' | 'DELETED';
  additions: number;
  deletions: number;
  diffLines: { type: 'add' | 'del' | 'context'; text: string }[];
}

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  department: string;
  journalOrConference: string;
  doi: string;
  year: number;
  citationCount: number;
  pdfUrl: string;
  bibtex: string;
}

export interface CampusActivityEvent {
  id: string;
  type: 'GIT_COMMIT' | 'PAPER_PUBLISHED' | 'REPO_STARRED' | 'MILESTONE_COMPLETED';
  actor: string;
  actionText: string;
  timestamp: string;
}
