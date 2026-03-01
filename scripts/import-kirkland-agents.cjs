/**
 * Import Kirkland Agents from CSV into Supabase.
 * 
 * Usage: node scripts/import-kirkland-agents.cjs
 */
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ibsisfnjxeowvdtvgzff.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlic2lzZm5qeGVvd3ZkdHZnemZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDU1OTU3OCwiZXhwIjoyMDgwMTM1NTc4fQ.j6SSw41LwGzXGAW0U_mQh6hGGnFekOE7GV__xevJY2M';

/**
 * Parse a CSV line handling quoted fields with commas.
 */
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

/**
 * Parse categories string like "Cat1, Cat2, Cat3" into array.
 */
function parseCategories(catStr) {
  if (!catStr) return [];
  return catStr.split(',').map(c => c.trim()).filter(Boolean);
}

async function main() {
  // Read CSV
  const csvPath = path.join(require('os').homedir(), 'Downloads', 'UNIQUE_ALL_AGENTS (1).csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    process.exit(1);
  }

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  
  // Skip header
  const header = parseCSVLine(lines[0]);
  console.log('Columns:', header.join(', '));
  console.log('Total rows:', lines.length - 1);

  // Parse all rows
  const agents = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 17) continue;

    const agent = {
      id: fields[0] || `agent-${i}`,
      name: fields[1] || 'Unknown',
      alias: fields[2] || null,
      phone: fields[3] || null,
      localized_phone: fields[4] || null,
      address1: fields[5] || null,
      address2: fields[6] || null,
      city: fields[7] || null,
      state: fields[8] || null,
      zip: fields[9] || null,
      country: fields[10] || 'US',
      latitude: fields[11] ? parseFloat(fields[11]) : null,
      longitude: fields[12] ? parseFloat(fields[12]) : null,
      avg_rating: fields[13] ? parseFloat(fields[13]) : null,
      review_count: fields[14] ? parseInt(fields[14], 10) : 0,
      categories: parseCategories(fields[15]),
      is_closed: fields[16] === 'True',
      photo_url: fields[17] || null,
    };

    // Skip if no valid id
    if (!agent.id) continue;
    agents.push(agent);
  }

  console.log(`Parsed ${agents.length} agents`);

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < agents.length; i += BATCH_SIZE) {
    const batch = agents.slice(i, i + BATCH_SIZE);

    // Format categories as Postgres array literal
    const rows = batch.map(a => ({
      ...a,
      categories: a.categories, // Supabase JS handles arrays
    }));

    const res = await fetch(`${SUPABASE_URL}/rest/v1/kirkland_agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify(rows),
    });

    if (res.ok) {
      inserted += batch.length;
      process.stdout.write(`\rInserted: ${inserted}/${agents.length}`);
    } else {
      const err = await res.text();
      console.error(`\nBatch error at ${i}:`, err);
      errors++;
    }
  }

  console.log(`\n\nDone! Inserted: ${inserted}, Errors: ${errors}`);
}

main().catch(console.error);
