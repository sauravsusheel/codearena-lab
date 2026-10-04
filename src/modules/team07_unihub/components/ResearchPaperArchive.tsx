import React from 'react';
import { BookOpen, FileText, Download, Quote, ExternalLink } from 'lucide-react';
import { ResearchPaper } from '../types/unihub.types';

interface ResearchPaperArchiveProps {
  papers: ResearchPaper[];
}

export const ResearchPaperArchive: React.FC<ResearchPaperArchiveProps> = ({ papers }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <BookOpen size={18} className="text-cu-navy" />
            Institutional Research Publication Archive
          </h3>
          <p className="text-xs text-gray-500">
            Open-access pre-prints, IEEE/ACM publications, DOIs, and instant BibTeX citations.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {papers.map((paper) => (
          <div key={paper.id} className="bg-white rounded-xl border border-cu-border p-5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
              <h4 className="font-bold text-sm text-cu-navy leading-snug hover:text-cu-gold cursor-pointer transition">
                {paper.title}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-mono font-semibold shrink-0">
                {paper.citationCount} Citations
              </span>
            </div>

            <div className="text-xs text-gray-600 flex flex-wrap items-center gap-2">
              <span className="font-medium text-slate-800">{paper.authors.join(', ')}</span>
              <span>•</span>
              <span className="italic text-gray-500">{paper.journalOrConference}</span>
              <span>•</span>
              <span className="font-mono text-gray-400">DOI: {paper.doi}</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100">
              <span className="text-[11px] text-gray-400 font-sans">{paper.department}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(paper.bibtex);
                    alert('BibTeX citation copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-slate-800 rounded-md text-[11px] font-semibold transition"
                >
                  <Quote size={12} />
                  Copy BibTeX
                </button>
                <button
                  onClick={() => alert(`Opening PDF manuscript: ${paper.title}`)}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#002561] hover:bg-[#0E1B38] text-white rounded-md text-[11px] font-semibold transition"
                >
                  <Download size={12} />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
