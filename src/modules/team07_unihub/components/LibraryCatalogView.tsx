import React, { useState } from 'react';
import { 
  BookOpen, Search, Filter, BookMarked, CheckCircle2, 
  Clock, AlertCircle, Bookmark, ExternalLink, QrCode, 
  RotateCcw, Plus, User, Layers, ShieldCheck, Download, X
} from 'lucide-react';

interface BookItem {
  id: string;
  accessionNo: string;
  title: string;
  author: string;
  isbn: string;
  callNumber: string;
  department: string;
  rackLocation: string;
  totalCopies: number;
  availableCopies: number;
  edition: string;
  publisher: string;
  status: 'AVAILABLE' | 'ISSUED' | 'REFERENCE_ONLY';
}

interface CirculationRecord {
  id: string;
  bookTitle: string;
  accessionNo: string;
  borrowerUsn: string;
  borrowerName: string;
  borrowerRole: 'STUDENT' | 'FACULTY';
  issuedDate: string;
  dueDate: string;
  status: 'ACTIVE' | 'OVERDUE' | 'RETURNED';
  fineAmount: number;
}

export const LibraryCatalogView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'circulation' | 'journals'>('catalog');
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedBookForIssue, setSelectedBookForIssue] = useState<BookItem | null>(null);
  const [borrowerUsnInput, setBorrowerUsnInput] = useState('');
  const [successToast, setSuccessToast] = useState('');

  // Deterministic catalog books
  const [books, setBooks] = useState<BookItem[]>([
    {
      id: 'bk_1',
      accessionNo: 'CU-LIB-CS-0412',
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
      isbn: '978-0262046305',
      callNumber: 'QA76.6 .C662 2022',
      department: 'Computer Science',
      rackLocation: 'Rack 4B • Shelf 3',
      totalCopies: 12,
      availableCopies: 4,
      edition: '4th Edition (2022)',
      publisher: 'MIT Press',
      status: 'AVAILABLE'
    },
    {
      id: 'bk_2',
      accessionNo: 'CU-LIB-CS-0884',
      title: 'Designing Data-Intensive Applications',
      author: 'Martin Kleppmann',
      isbn: '978-1449373320',
      callNumber: 'QA76.9.D3 K55 2017',
      department: 'Computer Science',
      rackLocation: 'Rack 4B • Shelf 1',
      totalCopies: 8,
      availableCopies: 2,
      edition: '1st Edition (2017)',
      publisher: "O'Reilly Media",
      status: 'AVAILABLE'
    },
    {
      id: 'bk_3',
      accessionNo: 'CU-LIB-AI-1033',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0134610993',
      callNumber: 'Q335 .R86 2020',
      department: 'AI & Data Science',
      rackLocation: 'Rack 5A • Shelf 2',
      totalCopies: 15,
      availableCopies: 0,
      edition: '4th Global Edition',
      publisher: 'Pearson Education',
      status: 'ISSUED'
    },
    {
      id: 'bk_4',
      accessionNo: 'CU-LIB-BIO-0219',
      title: 'Bioinformatics: Sequence and Genome Analysis',
      author: 'David W. Mount',
      isbn: '978-0879697129',
      callNumber: 'QH324.2 .M68 2004',
      department: 'Biosciences',
      rackLocation: 'Rack 2C • Shelf 4',
      totalCopies: 6,
      availableCopies: 3,
      edition: '2nd Edition',
      publisher: 'Cold Spring Harbor Laboratory',
      status: 'AVAILABLE'
    },
    {
      id: 'bk_5',
      accessionNo: 'CU-LIB-MGT-0551',
      title: 'Financial Management: Theory & Practice',
      author: 'Eugene F. Brigham, Michael C. Ehrhardt',
      isbn: '978-1305632295',
      callNumber: 'HG4026 .B669 2019',
      department: 'Management',
      rackLocation: 'Rack 1D • Shelf 2',
      totalCopies: 10,
      availableCopies: 6,
      edition: '16th Edition',
      publisher: 'Cengage Learning',
      status: 'AVAILABLE'
    },
    {
      id: 'bk_6',
      accessionNo: 'CU-LIB-LAW-0105',
      title: 'Constitution of India (Bare Act & Commentary)',
      author: 'Dr. Durga Das Basu',
      isbn: '978-9351439240',
      callNumber: 'KNS1744.5 .B37 2021',
      department: 'Law & Governance',
      rackLocation: 'Reference Section • Desk R1',
      totalCopies: 4,
      availableCopies: 4,
      edition: '9th Edition (2021)',
      publisher: 'LexisNexis Butterworths',
      status: 'REFERENCE_ONLY'
    }
  ]);

  // Deterministic circulation desk records
  const [circulations, setCirculations] = useState<CirculationRecord[]>([
    {
      id: 'cir_1',
      bookTitle: 'Artificial Intelligence: A Modern Approach',
      accessionNo: 'CU-LIB-AI-1033',
      borrowerUsn: '24MCA003',
      borrowerName: 'Arjun Kumar',
      borrowerRole: 'STUDENT',
      issuedDate: '2026-08-20',
      dueDate: '2026-09-03',
      status: 'OVERDUE',
      fineAmount: 15
    },
    {
      id: 'cir_2',
      bookTitle: 'Introduction to Algorithms (4th Edition)',
      accessionNo: 'CU-LIB-CS-0412',
      borrowerUsn: '24MCA018',
      borrowerName: 'Sneha Patel',
      borrowerRole: 'STUDENT',
      issuedDate: '2026-08-28',
      dueDate: '2026-09-11',
      status: 'ACTIVE',
      fineAmount: 0
    },
    {
      id: 'cir_3',
      bookTitle: 'Designing Data-Intensive Applications',
      accessionNo: 'CU-LIB-CS-0884',
      borrowerUsn: 'CUP2025/00303',
      borrowerName: 'Deepak B',
      borrowerRole: 'FACULTY',
      issuedDate: '2026-08-15',
      dueDate: '2026-09-15',
      status: 'ACTIVE',
      fineAmount: 0
    }
  ]);

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForIssue || !borrowerUsnInput.trim()) return;

    const newRecord: CirculationRecord = {
      id: `cir_${Date.now()}`,
      bookTitle: selectedBookForIssue.title,
      accessionNo: selectedBookForIssue.accessionNo,
      borrowerUsn: borrowerUsnInput.toUpperCase(),
      borrowerName: borrowerUsnInput.toUpperCase() === '24MCA003' ? 'Arjun Kumar' : 'Registered Scholar',
      borrowerRole: borrowerUsnInput.startsWith('CUP') ? 'FACULTY' : 'STUDENT',
      issuedDate: '2026-09-06',
      dueDate: '2026-09-20',
      status: 'ACTIVE',
      fineAmount: 0
    };

    setCirculations(prev => [newRecord, ...prev]);
    setBooks(prev => prev.map(b => b.id === selectedBookForIssue.id ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b));
    setSuccessToast(`Book "${selectedBookForIssue.title}" successfully issued to ${borrowerUsnInput.toUpperCase()}. Due date: Sep 20, 2026.`);
    setIssueModalOpen(false);
    setSelectedBookForIssue(null);
    setBorrowerUsnInput('');
    setTimeout(() => setSuccessToast(''), 4500);
  };

  const handleReturnBook = (recordId: string, accessionNo: string) => {
    setCirculations(prev => prev.map(c => c.id === recordId ? { ...c, status: 'RETURNED' } : c));
    setBooks(prev => prev.map(b => b.accessionNo === accessionNo ? { ...b, availableCopies: b.availableCopies + 1 } : b));
    setSuccessToast(`Book (Acc: ${accessionNo}) returned and RFID inventory updated.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery) ||
      b.accessionNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || b.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">Total Catalogued Volumes</span>
          <div className="text-2xl font-bold font-serif text-[#0a1e3b] mt-1">34,500</div>
          <span className="text-[10px] text-emerald-700 font-bold">100% RFID Tagged</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">Active Circulations</span>
          <div className="text-2xl font-bold font-serif text-amber-700 mt-1">1,420</div>
          <span className="text-[10px] text-slate-500 font-medium">Students &amp; Faculty</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">Today's Returns</span>
          <div className="text-2xl font-bold font-serif text-emerald-700 mt-1">68</div>
          <span className="text-[10px] text-emerald-700 font-medium">RFID Auto-Cleared</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-500 font-semibold">Overdue Alerts</span>
          <div className="text-2xl font-bold font-serif text-rose-700 mt-1">14</div>
          <span className="text-[10px] text-rose-600 font-bold">₹5/day Fine Enforced</span>
        </div>
      </div>

      {/* Sub Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('catalog')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'catalog' ? 'bg-[#0a1e3b] text-amber-300 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Book Catalog Search
          </button>
          <button
            onClick={() => setActiveSubTab('circulation')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'circulation' ? 'bg-[#0a1e3b] text-amber-300 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Circulation Desk ({circulations.filter(c => c.status !== 'RETURNED').length})
          </button>
          <button
            onClick={() => setActiveSubTab('journals')}
            className={`px-3 py-1.5 rounded-lg transition ${activeSubTab === 'journals' ? 'bg-[#0a1e3b] text-amber-300 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Subscribed Academic Journals
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium hidden sm:inline">
          Central Library • KOHA Integrated ILS
        </span>
      </div>

      {/* SUB TAB 1: BOOK CATALOG */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search Title, Author, ISBN, Accession #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-500 font-semibold text-[11px] shrink-0">School / Dept:</span>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="p-2 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Departments (6)</option>
                <option value="Computer Science">Computer Science</option>
                <option value="AI & Data Science">AI &amp; Data Science</option>
                <option value="Biosciences">Biosciences</option>
                <option value="Management">Management</option>
                <option value="Law & Governance">Law &amp; Governance</option>
              </select>
            </div>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                      {book.accessionNo}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      book.status === 'AVAILABLE' 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                        : book.status === 'REFERENCE_ONLY'
                        ? 'bg-purple-50 text-purple-800 border-purple-300'
                        : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}>
                      {book.status === 'AVAILABLE' ? 'Available' : book.status === 'REFERENCE_ONLY' ? 'Reference Only' : 'Circulated'}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 mt-2 line-clamp-2 leading-snug">
                    {book.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                    by {book.author}
                  </p>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-lg text-[11px] space-y-1 text-slate-600 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Call No:</span>
                      <span className="font-mono font-semibold text-slate-800">{book.callNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shelf Location:</span>
                      <span className="font-semibold text-amber-800">{book.rackLocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Availability:</span>
                      <span className="font-bold text-slate-800">
                        {book.availableCopies} of {book.totalCopies} copies
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ISBN: {book.isbn.split('-')[1]}...
                  </span>

                  {book.status === 'AVAILABLE' && (
                    <button
                      onClick={() => {
                        setSelectedBookForIssue(book);
                        setIssueModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0a1e3b] text-amber-300 hover:bg-[#16284F] rounded-lg text-xs font-bold transition shadow-sm"
                    >
                      <BookMarked size={13} />
                      <span>Issue Loan</span>
                    </button>
                  )}

                  {book.status === 'REFERENCE_ONLY' && (
                    <span className="text-[10px] font-bold text-purple-700 italic">
                      In-Library Reading Only
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: CIRCULATION DESK */}
      {activeSubTab === 'circulation' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Active Book Loans &amp; Overdue Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">Automated 14-day student lending cycle with ₹5/day overdue penalty.</p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
              {circulations.filter(c => c.status !== 'RETURNED').length} Active Checkouts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Accession #</th>
                  <th className="p-3">Book Title</th>
                  <th className="p-3">Borrower (USN / ID)</th>
                  <th className="p-3">Issue Date</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Fine (₹)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {circulations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-800">{rec.accessionNo}</td>
                    <td className="p-3 font-semibold text-slate-900">{rec.bookTitle}</td>
                    <td className="p-3">
                      <span className="font-bold text-slate-800">{rec.borrowerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono block">{rec.borrowerUsn} ({rec.borrowerRole})</span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{rec.issuedDate}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{rec.dueDate}</td>
                    <td className="p-3">
                      {rec.status === 'OVERDUE' ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px]">
                          Overdue (3d)
                        </span>
                      ) : rec.status === 'ACTIVE' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                          Active Loan
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                          Returned
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-rose-700">
                      {rec.fineAmount > 0 ? `₹ ${rec.fineAmount}` : '₹ 0'}
                    </td>
                    <td className="p-3 text-right">
                      {rec.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleReturnBook(rec.id, rec.accessionNo)}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-bold transition shadow-sm"
                        >
                          <RotateCcw size={12} />
                          <span>Return</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB TAB 3: ACADEMIC JOURNALS */}
      {activeSubTab === 'journals' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              name: 'IEEE Xplore Digital Library',
              coverage: 'Transactions on Software Engineering, AI & Distributed Systems',
              access: 'Institutional IP Authenticated',
              token: 'CU-IEEE-SUB-2026',
              articles: '5.2M+ Papers'
            },
            {
              name: 'ACM Digital Library',
              coverage: 'Computing Surveys, Cryptography & Cloud Architectures',
              access: 'Full Campus Open Access',
              token: 'CU-ACM-2026-CAMPUS',
              articles: '3.8M+ Papers'
            },
            {
              name: 'SpringerLink Journals',
              coverage: 'Bioinformatics, Applied Mathematics & Operational Research',
              access: 'Institutional Proxy Enabled',
              token: 'CU-SPRINGER-CORE',
              articles: '2.4M+ Papers'
            },
            {
              name: 'Elsevier ScienceDirect',
              coverage: 'Computer Science, Artificial Intelligence & Data Privacy',
              access: 'Direct Shiro / OAuth Token',
              token: 'CU-ELSEVIER-2026',
              articles: '18M+ Articles'
            }
          ].map((journal, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{journal.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{journal.coverage}</p>
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <strong className="text-slate-800">{journal.access}</strong>
                </div>
                <div className="flex justify-between font-mono text-[11px]">
                  <span>Campus Token:</span>
                  <span className="text-amber-700 font-bold">{journal.token}</span>
                </div>
              </div>

              <button 
                onClick={() => alert(`Redirecting to ${journal.name} via Chanakya University EZProxy...`)}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-[#0a1e3b] hover:text-amber-300 rounded-lg text-xs font-bold transition text-slate-700"
              >
                <ExternalLink size={13} />
                <span>Launch EZProxy Access</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ISSUE BOOK MODAL */}
      {issueModalOpen && selectedBookForIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BookMarked size={18} className="text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Issue Book to Scholar</h3>
              </div>
              <button 
                onClick={() => setIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="font-bold text-slate-800">{selectedBookForIssue.title}</div>
              <div className="text-[11px] text-slate-500">{selectedBookForIssue.author}</div>
              <div className="font-mono text-[10px] text-amber-700 font-bold pt-1">
                Accession: {selectedBookForIssue.accessionNo} &bull; {selectedBookForIssue.rackLocation}
              </div>
            </div>

            <form onSubmit={handleIssueBook} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Borrower USN / Employee ID:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 24MCA003 or CUP2025/00303"
                  value={borrowerUsnInput}
                  onChange={(e) => setBorrowerUsnInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <span className="font-bold">Lending Policy:</span> 14 calendar days for students, 30 days for faculty. Automatic email reminder sent 2 days prior to due date.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-[#0a1e3b] text-amber-300 font-bold hover:bg-[#16284F] transition shadow"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LibraryCatalogView;
