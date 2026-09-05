import React, { useState } from 'react';
import { CountryMaster, UserAccount } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import { ViewportOverlay } from '../components/ViewportOverlay';
import {
  Globe2,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface CountriesViewProps {
  countries: CountryMaster[];
  currentUser: UserAccount;
  onSaveCountry: (country: CountryMaster) => void;
  onDeleteCountry: (countryCode: string) => void;
}

export const CountriesView: React.FC<CountriesViewProps> = ({
  countries,
  currentUser,
  onSaveCountry,
  onDeleteCountry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCountry, setEditingCountry] = useState<CountryMaster | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [currency, setCurrency] = useState('GBP');
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const [flag, setFlag] = useState('🇬🇧');
  const [active, setActive] = useState(true);
  const [pswDuration, setPswDuration] = useState('2 Years');

  const isAdmin = currentUser.role === 'Admin';

  const filteredCountries = countries.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
  });

  const handleOpenAdd = () => {
    setEditingCountry(null);
    setName('');
    setCode('');
    setCurrency('USD');
    setCurrencySymbol('$');
    setFlag('🌍');
    setActive(true);
    setPswDuration('2 Years');
    setShowModal(true);
  };

  const handleOpenEdit = (c: CountryMaster) => {
    setEditingCountry(c);
    setName(c.name);
    setCode(c.code);
    setCurrency(c.currency);
    setCurrencySymbol(c.currency_symbol);
    setFlag(c.flag);
    setActive(c.active !== undefined ? c.active : (c.is_active ?? true));
    setPswDuration(c.psw_duration || c.post_study_work_visa || '2 Years');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;

    const saved: CountryMaster = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
      currency: currency.trim().toUpperCase(),
      currency_symbol: currencySymbol.trim(),
      flag: flag.trim() || '🌍',
      active,
      is_active: active,
      psw_duration: pswDuration.trim(),
      post_study_work_visa: pswDuration.trim(),
    };

    onSaveCountry(saved);
    setShowModal(false);
  };

  const handleExportCsv = () => {
    const rows = filteredCountries.map((c) => ({
      'Country Code': c.code,
      'Destination Name': c.name,
      'Currency': `${c.currency} (${c.currency_symbol})`,
      'Post-Study Work Visa': c.psw_duration || c.post_study_work_visa || '2 Years',
      'Status': c.active ? 'Active' : 'Inactive',
    }));
    exportToCsv(`SWC_Destinations_Directory_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['Country Flag & Name', 'ISO Code', 'Currency', 'Post-Study Work Visa', 'Status'];
    const rows = filteredCountries.map((c) => [
      `${c.flag} ${c.name}`,
      c.code,
      `${c.currency} (${c.currency_symbol})`,
      c.psw_duration || c.post_study_work_visa || '2 Years',
      c.active ? 'Active' : 'Inactive',
    ]);

    printFormattedReport({
      title: 'Study World Consultant — Study Destinations Registry',
      subtitle: `Authorized Global Study Destinations & Visa Parameters (${filteredCountries.length} Countries)`,
      badgeText: 'Destinations Roster',
      headers,
      rows,
      currentUser,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#701C18] text-white">
              Master Data
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Study Destinations & Currencies
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#701C18] mt-1">
            Countries & Destinations
          </h1>
          <p className="text-xs text-stone-500">
            Configure partner study destinations, ISO codes, local currencies, and post-study work visa rights
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handlePrintPdf}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#701C18]" />
            <span>Print / PDF</span>
          </button>

          {(isAdmin || currentUser.export_permission) && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Destination</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs text-xs">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country name or code..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-[#FBF6F1] focus:bg-white focus:outline-none focus:border-[#A8382C]"
          />
        </div>
      </div>

      {/* Countries Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCountries.map((c) => (
          <div
            key={c.code}
            className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#A8382C] transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{c.flag}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    (c.active ?? c.is_active ?? true)
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {(c.active ?? c.is_active ?? true) ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  {c.name}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  ISO: {c.code} · Currency: {c.currency} ({c.currency_symbol})
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-[#FBF6F1] text-xs">
                <span className="text-[10px] text-stone-500 uppercase block font-semibold">
                  Post-Study Work Visa
                </span>
                <span className="font-bold text-stone-800">
                  {c.psw_duration || c.post_study_work_visa || 'Standard'}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => handleOpenEdit(c)}
                  className="px-2.5 py-1 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete destination ${c.name}?`)) {
                      onDeleteCountry(c.code);
                    }
                  }}
                  className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg"
                  title="Delete Destination"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {showModal && (
        <ViewportOverlay onBackdropClick={() => setShowModal(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden text-xs">
            <div className="px-6 py-4 bg-[#7A2820] text-white flex items-center justify-between">
              <h3 className="font-display font-bold text-base">
                {editingCountry ? 'Edit Destination' : 'Add New Study Destination'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-stone-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Country Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. New Zealand"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">ISO Code (2-3 chars) *</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. NZ"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg uppercase font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Flag Emoji</label>
                  <input
                    type="text"
                    value={flag}
                    onChange={(e) => setFlag(e.target.value)}
                    placeholder="e.g. 🇳🇿"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Currency Code</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    placeholder="e.g. NZD"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg uppercase"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Currency Symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    placeholder="e.g. $"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-center"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Post-Study Work Visa Policy</label>
                <input
                  type="text"
                  value={pswDuration}
                  onChange={(e) => setPswDuration(e.target.value)}
                  placeholder="e.g. 3 Years Post Study Work"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activeDestCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 accent-[#A8382C]"
                />
                <label htmlFor="activeDestCheck" className="font-semibold text-stone-800">
                  Active Destination for University Admissions
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-stone-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#A8382C] hover:bg-[#7A2820] text-white font-bold rounded-lg shadow-sm"
                >
                  Save Destination
                </button>
              </div>
            </form>
          </div>
        </ViewportOverlay>
      )}
    </div>
  );
};
