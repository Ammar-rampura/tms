import { db } from './src/lib/db.js';

async function test() {
  const stats = await db.getCollectionStats(8, 2026);
  console.log('STATS:', stats);
}

test();
