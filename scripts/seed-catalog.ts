import dotenv from 'dotenv';
import { seedCatalogIfEmpty, getSqlTableCounts } from '../src/db/catalog.ts';

dotenv.config({ path: '.env.local', override: true });
dotenv.config();

await seedCatalogIfEmpty();
const counts = await getSqlTableCounts();
console.log(JSON.stringify(counts));
