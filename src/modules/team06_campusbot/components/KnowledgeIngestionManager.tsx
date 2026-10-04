import React from 'react';
import { FileText, CheckCircle2, UploadCloud, Database, Layers } from 'lucide-react';
import { IngestedDocument } from '../types/campusbot.types';

interface KnowledgeIngestionManagerProps {
  documents: IngestedDocument[];
}

export const KnowledgeIngestionManager: React.FC<KnowledgeIngestionManagerProps> = ({ documents }) => {
  return (
    <div className="bg-white rounded-xl border border-cu-border p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <div>
          <h3 className="text-base font-bold text-cu-navy flex items-center gap-2">
            <Database size={18} className="text-cu-navy" />
            Knowledge Base Ingestion &amp; Vector Pipeline
          </h3>
          <p className="text-xs text-gray-500">
            Ingests institutional handbooks, syllabus documents, and exam ordinances into 1536-dim vector chunks.
          </p>
        </div>
        <button
          onClick={() => alert('Document ingestion upload dialogue opened.')}
          className="inline-flex items-center gap-1.5 bg-[#002561] text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow hover:bg-[#0E1B38] transition"
        >
          <UploadCloud size={14} />
          Ingest New PDF Handbook
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
            <tr>
              <th className="p-3">Indexed File Name</th>
              <th className="p-3">Departmental Category</th>
              <th className="p-3">Semantic Chunks</th>
              <th className="p-3">Indexing Status</th>
              <th className="p-3">Last Synchronized</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50/50">
                <td className="p-3 font-semibold text-cu-navy flex items-center gap-2">
                  <FileText size={14} className="text-cu-navy shrink-0" />
                  <span>{doc.fileName}</span>
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold">
                    {doc.category}
                  </span>
                </td>
                <td className="p-3 font-mono text-gray-600">{doc.chunkCount} vector chunks</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    <CheckCircle2 size={11} /> {doc.status}
                  </span>
                </td>
                <td className="p-3 text-gray-500 font-mono">{doc.uploadedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
