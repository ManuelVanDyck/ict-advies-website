// Fix title capitalization in Sanity
// Run: node scripts/fix-titles.js

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'mgu8mw2o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Title corrections (old → new)
const titleCorrections = {
  // Modules
  'Module 1: Visievorming – De Mens aan het Roer': 'Module 1: Visievorming – De mens aan het roer',
  'Module 2: Betrouwbaarheid Toetsen': 'Module 2: Betrouwbaarheid toetsen',
  'Module 3: Het Didactische Proces (6 Stappen)': 'Module 3: Het didactische proces (6 stappen)',
  'Module 4: Professionalisering & Netwerk': 'Module 4: Professionalisering en netwerk',
  
  // Opdrachten
  'De Verantwoordingsmatrix': 'De verantwoordingsmatrix',
  'De Betrouwbaarheidsscan': 'De betrouwbaarheidsscan',
  'Het Participatieplan': 'Het participatieplan',
  'Het Evaluatieprotocol': 'Het evaluatieprotocol',
};

async function fixTitles() {
  console.log('🔍 Fetching tutorials from Sanity...\n');
  
  const tutorials = await client.fetch('*[_type == "tutorial"]{_id, title, slug}');
  
  console.log(`Found ${tutorials.length} tutorials\n`);
  
  for (const tutorial of tutorials) {
    const oldTitle = tutorial.title;
    const newTitle = titleCorrections[oldTitle];
    
    if (newTitle) {
      console.log(`✏️  Updating: "${oldTitle}"`);
      console.log(`   → "${newTitle}"\n`);
      
      await client
        .patch(tutorial._id)
        .set({ title: newTitle })
        .commit();
    } else if (oldTitle !== oldTitle.charAt(0).toUpperCase() + oldTitle.slice(1).toLowerCase()) {
      // Check if title needs general capitalization fix
      console.log(`⚠️  No correction found for: "${oldTitle}"`);
    }
  }
  
  console.log('\n✅ Done!');
}

fixTitles().catch(console.error);
