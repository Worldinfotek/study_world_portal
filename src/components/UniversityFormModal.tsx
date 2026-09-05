import React, { useEffect, useState } from 'react';
import { University, CountryMaster } from '../types';
import { countryCodeFromValue } from '../utils/countryRef';
import { X, Save, AlertCircle } from 'lucide-react';

interface UniversityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (university: University) => void;
  initialUniversity?: University | null;
  countries: CountryMaster[];
}

export const UniversityFormModal: React.FC<UniversityFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialUniversity,
  countries,
}) => {
  const isEditing = !!initialUniversity;

  const [uniId, setUniId] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('GB');
  const [city, setCity] = useState('');
  const [campus, setCampus] = useState('Main Campus');
  const [website, setWebsite] = useState('https://www.');
  const [logoUrl, setLogoUrl] = useState(
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80'
  );
  const [email, setEmail] = useState('admissions@');
  const [phone, setPhone] = useState('+44 ');
  const [ranking, setRanking] = useState<number | undefined>(350);
  const [establishedYear, setEstablishedYear] = useState<number | undefined>(1965);
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [overview, setOverview] = useState(
    'Leading international university providing high quality education, research programs, and student employability support.'
  );
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (initialUniversity) {
      setUniId(initialUniversity.university_id);
      setName(initialUniversity.name || '');
      setCountry(countryCodeFromValue(initialUniversity.country, countries) || countries[0]?.code || 'GB');
      setCity(initialUniversity.city || '');
      setCampus(initialUniversity.campus || '');
      setWebsite(initialUniversity.website || '');
      setLogoUrl(initialUniversity.logo_url || '');
      setEmail(initialUniversity.contact_info?.email || '');
      setPhone(initialUniversity.contact_info?.phone || '');
      setRanking(initialUniversity.ranking);
      setEstablishedYear(initialUniversity.established_year);
      setStatus(initialUniversity.status || 'Active');
      setOverview(initialUniversity.overview || '');
    } else {
      setUniId(`uni_${Date.now().toString(36)}`);
      setName('');
      setCountry(countries[0]?.code || 'GB');
      setCity('');
      setCampus('Main Campus');
      setWebsite('https://www.');
      setLogoUrl(
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80'
      );
      setEmail('admissions@');
      setPhone('+44 ');
      setRanking(350);
      setEstablishedYear(1965);
      setStatus('Active');
      setOverview(
        'Leading international university providing high quality education, research programs, and student employability support.'
      );
    }
    setErrorMessage('');
  }, [isOpen, initialUniversity, countries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('University name is required.');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('City is required.');
      return;
    }

    const savedUni: University = {
      university_id: uniId,
      name: name.trim(),
      country,
      city: city.trim(),
      campus: campus.trim() || undefined,
      website: website.trim(),
      logo_url: logoUrl.trim(),
      contact_info: {
        email: email.trim(),
        phone: phone.trim(),
      },
      status,
      ranking: ranking ? Number(ranking) : undefined,
      established_year: establishedYear ? Number(establishedYear) : undefined,
      overview: overview.trim(),
      date_added: initialUniversity?.date_added || new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString().split('T')[0],
    };

    onSave(savedUni);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-display font-bold">
              {isEditing ? 'Edit Partner University' : 'Add Partner University'}
            </h2>
            <p className="text-xs text-stone-200 mt-0.5">
              Study World Consultant Partner Network
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">University Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. University of Aberdeen"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Country Destination *</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                required
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">City *</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Aberdeen"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Campus Location(s)</label>
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="e.g. King's College Campus"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Official Website URL</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Logo Image URL</label>
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Admissions Contact Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Admissions Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">World Ranking (QS/Times)</label>
              <input
                type="number"
                value={ranking || ''}
                onChange={(e) => setRanking(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g. 200"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Established Year</label>
              <input
                type="number"
                value={establishedYear || ''}
                onChange={(e) => setEstablishedYear(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="e.g. 1495"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Listing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive')}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Institutional Overview</label>
            <textarea
              rows={3}
              value={overview}
              onChange={(e) => setOverview(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Save Changes' : 'Create University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
