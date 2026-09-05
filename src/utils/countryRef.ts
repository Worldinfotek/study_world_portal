import type { CountryMaster } from '../types';

export function countryCodeFromValue(value: string | undefined, countries: CountryMaster[]): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const byCode = countries.find((c) => c.code.toUpperCase() === raw.toUpperCase());
  if (byCode) return byCode.code;
  const byName = countries.find((c) => c.name.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.code;
  return raw.length <= 3 ? raw.toUpperCase() : raw;
}

export function countryDisplayName(value: string | undefined, countries: CountryMaster[]): string {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const byCode = countries.find((c) => c.code.toUpperCase() === raw.toUpperCase());
  if (byCode) return byCode.name;
  const byName = countries.find((c) => c.name.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.name;
  return raw;
}
