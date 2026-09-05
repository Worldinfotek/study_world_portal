import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

let appRoot = process.cwd();
let envFilePath = '';

function unique(paths: string[]): string[] {
  return [...new Set(paths.filter(Boolean))];
}

function candidateDirs(): string[] {
  return unique([
    process.cwd(),
    typeof __dirname === 'string' ? __dirname : '',
    typeof __dirname === 'string' ? path.resolve(__dirname, '..') : '',
  ]);
}

function stripQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

export function getAppRoot(): string {
  return appRoot;
}

export function getEnvFilePath(): string {
  return envFilePath;
}

export function loadEnv(): string {
  const names = ['.env', '.env.local', '.env.txt', 'env'];
  for (const dir of candidateDirs()) {
    for (const name of names) {
      const file = path.join(dir, name);
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
      dotenv.config({ path: file, override: false });
      if (!envFilePath) envFilePath = file;
      appRoot = dir;
    }
  }

  const pkg = path.join(appRoot, 'package.json');
  if (!fs.existsSync(pkg)) {
    const parentPkg = path.join(appRoot, '..', 'package.json');
    if (fs.existsSync(parentPkg)) appRoot = path.resolve(appRoot, '..');
  }

  try {
    if (fs.existsSync(path.join(appRoot, 'package.json'))) {
      process.chdir(appRoot);
    }
  } catch {
    // iisnode may deny chdir; paths still resolve from getAppRoot()
  }

  for (const key of ['SQL_HOST', 'SQL_DB_NAME', 'SQL_USER', 'SQL_PASSWORD', 'SQL_PORT']) {
    if (process.env[key]) process.env[key] = stripQuotes(String(process.env[key]));
  }

  if (process.env.IISNODE_VERSION) {
    process.env.NODE_ENV = 'production';
  }

  return envFilePath;
}
