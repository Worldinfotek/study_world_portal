var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server/loadEnv.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var appRoot = process.cwd();
var envFilePath = "";
function unique(paths) {
  return [...new Set(paths.filter(Boolean))];
}
function candidateDirs() {
  return unique([
    process.cwd(),
    typeof __dirname === "string" ? __dirname : "",
    typeof __dirname === "string" ? import_path.default.resolve(__dirname, "..") : ""
  ]);
}
function stripQuotes(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"') || trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
function getAppRoot() {
  return appRoot;
}
function getEnvFilePath() {
  return envFilePath;
}
function loadEnv() {
  const names = [".env", ".env.local", ".env.txt", "env"];
  for (const dir of candidateDirs()) {
    for (const name of names) {
      const file = import_path.default.join(dir, name);
      if (!import_fs.default.existsSync(file) || !import_fs.default.statSync(file).isFile()) continue;
      import_dotenv.default.config({ path: file, override: false });
      if (!envFilePath) envFilePath = file;
      appRoot = dir;
    }
  }
  const pkg = import_path.default.join(appRoot, "package.json");
  if (!import_fs.default.existsSync(pkg)) {
    const parentPkg = import_path.default.join(appRoot, "..", "package.json");
    if (import_fs.default.existsSync(parentPkg)) appRoot = import_path.default.resolve(appRoot, "..");
  }
  try {
    if (import_fs.default.existsSync(import_path.default.join(appRoot, "package.json"))) {
      process.chdir(appRoot);
    }
  } catch {
  }
  for (const key of ["SQL_HOST", "SQL_DB_NAME", "SQL_USER", "SQL_PASSWORD", "SQL_PORT"]) {
    if (process.env[key]) process.env[key] = stripQuotes(String(process.env[key]));
  }
  if (process.env.IISNODE_VERSION) {
    process.env.NODE_ENV = "production";
  }
  return envFilePath;
}

// src/server/app.ts
var import_express7 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);

