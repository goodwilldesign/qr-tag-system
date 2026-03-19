import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

const COUNTRIES = [
  { code: 'IN', name: 'India',             dial: '91',  flag: '🇮🇳' },
  { code: 'US', name: 'United States',     dial: '1',   flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom',    dial: '44',  flag: '🇬🇧' },
  { code: 'MY', name: 'Malaysia',          dial: '60',  flag: '🇲🇾' },
  { code: 'SG', name: 'Singapore',         dial: '65',  flag: '🇸🇬' },
  { code: 'AE', name: 'UAE',               dial: '971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia',      dial: '966', flag: '🇸🇦' },
  { code: 'AU', name: 'Australia',         dial: '61',  flag: '🇦🇺' },
  { code: 'CA', name: 'Canada',            dial: '1',   flag: '🇨🇦' },
  { code: 'PK', name: 'Pakistan',          dial: '92',  flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh',        dial: '880', flag: '🇧🇩' },
  { code: 'LK', name: 'Sri Lanka',         dial: '94',  flag: '🇱🇰' },
  { code: 'NP', name: 'Nepal',             dial: '977', flag: '🇳🇵' },
  { code: 'ID', name: 'Indonesia',         dial: '62',  flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines',       dial: '63',  flag: '🇵🇭' },
  { code: 'TH', name: 'Thailand',          dial: '66',  flag: '🇹🇭' },
  { code: 'QA', name: 'Qatar',             dial: '974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait',            dial: '965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain',           dial: '973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman',              dial: '968', flag: '🇴🇲' },
  { code: 'DE', name: 'Germany',           dial: '49',  flag: '🇩🇪' },
  { code: 'FR', name: 'France',            dial: '33',  flag: '🇫🇷' },
  { code: 'NL', name: 'Netherlands',       dial: '31',  flag: '🇳🇱' },
  { code: 'ZA', name: 'South Africa',      dial: '27',  flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria',           dial: '234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya',             dial: '254', flag: '🇰🇪' },
  { code: 'BR', name: 'Brazil',            dial: '55',  flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico',            dial: '52',  flag: '🇲🇽' },
  { code: 'NZ', name: 'New Zealand',       dial: '64',  flag: '🇳🇿' },
  { code: 'JP', name: 'Japan',             dial: '81',  flag: '🇯🇵' },
  { code: 'CN', name: 'China',             dial: '86',  flag: '🇨🇳' },
];

const DEFAULT_COUNTRY = COUNTRIES[0]; // India

/**
 * PhoneInput
 *
 * Props:
 *   value       – full phone string stored, e.g. "919876543210"
 *   onChange    – called with new full string on every change
 *   placeholder – placeholder for the number part, default "9876543210"
 *   required    – forwarded to input
 */
export default function PhoneInput({ value = '', onChange, placeholder = '9876543210', required }) {
  // Parse existing value: try to match a known dial code prefix
  const parseValue = (v) => {
    const digits = v.replace(/[^0-9]/g, '');
    for (const c of COUNTRIES) {
      if (digits.startsWith(c.dial)) {
        return { country: c, local: digits.slice(c.dial.length) };
      }
    }
    return { country: DEFAULT_COUNTRY, local: digits };
  };

  const parsed = parseValue(value);
  const [country, setCountry] = useState(parsed.country);
  const [local, setLocal] = useState(parsed.local);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    const p = parseValue(value);
    setCountry(p.country);
    setLocal(p.local);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false); setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const emit = (c, l) => {
    const digits = l.replace(/[^0-9]/g, '');
    onChange?.(c.dial + digits);
  };

  const handleCountrySelect = (c) => {
    setCountry(c); setOpen(false); setSearch('');
    emit(c, local);
  };

  const handleLocalChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setLocal(digits);
    emit(country, digits);
  };

  const filtered = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dial.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex gap-0 rounded-xl border border-slate-300 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 overflow-hidden bg-white transition-all">
      {/* Country Selector */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => { setOpen(o => !o); setSearch(''); }}
          className="flex items-center gap-1.5 px-3 h-full text-sm font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 transition-colors min-w-[88px]"
        >
          <span className="text-base leading-none">{country.flag}</span>
          <span className="text-slate-500">+{country.dial}</span>
          <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-fade-in">
            {/* Search */}
            <div className="p-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search country…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-violet-400"
                />
              </div>
            </div>
            {/* List */}
            <ul className="max-h-52 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="py-3 text-center text-sm text-slate-400">No results</li>
              )}
              {filtered.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-violet-50 transition-colors ${country.code === c.code ? 'bg-violet-50 font-semibold text-violet-700' : 'text-slate-700'}`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-slate-400 text-xs shrink-0">+{c.dial}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Number Input */}
      <input
        type="tel"
        inputMode="numeric"
        className="flex-1 px-3 py-3 text-sm text-slate-800 outline-none bg-transparent placeholder:text-slate-400 min-w-0"
        placeholder={placeholder}
        value={local}
        onChange={handleLocalChange}
        required={required}
      />
    </div>
  );
}
