import React, { useState } from 'react';
import { ImportHistoryRecord } from '../types';
import { exportToCsv } from '../utils/exportUtils';
import {
  History,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  User,
  ArrowUpDown,
  Search,
} from 'lucide-react';

interface ImportHistoryViewProps {
  importHistory: ImportHistoryRecord[];
  onNavigate: (screen: string) => void;
}

export const ImportHistoryView: React.FC<ImportHistoryViewProps> = ({
  importHistory,
  onNavigate,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<ImportHistoryRecord | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = importHistory.filter((item) => {
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchFile = item.file_name.toLowerCase().includes(q);
      const user = item.imported_by || item.admin_email || '';
      const matchUser = user.toLowerCase().includes(q);
      if (!matchFile && !matchUser) return false;
    }
    return true;
  });

  const handleDownloadErrors = (record: ImportHistoryRecord) => {
    const errList = record.errors || (record.error_report ? record.error_report.map(e => `Row ${e.row}: ${e.reason}`) : []);
    if (!errList || errList.length === 0) return;
    const errorRows = errList.map((err, i) => ({
      'Item #': i + 1,
      'File Name': record.file_name,
      'Timestamp': new Date(record.timestamp).toISOString(),
      'Error Detail': err,
    }));
    exportToCsv(`Errors_${record.file_name}.csv`, errorRows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A8382C] text-white">
              Audit Trail
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Section 7.2: Import Logging & Error Tracking
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#7A2820] mt-1">
            Data Import History
          </h1>
          <p className="text-xs text-stone-500">
            Audit logs of all bulk data ingestion operations, row counts, and validation discrepancy files
          </p>
        </div>

        <button
          onClick={() => onNavigate('data_upload')}
          className="px-4 py-2 bg-[#A8382C] hover:bg-[#7A2820] text-white font-bold text-xs rounded-xl shadow-xs self-start sm:self-auto"
        >
          + Upload New File
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name or counselor..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-[#FBF6F1] focus:bg-white focus:outline-none focus:border-[#A8382C]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#A8382C] font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Courses">Courses</option>
            <option value="Universities">Universities</option>
            <option value="Requirements">Requirements</option>
            <option value="Countries">Countries</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF6F1] text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">File Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Imported By</th>
                <th className="p-3.5">Total Rows</th>
                <th className="p-3.5">Successful</th>
                <th className="p-3.5">Skipped / Failed</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredHistory.map((rec) => {
                const dateStr = new Date(rec.timestamp).toLocaleString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <tr key={rec.id} className="hover:bg-[#FBF6F1] transition-colors">
                    <td className="p-3.5 font-medium text-stone-600">
                      {dateStr}
                    </td>
                    <td className="p-3.5 font-bold text-stone-900 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-[#A8382C]" />
                      <span>{rec.file_name}</span>
                    </td>
                    <td className="p-3.5 font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold">
                        {rec.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-700">{rec.imported_by || rec.admin_email || 'Admin'}</td>
                    <td className="p-3.5 font-bold">{rec.total_rows ?? rec.total_records ?? (rec.imported + (rec.skipped ?? rec.failed ?? 0))}</td>
                    <td className="p-3.5 text-emerald-700 font-bold">{rec.imported}</td>
                    <td className="p-3.5 text-rose-700 font-bold">{rec.skipped ?? rec.failed ?? 0}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      {((rec.errors && rec.errors.length > 0) || (rec.error_report && rec.error_report.length > 0)) ? (
                        <button
                          onClick={() => handleDownloadErrors(rec)}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>Error Log</span>
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Clean</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