// src/data/countriesData.ts
var ALL_COUNTRIES_DATA = [
  { code: "AF", name: "Afghanistan", flag: "\u{1F1E6}\u{1F1EB}", currency: "AFN", currency_symbol: "\u060B", region: "Asia" },
  { code: "AL", name: "Albania", flag: "\u{1F1E6}\u{1F1F1}", currency: "ALL", currency_symbol: "L", region: "Europe" },
  { code: "DZ", name: "Algeria", flag: "\u{1F1E9}\u{1F1FF}", currency: "DZD", currency_symbol: "\u062F.\u062C", region: "Africa" },
  { code: "AD", name: "Andorra", flag: "\u{1F1E6}\u{1F1E9}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "AO", name: "Angola", flag: "\u{1F1E6}\u{1F1F4}", currency: "AOA", currency_symbol: "Kz", region: "Africa" },
  { code: "AG", name: "Antigua and Barbuda", flag: "\u{1F1E6}\u{1F1EC}", currency: "XCD", currency_symbol: "$", region: "Americas" },
  { code: "AR", name: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", currency: "ARS", currency_symbol: "$", region: "Americas" },
  { code: "AM", name: "Armenia", flag: "\u{1F1E6}\u{1F1F2}", currency: "AMD", currency_symbol: "\u058F", region: "Asia" },
  { code: "AU", name: "Australia", flag: "\u{1F1E6}\u{1F1FA}", currency: "AUD", currency_symbol: "A$", region: "Oceania" },
  { code: "AT", name: "Austria", flag: "\u{1F1E6}\u{1F1F9}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "AZ", name: "Azerbaijan", flag: "\u{1F1E6}\u{1F1FF}", currency: "AZN", currency_symbol: "\u20BC", region: "Asia" },
  { code: "BS", name: "Bahamas", flag: "\u{1F1E7}\u{1F1F8}", currency: "BSD", currency_symbol: "$", region: "Americas" },
  { code: "BH", name: "Bahrain", flag: "\u{1F1E7}\u{1F1ED}", currency: "BHD", currency_symbol: ".\u062F.\u0628", region: "Middle East" },
  { code: "BD", name: "Bangladesh", flag: "\u{1F1E7}\u{1F1E9}", currency: "BDT", currency_symbol: "\u09F3", region: "Asia" },
  { code: "BB", name: "Barbados", flag: "\u{1F1E7}\u{1F1E7}", currency: "BBD", currency_symbol: "$", region: "Americas" },
  { code: "BY", name: "Belarus", flag: "\u{1F1E7}\u{1F1FE}", currency: "BYN", currency_symbol: "Br", region: "Europe" },
  { code: "BE", name: "Belgium", flag: "\u{1F1E7}\u{1F1EA}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "BZ", name: "Belize", flag: "\u{1F1E7}\u{1F1FF}", currency: "BZD", currency_symbol: "$", region: "Americas" },
  { code: "BJ", name: "Benin", flag: "\u{1F1E7}\u{1F1EF}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "BT", name: "Bhutan", flag: "\u{1F1E7}\u{1F1F9}", currency: "BTN", currency_symbol: "Nu.", region: "Asia" },
  { code: "BO", name: "Bolivia", flag: "\u{1F1E7}\u{1F1F4}", currency: "BOB", currency_symbol: "Bs.", region: "Americas" },
  { code: "BA", name: "Bosnia and Herzegovina", flag: "\u{1F1E7}\u{1F1E6}", currency: "BAM", currency_symbol: "KM", region: "Europe" },
  { code: "BW", name: "Botswana", flag: "\u{1F1E7}\u{1F1FC}", currency: "BWP", currency_symbol: "P", region: "Africa" },
  { code: "BR", name: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", currency: "BRL", currency_symbol: "R$", region: "Americas" },
  { code: "BN", name: "Brunei", flag: "\u{1F1E7}\u{1F1F3}", currency: "BND", currency_symbol: "$", region: "Asia" },
  { code: "BG", name: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}", currency: "BGN", currency_symbol: "\u043B\u0432", region: "Europe" },
  { code: "BF", name: "Burkina Faso", flag: "\u{1F1E7}\u{1F1EB}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "BI", name: "Burundi", flag: "\u{1F1E7}\u{1F1EE}", currency: "BIF", currency_symbol: "FBu", region: "Africa" },
  { code: "KH", name: "Cambodia", flag: "\u{1F1F0}\u{1F1ED}", currency: "KHR", currency_symbol: "\u17DB", region: "Asia" },
  { code: "CM", name: "Cameroon", flag: "\u{1F1E8}\u{1F1F2}", currency: "XAF", currency_symbol: "FCFA", region: "Africa" },
  { code: "CA", name: "Canada", flag: "\u{1F1E8}\u{1F1E6}", currency: "CAD", currency_symbol: "C$", region: "Americas" },
  { code: "CV", name: "Cape Verde", flag: "\u{1F1E8}\u{1F1FB}", currency: "CVE", currency_symbol: "$", region: "Africa" },
  { code: "CF", name: "Central African Republic", flag: "\u{1F1E8}\u{1F1EB}", currency: "XAF", currency_symbol: "FCFA", region: "Africa" },
  { code: "TD", name: "Chad", flag: "\u{1F1F9}\u{1F1E9}", currency: "XAF", currency_symbol: "FCFA", region: "Africa" },
  { code: "CL", name: "Chile", flag: "\u{1F1E8}\u{1F1F1}", currency: "CLP", currency_symbol: "$", region: "Americas" },
  { code: "CN", name: "China", flag: "\u{1F1E8}\u{1F1F3}", currency: "CNY", currency_symbol: "\xA5", region: "Asia" },
  { code: "CO", name: "Colombia", flag: "\u{1F1E8}\u{1F1F4}", currency: "COP", currency_symbol: "$", region: "Americas" },
  { code: "KM", name: "Comoros", flag: "\u{1F1F0}\u{1F1F2}", currency: "KMF", currency_symbol: "CF", region: "Africa" },
  { code: "CG", name: "Congo", flag: "\u{1F1E8}\u{1F1EC}", currency: "XAF", currency_symbol: "FCFA", region: "Africa" },
  { code: "CR", name: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}", currency: "CRC", currency_symbol: "\u20A1", region: "Americas" },
  { code: "HR", name: "Croatia", flag: "\u{1F1ED}\u{1F1F7}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "CU", name: "Cuba", flag: "\u{1F1E8}\u{1F1FA}", currency: "CUP", currency_symbol: "$", region: "Americas" },
  { code: "CY", name: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "CZ", name: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}", currency: "CZK", currency_symbol: "K\u010D", region: "Europe" },
  { code: "DK", name: "Denmark", flag: "\u{1F1E9}\u{1F1F0}", currency: "DKK", currency_symbol: "kr", region: "Europe" },
  { code: "DJ", name: "Djibouti", flag: "\u{1F1E9}\u{1F1EF}", currency: "DJF", currency_symbol: "Fdj", region: "Africa" },
  { code: "DM", name: "Dominica", flag: "\u{1F1E9}\u{1F1F2}", currency: "XCD", currency_symbol: "$", region: "Americas" },
  { code: "DO", name: "Dominican Republic", flag: "\u{1F1E9}\u{1F1F4}", currency: "DOP", currency_symbol: "$", region: "Americas" },
  { code: "EC", name: "Ecuador", flag: "\u{1F1EA}\u{1F1E8}", currency: "USD", currency_symbol: "$", region: "Americas" },
  { code: "EG", name: "Egypt", flag: "\u{1F1EA}\u{1F1EC}", currency: "EGP", currency_symbol: "E\xA3", region: "Africa" },
  { code: "SV", name: "El Salvador", flag: "\u{1F1F8}\u{1F1FB}", currency: "USD", currency_symbol: "$", region: "Americas" },
  { code: "GQ", name: "Equatorial Guinea", flag: "\u{1F1EC}\u{1F1F6}", currency: "XAF", currency_symbol: "FCFA", region: "Africa" },
  { code: "ER", name: "Eritrea", flag: "\u{1F1EA}\u{1F1F7}", currency: "ERN", currency_symbol: "Nfk", region: "Africa" },
  { code: "EE", name: "Estonia", flag: "\u{1F1EA}\u{1F1EA}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "SZ", name: "Eswatini", flag: "\u{1F1F8}\u{1F1FF}", currency: "SZL", currency_symbol: "L", region: "Africa" },
  { code: "ET", name: "Ethiopia", flag: "\u{1F1EA}\u{1F1F9}", currency: "ETB", currency_symbol: "Br", region: "Africa" },
  { code: "FJ", name: "Fiji", flag: "\u{1F1EB}\u{1F1EF}", currency: "FJD", currency_symbol: "$", region: "Oceania" },
  { code: "FI", name: "Finland", flag: "\u{1F1EB}\u{1F1EE}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "FR", name: "France", flag: "\u{1F1EB}\u{1F1F7}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "GA", name: "Gabon", flag: "\u{1F1EC}\u{1F1E6}", currency: "XAF", currency_symbol: "FCFA", region: "Africa" },
  { code: "GM", name: "Gambia", flag: "\u{1F1EC}\u{1F1F2}", currency: "GMD", currency_symbol: "D", region: "Africa" },
  { code: "GE", name: "Georgia", flag: "\u{1F1EC}\u{1F1EA}", currency: "GEL", currency_symbol: "\u20BE", region: "Asia" },
  { code: "DE", name: "Germany", flag: "\u{1F1E9}\u{1F1EA}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "GH", name: "Ghana", flag: "\u{1F1EC}\u{1F1ED}", currency: "GHS", currency_symbol: "GH\u20B5", region: "Africa" },
  { code: "GR", name: "Greece", flag: "\u{1F1EC}\u{1F1F7}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "GD", name: "Grenada", flag: "\u{1F1EC}\u{1F1E9}", currency: "XCD", currency_symbol: "$", region: "Americas" },
  { code: "GT", name: "Guatemala", flag: "\u{1F1EC}\u{1F1F9}", currency: "GTQ", currency_symbol: "Q", region: "Americas" },
  { code: "GN", name: "Guinea", flag: "\u{1F1EC}\u{1F1F3}", currency: "GNF", currency_symbol: "FG", region: "Africa" },
  { code: "GW", name: "Guinea-Bissau", flag: "\u{1F1EC}\u{1F1FC}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "GY", name: "Guyana", flag: "\u{1F1EC}\u{1F1FE}", currency: "GYD", currency_symbol: "$", region: "Americas" },
  { code: "HT", name: "Haiti", flag: "\u{1F1ED}\u{1F1F9}", currency: "HTG", currency_symbol: "G", region: "Americas" },
  { code: "HN", name: "Honduras", flag: "\u{1F1ED}\u{1F1F3}", currency: "HNL", currency_symbol: "L", region: "Americas" },
  { code: "HK", name: "Hong Kong", flag: "\u{1F1ED}\u{1F1F0}", currency: "HKD", currency_symbol: "HK$", region: "Asia" },
  { code: "HU", name: "Hungary", flag: "\u{1F1ED}\u{1F1FA}", currency: "HUF", currency_symbol: "Ft", region: "Europe" },
  { code: "IS", name: "Iceland", flag: "\u{1F1EE}\u{1F1F8}", currency: "ISK", currency_symbol: "kr", region: "Europe" },
  { code: "IN", name: "India", flag: "\u{1F1EE}\u{1F1F3}", currency: "INR", currency_symbol: "\u20B9", region: "Asia" },
  { code: "ID", name: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", currency: "IDR", currency_symbol: "Rp", region: "Asia" },
  { code: "IR", name: "Iran", flag: "\u{1F1EE}\u{1F1F7}", currency: "IRR", currency_symbol: "\uFDFC", region: "Middle East" },
  { code: "IQ", name: "Iraq", flag: "\u{1F1EE}\u{1F1F6}", currency: "IQD", currency_symbol: "\u0639.\u062F", region: "Middle East" },
  { code: "IE", name: "Ireland", flag: "\u{1F1EE}\u{1F1EA}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "IL", name: "Israel", flag: "\u{1F1EE}\u{1F1F1}", currency: "ILS", currency_symbol: "\u20AA", region: "Middle East" },
  { code: "IT", name: "Italy", flag: "\u{1F1EE}\u{1F1F9}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "JM", name: "Jamaica", flag: "\u{1F1EF}\u{1F1F2}", currency: "JMD", currency_symbol: "J$", region: "Americas" },
  { code: "JP", name: "Japan", flag: "\u{1F1EF}\u{1F1F5}", currency: "JPY", currency_symbol: "\xA5", region: "Asia" },
  { code: "JO", name: "Jordan", flag: "\u{1F1EF}\u{1F1F4}", currency: "JOD", currency_symbol: "JD", region: "Middle East" },
  { code: "KZ", name: "Kazakhstan", flag: "\u{1F1F0}\u{1F1FF}", currency: "KZT", currency_symbol: "\u20B8", region: "Asia" },
  { code: "KE", name: "Kenya", flag: "\u{1F1F0}\u{1F1EA}", currency: "KES", currency_symbol: "KSh", region: "Africa" },
  { code: "KW", name: "Kuwait", flag: "\u{1F1F0}\u{1F1FC}", currency: "KWD", currency_symbol: "KD", region: "Middle East" },
  { code: "KG", name: "Kyrgyzstan", flag: "\u{1F1F0}\u{1F1EC}", currency: "KGS", currency_symbol: "\u0441", region: "Asia" },
  { code: "LA", name: "Laos", flag: "\u{1F1F1}\u{1F1E6}", currency: "LAK", currency_symbol: "\u20AD", region: "Asia" },
  { code: "LV", name: "Latvia", flag: "\u{1F1F1}\u{1F1FB}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "LB", name: "Lebanon", flag: "\u{1F1F1}\u{1F1E7}", currency: "LBP", currency_symbol: "\u0644.\u0644", region: "Middle East" },
  { code: "LS", name: "Lesotho", flag: "\u{1F1F1}\u{1F1F8}", currency: "LSL", currency_symbol: "M", region: "Africa" },
  { code: "LR", name: "Liberia", flag: "\u{1F1F1}\u{1F1F7}", currency: "LRD", currency_symbol: "$", region: "Africa" },
  { code: "LY", name: "Libya", flag: "\u{1F1F1}\u{1F1FE}", currency: "LYD", currency_symbol: "LD", region: "Africa" },
  { code: "LI", name: "Liechtenstein", flag: "\u{1F1F1}\u{1F1EE}", currency: "CHF", currency_symbol: "CHF", region: "Europe" },
  { code: "LT", name: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "LU", name: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "MO", name: "Macau", flag: "\u{1F1F2}\u{1F1F4}", currency: "MOP", currency_symbol: "MOP$", region: "Asia" },
  { code: "MG", name: "Madagascar", flag: "\u{1F1F2}\u{1F1EC}", currency: "MGA", currency_symbol: "Ar", region: "Africa" },
  { code: "MW", name: "Malawi", flag: "\u{1F1F2}\u{1F1FC}", currency: "MWK", currency_symbol: "MK", region: "Africa" },
  { code: "MY", name: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", currency: "MYR", currency_symbol: "RM", region: "Asia" },
  { code: "MV", name: "Maldives", flag: "\u{1F1F2}\u{1F1FB}", currency: "MVR", currency_symbol: "Rf", region: "Asia" },
  { code: "ML", name: "Mali", flag: "\u{1F1F2}\u{1F1F1}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "MT", name: "Malta", flag: "\u{1F1F2}\u{1F1F9}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "MR", name: "Mauritania", flag: "\u{1F1F2}\u{1F1F7}", currency: "MRU", currency_symbol: "UM", region: "Africa" },
  { code: "MU", name: "Mauritius", flag: "\u{1F1F2}\u{1F1FA}", currency: "MUR", currency_symbol: "\u20A8", region: "Africa" },
  { code: "MX", name: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", currency: "MXN", currency_symbol: "$", region: "Americas" },
  { code: "MD", name: "Moldova", flag: "\u{1F1F2}\u{1F1E9}", currency: "MDL", currency_symbol: "L", region: "Europe" },
  { code: "MC", name: "Monaco", flag: "\u{1F1F2}\u{1F1E8}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "MN", name: "Mongolia", flag: "\u{1F1F2}\u{1F1F3}", currency: "MNT", currency_symbol: "\u20AE", region: "Asia" },
  { code: "ME", name: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "MA", name: "Morocco", flag: "\u{1F1F2}\u{1F1E6}", currency: "MAD", currency_symbol: "DH", region: "Africa" },
  { code: "MZ", name: "Mozambique", flag: "\u{1F1F2}\u{1F1FF}", currency: "MZN", currency_symbol: "MT", region: "Africa" },
  { code: "MM", name: "Myanmar", flag: "\u{1F1F2}\u{1F1F2}", currency: "MMK", currency_symbol: "K", region: "Asia" },
  { code: "NA", name: "Namibia", flag: "\u{1F1F3}\u{1F1E6}", currency: "NAD", currency_symbol: "$", region: "Africa" },
  { code: "NP", name: "Nepal", flag: "\u{1F1F3}\u{1F1F5}", currency: "NPR", currency_symbol: "\u0930\u0942", region: "Asia" },
  { code: "NL", name: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "NZ", name: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}", currency: "NZD", currency_symbol: "NZ$", region: "Oceania" },
  { code: "NI", name: "Nicaragua", flag: "\u{1F1F3}\u{1F1EE}", currency: "NIO", currency_symbol: "C$", region: "Americas" },
  { code: "NE", name: "Niger", flag: "\u{1F1F3}\u{1F1EA}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "NG", name: "Nigeria", flag: "\u{1F1F3}\u{1F1EC}", currency: "NGN", currency_symbol: "\u20A6", region: "Africa" },
  { code: "MK", name: "North Macedonia", flag: "\u{1F1F2}\u{1F1F0}", currency: "MKD", currency_symbol: "\u0434\u0435\u043D", region: "Europe" },
  { code: "NO", name: "Norway", flag: "\u{1F1F3}\u{1F1F4}", currency: "NOK", currency_symbol: "kr", region: "Europe" },
  { code: "OM", name: "Oman", flag: "\u{1F1F4}\u{1F1F2}", currency: "OMR", currency_symbol: "\u0631.\u0639.", region: "Middle East" },
  { code: "PK", name: "Pakistan", flag: "\u{1F1F5}\u{1F1F0}", currency: "PKR", currency_symbol: "Rs", region: "Asia" },
  { code: "PS", name: "Palestine", flag: "\u{1F1F5}\u{1F1F8}", currency: "USD", currency_symbol: "$", region: "Middle East" },
  { code: "PA", name: "Panama", flag: "\u{1F1F5}\u{1F1E6}", currency: "USD", currency_symbol: "$", region: "Americas" },
  { code: "PG", name: "Papua New Guinea", flag: "\u{1F1F5}\u{1F1EC}", currency: "PGK", currency_symbol: "K", region: "Oceania" },
  { code: "PY", name: "Paraguay", flag: "\u{1F1F5}\u{1F1FE}", currency: "PYG", currency_symbol: "\u20B2", region: "Americas" },
  { code: "PE", name: "Peru", flag: "\u{1F1F5}\u{1F1EA}", currency: "PEN", currency_symbol: "S/.", region: "Americas" },
  { code: "PH", name: "Philippines", flag: "\u{1F1F5}\u{1F1ED}", currency: "PHP", currency_symbol: "\u20B1", region: "Asia" },
  { code: "PL", name: "Poland", flag: "\u{1F1F5}\u{1F1F1}", currency: "PLN", currency_symbol: "z\u0142", region: "Europe" },
  { code: "PT", name: "Portugal", flag: "\u{1F1F5}\u{1F1F9}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "QA", name: "Qatar", flag: "\u{1F1F6}\u{1F1E6}", currency: "QAR", currency_symbol: "QR", region: "Middle East" },
  { code: "RO", name: "Romania", flag: "\u{1F1F7}\u{1F1F4}", currency: "RON", currency_symbol: "lei", region: "Europe" },
  { code: "RU", name: "Russia", flag: "\u{1F1F7}\u{1F1FA}", currency: "RUB", currency_symbol: "\u20BD", region: "Europe/Asia" },
  { code: "RW", name: "Rwanda", flag: "\u{1F1F7}\u{1F1FC}", currency: "RWF", currency_symbol: "FRw", region: "Africa" },
  { code: "SA", name: "Saudi Arabia", flag: "\u{1F1F8}\u{1F1E6}", currency: "SAR", currency_symbol: "SR", region: "Middle East" },
  { code: "SN", name: "Senegal", flag: "\u{1F1F8}\u{1F1F3}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "RS", name: "Serbia", flag: "\u{1F1F7}\u{1F1F8}", currency: "RSD", currency_symbol: "\u0434\u0438\u043D.", region: "Europe" },
  { code: "SC", name: "Seychelles", flag: "\u{1F1F8}\u{1F1E8}", currency: "SCR", currency_symbol: "SR", region: "Africa" },
  { code: "SL", name: "Sierra Leone", flag: "\u{1F1F8}\u{1F1F1}", currency: "SLE", currency_symbol: "Le", region: "Africa" },
  { code: "SG", name: "Singapore", flag: "\u{1F1F8}\u{1F1EC}", currency: "SGD", currency_symbol: "S$", region: "Asia" },
  { code: "SK", name: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "SI", name: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "SO", name: "Somalia", flag: "\u{1F1F8}\u{1F1F4}", currency: "SOS", currency_symbol: "Sh", region: "Africa" },
  { code: "ZA", name: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", currency: "ZAR", currency_symbol: "R", region: "Africa" },
  { code: "KR", name: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", currency: "KRW", currency_symbol: "\u20A9", region: "Asia" },
  { code: "SS", name: "South Sudan", flag: "\u{1F1F8}\u{1F1F8}", currency: "SSP", currency_symbol: "\xA3", region: "Africa" },
  { code: "ES", name: "Spain", flag: "\u{1F1EA}\u{1F1F8}", currency: "EUR", currency_symbol: "\u20AC", region: "Europe" },
  { code: "LK", name: "Sri Lanka", flag: "\u{1F1F1}\u{1F1F0}", currency: "LKR", currency_symbol: "Rs", region: "Asia" },
  { code: "SD", name: "Sudan", flag: "\u{1F1F8}\u{1F1E9}", currency: "SDG", currency_symbol: "\xA3", region: "Africa" },
  { code: "SR", name: "Suriname", flag: "\u{1F1F8}\u{1F1F7}", currency: "SRD", currency_symbol: "$", region: "Americas" },
  { code: "SE", name: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", currency: "SEK", currency_symbol: "kr", region: "Europe" },
  { code: "CH", name: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", currency: "CHF", currency_symbol: "CHF", region: "Europe" },
  { code: "SY", name: "Syria", flag: "\u{1F1F8}\u{1F1FE}", currency: "SYP", currency_symbol: "LS", region: "Middle East" },
  { code: "TW", name: "Taiwan", flag: "\u{1F1F9}\u{1F1FC}", currency: "TWD", currency_symbol: "NT$", region: "Asia" },
  { code: "TJ", name: "Tajikistan", flag: "\u{1F1F9}\u{1F1EF}", currency: "TJS", currency_symbol: "SM", region: "Asia" },
  { code: "TZ", name: "Tanzania", flag: "\u{1F1F9}\u{1F1FF}", currency: "TZS", currency_symbol: "TSh", region: "Africa" },
  { code: "TH", name: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", currency: "THB", currency_symbol: "\u0E3F", region: "Asia" },
  { code: "TG", name: "Togo", flag: "\u{1F1F9}\u{1F1EC}", currency: "XOF", currency_symbol: "CFA", region: "Africa" },
  { code: "TO", name: "Tonga", flag: "\u{1F1F9}\u{1F1F4}", currency: "TOP", currency_symbol: "T$", region: "Oceania" },
  { code: "TT", name: "Trinidad and Tobago", flag: "\u{1F1F9}\u{1F1F9}", currency: "TTD", currency_symbol: "TT$", region: "Americas" },
  { code: "TN", name: "Tunisia", flag: "\u{1F1F9}\u{1F1F3}", currency: "TND", currency_symbol: "DT", region: "Africa" },
  { code: "TR", name: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", currency: "TRY", currency_symbol: "\u20BA", region: "Europe/Asia" },
  { code: "TM", name: "Turkmenistan", flag: "\u{1F1F9}\u{1F1F2}", currency: "TMT", currency_symbol: "T", region: "Asia" },
  { code: "UG", name: "Uganda", flag: "UGX", currency: "UGX", currency_symbol: "USh", region: "Africa" },
  { code: "UA", name: "Ukraine", flag: "\u{1F1FA}\u{1F1E6}", currency: "UAH", currency_symbol: "\u20B4", region: "Europe" },
  { code: "AE", name: "United Arab Emirates", flag: "\u{1F1E6}\u{1F1EA}", currency: "AED", currency_symbol: "AED", region: "Middle East" },
  { code: "GB", name: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", currency: "GBP", currency_symbol: "\xA3", region: "Europe" },
  { code: "US", name: "United States", flag: "\u{1F1FA}\u{1F1F8}", currency: "USD", currency_symbol: "$", region: "Americas" },
  { code: "UY", name: "Uruguay", flag: "\u{1F1FA}\u{1F1FE}", currency: "UYU", currency_symbol: "$U", region: "Americas" },
  { code: "UZ", name: "Uzbekistan", flag: "\u{1F1FA}\u{1F1FF}", currency: "UZS", currency_symbol: "so\u02BBm", region: "Asia" },
  { code: "VE", name: "Venezuela", flag: "\u{1F1FB}\u{1F1EA}", currency: "VES", currency_symbol: "Bs.", region: "Americas" },
  { code: "VN", name: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", currency: "VND", currency_symbol: "\u20AB", region: "Asia" },
  { code: "YE", name: "Yemen", flag: "\u{1F1FE}\u{1F1EA}", currency: "YER", currency_symbol: "\uFDFC", region: "Middle East" },
  { code: "ZM", name: "Zambia", flag: "\u{1F1FF}\u{1F1F2}", currency: "ZMW", currency_symbol: "ZK", region: "Africa" },
  { code: "ZW", name: "Zimbabwe", flag: "\u{1F1FF}\u{1F1FC}", currency: "USD", currency_symbol: "$", region: "Africa" }
];
var ALL_GLOBAL_COUNTRIES = ALL_COUNTRIES_DATA.map((c) => c.name).sort(
  (a, b) => a.localeCompare(b)
);
var COUNTRY_SPECIFIC_PRESETS = {
  "United Kingdom": {
    active_universities_count: 18,
    visa_processing_weeks: "3-4 weeks",
    post_study_work_visa: "Graduate Route: 2-3 Years",
    financial_requirement_notes: "Tuition + 9 months living costs (\xA39,207 outside London, \xA312,006 inside London)"
  },
  "Australia": {
    active_universities_count: 14,
    visa_processing_weeks: "4-8 weeks",
    post_study_work_visa: "Subclass 485: 2-4 Years based on study level",
    financial_requirement_notes: "AUD 29,710/year living expenses + first year tuition + travel cost"
  },
  "Canada": {
    active_universities_count: 12,
    visa_processing_weeks: "6-12 weeks",
    post_study_work_visa: "PGWP: up to 3 years",
    financial_requirement_notes: "CAD 20,635 living expenses (GIC) + 1st year tuition"
  },
  "United States": {
    active_universities_count: 10,
    visa_processing_weeks: "2-5 weeks (Interview based)",
    post_study_work_visa: "OPT: 12 months (36 months for STEM extension)",
    financial_requirement_notes: "I-20 financial proof covering 1 full academic year tuition & living expenses"
  },
  "Ireland": {
    active_universities_count: 8,
    visa_processing_weeks: "4-6 weeks",
    post_study_work_visa: "Third Level Graduate Scheme: 1-2 Years",
    financial_requirement_notes: "\u20AC10,000 proof of funds + full tuition receipt"
  },
  "Germany": {
    active_universities_count: 6,
    visa_processing_weeks: "8-12 weeks",
    post_study_work_visa: "18-month job seeker visa post graduation",
    financial_requirement_notes: "Blocked account with \u20AC11,208/year"
  },
  "Malaysia": {
    active_universities_count: 7,
    visa_processing_weeks: "3-4 weeks",
    post_study_work_visa: "Limited / Transfer options to UK/Aus",
    financial_requirement_notes: "EMGS processing proof + bank statement of approx USD 5,000"
  },
  "United Arab Emirates": {
    active_universities_count: 5,
    visa_processing_weeks: "2-3 weeks",
    post_study_work_visa: "Green Visa / Golden Visa eligible for high achievers",
    financial_requirement_notes: "Tuition deposit + medical check clearance"
  },
  "New Zealand": {
    active_universities_count: 4,
    visa_processing_weeks: "5-8 weeks",
    post_study_work_visa: "Post-study work visa up to 3 years",
    financial_requirement_notes: "NZD 20,000/year living costs + full tuition"
  },
  "France": {
    active_universities_count: 3,
    visa_processing_weeks: "3-5 weeks",
    post_study_work_visa: "APS / Job search authorization up to 1-2 years",
    financial_requirement_notes: "\u20AC615/month living expenses proof + tuition receipt"
  },
  "Italy": {
    active_universities_count: 3,
    visa_processing_weeks: "4-6 weeks",
    post_study_work_visa: "Permesso di soggiorno per ricerca lavoro: 1 Year",
    financial_requirement_notes: "\u20AC6,000/year minimum living funds proof"
  },
  "Spain": {
    active_universities_count: 2,
    visa_processing_weeks: "4-6 weeks",
    post_study_work_visa: "Job search visa: 12 months post Master/PhD",
    financial_requirement_notes: "100% IPREM monthly (\u20AC600/month) + insurance"
  },
  "Netherlands": {
    active_universities_count: 3,
    visa_processing_weeks: "3-4 weeks (Via university IND)",
    post_study_work_visa: "Zoekjaar / Orientation Year: 1 Year",
    financial_requirement_notes: "\u20AC1,050/month living costs proof"
  },
  "Sweden": {
    active_universities_count: 2,
    visa_processing_weeks: "4-8 weeks",
    post_study_work_visa: "Residence permit to seek employment: 12 months",
    financial_requirement_notes: "SEK 9,450/month living expenses"
  },
  "Switzerland": {
    active_universities_count: 2,
    visa_processing_weeks: "8-12 weeks (Cantonal approval)",
    post_study_work_visa: "6 months job seeker permit",
    financial_requirement_notes: "CHF 21,000/year living costs guarantee"
  },
  "Turkey": {
    active_universities_count: 3,
    visa_processing_weeks: "2-4 weeks",
    post_study_work_visa: "Short-term residence permit transition available",
    financial_requirement_notes: "Proof of funds covering tuition and $500/month living costs"
  },
  "Cyprus": {
    active_universities_count: 3,
    visa_processing_weeks: "3-4 weeks",
    post_study_work_visa: "Standard European work permit pathway upon sponsorship",
    financial_requirement_notes: "Bank guarantee \u20AC5,000 + tuition fee receipt"
  },
  "Singapore": {
    active_universities_count: 2,
    visa_processing_weeks: "2-4 weeks",
    post_study_work_visa: "Long-Term Visit Pass (LTVP) for graduates: up to 1 Year",
    financial_requirement_notes: "Financial guarantee from sponsor or bank statement"
  },
  "China": {
    active_universities_count: 2,
    visa_processing_weeks: "2-3 weeks (X1 Visa with JW202)",
    post_study_work_visa: "Z-Visa / Entrepreneurship visa options for qualified graduates",
    financial_requirement_notes: "Bank balance proof of approx USD 3,000 - 5,000"
  }
};
var GLOBAL_COUNTRIES_MASTER = ALL_COUNTRIES_DATA.map((country) => {
  const preset = COUNTRY_SPECIFIC_PRESETS[country.name] || {};
  return {
    code: country.code,
    name: country.name,
    flag: country.flag,
    currency: country.currency,
    currency_symbol: country.currency_symbol,
    active_universities_count: preset.active_universities_count || 0,
    visa_processing_weeks: preset.visa_processing_weeks || "3-6 weeks",
    post_study_work_visa: preset.post_study_work_visa || "Standard post-study visa path",
    financial_requirement_notes: preset.financial_requirement_notes || `Proof of tuition fee + local living expenses in ${country.currency}`,
    is_active: true
  };
});

// src/data/mockData.ts
var INITIAL_FRANCHISES = [
  {
    id: "fr_lhr_gulberg",
    name: "Study World \u2014 Gulberg Lahore Franchise",
    code: "SWC-FR-LHR01",
    city: "Lahore",
    country: "Pakistan",
    address: "Suite 402, Al-Hafeez Heights, Main Boulevard Gulberg III",
    contact_person: "Chaudhry Salman",
    email: "gulberg@studyworldfranchise.pk",
    phone: "+92 42 35789012",
    status: "Active",
    created_at: "2025-02-15",
    max_sub_users: 5,
    commission_rate: 20,
    consultancy_fee_commission_pct: 50,
    university_commission_pct: 20,
    notes: "Premier flagship franchise covering Central Punjab student walk-ins."
  },
  {
    id: "fr_isb_f8",
    name: "Study World \u2014 Islamabad F-8 Franchise",
    code: "SWC-FR-ISB02",
    city: "Islamabad",
    country: "Pakistan",
    address: "Plaza 18, Street 12, F-8 Markaz",
    contact_person: "Hamza Farooq",
    email: "isb.f8@studyworldfranchise.pk",
    phone: "+92 51 2854321",
    status: "Active",
    created_at: "2025-04-10",
    max_sub_users: 4,
    commission_rate: 20,
    consultancy_fee_commission_pct: 60,
    university_commission_pct: 20,
    notes: "Capital territory branch handling high-tier undergraduate visa cases."
  },
  {
    id: "fr_dxb_deira",
    name: "Study World \u2014 Dubai International Franchise",
    code: "SWC-FR-DXB03",
    city: "Dubai",
    country: "United Arab Emirates",
    address: "Office 703, City Tower 2, Sheikh Zayed Road",
    contact_person: "Rashed Al-Maktoum / Imran Sheikh",
    email: "dubai@studyworldfranchise.ae",
    phone: "+971 4 398 7654",
    status: "Active",
    created_at: "2025-07-20",
    max_sub_users: 6,
    commission_rate: 25,
    consultancy_fee_commission_pct: 70,
    university_commission_pct: 25,
    notes: "GCC region hub recruiting expats for UK, Canada and Australia admissions."
  }
];
var COUNTRIES_MASTER = GLOBAL_COUNTRIES_MASTER;
var PROGRAMS_MASTER = [
  {
    id: "prg_1",
    name: "Foundation",
    rank_level: 1,
    description: "Pre-university preparation course bridging high school to undergraduate studies.",
    typical_duration_years: "0.5 - 1 Year",
    active_courses_count: 12
  },
  {
    id: "prg_2",
    name: "Diploma / Advanced Diploma",
    rank_level: 2,
    description: "Higher education vocational or technical academic qualification.",
    typical_duration_years: "1 - 2 Years",
    active_courses_count: 18
  },
  {
    id: "prg_3",
    name: "Associate Degree",
    rank_level: 3,
    description: "Two-year undergraduate degree offered by colleges and universities.",
    typical_duration_years: "2 Years",
    active_courses_count: 8
  },
  {
    id: "prg_4",
    name: "Bachelor's / Undergraduate",
    rank_level: 4,
    description: "Primary undergraduate degree leading to professional honors.",
    typical_duration_years: "3 - 4 Years",
    active_courses_count: 64
  },
  {
    id: "prg_5",
    name: "Graduate Certificate / Diploma",
    rank_level: 5,
    description: "Postgraduate qualification shorter than a full Master\u2019s degree.",
    typical_duration_years: "0.5 - 1 Year",
    active_courses_count: 14
  },
  {
    id: "prg_6",
    name: "Master's (Coursework)",
    rank_level: 6,
    description: "Postgraduate degree structured around lectures, tutorials, and applied projects.",
    typical_duration_years: "1 - 2 Years",
    active_courses_count: 52
  },
  {
    id: "prg_7",
    name: "Master's (Research)",
    rank_level: 7,
    description: "Advanced postgraduate thesis-based degree with research focus (MPhil / MRes).",
    typical_duration_years: "1.5 - 2 Years",
    active_courses_count: 10
  },
  {
    id: "prg_8",
    name: "Doctorate / PhD",
    rank_level: 8,
    description: "Highest academic degree involving extensive original scholarly research.",
    typical_duration_years: "3 - 4 Years",
    active_courses_count: 8
  },
  {
    id: "prg_9",
    name: "Post-Doctoral / Fellowship",
    rank_level: 9,
    description: "Professional fellowship and advanced academic research appointments.",
    typical_duration_years: "1 - 3 Years",
    active_courses_count: 4
  },
  {
    id: "prg_10",
    name: "Language / Pathway Program",
    rank_level: 0,
    description: "Pre-sessional English or pathway progression program before degree entry.",
    typical_duration_years: "2 - 6 Months",
    active_courses_count: 11
  }
];
var INITIAL_UNIVERSITIES = [
  {
    university_id: "uni_coventry",
    name: "Coventry University",
    country: "United Kingdom",
    city: "Coventry",
    campus: "Main Campus & London Campus",
    website: "https://www.coventry.ac.uk",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "international.admissions@coventry.ac.uk",
      phone: "+44 24 7765 7688",
      address: "Priory St, Coventry CV1 5FB, United Kingdom"
    },
    status: "Active",
    ranking: 550,
    established_year: 1843,
    overview: "Modern global university recognized for innovative teaching, state-of-the-art facilities, and strong industry employability links.",
    date_added: "2025-01-15",
    last_updated: "2026-08-10"
  },
  {
    university_id: "uni_hertfordshire",
    name: "University of Hertfordshire",
    country: "United Kingdom",
    city: "Hatfield",
    campus: "College Lane & de Havilland",
    website: "https://www.herts.ac.uk",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "international@herts.ac.uk",
      phone: "+44 1707 284800",
      address: "Hatfield AL10 9AB, United Kingdom"
    },
    status: "Active",
    ranking: 680,
    established_year: 1952,
    overview: "Leading business-facing university located just 25 minutes from central London with excellent practical industry ties.",
    date_added: "2025-01-20",
    last_updated: "2026-07-28"
  },
  {
    university_id: "uni_manchester_met",
    name: "Manchester Metropolitan University",
    country: "United Kingdom",
    city: "Manchester",
    campus: "All Saints Campus",
    website: "https://www.mmu.ac.uk",
    logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "international@mmu.ac.uk",
      phone: "+44 161 247 2000",
      address: "All Saints Building, Manchester M15 6BH, UK"
    },
    status: "Active",
    ranking: 590,
    established_year: 1970,
    overview: "Dynamic university in the heart of Manchester, renowned for business, computing, and creative arts.",
    date_added: "2025-02-05",
    last_updated: "2026-08-15"
  },
  {
    university_id: "uni_deakin",
    name: "Deakin University",
    country: "Australia",
    city: "Melbourne",
    campus: "Burwood, Geelong Waurn Ponds, Warrnambool",
    website: "https://www.deakin.edu.au",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "deakin-international@deakin.edu.au",
      phone: "+61 3 9627 4877",
      address: "221 Burwood Hwy, Burwood VIC 3125, Australia"
    },
    status: "Active",
    ranking: 197,
    established_year: 1974,
    overview: "Top 1% global university ranked among the world\u2019s best for student satisfaction, high graduate employment, and digital learning.",
    date_added: "2025-01-25",
    last_updated: "2026-08-12"
  },
  {
    university_id: "uni_uts",
    name: "University of Technology Sydney (UTS)",
    country: "Australia",
    city: "Sydney",
    campus: "City Campus (Ultimo)",
    website: "https://www.uts.edu.au",
    logo_url: "https://images.unsplash.com/photo-1568792923760-d70635a89fa1?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "international@uts.edu.au",
      phone: "+61 2 9514 1531",
      address: "15 Broadway, Ultimo NSW 2007, Australia"
    },
    status: "Active",
    ranking: 88,
    established_year: 1988,
    overview: "Australia\u2019s top-ranked young university with world-class engineering, technology, and business faculties.",
    date_added: "2025-02-10",
    last_updated: "2026-08-01"
  },
  {
    university_id: "uni_monash_01",
    name: "Monash University",
    country: "Australia",
    city: "Melbourne",
    campus: "Clayton & Caulfield Campus",
    website: "https://www.monash.edu",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "study@monash.edu",
      phone: "+61 3 9903 4788",
      address: "Wellington Rd, Clayton VIC 3800, Australia"
    },
    status: "Active",
    ranking: 42,
    established_year: 1958,
    overview: "Prestigious Group of Eight (Go8) university in Australia recognized worldwide for excellence in business, medicine, and engineering.",
    date_added: "2025-02-12",
    last_updated: "2026-08-20"
  },
  {
    university_id: "uni_windsor",
    name: "University of Windsor",
    country: "Canada",
    city: "Windsor",
    campus: "Main Campus",
    website: "https://www.uwindsor.ca",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "intladm@uwindsor.ca",
      phone: "+1 519 253 3000",
      address: "401 Sunset Ave, Windsor, ON N9B 3P4, Canada"
    },
    status: "Active",
    ranking: 620,
    established_year: 1963,
    overview: "Comprehensive university in Ontario near the US-Canada border, offering top Master of Applied Computing and engineering programs.",
    date_added: "2025-02-15",
    last_updated: "2026-07-20"
  },
  {
    university_id: "uni_yorkville",
    name: "Yorkville University",
    country: "Canada",
    city: "Toronto / Vancouver",
    campus: "Toronto Downtown & Vancouver",
    website: "https://www.yorkvilleu.ca",
    logo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "admissions@yorkvilleu.ca",
      phone: "+1 866 838 6542",
      address: "2000 Steeles Ave W, Concord, ON L4K 4N1, Canada"
    },
    status: "Active",
    ranking: 850,
    established_year: 2004,
    overview: "Career-focused Canadian university offering accelerated degree pathways with flexible intakes and PGWP eligibility.",
    date_added: "2025-03-01",
    last_updated: "2026-06-15"
  },
  {
    university_id: "uni_north_texas",
    name: "University of North Texas (UNT)",
    country: "United States",
    city: "Denton",
    campus: "Main Denton Campus & Frisco",
    website: "https://www.unt.edu",
    logo_url: "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "international@unt.edu",
      phone: "+1 940 565 2197",
      address: "1155 Union Cir, Denton, TX 76203, USA"
    },
    status: "Active",
    ranking: 410,
    established_year: 1890,
    overview: "Tier-one research institution in the Dallas-Fort Worth area with affordable tuition and STEM scholarships.",
    date_added: "2025-02-20",
    last_updated: "2026-08-05"
  },
  {
    university_id: "uni_galway",
    name: "University of Galway",
    country: "Ireland",
    city: "Galway",
    campus: "Main University Campus",
    website: "https://www.universityofgalway.ie",
    logo_url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "international@universityofgalway.ie",
      phone: "+353 91 493000",
      address: "University Rd, Galway, H91 TK33, Ireland"
    },
    status: "Active",
    ranking: 289,
    established_year: 1845,
    overview: "Top-tier Irish research university ranked in the top 2% worldwide, located in Ireland\u2019s cultural hub.",
    date_added: "2025-03-10",
    last_updated: "2026-08-11"
  },
  {
    university_id: "uni_taylors",
    name: "Taylor's University",
    country: "Malaysia",
    city: "Subang Jaya",
    campus: "Lakeside Campus",
    website: "https://university.taylors.edu.my",
    logo_url: "https://images.unsplash.com/photo-1562774053-701939374585?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "admissions@taylors.edu.my",
      phone: "+60 3 5629 5000",
      address: "1, Jalan Taylors, 47500 Subang Jaya, Selangor, Malaysia"
    },
    status: "Active",
    ranking: 251,
    established_year: 1969,
    overview: "Top private university in Southeast Asia offering dual degrees and UK transfer pathways in computing, hospitality, and design.",
    date_added: "2025-03-12",
    last_updated: "2026-07-15"
  },
  {
    university_id: "uni_iu_germany",
    name: "IU International University of Applied Sciences",
    country: "Germany",
    city: "Berlin / Bad Honnef",
    campus: "Berlin Campus",
    website: "https://www.iu.org",
    logo_url: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "study@iu.org",
      phone: "+49 30 311 98720",
      address: "Rolandstra\xDFe 8, 53604 Bad Honnef, Germany"
    },
    status: "Active",
    ranking: 750,
    established_year: 1998,
    overview: "Germany\u2019s largest accredited state-recognized university offering English-taught degrees with up to 50% international scholarships.",
    date_added: "2025-04-01",
    last_updated: "2026-08-14"
  },
  {
    university_id: "uni_uow_dubai",
    name: "University of Wollongong in Dubai (UOWD)",
    country: "United Arab Emirates",
    city: "Dubai",
    campus: "Dubai Knowledge Park",
    website: "https://www.uowdubai.ac.ae",
    logo_url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=160&auto=format&fit=crop&q=80",
    contact_info: {
      email: "info@uowdubai.ac.ae",
      phone: "+971 4 278 1800",
      address: "Dubai Knowledge Park, Dubai, UAE"
    },
    status: "Active",
    ranking: 167,
    established_year: 1993,
    overview: "Premier Australian university in the Middle East granting internationally accredited Australian degrees with seamless transfer options.",
    date_added: "2025-04-10",
    last_updated: "2026-08-08"
  }
];
var INITIAL_COURSES = [
  {
    course_id: "crs_cov_msc_ds",
    university_id: "uni_coventry",
    course_name: "MSc Data Science and Artificial Intelligence with Placement",
    destination_country: "United Kingdom",
    city: "Coventry",
    faculty: "Engineering, Environment and Computing",
    program: "Master's (Coursework)",
    duration: 2,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["January", "May", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 19850,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "2026-11-15",
    scholarship_available: true,
    scholarship_detail: "International Early Payment Discount: \xA32,000 + Merit Scholarship up to \xA33,500",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-01-16",
    last_updated: "2026-08-10",
    eligibility: {
      course_id: "crs_cov_msc_ds",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 55,
      minimum_cgpa: 2.5,
      study_gap_allowed_years: 5,
      age_requirement_min: 20,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 59,
      toefl_min: 88,
      moi_acceptance: "Accepted",
      required_documents: [
        "Bachelor Degree & Transcripts",
        "Updated Resume (CV)",
        "Statement of Purpose (SOP)",
        "2 Academic/Professional Reference Letters",
        "Valid Passport Copy",
        "MOI Letter or English Test Score"
      ],
      additional_admission_conditions: "Background in quantitative discipline (CS, Engineering, Mathematics, Business Analytics) preferred.",
      important_notes: "Includes 12 months optional paid industrial work placement. CAS issued within 5-7 business days after deposit."
    }
  },
  {
    course_id: "crs_cov_bsc_cs",
    university_id: "uni_coventry",
    course_name: "BSc (Hons) Computer Science",
    destination_country: "United Kingdom",
    city: "Coventry",
    faculty: "Computing",
    program: "Bachelor's / Undergraduate",
    duration: 3,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["January", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 17800,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "2026-12-01",
    scholarship_available: true,
    scholarship_detail: "Academic Merit Excellence Award: \xA31,500 per year",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-01-16",
    last_updated: "2026-08-01",
    eligibility: {
      course_id: "crs_cov_bsc_cs",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 60,
      study_gap_allowed_years: 2,
      age_requirement_min: 17,
      ielts_overall: 6,
      ielts_min_band: 5.5,
      pte_min: 54,
      toefl_min: 79,
      moi_acceptance: "Accepted",
      required_documents: [
        "10th & 12th Grade / Intermediate Certificates & Marksheets",
        "Passport",
        "Statement of Purpose",
        "Letter of Recommendation from School/College"
      ],
      additional_admission_conditions: "Must have studied Mathematics at secondary or intermediate level.",
      important_notes: "Direct 3-year bachelor degree. Students with lower high school scores can be routed to International Year 1 pathway."
    }
  },
  {
    course_id: "crs_herts_msc_swe",
    university_id: "uni_hertfordshire",
    course_name: "MSc Advanced Computer Science with Advanced Research",
    destination_country: "United Kingdom",
    city: "Hatfield",
    faculty: "School of Physics, Engineering and Computer Science",
    program: "Master's (Coursework)",
    duration: 2,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["January", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 16950,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "2026-11-30",
    scholarship_available: true,
    scholarship_detail: "Chancellor\u2019s International Scholarship up to \xA34,000",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-01-22",
    last_updated: "2026-07-28",
    eligibility: {
      course_id: "crs_herts_msc_swe",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 52,
      minimum_cgpa: 2.3,
      study_gap_allowed_years: 6,
      age_requirement_min: 20,
      ielts_overall: 6.5,
      ielts_min_band: 5.5,
      pte_min: 58,
      toefl_min: 80,
      moi_acceptance: "Accepted",
      required_documents: [
        "Transcripts & Degree Certificate",
        "CV / Experience Letter (for gap justification)",
        "SOP",
        "Passport"
      ],
      additional_admission_conditions: "Prior degree in Computing, IT, Software Engineering or related analytical science.",
      important_notes: "Hatfield is within commuting distance to central London with lower living costs."
    }
  },
  {
    course_id: "crs_mmu_mba",
    university_id: "uni_manchester_met",
    course_name: "Master of Business Administration (MBA Executive / Global)",
    destination_country: "United Kingdom",
    city: "Manchester",
    faculty: "Manchester Business School",
    program: "Master's (Coursework)",
    duration: 1,
    duration_unit: "years",
    duration_bucket: "0-1",
    intake_months: ["September"],
    intake_years: [2026],
    tuition_fee: 21500,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "2026-07-15",
    scholarship_available: true,
    scholarship_detail: "Vice-Chancellor Global Excellence Scholarship: \xA33,000 - \xA35,000",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-02-06",
    last_updated: "2026-08-15",
    eligibility: {
      course_id: "crs_mmu_mba",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 58,
      minimum_cgpa: 2.7,
      study_gap_allowed_years: 8,
      age_requirement_min: 22,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 61,
      toefl_min: 89,
      moi_acceptance: "Case-by-Case",
      required_documents: [
        "Bachelor Degree & Transcripts",
        "2+ Years Professional Work Experience Evidence",
        "Detailed CV",
        "Executive SOP"
      ],
      additional_admission_conditions: "Online admissions interview required following initial document clearance.",
      important_notes: "AMBA & AACSB accredited business school. Triple crown status."
    }
  },
  {
    course_id: "crs_deakin_mit",
    university_id: "uni_deakin",
    course_name: "Master of Information Technology (Cybersecurity / Cloud / Data)",
    destination_country: "Australia",
    city: "Melbourne",
    faculty: "Faculty of Science, Engineering and Built Environment",
    program: "Master's (Coursework)",
    duration: 2,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["March", "July", "November"],
    intake_years: [2026, 2027],
    tuition_fee: 39600,
    currency: "AUD",
    application_fee: 55,
    application_deadline: "2026-10-31",
    scholarship_available: true,
    scholarship_detail: "Deakin International Scholarship: 25% or 50% tuition reduction for high CGPA",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-01-26",
    last_updated: "2026-08-12",
    eligibility: {
      course_id: "crs_deakin_mit",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 60,
      minimum_cgpa: 2.8,
      study_gap_allowed_years: 4,
      age_requirement_min: 20,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 58,
      toefl_min: 79,
      moi_acceptance: "Not Accepted",
      required_documents: [
        "Official Transcripts & Degree",
        "GTE / GS (Genuine Student) Statement",
        "Bank Statement (Proof of Funds)",
        "IELTS / PTE Academic Score Card"
      ],
      additional_admission_conditions: "Australian DHA Genuine Student (GS) assessment mandatory.",
      important_notes: "ACS (Australian Computer Society) accredited. Qualifies for post-study work visa in Victoria."
    }
  },
  {
    course_id: "crs_deakin_bcom",
    university_id: "uni_deakin",
    course_name: "Bachelor of Commerce (Accounting / Finance / Marketing)",
    destination_country: "Australia",
    city: "Melbourne",
    faculty: "Faculty of Business and Law",
    program: "Bachelor's / Undergraduate",
    duration: 3,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["March", "July", "November"],
    intake_years: [2026, 2027],
    tuition_fee: 38200,
    currency: "AUD",
    application_fee: 55,
    application_deadline: "2026-10-31",
    scholarship_available: true,
    scholarship_detail: "Deakin STEM / Business Global Grant: 20% tuition reduction",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-01-26",
    last_updated: "2026-08-01",
    eligibility: {
      course_id: "crs_deakin_bcom",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 65,
      study_gap_allowed_years: 2,
      age_requirement_min: 17,
      ielts_overall: 6,
      ielts_min_band: 6,
      pte_min: 50,
      toefl_min: 69,
      moi_acceptance: "Not Accepted",
      required_documents: [
        "Higher Secondary School Certificate & Marksheet",
        "GS Form & Financial Readiness Affidavit",
        "English Test Report"
      ],
      additional_admission_conditions: "Standard 12 years of formal schooling completed with good academic standing.",
      important_notes: "Offers international internships and dual majors at no additional course tuition cost."
    }
  },
  {
    course_id: "crs_uts_master_eng",
    university_id: "uni_uts",
    course_name: "Master of Engineering Management",
    destination_country: "Australia",
    city: "Sydney",
    faculty: "Faculty of Engineering and IT",
    program: "Master's (Coursework)",
    duration: 2,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["February", "August"],
    intake_years: [2026, 2027],
    tuition_fee: 44500,
    currency: "AUD",
    application_fee: 100,
    application_deadline: "2026-11-15",
    scholarship_available: true,
    scholarship_detail: "UTS High Achievers International Award: AUD 10,000 per year",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-02-12",
    last_updated: "2026-08-01",
    eligibility: {
      course_id: "crs_uts_master_eng",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 65,
      minimum_cgpa: 3,
      study_gap_allowed_years: 5,
      age_requirement_min: 21,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 58,
      toefl_min: 79,
      moi_acceptance: "Not Accepted",
      required_documents: [
        "Bachelor of Engineering / Tech Degree transcripts",
        "Curriculum Vitae",
        "Passport",
        "Genuine Student Statement"
      ],
      additional_admission_conditions: "Undergraduate degree in Engineering or Technology field required.",
      important_notes: "Located in Sydney\u2019s premier tech precinct next to Central Station."
    }
  },
  {
    course_id: "crs_wind_01",
    university_id: "uni_windsor",
    course_name: "Bachelor of Science in Nursing / Health Sciences",
    destination_country: "Canada",
    city: "Windsor, Ontario",
    faculty: "Faculty of Nursing & Health Sciences",
    program: "Bachelor's / Undergraduate",
    duration: 4,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["September"],
    intake_years: [2026, 2027],
    tuition_fee: 33500,
    currency: "CAD",
    application_fee: 125,
    application_deadline: "2026-03-01",
    scholarship_available: true,
    scholarship_detail: "International Entrance Scholarship up to CAD 4,000",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-02-18",
    last_updated: "2026-08-19",
    eligibility: {
      course_id: "crs_wind_01",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 75,
      study_gap_allowed_years: 1,
      age_requirement_min: 17,
      ielts_overall: 7,
      ielts_min_band: 6.5,
      pte_min: 65,
      toefl_min: 90,
      moi_acceptance: "Not Accepted",
      required_documents: ["12th Grade Marksheets with Biology & Chemistry", "IELTS Report", "Medical Fitness Certificate"],
      additional_admission_conditions: "Clinical health clearances and CPR certification required before hospital placement.",
      important_notes: "Accredited by the College of Nurses of Ontario (CNO) with extensive clinical hospital rotations."
    }
  },
  {
    course_id: "crs_mon_01",
    university_id: "uni_monash_01",
    course_name: "Bachelor of International Business & Global Logistics",
    destination_country: "Australia",
    city: "Melbourne, Victoria",
    faculty: "Monash Business School",
    program: "Bachelor's / Undergraduate",
    duration: 3,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["February", "July"],
    intake_years: [2026, 2027],
    tuition_fee: 48500,
    currency: "AUD",
    application_fee: 100,
    application_deadline: "2026-11-30",
    scholarship_available: true,
    scholarship_detail: "Monash International Leadership Scholarship: 100% or $10,000 grant per year",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-02-12",
    last_updated: "2026-08-23",
    eligibility: {
      course_id: "crs_mon_01",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 75,
      minimum_cgpa: 3.3,
      study_gap_allowed_years: 2,
      age_requirement_min: 17,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 58,
      toefl_min: 79,
      moi_acceptance: "Not Accepted",
      required_documents: ["High School Transcript & Diploma", "Passport", "Genuine Student Statement", "English Test Score"],
      additional_admission_conditions: "Mathematics background required at 12th year standard.",
      important_notes: "Triple Crown accredited (AACSB, EQUIS, AMBA) world top 50 business school."
    }
  },
  {
    course_id: "crs_windsor_mac",
    university_id: "uni_windsor",
    course_name: "Master of Applied Computing (MAC - AI / Data Stream)",
    destination_country: "Canada",
    city: "Windsor",
    faculty: "Faculty of Science / Computer Science",
    program: "Master's (Coursework)",
    duration: 1.5,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["January", "May", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 28500,
    currency: "CAD",
    application_fee: 125,
    application_deadline: "2026-10-01",
    scholarship_available: false,
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-02-18",
    last_updated: "2026-07-20",
    eligibility: {
      course_id: "crs_windsor_mac",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 70,
      minimum_cgpa: 3,
      study_gap_allowed_years: 4,
      age_requirement_min: 20,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 65,
      toefl_min: 92,
      moi_acceptance: "Not Accepted",
      required_documents: [
        "4-Year Bachelor Degree Transcripts (WES evaluation if required)",
        "3 Reference Letters",
        "Resume detailing coding projects",
        "Statement of Interest"
      ],
      additional_admission_conditions: "Solid foundation in C/C++, Java, Data Structures, and Algorithms.",
      important_notes: "Includes mandatory 4-8 months paid internship (co-op) semester in Ontario tech companies."
    }
  },
  {
    course_id: "crs_yorkville_bba",
    university_id: "uni_yorkville",
    course_name: "Bachelor of Business Administration (Supply Chain / Project Mgmt)",
    destination_country: "Canada",
    city: "Toronto",
    faculty: "School of Business",
    program: "Bachelor's / Undergraduate",
    duration: 2.5,
    duration_unit: "years",
    duration_bucket: "2-3",
    intake_months: ["January", "April", "July", "October"],
    intake_years: [2026, 2027],
    tuition_fee: 24e3,
    currency: "CAD",
    application_fee: 75,
    application_deadline: "Rolling",
    scholarship_available: true,
    scholarship_detail: "Bilingual / International Bursary up to CAD 10,000 total",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-03-02",
    last_updated: "2026-06-15",
    eligibility: {
      course_id: "crs_yorkville_bba",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 55,
      study_gap_allowed_years: 5,
      age_requirement_min: 18,
      ielts_overall: 6,
      ielts_min_band: 5.5,
      pte_min: 50,
      toefl_min: 80,
      moi_acceptance: "Accepted",
      required_documents: ["High School Transcript", "Passport", "Study Plan Essay"],
      additional_admission_conditions: "Year-round trimesters permit completion of a 4-year degree in 2.5 years.",
      important_notes: "Eligible for Post-Graduation Work Permit (PGWP) upon campus graduation."
    }
  },
  {
    course_id: "crs_unt_ms_cs",
    university_id: "uni_north_texas",
    course_name: "MS in Computer Science (STEM Designated Program)",
    destination_country: "United States",
    city: "Denton",
    faculty: "College of Engineering",
    program: "Master's (Coursework)",
    duration: 2,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["January", "August"],
    intake_years: [2026, 2027],
    tuition_fee: 18200,
    currency: "USD",
    application_fee: 85,
    application_deadline: "2026-10-15",
    scholarship_available: true,
    scholarship_detail: "Competitive Out-of-State Tuition Waiver + $1,000 Dean Scholarship reduces tuition to in-state rates",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-02-22",
    last_updated: "2026-08-05",
    eligibility: {
      course_id: "crs_unt_ms_cs",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 65,
      minimum_cgpa: 3,
      study_gap_allowed_years: 5,
      age_requirement_min: 20,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 53,
      toefl_min: 79,
      moi_acceptance: "Case-by-Case",
      required_documents: [
        "Bachelor transcripts & Degree Certificate",
        "GRE score card (Optional / Waived with CGPA > 3.2)",
        "SOP",
        "2 Letters of Recommendation",
        "Bank affidavit for I-20 generation"
      ],
      additional_admission_conditions: "Prerequisite coursework in Object Oriented Programming and Operating Systems.",
      important_notes: "STEM OPT enables up to 3 years of post-study full-time US work authorization."
    }
  },
  {
    course_id: "crs_galway_msc_fin",
    university_id: "uni_galway",
    course_name: "MSc International Finance & Sustainable Investment",
    destination_country: "Ireland",
    city: "Galway",
    faculty: "J.E. Cairnes School of Business & Economics",
    program: "Master's (Coursework)",
    duration: 1,
    duration_unit: "years",
    duration_bucket: "0-1",
    intake_months: ["September"],
    intake_years: [2026],
    tuition_fee: 19500,
    currency: "EUR",
    application_fee: 35,
    application_deadline: "2026-06-30",
    scholarship_available: true,
    scholarship_detail: "Global Achievement Scholarship: \u20AC2,000 - \u20AC4,000 automatic merit evaluation",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-03-11",
    last_updated: "2026-08-11",
    eligibility: {
      course_id: "crs_galway_msc_fin",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 60,
      minimum_cgpa: 2.8,
      study_gap_allowed_years: 6,
      age_requirement_min: 21,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 61,
      toefl_min: 88,
      moi_acceptance: "Accepted",
      required_documents: [
        "Graduation Certificate & Transcripts",
        "2 Academic Recommendations",
        "Personal Statement",
        "CV"
      ],
      additional_admission_conditions: "Undergraduate study with quantitative/economic components.",
      important_notes: "Ireland offers a 2-year post-study work visa (Stamp 1G) for Master\u2019s graduates."
    }
  },
  {
    course_id: "crs_taylors_bachelor_hosp",
    university_id: "uni_taylors",
    course_name: "Bachelor of International Hospitality Management (Dual Degree)",
    destination_country: "Malaysia",
    city: "Subang Jaya",
    faculty: "Faculty of Social Sciences & Leisure Management",
    program: "Bachelor's / Undergraduate",
    duration: 3,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["March", "August"],
    intake_years: [2026, 2027],
    tuition_fee: 105e3,
    currency: "MYR",
    application_fee: 350,
    application_deadline: "2026-11-30",
    scholarship_available: true,
    scholarship_detail: "Taylor\u2019s International Talent Scholarship: 30% - 50% tuition waiver",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-03-14",
    last_updated: "2026-07-15",
    eligibility: {
      course_id: "crs_taylors_bachelor_hosp",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 55,
      study_gap_allowed_years: 3,
      age_requirement_min: 17,
      ielts_overall: 5.5,
      ielts_min_band: 5,
      pte_min: 42,
      toefl_min: 46,
      moi_acceptance: "Accepted",
      required_documents: [
        "High School Transcripts & Certificate",
        "Passport (all pages)",
        "Passport Size Photos (White background)",
        "Medical Declaration Form"
      ],
      additional_admission_conditions: "Direct dual degree with University of Toulouse (France).",
      important_notes: "QS World Rank #17 for Hospitality & Leisure Management."
    }
  },
  {
    course_id: "crs_iu_bsc_ai",
    university_id: "uni_iu_germany",
    course_name: "BSc Applied Artificial Intelligence (English Medium)",
    destination_country: "Germany",
    city: "Berlin",
    faculty: "Faculty of Computer Science",
    program: "Bachelor's / Undergraduate",
    duration: 3,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["January", "April", "July", "October"],
    intake_years: [2026, 2027],
    tuition_fee: 14800,
    currency: "EUR",
    application_fee: 0,
    application_deadline: "Rolling",
    scholarship_available: true,
    scholarship_detail: "Guaranteed 35% online-to-campus initiative scholarship",
    study_mode: "Hybrid",
    status: "Active",
    date_added: "2025-04-02",
    last_updated: "2026-08-14",
    eligibility: {
      course_id: "crs_iu_bsc_ai",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / A-Levels / Intermediate",
      minimum_qualification_rank: 2,
      minimum_percentage: 55,
      study_gap_allowed_years: 5,
      age_requirement_min: 18,
      ielts_overall: 6,
      ielts_min_band: 5.5,
      pte_min: 50,
      toefl_min: 80,
      moi_acceptance: "Accepted",
      required_documents: ["High School Transcript", "ID/Passport", "Proof of English (or MOI)"],
      additional_admission_conditions: "No German language proficiency required for admission or visa.",
      important_notes: "Students can begin semester 1 online and transfer to Berlin campus for remaining semesters."
    }
  },
  {
    course_id: "crs_uowd_msc_cyber",
    university_id: "uni_uow_dubai",
    course_name: "Master of Information Technology in Cyber Security",
    destination_country: "United Arab Emirates",
    city: "Dubai",
    faculty: "Faculty of Engineering and Information Sciences",
    program: "Master's (Coursework)",
    duration: 2,
    duration_unit: "years",
    duration_bucket: "1-2",
    intake_months: ["January", "May", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 85500,
    currency: "AED",
    application_fee: 0,
    application_deadline: "Rolling",
    scholarship_available: true,
    scholarship_detail: "Academic Excellence Scholarship 15% - 25% on tuition",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-04-12",
    last_updated: "2026-08-08",
    eligibility: {
      course_id: "crs_uowd_msc_cyber",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Bachelor's / Undergraduate",
      minimum_qualification_rank: 4,
      minimum_percentage: 60,
      minimum_cgpa: 2.7,
      study_gap_allowed_years: 7,
      age_requirement_min: 21,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 58,
      toefl_min: 79,
      moi_acceptance: "Accepted",
      required_documents: ["Bachelor Degree & Transcripts", "Passport Copy", "CV", "English Proficiency Proof"],
      additional_admission_conditions: "UAE Ministry of Higher Education & Australian CAA accredited.",
      important_notes: "Fast-track visa processing (approx 2 weeks) and easy option to transfer to Wollongong Australia."
    }
  },
  {
    course_id: "crs_cov_pre_master",
    university_id: "uni_coventry",
    course_name: "International Pre-Master\u2019s in Business and Social Sciences",
    destination_country: "United Kingdom",
    city: "Coventry",
    faculty: "ONCAMPUS Coventry / Academic Pathways",
    program: "Language / Pathway Program",
    duration: 6,
    duration_unit: "months",
    duration_bucket: "0-1",
    intake_months: ["January", "April", "June", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 14500,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "Rolling",
    scholarship_available: true,
    scholarship_detail: "Pathway Progression Bursary: \xA31,500",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-05-01",
    last_updated: "2026-08-01",
    eligibility: {
      course_id: "crs_cov_pre_master",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Diploma / Associate Degree / Pass Bachelor",
      minimum_qualification_rank: 3,
      minimum_percentage: 45,
      minimum_cgpa: 2,
      study_gap_allowed_years: 8,
      age_requirement_min: 20,
      ielts_overall: 5.5,
      ielts_min_band: 5,
      pte_min: 44,
      toefl_min: 55,
      moi_acceptance: "Accepted",
      required_documents: ["3-year or 2-year Bachelor/Diploma transcripts", "Passport", "Study gap statement"],
      additional_admission_conditions: "Guaranteed progression to Master\u2019s degree upon achieving 60% in pathway modules.",
      important_notes: "Ideal for students with 14-year education (BA/BSc pass) or significant study gap."
    }
  },
  {
    course_id: "crs_cov_found_eng",
    university_id: "uni_coventry",
    course_name: "International Foundation Programme in Engineering and Computing",
    destination_country: "United Kingdom",
    city: "Coventry",
    faculty: "Academic Pathways",
    program: "Foundation",
    duration: 9,
    duration_unit: "months",
    duration_bucket: "0-1",
    intake_months: ["January", "September"],
    intake_years: [2026, 2027],
    tuition_fee: 14250,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "Rolling",
    scholarship_available: true,
    scholarship_detail: "Foundation Starter Grant: \xA31,000",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-05-05",
    last_updated: "2026-08-01",
    eligibility: {
      course_id: "crs_cov_found_eng",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Secondary / 10th Grade / O-Levels / 11th Grade",
      minimum_qualification_rank: 1,
      minimum_percentage: 50,
      study_gap_allowed_years: 2,
      age_requirement_min: 16,
      ielts_overall: 5,
      ielts_min_band: 4.5,
      pte_min: 40,
      toefl_min: 45,
      moi_acceptance: "Accepted",
      required_documents: ["10th grade certificate or O-Level results", "Passport", "SOP"],
      additional_admission_conditions: "Enables direct transition into Year 1 of BEng or BSc Engineering degrees.",
      important_notes: "Integrated single CAS option available for Foundation + Degree."
    }
  },
  {
    course_id: "crs_herts_phd_cs",
    university_id: "uni_hertfordshire",
    course_name: "Doctorate of Philosophy (PhD) in Computer Science & Robotics",
    destination_country: "United Kingdom",
    city: "Hatfield",
    faculty: "Centre for Computer Science and Informatics Research",
    program: "Doctorate / PhD",
    duration: 3,
    duration_unit: "years",
    duration_bucket: "3-4",
    intake_months: ["October", "February"],
    intake_years: [2026, 2027],
    tuition_fee: 17200,
    currency: "GBP",
    application_fee: 0,
    application_deadline: "2026-06-01",
    scholarship_available: true,
    scholarship_detail: "Vice-Chancellor Doctoral Studentship covering full tuition + monthly stipend for exceptional research proposals",
    study_mode: "On-campus",
    status: "Active",
    date_added: "2025-04-15",
    last_updated: "2026-08-02",
    eligibility: {
      course_id: "crs_herts_phd_cs",
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "Master's Degree (MSc / MS / MPhil)",
      minimum_qualification_rank: 6,
      minimum_percentage: 65,
      minimum_cgpa: 3.2,
      study_gap_allowed_years: 8,
      age_requirement_min: 23,
      ielts_overall: 6.5,
      ielts_min_band: 6,
      pte_min: 60,
      toefl_min: 90,
      moi_acceptance: "Accepted",
      required_documents: [
        "Detailed Research Proposal (2,000 - 3,000 words)",
        "Master & Bachelor Degree Transcripts",
        "Sample Publications / Thesis Summary",
        "2 Academic Referee Letters"
      ],
      additional_admission_conditions: "Must secure preliminary supervisor alignment prior to unconditional offer.",
      important_notes: "Access to the world-renowned Robot House research facility."
    }
  }
];
var INITIAL_IMPORT_HISTORY = [
  {
    id: "imp_2026_08_01",
    file_name: "UK_Universities_Master_Q3_2026.xlsx",
    file_type: "XLSX",
    category: "Universities",
    date: "2026-08-01 14:23",
    timestamp: 178559058e4,
    admin_email: "musadixsolution@gmail.com",
    total_records: 24,
    imported: 22,
    updated: 2,
    duplicates: 0,
    failed: 0,
    status: "Completed"
  },
  {
    id: "imp_2026_07_18",
    file_name: "Australia_Canada_Master_Courses_2026.csv",
    file_type: "CSV",
    category: "Courses",
    date: "2026-07-18 10:11",
    timestamp: 178436586e4,
    admin_email: "musadixsolution@gmail.com",
    total_records: 45,
    imported: 41,
    updated: 2,
    duplicates: 1,
    failed: 1,
    status: "Completed with Errors",
    error_report: [
      {
        row: 38,
        record_identifier: "crs_bad_fee_example",
        field: "tuition_fee",
        reason: 'Tuition fee value "TBD" is not numeric',
        raw_data: { course_name: "Diploma in Graphic Arts", tuition: "TBD" }
      }
    ]
  },
  {
    id: "imp_2026_06_22",
    file_name: "Complete_Batch_Intakes_2026_2027.xlsx",
    file_type: "XLSX",
    category: "Complete Data Import",
    date: "2026-06-22 16:45",
    timestamp: 17820567e5,
    admin_email: "musadixsolution@gmail.com",
    total_records: 80,
    imported: 76,
    updated: 4,
    duplicates: 0,
    failed: 0,
    status: "Completed"
  }
];

// src/db/mssql.ts
var import_mssql = __toESM(require("mssql"), 1);

// src/server/httpError.ts
var HttpError = class extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = "HttpError";
  }
};

// src/db/mssql.ts
function sqlServerName() {
  return String(process.env.SQL_HOST || "").trim().replace(/:0$/, "");
}
function parseHost(host) {
  let server = host.trim();
  let instanceName;
  let port;
  if (server.includes("\\")) {
    const [name, instance] = server.split("\\");
    server = name;
    instanceName = instance || void 0;
  }
  if (server.includes(",")) {
    const [name, portText] = server.split(",");
    server = name;
    port = Number(portText) || void 0;
  }
  const envPort = Number(process.env.SQL_PORT || "");
  if (!port && Number.isFinite(envPort) && envPort > 0) port = envPort;
  return { server, instanceName, port };
}
function poolConfig() {
  const host = sqlServerName();
  if (!host) {
    throw new HttpError(503, "SQL_HOST is missing. Add it to the .env file in the site root.");
  }
  const { server, instanceName, port } = parseHost(host);
  const user = String(process.env.SQL_USER || "").trim();
  const password = String(process.env.SQL_PASSWORD || "");
  const database = process.env.SQL_DB_NAME || "study_world_portal";
  const config = {
    server,
    port: port || (instanceName ? void 0 : 1433),
    database,
    connectionTimeout: 15e3,
    requestTimeout: 3e4,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName,
      enableArithAbort: true
    }
  };
  if (!user || !password) {
    throw new HttpError(503, "SQL_USER and SQL_PASSWORD are missing. Add them to the .env file in the site root.");
  }
  config.user = user;
  config.password = password;
  return config;
}
function sqlUnavailable(err) {
  const message = String(err?.message || err);
  const safe = message.replace(/Password=[^;]+/gi, "Password=***").slice(0, 400);
  console.error("[SQL Server]", safe);
  if (/Login failed|ELOGIN/i.test(message)) {
    throw new HttpError(503, "SQL login failed. Check SQL_USER and SQL_PASSWORD in the site .env file.");
  }
  if (/ETIMEOUT|ECONNREFUSED|getaddrinfo|Failed to connect|ESOCKET/i.test(message)) {
    throw new HttpError(
      503,
      "Cannot connect to SQL_HOST. If Plesk and SQL are on the same server, use 127.0.0.1. Otherwise use 74.50.79.178 and open port 1433."
    );
  }
  if (/Cannot open database|RECOVERY_PENDING|not accessible/i.test(message)) {
    throw new HttpError(503, "SQL Server is temporarily unavailable. Please try again.");
  }
  throw new HttpError(503, "Could not query SQL Server. Please try again.");
}
var poolPromise = null;
function getPool() {
  if (!poolPromise) {
    poolPromise = new import_mssql.default.ConnectionPool(poolConfig()).connect().catch((err) => {
      poolPromise = null;
      sqlUnavailable(err);
    });
  }
  return poolPromise;
}
function bind(request, params = {}) {
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value === void 0 ? null : value);
  }
}
function asRows(recordset) {
  return Array.isArray(recordset) ? recordset : [];
}
async function mssqlQueries(queries) {
  const pool = await getPool();
  const grouped = {};
  for (const item of queries) {
    const request = pool.request();
    bind(request, item.params);
    const result = await request.query(item.query).catch(sqlUnavailable);
    grouped[item.name] = asRows(result.recordset);
  }
  return grouped;
}
async function mssqlQuery(query, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  bind(request, params);
  const result = await request.query(query).catch(sqlUnavailable);
  return asRows(result.recordset);
}
async function mssqlExecute(query, params = {}) {
  const pool = await getPool();
  const request = pool.request();
  bind(request, params);
  const result = await request.query(query).catch(sqlUnavailable);
  const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : 0;
  return Number(affected || 0);
}
async function testSqlConnection() {
  const rows = await mssqlQuery("SELECT DB_NAME() AS name");
  return {
    ok: true,
    database: rows[0]?.name || process.env.SQL_DB_NAME || "study_world_portal",
    server: sqlServerName()
  };
}
async function mssqlBulk(records) {
  if (!records.length) return 0;
  const pool = await getPool();
  const transaction = new import_mssql.default.Transaction(pool);
  await transaction.begin();
  try {
    for (const item of records) {
      const request = new import_mssql.default.Request(transaction);
      bind(request, item.params);
      await request.query(item.sql);
    }
    await transaction.commit();
    return records.length;
  } catch (err) {
    await transaction.rollback().catch(() => {
    });
    sqlUnavailable(err);
  }
}

// src/utils/countryRef.ts
function countryCodeFromValue(value, countries) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const byCode = countries.find((c) => c.code.toUpperCase() === raw.toUpperCase());
  if (byCode) return byCode.code;
  const byName = countries.find((c) => c.name.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.code;
  return raw.length <= 3 ? raw.toUpperCase() : raw;
}
function countryDisplayName(value, countries) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const byCode = countries.find((c) => c.code.toUpperCase() === raw.toUpperCase());
  if (byCode) return byCode.name;
  const byName = countries.find((c) => c.name.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.name;
  return raw;
}

// src/lib/passwordHash.ts
var import_node_crypto = require("node:crypto");
var PREFIX = "scrypt$";
function hashPassword(plain) {
  const salt = (0, import_node_crypto.randomBytes)(16).toString("hex");
  const hash = (0, import_node_crypto.scryptSync)(plain, salt, 32).toString("hex");
  return `${PREFIX}${salt}$${hash}`;
}
function isHashedPassword(stored) {
  return String(stored || "").startsWith(PREFIX);
}
function verifyPassword(plain, stored) {
  const value = String(stored || "");
  if (!plain || !value) return false;
  if (!value.startsWith(PREFIX)) {
    return value === plain;
  }
  const rest = value.slice(PREFIX.length);
  const sep = rest.indexOf("$");
  if (sep < 0) return false;
  const salt = rest.slice(0, sep);
  const hash = rest.slice(sep + 1);
  const actual = (0, import_node_crypto.scryptSync)(plain, salt, 32);
  const expected = Buffer.from(hash, "hex");
  if (actual.length !== expected.length) return false;
  return (0, import_node_crypto.timingSafeEqual)(actual, expected);
}

// src/mappers/userMapper.ts
function mapSqlUser(row) {
  const email = String(row?.email || "").trim().toLowerCase();
  return {
    id: row?.uid || `usr_${email.replace(/[^a-z0-9]+/g, "_")}`,
    email,
    name: row?.name || email.split("@")[0],
    role: row?.role || "User",
    status: row?.status === "Inactive" || row?.is_active === false || row?.is_active === 0 ? "Inactive" : "Active",
    export_permission: Boolean(row?.export_permission),
    department: row?.department || row?.franchise_name || "Portal User",
    franchise_id: row?.franchise_id || void 0,
    franchise_name: row?.franchise_name || void 0,
    avatar_url: row?.photo_url || void 0,
    phone: row?.phone || void 0,
    auth_provider: row?.auth_provider || "email",
    last_login: (/* @__PURE__ */ new Date()).toISOString()
  };
}
function isInactiveUserRow(row) {
  return row?.status === "Inactive" || row?.is_active === false || row?.is_active === 0;
}

// src/mappers/leadMapper.ts
function mapSqlLead(row) {
  if (row?.payload_json) {
    try {
      const parsed = typeof row.payload_json === "string" ? JSON.parse(row.payload_json) : row.payload_json;
      if (parsed?.id) return parsed;
    } catch {
    }
  }
  return {
    id: row.lead_id,
    student_name: row.student_name,
    student_email: row.email,
    student_phone: row.phone,
    student_city: row.city,
    course_id: row.course_id,
    course_name: row.course_name,
    university_id: row.university_id,
    university_name: row.university_name,
    destination_country: row.destination_country,
    city: row.city,
    counselor_id: row.counselor_id,
    counselor_name: row.counselor_name,
    counselor_email: row.counselor_email,
    franchise_id: row.franchise_id,
    franchise_name: row.franchise_name,
    request_type: row.request_type === "Direct Admission" ? "Course Application" : row.request_type,
    priority: row.priority,
    status: row.status === "New Lead" ? "New Inquiry" : row.status,
    notes: row.notes,
    meet_link: row.meet_link,
    calendar_event_id: row.calendar_event_id,
    google_doc_id: row.google_doc_id,
    academic_score: row.academic_score,
    english_test: row.english_test_score,
    intake: row.target_intake,
    timeline: [],
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

// src/db/catalog.ts
function parsePayload(row) {
  if (!row?.payload_json) return null;
  try {
    return typeof row.payload_json === "string" ? JSON.parse(row.payload_json) : row.payload_json;
  } catch {
    return null;
  }
}
function universityUpsert(u) {
  const country = countryCodeFromValue(u.country, COUNTRIES_MASTER);
  const record = { ...u, country };
  return {
    sql: `MERGE dbo.universities AS t
USING (SELECT @id AS university_id) AS s ON t.university_id = s.university_id
WHEN MATCHED THEN UPDATE SET name=@name, country=@country, city=@city, campus=@campus, ranking=@ranking, logo_url=@logoUrl, website_url=@websiteUrl, status=@status, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (university_id, name, country, city, campus, ranking, logo_url, website_url, status, payload_json)
VALUES (@id, @name, @country, @city, @campus, @ranking, @logoUrl, @websiteUrl, @status, @payloadJson);`,
    params: {
      id: u.university_id,
      name: u.name,
      country,
      city: u.city,
      campus: u.campus || "",
      ranking: u.ranking ?? null,
      logoUrl: u.logo_url || "",
      websiteUrl: u.website || "",
      status: u.status || "Active",
      payloadJson: JSON.stringify(record)
    }
  };
}
function courseUpsert(c) {
  const country = countryCodeFromValue(c.destination_country, COUNTRIES_MASTER);
  const record = { ...c, destination_country: country };
  return {
    sql: `MERGE dbo.courses AS t
USING (SELECT @id AS course_id) AS s ON t.course_id = s.course_id
WHEN MATCHED THEN UPDATE SET university_id=@universityId, university_name=@universityName, country=@country, city=@city, course_name=@courseName, discipline=@discipline, level=@level, duration_years=@durationYears, annual_fee=@annualFee, currency=@currency, status=@status, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (course_id, university_id, university_name, country, city, course_name, discipline, level, duration_years, annual_fee, currency, status, payload_json)
VALUES (@id, @universityId, @universityName, @country, @city, @courseName, @discipline, @level, @durationYears, @annualFee, @currency, @status, @payloadJson);`,
    params: {
      id: c.course_id,
      universityId: c.university_id,
      universityName: c.university_name || INITIAL_UNIVERSITIES.find((u) => u.university_id === c.university_id)?.name || c.university_id,
      country,
      city: c.city || "",
      courseName: c.course_name,
      discipline: c.faculty || c.program || "General",
      level: c.program || "Bachelor's / Undergraduate",
      durationYears: String(c.duration ?? ""),
      annualFee: String(c.tuition_fee ?? ""),
      currency: c.currency || "USD",
      status: c.status || "Active",
      payloadJson: JSON.stringify(record)
    }
  };
}
function franchiseUpsert(f) {
  return {
    sql: `MERGE dbo.franchises AS t
USING (SELECT @id AS franchise_id) AS s ON t.franchise_id = s.franchise_id
WHEN MATCHED THEN UPDATE SET name=@name, code=@code, city=@city, country=@country, address=@address, contact_person=@contactPerson, email=@email, phone=@phone, status=@status, payload_json=@payloadJson
WHEN NOT MATCHED THEN INSERT (franchise_id, name, code, city, country, address, contact_person, email, phone, status, payload_json)
VALUES (@id, @name, @code, @city, @country, @address, @contactPerson, @email, @phone, @status, @payloadJson);`,
    params: {
      id: f.id,
      name: f.name,
      code: f.code,
      city: f.city,
      country: f.country,
      address: f.address || "",
      contactPerson: f.contact_person || "",
      email: f.email || "",
      phone: f.phone || "",
      status: f.status || "Active",
      payloadJson: JSON.stringify(f)
    }
  };
}
function countryUpsert(c) {
  return {
    sql: `MERGE dbo.countries AS t
USING (SELECT @code AS code) AS s ON t.code = s.code
WHEN MATCHED THEN UPDATE SET name=@name, flag=@flag, currency=@currency, currency_symbol=@currencySymbol, visa_processing_weeks=@visaWeeks, post_study_work_visa=@psw, psw_duration=@pswDuration, is_active=@isActive, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (code, name, flag, currency, currency_symbol, visa_processing_weeks, post_study_work_visa, psw_duration, is_active, payload_json)
VALUES (@code, @name, @flag, @currency, @currencySymbol, @visaWeeks, @psw, @pswDuration, @isActive, @payloadJson);`,
    params: {
      code: c.code,
      name: c.name,
      flag: c.flag || "",
      currency: c.currency,
      currencySymbol: c.currency_symbol,
      visaWeeks: c.visa_processing_weeks || "",
      psw: c.post_study_work_visa || "",
      pswDuration: c.psw_duration || "",
      isActive: c.is_active === false || c.active === false ? 0 : 1,
      payloadJson: JSON.stringify(c)
    }
  };
}
function programUpsert(p) {
  return {
    sql: `MERGE dbo.programs AS t
USING (SELECT @id AS program_id) AS s ON t.program_id = s.program_id
WHEN MATCHED THEN UPDATE SET name=@name, rank_level=@rankLevel, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (program_id, name, rank_level, payload_json)
VALUES (@id, @name, @rankLevel, @payloadJson);`,
    params: {
      id: p.id,
      name: p.name,
      rankLevel: p.rank_level ?? p.rank ?? 1,
      payloadJson: JSON.stringify(p)
    }
  };
}
function importHistoryUpsert(h) {
  const historyId = String(h.timestamp || h.file_name || Date.now());
  return {
    sql: `MERGE dbo.import_history AS t
USING (SELECT @id AS history_id) AS s ON t.history_id = s.history_id
WHEN MATCHED THEN UPDATE SET payload_json=@payloadJson
WHEN NOT MATCHED THEN INSERT (history_id, payload_json) VALUES (@id, @payloadJson);`,
    params: {
      id: historyId,
      payloadJson: JSON.stringify(h)
    }
  };
}
function catalogSeedRecords() {
  return [
    ...INITIAL_UNIVERSITIES.map(universityUpsert),
    ...INITIAL_COURSES.map(courseUpsert),
    ...INITIAL_FRANCHISES.map(franchiseUpsert),
    ...COUNTRIES_MASTER.map(countryUpsert),
    ...PROGRAMS_MASTER.map(programUpsert),
    ...INITIAL_IMPORT_HISTORY.map(importHistoryUpsert)
  ];
}
async function seedCatalogIfEmpty() {
  const seedIfEmpty = async (table, records) => {
    const rows = await mssqlQuery(`SELECT COUNT(*) AS cnt FROM dbo.${table}`);
    if (Number(rows[0]?.cnt || 0) > 0) return;
    const count = await mssqlBulk(records);
    console.log(`[SQL Server] Seeded ${table}: ${count}`);
  };
  await seedIfEmpty("countries", COUNTRIES_MASTER.map(countryUpsert));
  await seedIfEmpty("programs", PROGRAMS_MASTER.map(programUpsert));
  await seedIfEmpty("franchises", INITIAL_FRANCHISES.map(franchiseUpsert));
  await seedIfEmpty("universities", INITIAL_UNIVERSITIES.map(universityUpsert));
  await seedIfEmpty("courses", INITIAL_COURSES.map(courseUpsert));
  await seedIfEmpty("import_history", INITIAL_IMPORT_HISTORY.map(importHistoryUpsert));
  await mssqlExecute(`
    IF COL_LENGTH('dbo.student_leads', 'payload_json') IS NULL
      ALTER TABLE dbo.student_leads ADD payload_json NVARCHAR(MAX) NULL;
  `).catch(() => {
  });
  await mssqlExecute(`UPDATE dbo.student_leads SET status = N'New Inquiry' WHERE status = N'New Lead'`).catch(() => {
  });
}
async function resetAndSeedCatalog() {
  await mssqlExecute("DELETE FROM dbo.courses");
  await mssqlExecute("DELETE FROM dbo.universities");
  await mssqlExecute("DELETE FROM dbo.countries");
  await mssqlExecute("DELETE FROM dbo.programs");
  await mssqlExecute("DELETE FROM dbo.import_history");
  await mssqlExecute("DELETE FROM dbo.franchises");
  const count = await mssqlBulk(catalogSeedRecords());
  console.log(`[SQL Server] Reset and re-seeded catalog records: ${count}`);
  return count;
}
function asUniversity(row) {
  const parsed = parsePayload(row);
  const id = parsed?.university_id || row?.university_id;
  if (!id) return null;
  return {
    university_id: id,
    name: parsed?.name || row.name || id,
    country: parsed?.country || row.country || "",
    city: parsed?.city || row.city || "",
    campus: parsed?.campus || row.campus || "",
    website: parsed?.website || row.website_url || "",
    logo_url: parsed?.logo_url || row.logo_url || "",
    contact_info: parsed?.contact_info || { email: "", phone: "" },
    status: parsed?.status || row.status || "Active",
    ranking: parsed?.ranking ?? row.ranking ?? void 0,
    established_year: parsed?.established_year,
    overview: parsed?.overview || "",
    date_added: parsed?.date_added || row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    last_updated: parsed?.last_updated || row.updated_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function asCourse(row) {
  const parsed = parsePayload(row);
  if (parsed?.course_id) return parsed;
  if (!row?.course_id) return null;
  const duration = Number(row.duration_years) || 1;
  return {
    course_id: row.course_id,
    university_id: row.university_id,
    course_name: row.course_name || "",
    destination_country: row.country || "",
    city: row.city || "",
    faculty: row.discipline || "General",
    program: row.level || "Bachelor's / Undergraduate",
    duration,
    duration_unit: "years",
    duration_bucket: duration <= 1 ? "0-1" : duration <= 2 ? "1-2" : duration <= 3 ? "2-3" : duration <= 4 ? "3-4" : "4+",
    intake_months: String(row.intakes || "").split(",").map((s) => s.trim()).filter(Boolean),
    intake_years: [],
    tuition_fee: Number(row.annual_fee) || 0,
    currency: row.currency || "USD",
    application_fee: 0,
    application_deadline: row.application_deadline || "",
    scholarship_available: Boolean(row.scholarship_available),
    study_mode: "On-campus",
    status: row.status || "Active",
    date_added: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    last_updated: row.updated_at || (/* @__PURE__ */ new Date()).toISOString(),
    eligibility: {
      course_id: row.course_id,
      eligible_nationalities: ["All"],
      restricted_nationalities: [],
      minimum_qualification: "High School / 12th Grade",
      minimum_qualification_rank: 2,
      study_gap_allowed_years: 5,
      age_requirement_min: 17,
      ielts_overall: 6,
      ielts_min_band: 5.5,
      pte_min: 50,
      toefl_min: 80,
      moi_acceptance: "Accepted",
      required_documents: [],
      additional_admission_conditions: "",
      important_notes: ""
    }
  };
}
function asFranchise(row) {
  const parsed = parsePayload(row);
  if (parsed?.id) return parsed;
  if (!row?.franchise_id) return null;
  return {
    id: row.franchise_id,
    name: row.name,
    code: row.code,
    city: row.city,
    country: row.country,
    address: row.address || "",
    contact_person: row.contact_person || "",
    email: row.email || "",
    phone: row.phone || "",
    status: row.status || "Active"
  };
}
function asCountry(row) {
  const parsed = parsePayload(row);
  if (parsed?.code) return parsed;
  if (!row?.code) return null;
  return {
    code: row.code,
    name: row.name,
    flag: row.flag || "",
    currency: row.currency,
    currency_symbol: row.currency_symbol,
    visa_processing_weeks: row.visa_processing_weeks || "",
    post_study_work_visa: row.post_study_work_visa || "",
    psw_duration: row.psw_duration || "",
    is_active: row.is_active !== 0 && row.is_active !== false,
    active: row.is_active !== 0 && row.is_active !== false
  };
}
function asProgram(row) {
  const parsed = parsePayload(row);
  const rankLevel = Number(parsed?.rank_level ?? parsed?.rank ?? row.rank_level) || 1;
  const duration = parsed?.typical_duration || parsed?.typical_duration_years || "";
  if (parsed?.id) {
    return {
      ...parsed,
      rank: parsed.rank ?? rankLevel,
      rank_level: rankLevel,
      typical_duration: duration,
      typical_duration_years: parsed.typical_duration_years || duration
    };
  }
  if (!row?.program_id) return null;
  return {
    id: row.program_id,
    name: row.name,
    rank: rankLevel,
    rank_level: rankLevel,
    description: "",
    typical_duration: duration,
    typical_duration_years: duration,
    active_courses_count: 0
  };
}
function asLead(row) {
  const parsed = parsePayload(row);
  if (parsed?.id) return parsed;
  if (!row?.lead_id) return null;
  return {
    id: row.lead_id,
    student_name: row.student_name || "",
    student_email: row.email || "",
    student_phone: row.phone || "",
    student_city: row.city || "",
    nationality: "",
    academic_score: row.academic_score || "",
    english_test: row.english_test_score || "",
    course_id: row.course_id || "",
    course_name: row.course_name || "",
    university_id: row.university_id || "",
    university_name: row.university_name || "",
    destination_country: row.destination_country || "",
    city: row.city || "",
    counselor_id: row.counselor_id || "",
    counselor_name: row.counselor_name || "",
    counselor_email: row.counselor_email || "",
    franchise_id: row.franchise_id || "ho",
    franchise_name: row.franchise_name || "Head Office",
    request_type: row.request_type || "Course Application",
    priority: row.priority || "Medium",
    status: row.status === "New Lead" ? "New Inquiry" : row.status || "New Inquiry",
    notes: row.notes || "",
    meet_link: row.meet_link || "",
    timeline: [],
    created_at: row.created_at || (/* @__PURE__ */ new Date()).toISOString(),
    updated_at: row.updated_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function asMeeting(row) {
  if (!row?.meeting_id && !row?.id) return null;
  return {
    id: row.meeting_id || row.id,
    lead_id: row.lead_id || void 0,
    student_name: row.student_name || "",
    student_email: row.student_email || "",
    counselor_email: row.counselor_email || "",
    title: row.title || "",
    description: row.description || "",
    meet_uri: row.meet_uri || "",
    calendar_event_id: row.calendar_event_id || "",
    start_time: row.start_time || "",
    end_time: row.end_time || "",
    status: row.status || "scheduled",
    created_at: row.created_at || (/* @__PURE__ */ new Date()).toISOString()
  };
}
function asImportHistory(row) {
  return parsePayload(row);
}
function asUserAccount(row) {
  if (!row?.uid && !row?.email) return null;
  return mapSqlUser(row);
}
async function loadBootstrap() {
  const grouped = await mssqlQueries([
    { name: "universities", query: "SELECT * FROM dbo.universities" },
    { name: "courses", query: "SELECT * FROM dbo.courses" },
    { name: "franchises", query: "SELECT * FROM dbo.franchises" },
    { name: "countries", query: "SELECT * FROM dbo.countries" },
    { name: "programs", query: "SELECT * FROM dbo.programs" },
    { name: "import_history", query: "SELECT * FROM dbo.import_history" },
    { name: "users", query: "SELECT uid, email, name, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider FROM dbo.users" },
    { name: "leads", query: "SELECT * FROM dbo.student_leads ORDER BY created_at DESC" },
    { name: "meetings", query: "SELECT * FROM dbo.counseling_meetings ORDER BY start_time DESC" }
  ]);
  const asRows2 = (value) => Array.isArray(value) ? value : value ? [value] : [];
  const uniRows = asRows2(grouped.universities);
  const courseRows = asRows2(grouped.courses);
  const franchiseRows = asRows2(grouped.franchises);
  const countryRows = asRows2(grouped.countries);
  const programRows = asRows2(grouped.programs);
  const historyRows = asRows2(grouped.import_history);
  const userRows = asRows2(grouped.users);
  const leadRows = asRows2(grouped.leads);
  const meetingRows = asRows2(grouped.meetings);
  const countries = countryRows.map(asCountry).filter(Boolean);
  const universities = uniRows.map(asUniversity).filter(Boolean).map((u) => ({
    ...u,
    country: countryDisplayName(u.country, countries)
  }));
  const courses = courseRows.map(asCourse).filter(Boolean).map((c) => ({
    ...c,
    destination_country: countryDisplayName(c.destination_country, countries)
  }));
  const leads = leadRows.map(asLead).filter(Boolean).map((lead) => ({
    ...lead,
    status: String(lead.status) === "New Lead" ? "New Inquiry" : lead.status,
    request_type: String(lead.request_type) === "Direct Admission" ? "Course Application" : lead.request_type
  }));
  return {
    universities,
    courses,
    franchises: franchiseRows.map(asFranchise).filter(Boolean),
    countries,
    programs: programRows.map(asProgram).filter(Boolean),
    importHistory: historyRows.map((row) => parsePayload(row)).filter(Boolean),
    users: userRows.map((row) => ({
      id: row.uid,
      email: String(row.email || "").toLowerCase(),
      name: row.name,
      role: row.role,
      status: row.status === "Inactive" || row.is_active === false || row.is_active === 0 ? "Inactive" : "Active",
      export_permission: Boolean(row.export_permission),
      department: row.department || "Portal User",
      franchise_id: row.franchise_id || void 0,
      franchise_name: row.franchise_name || void 0,
      avatar_url: row.photo_url || void 0,
      phone: row.phone || void 0,
      auth_provider: row.auth_provider || "email",
      last_login: (/* @__PURE__ */ new Date()).toISOString()
    })),
    studentLeads: leads,
    meetings: meetingRows.map(asMeeting).filter(Boolean)
  };
}
async function upsertCollectionRecord(collection, record) {
  let item;
  switch (collection) {
    case "universities":
      item = universityUpsert(record);
      break;
    case "courses":
      item = courseUpsert(record);
      break;
    case "franchises":
      item = franchiseUpsert(record);
      break;
    case "countries":
      item = countryUpsert(record);
      break;
    case "programs":
      item = programUpsert(record);
      break;
    case "import_history":
      item = importHistoryUpsert(record);
      break;
    default:
      throw new Error(`Unsupported collection: ${collection}`);
  }
  await mssqlExecute(item.sql, item.params);
}
async function deleteCollectionRecord(collection, id) {
  const map = {
    universities: { table: "universities", column: "university_id" },
    courses: { table: "courses", column: "course_id" },
    franchises: { table: "franchises", column: "franchise_id" },
    countries: { table: "countries", column: "code" },
    programs: { table: "programs", column: "program_id" },
    import_history: { table: "import_history", column: "history_id" }
  };
  const target = map[collection];
  if (!target) throw new Error(`Unsupported collection: ${collection}`);
  if (collection === "universities") {
    await mssqlExecute("DELETE FROM dbo.courses WHERE university_id = @id", { id });
  }
  await mssqlExecute(`DELETE FROM dbo.${target.table} WHERE ${target.column} = @id`, { id });
}
async function saveSqlUser(user, password) {
  const incomingPassword = password || user.password;
  const hashed = incomingPassword ? hashPassword(incomingPassword) : void 0;
  await mssqlExecute(
    `MERGE dbo.users AS t
     USING (SELECT @email AS email) AS s ON LOWER(t.email) = LOWER(s.email)
     WHEN MATCHED THEN UPDATE SET
       uid=@uid, name=@name, role=@role, department=@department, status=@status, is_active=@isActive,
       export_permission=@exportPermission, franchise_id=@franchiseId, franchise_name=@franchiseName,
       photo_url=@photoUrl, phone=@phone, auth_provider=@authProvider, updated_at=SYSUTCDATETIME()
       ${hashed ? ", password=@password" : ""}
     WHEN NOT MATCHED THEN INSERT (uid, email, name, password, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider)
     VALUES (@uid, @email, @name, @password, @role, @department, @status, @isActive, @exportPermission, @franchiseId, @franchiseName, @photoUrl, @phone, @authProvider);`,
    {
      uid: user.id,
      email: user.email,
      name: user.name,
      password: hashed || null,
      role: user.role,
      department: user.department || "",
      status: user.status || "Active",
      isActive: user.status === "Inactive" ? 0 : 1,
      exportPermission: user.export_permission ? 1 : 0,
      franchiseId: user.franchise_id || null,
      franchiseName: user.franchise_name || null,
      photoUrl: user.avatar_url || null,
      phone: user.phone || null,
      authProvider: user.auth_provider || "email"
    }
  );
}
async function deleteSqlUser(userId) {
  await mssqlExecute("DELETE FROM dbo.users WHERE uid = @uid", { uid: userId });
}
async function findSqlUserRowByEmail(email) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.users WHERE LOWER(email) = LOWER(@email)", { email });
  return rows[0] || null;
}
async function findSqlUserProfileByEmail(email) {
  const rows = await mssqlQuery(
    "SELECT TOP 1 uid, email, name, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider FROM dbo.users WHERE LOWER(email) = LOWER(@email)",
    { email }
  );
  return rows[0] || null;
}
async function updateSqlUserPassword(email, hashedPassword) {
  await mssqlExecute(
    "UPDATE dbo.users SET password = @password, updated_at = SYSUTCDATETIME() WHERE LOWER(email) = LOWER(@email)",
    { email, password: hashedPassword }
  );
}
async function touchSqlUser(email) {
  await mssqlExecute("UPDATE dbo.users SET updated_at = SYSUTCDATETIME() WHERE LOWER(email) = LOWER(@email)", { email });
}
async function listSqlLeads() {
  return mssqlQuery("SELECT * FROM dbo.student_leads ORDER BY created_at DESC");
}
async function findSqlLeadById(leadId) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.student_leads WHERE lead_id = @leadId", { leadId });
  return rows[0] || null;
}
function clip(value, max, fallback = "") {
  const text = String(value ?? "").trim();
  return (text || fallback).slice(0, max);
}
async function saveSqlLeadRecord(leadData) {
  const leadId = clip(leadData.id || `lead_${Date.now()}`, 64);
  const fullLead = { ...leadData, id: leadId, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
  await mssqlExecute(
    `MERGE dbo.student_leads AS t
     USING (SELECT @leadId AS lead_id) AS s
     ON t.lead_id = s.lead_id
     WHEN MATCHED THEN UPDATE SET
       student_name = @studentName,
       email = @email,
       phone = @phone,
       city = @city,
       counselor_id = @counselorId,
       counselor_name = @counselorName,
       counselor_email = @counselorEmail,
       franchise_id = @franchiseId,
       franchise_name = @franchiseName,
       course_id = @courseId,
       course_name = @courseName,
       university_id = @universityId,
       university_name = @universityName,
       destination_country = @destinationCountry,
       target_intake = @targetIntake,
       academic_score = @academicScore,
       english_test_score = @englishTestScore,
       status = @status,
       priority = @priority,
       request_type = @requestType,
       notes = @notes,
       meet_link = @meetLink,
       calendar_event_id = @calendarEventId,
       google_doc_id = @googleDocId,
       payload_json = @payloadJson,
       updated_at = SYSUTCDATETIME()
     WHEN NOT MATCHED THEN INSERT (
       lead_id, student_name, email, phone, city, counselor_id, counselor_name, counselor_email,
       franchise_id, franchise_name, course_id, course_name, university_id, university_name,
       destination_country, target_intake, academic_score, english_test_score, status, priority,
       request_type, notes, meet_link, calendar_event_id, google_doc_id, payload_json
     ) VALUES (
       @leadId, @studentName, @email, @phone, @city, @counselorId, @counselorName, @counselorEmail,
       @franchiseId, @franchiseName, @courseId, @courseName, @universityId, @universityName,
       @destinationCountry, @targetIntake, @academicScore, @englishTestScore, @status, @priority,
       @requestType, @notes, @meetLink, @calendarEventId, @googleDocId, @payloadJson
     );`,
    {
      leadId,
      studentName: clip(fullLead.student_name, 128, "Unknown student"),
      email: clip(fullLead.student_email || fullLead.email, 256),
      phone: clip(fullLead.student_phone || fullLead.phone, 64),
      city: clip(fullLead.student_city || fullLead.city, 64),
      counselorId: clip(fullLead.counselor_id, 128, "counselor_1"),
      counselorName: clip(fullLead.counselor_name, 128, "Counselor"),
      counselorEmail: clip(fullLead.counselor_email, 256),
      franchiseId: clip(fullLead.franchise_id, 64, "ho"),
      franchiseName: clip(fullLead.franchise_name, 256, "Head Office"),
      courseId: clip(fullLead.course_id, 64, "unassigned"),
      courseName: clip(fullLead.course_name, 256, "Unassigned"),
      universityId: clip(fullLead.university_id, 64, "unassigned"),
      universityName: clip(fullLead.university_name, 256, "Unassigned"),
      destinationCountry: clip(fullLead.destination_country, 64, "Unknown"),
      targetIntake: clip(fullLead.target_intake || fullLead.intake, 64),
      academicScore: clip(fullLead.academic_score, 64),
      englishTestScore: clip(fullLead.english_test_score || fullLead.english_test, 64),
      status: clip(fullLead.status === "New Lead" ? "New Inquiry" : fullLead.status, 64, "New Inquiry"),
      priority: clip(fullLead.priority, 32, "Medium"),
      requestType: clip(
        fullLead.request_type === "Direct Admission" ? "Course Application" : fullLead.request_type,
        64,
        "Course Application"
      ),
      notes: clip(fullLead.notes, 2e3),
      meetLink: clip(fullLead.meet_link, 512),
      calendarEventId: clip(fullLead.calendar_event_id, 128),
      googleDocId: clip(fullLead.google_doc_id, 128),
      payloadJson: JSON.stringify(fullLead)
    }
  );
  return await findSqlLeadById(leadId) || { lead_id: leadId, payload_json: JSON.stringify(fullLead) };
}
async function deleteSqlLeadRecord(leadId) {
  await mssqlExecute("DELETE FROM dbo.student_leads WHERE lead_id = @leadId", { leadId });
}
async function getSqlTableCounts() {
  const [leads, courseRows, uniRows, userRows, countryRows, franchiseRows, programRows, historyRows, meetingRows] = await Promise.all([
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.student_leads"),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.courses"),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.universities"),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.users"),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.countries"),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.franchises"),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.programs").catch(() => [{ cnt: 0 }]),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.import_history").catch(() => [{ cnt: 0 }]),
    mssqlQuery("SELECT COUNT(*) AS cnt FROM dbo.counseling_meetings").catch(() => [{ cnt: 0 }])
  ]);
  return {
    student_leads: Number(leads[0]?.cnt || 0),
    courses: Number(courseRows[0]?.cnt || 0),
    universities: Number(uniRows[0]?.cnt || 0),
    users: Number(userRows[0]?.cnt || 0),
    countries: Number(countryRows[0]?.cnt || 0),
    franchises: Number(franchiseRows[0]?.cnt || 0),
    programs: Number(programRows[0]?.cnt || 0),
    import_history: Number(historyRows[0]?.cnt || 0),
    counseling_meetings: Number(meetingRows[0]?.cnt || 0)
  };
}
var USER_PROFILE_SQL = "uid, email, name, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider";
async function listCountries() {
  const rows = await mssqlQuery("SELECT * FROM dbo.countries");
  return rows.map(asCountry).filter(Boolean);
}
async function getCountryByCode(code) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.countries WHERE code = @code", { code });
  return asCountry(rows[0]) || null;
}
async function listUniversities() {
  const [rows, countries] = await Promise.all([mssqlQuery("SELECT * FROM dbo.universities"), listCountries()]);
  return rows.map(asUniversity).filter(Boolean).map((u) => ({
    ...u,
    country: countryDisplayName(u.country, countries)
  }));
}
async function getUniversityById(id) {
  const [rows, countries] = await Promise.all([
    mssqlQuery("SELECT TOP 1 * FROM dbo.universities WHERE university_id = @id", { id }),
    listCountries()
  ]);
  const uni = asUniversity(rows[0]);
  if (!uni) return null;
  return { ...uni, country: countryDisplayName(uni.country, countries) };
}
async function listCourses() {
  const [rows, countries] = await Promise.all([mssqlQuery("SELECT * FROM dbo.courses"), listCountries()]);
  return rows.map(asCourse).filter(Boolean).map((c) => ({
    ...c,
    destination_country: countryDisplayName(c.destination_country, countries)
  }));
}
async function getCourseById(id) {
  const [rows, countries] = await Promise.all([
    mssqlQuery("SELECT TOP 1 * FROM dbo.courses WHERE course_id = @id", { id }),
    listCountries()
  ]);
  const course = asCourse(rows[0]);
  if (!course) return null;
  return { ...course, destination_country: countryDisplayName(course.destination_country, countries) };
}
async function listFranchises() {
  const rows = await mssqlQuery("SELECT * FROM dbo.franchises");
  return rows.map(asFranchise).filter(Boolean);
}
async function getFranchiseById(id) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.franchises WHERE franchise_id = @id", { id });
  return asFranchise(rows[0]);
}
async function listPrograms() {
  const rows = await mssqlQuery("SELECT * FROM dbo.programs");
  return rows.map(asProgram).filter(Boolean);
}
async function getProgramById(id) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.programs WHERE program_id = @id", { id });
  return asProgram(rows[0]);
}
async function listImportHistory() {
  const rows = await mssqlQuery("SELECT * FROM dbo.import_history");
  return rows.map(asImportHistory).filter(Boolean);
}
async function getImportHistoryById(id) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.import_history WHERE history_id = @id", { id });
  return asImportHistory(rows[0]);
}
async function listSqlUsers() {
  const rows = await mssqlQuery(`SELECT ${USER_PROFILE_SQL} FROM dbo.users`);
  return rows.map(asUserAccount).filter(Boolean);
}
async function getSqlUserById(id) {
  const rows = await mssqlQuery(`SELECT TOP 1 ${USER_PROFILE_SQL} FROM dbo.users WHERE uid = @id`, { id });
  return asUserAccount(rows[0]);
}
async function getMappedLeadById(leadId) {
  const row = await findSqlLeadById(leadId);
  if (!row) return null;
  return mapSqlLead(row);
}
async function listMeetings() {
  const rows = await mssqlQuery("SELECT * FROM dbo.counseling_meetings ORDER BY start_time DESC");
  return rows.map(asMeeting).filter(Boolean);
}
async function getMeetingById(id) {
  const rows = await mssqlQuery("SELECT TOP 1 * FROM dbo.counseling_meetings WHERE meeting_id = @id", { id });
  return asMeeting(rows[0]);
}
async function saveMeeting(record) {
  const meetingId = record.id || record.meeting_id || `mtg_${Date.now()}`;
  await mssqlExecute(
    `MERGE dbo.counseling_meetings AS t
     USING (SELECT @id AS meeting_id) AS s ON t.meeting_id = s.meeting_id
     WHEN MATCHED THEN UPDATE SET
       lead_id=@leadId, student_name=@studentName, student_email=@studentEmail, counselor_email=@counselorEmail,
       title=@title, description=@description, meet_uri=@meetUri, calendar_event_id=@calendarEventId,
       start_time=@startTime, end_time=@endTime, status=@status
     WHEN NOT MATCHED THEN INSERT (
       meeting_id, lead_id, student_name, student_email, counselor_email, title, description,
       meet_uri, calendar_event_id, start_time, end_time, status
     ) VALUES (
       @id, @leadId, @studentName, @studentEmail, @counselorEmail, @title, @description,
       @meetUri, @calendarEventId, @startTime, @endTime, @status
     );`,
    {
      id: meetingId,
      leadId: record.lead_id || null,
      studentName: record.student_name || "",
      studentEmail: record.student_email || "",
      counselorEmail: record.counselor_email || "",
      title: record.title || "Counseling meeting",
      description: record.description || "",
      meetUri: record.meet_uri || "",
      calendarEventId: record.calendar_event_id || "",
      startTime: record.start_time || (/* @__PURE__ */ new Date()).toISOString(),
      endTime: record.end_time || (/* @__PURE__ */ new Date()).toISOString(),
      status: record.status || "scheduled"
    }
  );
  return await getMeetingById(meetingId) || { ...record, id: meetingId };
}
async function deleteMeeting(id) {
  await mssqlExecute("DELETE FROM dbo.counseling_meetings WHERE meeting_id = @id", { id });
}

// src/middleware/auth.ts
var import_node_crypto2 = require("node:crypto");
var sessions = /* @__PURE__ */ new Map();
var SESSION_TTL_MS = 12 * 60 * 60 * 1e3;
function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [token, session] of sessions) {
    if (session.createdAt < cutoff) sessions.delete(token);
  }
}
function createSessionToken(user) {
  pruneSessions();
  const token = (0, import_node_crypto2.randomBytes)(32).toString("hex");
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: Date.now()
  });
  return token;
}
function readBearerToken(req) {
  const header = String(req.headers.authorization || "");
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  return "";
}
function requireAuth(req, res, next) {
  pruneSessions();
  const token = readBearerToken(req);
  const session = token ? sessions.get(token) : void 0;
  if (!session) {
    return res.status(401).json({ error: "Please sign in to continue." });
  }
  req.portalUser = session;
  next();
}
function requireAdmin(req, res, next) {
  if (!req.portalUser) {
    return res.status(401).json({ error: "Please sign in to continue." });
  }
  if (req.portalUser.role !== "Admin" && req.portalUser.role !== "Super Admin") {
    return res.status(403).json({ error: "Administrator access is required." });
  }
  next();
}

// src/middleware/apiAuthGate.ts
var OPEN_POST = /* @__PURE__ */ new Set(["/auth/login", "/auth/register", "/auth/external-session"]);
function apiAuthGate(req, res, next) {
  const pathName = req.path;
  const open = pathName === "/health" || req.method === "POST" && OPEN_POST.has(pathName);
  if (open) return next();
  return requireAuth(req, res, next);
}

// src/middleware/errorHandler.ts
function errorHandler(err, _req, res, _next) {
  const error = err;
  const status = err instanceof HttpError ? err.status : Number(error?.status) || 500;
  if (status >= 500) {
    console.error("[API]", err);
  }
  res.status(status).json({
    error: error?.message || "Server error"
  });
}

// src/routes/index.ts
var import_express6 = require("express");

// src/routes/auth.routes.ts
var import_express = require("express");

// src/services/auth.service.ts
async function login(emailRaw, passwordRaw) {
  const email = String(emailRaw || "").trim().toLowerCase();
  const password = String(passwordRaw || "").trim();
  if (!email || !password) {
    throw new HttpError(400, "Email and password are required.");
  }
  const row = await findSqlUserRowByEmail(email);
  if (!row) {
    throw new HttpError(404, "No account found for this email.");
  }
  if (isInactiveUserRow(row)) {
    throw new HttpError(403, "This account is currently marked Inactive.");
  }
  if (!verifyPassword(password, String(row.password || ""))) {
    throw new HttpError(401, "Incorrect password.");
  }
  if (!isHashedPassword(String(row.password || ""))) {
    await updateSqlUserPassword(email, hashPassword(password));
  } else {
    await touchSqlUser(email);
  }
  const user = mapSqlUser(row);
  const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
  return { source: "sql", user, token };
}
async function register(body) {
  const email = String(body?.email || "").trim().toLowerCase();
  const password = String(body?.password || "").trim();
  const name = String(body?.name || "").trim();
  if (!email || !password || !name) {
    throw new HttpError(400, "Name, email, and password are required.");
  }
  const existing = await findSqlUserRowByEmail(email);
  if (existing) {
    throw new HttpError(409, "An account with this email already exists.");
  }
  const user = {
    id: `usr_${Date.now().toString(36)}`,
    email,
    name,
    role: "User",
    status: "Active",
    export_permission: true,
    department: body?.department || "Public Student Portal",
    phone: body?.phone || void 0,
    auth_provider: "email",
    last_login: (/* @__PURE__ */ new Date()).toISOString()
  };
  await saveSqlUser(user, password);
  const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
  return { source: "sql", user, token };
}
async function createExternalSession(body) {
  const email = String(body?.email || "").trim().toLowerCase();
  const name = String(body?.name || email.split("@")[0]).trim();
  if (!email || !email.includes("@")) {
    throw new HttpError(400, "A valid email is required.");
  }
  const row = await findSqlUserRowByEmail(email);
  let user;
  if (row) {
    if (isInactiveUserRow(row)) {
      throw new HttpError(403, "This account is currently marked Inactive.");
    }
    user = mapSqlUser(row);
  } else {
    user = {
      id: `usr_g_${Date.now().toString(36)}`,
      email,
      name,
      role: "User",
      status: "Active",
      export_permission: true,
      department: "Public Student Portal",
      avatar_url: body?.photo || void 0,
      auth_provider: "google",
      last_login: (/* @__PURE__ */ new Date()).toISOString()
    };
    await saveSqlUser(user);
  }
  const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
  return { source: "sql", user, token };
}
async function changePassword(email, currentPasswordRaw, newPasswordRaw) {
  const currentPassword = String(currentPasswordRaw || "").trim();
  const newPassword = String(newPasswordRaw || "").trim();
  if (!email) {
    throw new HttpError(401, "Please sign in to continue.");
  }
  if (newPassword.length < 8) {
    throw new HttpError(400, "New password must be at least 8 characters long.");
  }
  const row = await findSqlUserRowByEmail(email);
  if (!row) {
    throw new HttpError(404, "Account not found.");
  }
  if (!verifyPassword(currentPassword, String(row.password || ""))) {
    throw new HttpError(401, "Current password is incorrect.");
  }
  await updateSqlUserPassword(email, hashPassword(newPassword));
  return { ok: true };
}

// src/controllers/auth.controller.ts
async function login2(req, res) {
  const result = await login(req.body?.email, req.body?.password);
  res.json(result);
}
async function register2(req, res) {
  const result = await register(req.body);
  res.json(result);
}
async function externalSession(req, res) {
  const result = await createExternalSession(req.body);
  res.json(result);
}
async function changePassword2(req, res) {
  const result = await changePassword(
    req.portalUser?.email,
    req.body?.currentPassword,
    req.body?.newPassword
  );
  res.json(result);
}

// src/middleware/asyncHandler.ts
function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

// src/routes/auth.routes.ts
var router = (0, import_express.Router)();
router.post("/login", asyncHandler(login2));
router.post("/register", asyncHandler(register2));
router.post("/external-session", asyncHandler(externalSession));
router.post("/change-password", asyncHandler(changePassword2));
var auth_routes_default = router;

// src/routes/users.routes.ts
var import_express2 = require("express");

// src/services/users.service.ts
var users_service_exports = {};
__export(users_service_exports, {
  getById: () => getById,
  list: () => list,
  lookupUserByEmail: () => lookupUserByEmail,
  remove: () => remove,
  removeUser: () => removeUser,
  save: () => save,
  saveUser: () => saveUser
});
async function list() {
  return listSqlUsers();
}
async function getById(id) {
  const item = await getSqlUserById(id);
  if (!item) throw new HttpError(404, "User not found.");
  return item;
}
async function lookupUserByEmail(emailRaw) {
  const email = String(emailRaw || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new HttpError(400, "A valid email is required.");
  }
  const row = await findSqlUserProfileByEmail(email);
  if (!row) return { user: null, source: "sql" };
  return { source: "sql", user: mapSqlUser(row) };
}
async function save(body, id) {
  const record = { ...body, id: body?.id || id || `user_${Date.now()}` };
  if (!record.email) throw new HttpError(400, "Email is required.");
  await saveSqlUser(record, record.password);
  const saved = await getSqlUserById(record.id);
  if (saved) return saved;
  const row = await findSqlUserProfileByEmail(String(record.email).trim().toLowerCase());
  if (!row) throw new HttpError(500, "User was not saved.");
  return mapSqlUser(row);
}
async function saveUser(body) {
  return save(body);
}
async function remove(userId) {
  if (!userId) throw new HttpError(400, "User id is required.");
  await getById(userId);
  await deleteSqlUser(userId);
  return { ok: true, id: userId };
}
async function removeUser(userId) {
  return remove(userId);
}

// src/server/makeCrudController.ts
function makeCrudController(service, idParam = "id") {
  return {
    list: async (_req, res) => {
      res.json(await service.list());
    },
    getById: async (req, res) => {
      res.json(await service.getById(String(req.params[idParam] || "")));
    },
    create: async (req, res) => {
      res.status(201).json(await service.save(req.body));
    },
    update: async (req, res) => {
      res.json(await service.save(req.body, String(req.params[idParam] || "")));
    },
    remove: async (req, res) => {
      res.json(await service.remove(String(req.params[idParam] || "")));
    }
  };
}

// src/controllers/users.controller.ts
var crud = makeCrudController(users_service_exports);
var list2 = crud.list;
var getById2 = crud.getById;
var create = crud.create;
var update = crud.update;
var remove2 = crud.remove;
async function lookup(req, res) {
  res.json(await lookupUserByEmail(String(req.query.email || "")));
}
async function save2(req, res) {
  res.json(await save(req.body, req.params.id));
}

// src/routes/users.routes.ts
var router2 = (0, import_express2.Router)();
router2.get("/lookup", asyncHandler(lookup));
router2.get("/", asyncHandler(list2));
router2.post("/", asyncHandler(create));
router2.put("/", asyncHandler(save2));
router2.post("/:id/delete", requireAdmin, asyncHandler(remove2));
router2.get("/:id", asyncHandler(getById2));
router2.put("/:id", asyncHandler(update));
router2.patch("/:id", asyncHandler(update));
router2.delete("/:id", requireAdmin, asyncHandler(remove2));
var users_routes_default = router2;

// src/routes/catalog.routes.ts
var import_express3 = require("express");

// src/services/catalog.service.ts
async function getBootstrap() {
  return loadBootstrap();
}
async function resetCatalog() {
  const seeded = await resetAndSeedCatalog();
  const data = await loadBootstrap();
  return { ok: true, seeded, data };
}
async function saveRecord(collection, record) {
  await upsertCollectionRecord(collection, record);
  return { ok: true };
}
async function deleteRecord(collection, id) {
  await deleteCollectionRecord(collection, id);
  return { ok: true };
}

// src/controllers/catalog.controller.ts
async function bootstrap(_req, res) {
  res.json(await getBootstrap());
}
async function reset(_req, res) {
  res.json(await resetCatalog());
}
async function saveCollection(req, res) {
  res.json(await saveRecord(req.params.collection, req.body));
}
async function deleteCollection(req, res) {
  res.json(await deleteRecord(req.params.collection, req.params.id));
}

// src/routes/catalog.routes.ts
var router3 = (0, import_express3.Router)();
router3.get("/bootstrap", asyncHandler(bootstrap));
router3.post("/catalog/reset", requireAdmin, asyncHandler(reset));
router3.put("/records/:collection/:id", asyncHandler(saveCollection));
router3.delete("/records/:collection/:id", asyncHandler(deleteCollection));
var catalog_routes_default = router3;

// src/controllers/leads.controller.ts
var leads_controller_exports = {};
__export(leads_controller_exports, {
  create: () => create2,
  getById: () => getById4,
  list: () => list4,
  remove: () => remove4,
  update: () => update2
});

// src/services/leads.service.ts
var leads_service_exports = {};
__export(leads_service_exports, {
  deleteLead: () => deleteLead,
  getById: () => getById3,
  list: () => list3,
  listLeads: () => listLeads,
  remove: () => remove3,
  save: () => save3,
  saveLead: () => saveLead
});
async function list3() {
  return (await listSqlLeads()).map(mapSqlLead);
}
async function listLeads() {
  return list3();
}
async function getById3(leadId) {
  if (!leadId) throw new HttpError(400, "Lead id is required.");
  const item = await getMappedLeadById(leadId);
  if (!item) throw new HttpError(404, "Lead not found.");
  return item;
}
async function save3(leadData, id) {
  const record = { ...leadData, id: leadData?.id || id };
  return mapSqlLead(await saveSqlLeadRecord(record || {}));
}
async function saveLead(leadData) {
  return save3(leadData);
}
async function remove3(leadIdRaw) {
  const leadId = String(leadIdRaw || "");
  if (!leadId) throw new HttpError(400, "Lead id is required.");
  await getById3(leadId);
  await deleteSqlLeadRecord(leadId);
  return { ok: true, id: leadId };
}
async function deleteLead(leadIdRaw) {
  return remove3(leadIdRaw);
}

// src/controllers/leads.controller.ts
var { list: list4, getById: getById4, create: create2, update: update2, remove: remove4 } = makeCrudController(leads_service_exports, "leadId");

// src/routes/makeResourceRouter.ts
var import_express4 = require("express");
function makeResourceRouter(controller, idParam = "id") {
  const router6 = (0, import_express4.Router)();
  router6.get("/", asyncHandler(controller.list));
  router6.post("/", asyncHandler(controller.create));
  router6.post(`/:${idParam}/delete`, asyncHandler(controller.remove));
  router6.get(`/:${idParam}`, asyncHandler(controller.getById));
  router6.put(`/:${idParam}`, asyncHandler(controller.update));
  router6.patch(`/:${idParam}`, asyncHandler(controller.update));
  router6.delete(`/:${idParam}`, asyncHandler(controller.remove));
  return router6;
}

// src/routes/leads.routes.ts
var leads_routes_default = makeResourceRouter(leads_controller_exports, "leadId");

// src/routes/health.routes.ts
var import_express5 = require("express");

// src/services/health.service.ts
function sqlConfigStatus() {
  return {
    host: sqlServerName() || "(not set)",
    database: process.env.SQL_DB_NAME || "study_world_portal",
    user: String(process.env.SQL_USER || "").trim() || "(not set)",
    passwordSet: Boolean(String(process.env.SQL_PASSWORD || "").trim()),
    envFile: getEnvFilePath() || "(not found)"
  };
}
async function getHealth() {
  try {
    const sql2 = await testSqlConnection();
    return {
      status: "ok",
      sql: sql2,
      config: sqlConfigStatus(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  } catch (error) {
    return {
      status: "error",
      sql: { ok: false, error: error.message },
      config: sqlConfigStatus(),
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
}
async function getDatabaseStatus() {
  const tables = await getSqlTableCounts();
  return {
    success: true,
    region: "sql",
    server: sqlServerName() || "(not set)",
    database: process.env.SQL_DB_NAME || "study_world_portal",
    tables
  };
}

// src/controllers/health.controller.ts
async function health(_req, res) {
  const payload = await getHealth();
  res.status(payload.status === "ok" ? 200 : 500).json(payload);
}
async function databaseStatus(_req, res) {
  res.json(await getDatabaseStatus());
}

// src/routes/health.routes.ts
var router4 = (0, import_express5.Router)();
router4.get("/health", asyncHandler(health));
router4.get("/cloudsql/status", asyncHandler(databaseStatus));
var health_routes_default = router4;

// src/controllers/universities.controller.ts
var universities_controller_exports = {};
__export(universities_controller_exports, {
  create: () => create3,
  getById: () => getById6,
  list: () => list6,
  remove: () => remove6,
  update: () => update3
});

// src/services/universities.service.ts
var universities_service_exports = {};
__export(universities_service_exports, {
  getById: () => getById5,
  list: () => list5,
  remove: () => remove5,
  save: () => save4
});
async function list5() {
  return listUniversities();
}
async function getById5(id) {
  const item = await getUniversityById(id);
  if (!item) throw new HttpError(404, "University not found.");
  return item;
}
async function save4(body, id) {
  const record = { ...body, university_id: body?.university_id || id || `uni_${Date.now()}` };
  if (!record.name) throw new HttpError(400, "University name is required.");
  await upsertCollectionRecord("universities", record);
  return getById5(record.university_id);
}
async function remove5(id) {
  if (!id) throw new HttpError(400, "University id is required.");
  await getById5(id);
  await deleteCollectionRecord("universities", id);
  return { ok: true, id };
}

// src/controllers/universities.controller.ts
var { list: list6, getById: getById6, create: create3, update: update3, remove: remove6 } = makeCrudController(universities_service_exports);

// src/routes/universities.routes.ts
var universities_routes_default = makeResourceRouter(universities_controller_exports);

// src/controllers/courses.controller.ts
var courses_controller_exports = {};
__export(courses_controller_exports, {
  create: () => create4,
  getById: () => getById8,
  list: () => list8,
  remove: () => remove8,
  update: () => update4
});

// src/services/courses.service.ts
var courses_service_exports = {};
__export(courses_service_exports, {
  getById: () => getById7,
  list: () => list7,
  remove: () => remove7,
  save: () => save5
});
async function list7() {
  return listCourses();
}
async function getById7(id) {
  const item = await getCourseById(id);
  if (!item) throw new HttpError(404, "Course not found.");
  return item;
}
async function save5(body, id) {
  const record = { ...body, course_id: body?.course_id || id || `crs_${Date.now()}` };
  if (!record.course_name) throw new HttpError(400, "course_name is required.");
  await upsertCollectionRecord("courses", record);
  return getById7(record.course_id);
}
async function remove7(id) {
  if (!id) throw new HttpError(400, "Course id is required.");
  await getById7(id);
  await deleteCollectionRecord("courses", id);
  return { ok: true, id };
}

// src/controllers/courses.controller.ts
var { list: list8, getById: getById8, create: create4, update: update4, remove: remove8 } = makeCrudController(courses_service_exports);

// src/routes/courses.routes.ts
var courses_routes_default = makeResourceRouter(courses_controller_exports);

// src/controllers/countries.controller.ts
var countries_controller_exports = {};
__export(countries_controller_exports, {
  create: () => create5,
  getById: () => getById10,
  list: () => list10,
  remove: () => remove10,
  update: () => update5
});

// src/services/countries.service.ts
var countries_service_exports = {};
__export(countries_service_exports, {
  getById: () => getById9,
  list: () => list9,
  remove: () => remove9,
  save: () => save6
});
async function list9() {
  return listCountries();
}
async function getById9(code) {
  const item = await getCountryByCode(code);
  if (!item) throw new HttpError(404, "Country not found.");
  return item;
}
async function save6(body, code) {
  const record = { ...body, code: body?.code || code };
  if (!record.code) throw new HttpError(400, "Country code is required.");
  if (!record.name) throw new HttpError(400, "Country name is required.");
  await upsertCollectionRecord("countries", record);
  return getById9(record.code);
}
async function remove9(code) {
  if (!code) throw new HttpError(400, "Country code is required.");
  await getById9(code);
  await deleteCollectionRecord("countries", code);
  return { ok: true, id: code };
}

// src/controllers/countries.controller.ts
var { list: list10, getById: getById10, create: create5, update: update5, remove: remove10 } = makeCrudController(countries_service_exports, "code");

// src/routes/countries.routes.ts
var countries_routes_default = makeResourceRouter(countries_controller_exports, "code");

// src/controllers/franchises.controller.ts
var franchises_controller_exports = {};
__export(franchises_controller_exports, {
  create: () => create6,
  getById: () => getById12,
  list: () => list12,
  remove: () => remove12,
  update: () => update6
});

// src/services/franchises.service.ts
var franchises_service_exports = {};
__export(franchises_service_exports, {
  getById: () => getById11,
  list: () => list11,
  remove: () => remove11,
  save: () => save7
});
async function list11() {
  return listFranchises();
}
async function getById11(id) {
  const item = await getFranchiseById(id);
  if (!item) throw new HttpError(404, "Franchise not found.");
  return item;
}
async function save7(body, id) {
  const record = { ...body, id: body?.id || body?.franchise_id || id || `fr_${Date.now()}` };
  if (!record.name) throw new HttpError(400, "Franchise name is required.");
  await upsertCollectionRecord("franchises", record);
  return getById11(record.id);
}
async function remove11(id) {
  if (!id) throw new HttpError(400, "Franchise id is required.");
  await getById11(id);
  await deleteCollectionRecord("franchises", id);
  return { ok: true, id };
}

// src/controllers/franchises.controller.ts
var { list: list12, getById: getById12, create: create6, update: update6, remove: remove12 } = makeCrudController(franchises_service_exports);

// src/routes/franchises.routes.ts
var franchises_routes_default = makeResourceRouter(franchises_controller_exports);

// src/controllers/programs.controller.ts
var programs_controller_exports = {};
__export(programs_controller_exports, {
  create: () => create7,
  getById: () => getById14,
  list: () => list14,
  remove: () => remove14,
  update: () => update7
});

// src/services/programs.service.ts
var programs_service_exports = {};
__export(programs_service_exports, {
  getById: () => getById13,
  list: () => list13,
  remove: () => remove13,
  save: () => save8
});
async function list13() {
  return listPrograms();
}
async function getById13(id) {
  const item = await getProgramById(id);
  if (!item) throw new HttpError(404, "Program not found.");
  return item;
}
async function save8(body, id) {
  const record = { ...body, id: body?.id || body?.program_id || id || `prog_${Date.now()}` };
  if (!record.name) throw new HttpError(400, "Program name is required.");
  await upsertCollectionRecord("programs", record);
  return getById13(record.id);
}
async function remove13(id) {
  if (!id) throw new HttpError(400, "Program id is required.");
  await getById13(id);
  await deleteCollectionRecord("programs", id);
  return { ok: true, id };
}

// src/controllers/programs.controller.ts
var { list: list14, getById: getById14, create: create7, update: update7, remove: remove14 } = makeCrudController(programs_service_exports);

// src/routes/programs.routes.ts
var programs_routes_default = makeResourceRouter(programs_controller_exports);

// src/controllers/importHistory.controller.ts
var importHistory_controller_exports = {};
__export(importHistory_controller_exports, {
  create: () => create8,
  getById: () => getById16,
  list: () => list16,
  remove: () => remove16,
  update: () => update8
});

// src/services/importHistory.service.ts
var importHistory_service_exports = {};
__export(importHistory_service_exports, {
  getById: () => getById15,
  list: () => list15,
  remove: () => remove15,
  save: () => save9
});
async function list15() {
  return listImportHistory();
}
async function getById15(id) {
  const item = await getImportHistoryById(id);
  if (!item) throw new HttpError(404, "Import history record not found.");
  return item;
}
async function save9(body, id) {
  const historyId = String(body?.timestamp || body?.id || id || Date.now());
  const record = { ...body, timestamp: body?.timestamp || historyId, file_name: body?.file_name || historyId };
  await upsertCollectionRecord("import_history", record);
  return getById15(String(record.timestamp || record.file_name));
}
async function remove15(id) {
  if (!id) throw new HttpError(400, "Import history id is required.");
  await getById15(id);
  await deleteCollectionRecord("import_history", id);
  return { ok: true, id };
}

// src/controllers/importHistory.controller.ts
var { list: list16, getById: getById16, create: create8, update: update8, remove: remove16 } = makeCrudController(importHistory_service_exports);

// src/routes/importHistory.routes.ts
var importHistory_routes_default = makeResourceRouter(importHistory_controller_exports);

// src/controllers/meetings.controller.ts
var meetings_controller_exports = {};
__export(meetings_controller_exports, {
  create: () => create9,
  getById: () => getById18,
  list: () => list18,
  remove: () => remove18,
  update: () => update9
});

// src/services/meetings.service.ts
var meetings_service_exports = {};
__export(meetings_service_exports, {
  getById: () => getById17,
  list: () => list17,
  remove: () => remove17,
  save: () => save10
});
async function list17() {
  return listMeetings();
}
async function getById17(id) {
  const item = await getMeetingById(id);
  if (!item) throw new HttpError(404, "Meeting not found.");
  return item;
}
async function save10(body, id) {
  const record = { ...body, id: body?.id || body?.meeting_id || id };
  if (!record.student_name || !record.student_email || !record.counselor_email) {
    throw new HttpError(400, "student_name, student_email, and counselor_email are required.");
  }
  return saveMeeting(record);
}
async function remove17(id) {
  if (!id) throw new HttpError(400, "Meeting id is required.");
  await getById17(id);
  await deleteMeeting(id);
  return { ok: true, id };
}

// src/controllers/meetings.controller.ts
var { list: list18, getById: getById18, create: create9, update: update9, remove: remove18 } = makeCrudController(meetings_service_exports);

// src/routes/meetings.routes.ts
var meetings_routes_default = makeResourceRouter(meetings_controller_exports);

// src/routes/index.ts
var router5 = (0, import_express6.Router)();
router5.use(health_routes_default);
router5.use("/auth", auth_routes_default);
router5.use("/users", users_routes_default);
router5.use("/leads", leads_routes_default);
router5.use("/universities", universities_routes_default);
router5.use("/courses", courses_routes_default);
router5.use("/countries", countries_routes_default);
router5.use("/franchises", franchises_routes_default);
router5.use("/programs", programs_routes_default);
router5.use("/import-history", importHistory_routes_default);
router5.use("/meetings", meetings_routes_default);
router5.use(catalog_routes_default);
var routes_default = router5;

// src/server/app.ts
async function createApp() {
  const app = (0, import_express7.default)();
  app.use(import_express7.default.json({ limit: "10mb" }));
  app.use("/api", apiAuthGate);
  app.use("/api", routes_default);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(getAppRoot(), "dist", "public");
    app.use(import_express7.default.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.use(errorHandler);
  void seedCatalogIfEmpty().catch((err) => {
    console.error("[SQL Server] Catalog seed failed:", err);
  });
  return app;
}

// server.ts
loadEnv();
function listenTarget() {
  const raw = process.env.PORT;
  if (raw && Number.isNaN(Number(raw))) {
    return raw;
  }
  return Number(raw) || 3e3;
}
async function startServer() {
  const app = await createApp();
  const port = listenTarget();
  const onListening = () => {
    const where = typeof port === "string" ? port : `http://0.0.0.0:${port}`;
    console.log(`Study World Server running on ${where}`);
    console.log(
      `SQL Server: ${String(process.env.SQL_HOST || "").trim() || "(not set)"} / ${process.env.SQL_DB_NAME || "study_world_portal"}`
    );
  };
  const server = typeof port === "string" ? app.listen(port, onListening) : app.listen(port, "0.0.0.0", onListening);
  server.on("error", (err) => {
    console.error("[server] listen failed:", err);
    process.exit(1);
  });
}
startServer().catch((err) => {
  console.error("[server] failed to start:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
