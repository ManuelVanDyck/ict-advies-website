require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = 'mgu8mw2o';
const DATASET = 'production';
const API_TOKEN = process.env.SANITY_API_TOKEN;

// Content data
const categories = [
  {
    _type: 'category',
    title: 'Clevertouch',
    slug: { _type: 'slug', current: 'clevertouch' },
    description: 'Handleidingen voor het Clevertouch Impact Plus digibord'
  },
  {
    _type: 'category',
    title: 'Google Workspace',
    slug: { _type: 'slug', current: 'google-workspace' },
    description: 'Handleidingen voor Google tools in het onderwijs'
  },
  {
    _type: 'category',
    title: 'Tips & Tricks',
    slug: { _type: 'slug', current: 'tips-tricks' },
    description: 'Handige tips om efficiënter te werken'
  }
];

const tutorials = [
  {
    _type: 'tutorial',
    title: 'Clevertouch Basisgebruik',
    slug: { _type: 'slug', current: 'clevertouch-basisgebruik' },
    excerpt: 'Leer de basisfuncties van het Clevertouch Impact Plus bord',
    category: { _type: 'reference', _ref: '' }, // Will be filled
    publishedAt: new Date().toISOString(),
    body: [
      {
        _type: 'block',
        _key: 'block1',
        children: [{ _type: 'span', marks: [], text: 'Het Clevertouch bord start automatisch op wanneer je de stroom inschakelt. Dit duurt ongeveer 30-60 seconden.', _key: 'span1' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'block2',
        children: [{ _type: 'span', marks: ['strong'], text: 'Stappen:', _key: 'span2' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'block3',
        children: [{ _type: 'span', marks: [], text: '1. Zorg dat het bord stroom heeft (groen lampje onderaan)', _key: 'span3' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'block4',
        children: [{ _type: 'span', marks: [], text: '2. Druk op de fysieke aan/uit knop of raak het scherm aan', _key: 'span4' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'block5',
        children: [{ _type: 'span', marks: [], text: '3. Wacht tot het Clevertouch logo verschijnt', _key: 'span5' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'block6',
        children: [{ _type: 'span', marks: ['strong'], text: 'Navigeren op het startscherm', _key: 'span6' }],
        markDefs: [],
        style: 'h2'
      },
      {
        _type: 'block',
        _key: 'block7',
        children: [{ _type: 'span', marks: [], text: 'Het startscherm toont verschillende opties:', _key: 'span7' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'block8',
        children: [
          { _type: 'span', marks: ['strong'], text: 'CleverApps', _key: 'span8a' },
          { _type: 'span', marks: [], text: ' - Voorgeïnstalleerde educatieve apps', _key: 'span8b' }
        ],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'block9',
        children: [
          { _type: 'span', marks: ['strong'], text: 'Whiteboard', _key: 'span9a' },
          { _type: 'span', marks: [], text: ' - Digitaal whiteboard voor notities', _key: 'span9b' }
        ],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'block10',
        children: [
          { _type: 'span', marks: ['strong'], text: 'Browser', _key: 'span10a' },
          { _type: 'span', marks: [], text: ' - Internet surfen', _key: 'span10b' }
        ],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'block11',
        children: [{ _type: 'span', marks: ['strong'], text: 'Tip:', _key: 'span11' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'block12',
        children: [{ _type: 'span', marks: [], text: 'Gebruik de zijbalk om snel te wisselen tussen apps zonder terug te gaan naar het startscherm.', _key: 'span12' }],
        markDefs: [],
        style: 'normal'
      }
    ]
  },
  {
    _type: 'tutorial',
    title: 'Scherm Delen',
    slug: { _type: 'slug', current: 'scherm-delen' },
    excerpt: 'Je scherm delen met leerlingen via Clevershare',
    category: { _type: 'reference', _ref: '' },
    publishedAt: new Date().toISOString(),
    body: [
      {
        _type: 'block',
        _key: 'sdblock1',
        children: [{ _type: 'span', marks: [], text: 'Met Clevershare kan je je scherm delen met leerlingen op hun Chromebooks.', _key: 'sdspan1' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'sdblock2',
        children: [{ _type: 'span', marks: ['strong'], text: 'Hoe te gebruiken:', _key: 'sdspan2' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'sdblock3',
        children: [{ _type: 'span', marks: [], text: '1. Open Clevershare op het bord', _key: 'sdspan3' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'sdblock4',
        children: [{ _type: 'span', marks: [], text: '2. Deel de code met je leerlingen', _key: 'sdspan4' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'sdblock5',
        children: [{ _type: 'span', marks: [], text: '3. Leerlingen gaan naar de URL en voeren de code in', _key: 'sdspan5' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      }
    ]
  },
  {
    _type: 'tutorial',
    title: 'Handige Shortcuts',
    slug: { _type: 'slug', current: 'handige-shortcuts' },
    excerpt: 'Handige keyboard shortcuts om sneller te werken',
    category: { _type: 'reference', _ref: '' },
    publishedAt: new Date().toISOString(),
    body: [
      {
        _type: 'block',
        _key: 'hsblock1',
        children: [{ _type: 'span', marks: [], text: 'Deze shortcuts besparen je tijd bij dagelijkse taken:', _key: 'hsspan1' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'hsblock2',
        children: [
          { _type: 'span', marks: ['code'], text: 'Ctrl + Shift + T', _key: 'hsspan2a' },
          { _type: 'span', marks: [], text: ' - Gesloten tab heropenen', _key: 'hsspan2b' }
        ],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'hsblock3',
        children: [
          { _type: 'span', marks: ['code'], text: 'Ctrl + Shift + S', _key: 'hsspan3a' },
          { _type: 'span', marks: [], text: ' - Schermafbeelding maken', _key: 'hsspan3b' }
        ],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'hsblock4',
        children: [
          { _type: 'span', marks: ['code'], text: 'Windows + .', _key: 'hsspan4a' },
          { _type: 'span', marks: [], text: ' - Emoji menu openen', _key: 'hsspan4b' }
        ],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      }
    ]
  },
  {
    _type: 'tutorial',
    title: 'Google Classroom Basis',
    slug: { _type: 'slug', current: 'google-classroom-basis' },
    excerpt: 'Klassen, opdrachten en cijfers beheren in Google Classroom',
    category: { _type: 'reference', _ref: '' },
    publishedAt: new Date().toISOString(),
    body: [
      {
        _type: 'block',
        _key: 'gcblock1',
        children: [{ _type: 'span', marks: [], text: 'Google Classroom is de centrale hub voor je lessen.', _key: 'gcspan1' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'gcblock2',
        children: [{ _type: 'span', marks: ['strong'], text: 'Aan de slag:', _key: 'gcspan2' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'gcblock3',
        children: [{ _type: 'span', marks: [], text: '1. Maak een nieuwe klas aan', _key: 'gcspan3' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'gcblock4',
        children: [{ _type: 'span', marks: [], text: '2. Nodig leerlingen uit via de klasscode', _key: 'gcspan4' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      },
      {
        _type: 'block',
        _key: 'gcblock5',
        children: [{ _type: 'span', marks: [], text: '3. Plaats opdrachten en materialen', _key: 'gcspan5' }],
        markDefs: [],
        style: 'normal',
        listItem: 'number',
        level: 1
      }
    ]
  },
  {
    _type: 'tutorial',
    title: 'Google Drive Organiseren',
    slug: { _type: 'slug', current: 'google-drive-organiseren' },
    excerpt: 'Bestanden opslaan, organiseren en delen',
    category: { _type: 'reference', _ref: '' },
    publishedAt: new Date().toISOString(),
    body: [
      {
        _type: 'block',
        _key: 'gdblock1',
        children: [{ _type: 'span', marks: [], text: 'Tips voor een georganiseerde Google Drive:', _key: 'gdspan1' }],
        markDefs: [],
        style: 'normal'
      },
      {
        _type: 'block',
        _key: 'gdblock2',
        children: [{ _type: 'span', marks: [], text: '• Gebruik een vaste mappenstructuur per vak', _key: 'gdspan2' }],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'gdblock3',
        children: [{ _type: 'span', marks: [], text: '• Kleurcodering voor snelle herkenning', _key: 'gdspan3' }],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      },
      {
        _type: 'block',
        _key: 'gdblock4',
        children: [{ _type: 'span', marks: [], text: '• Star belangrijke bestanden', _key: 'gdspan4' }],
        markDefs: [],
        style: 'normal',
        listItem: 'bullet',
        level: 1
      }
    ]
  }
];

async function createDocument(doc) {
  const response = await fetch(
    `https://${PROJECT_ID}.api.sanity.io/v1/data/mutate/${DATASET}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        mutations: [{
          createOrReplace: doc
        }]
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${error}`);
  }
  
  return response.json();
}

async function migrate() {
  console.log('🚀 Starting migration to Sanity...\n');
  
  // Step 1: Create categories
  console.log('📁 Creating categories...');
  const categoryIds = {};
  
  for (const cat of categories) {
    try {
      const result = await createDocument(cat);
      categoryIds[cat.slug.current] = result.results[0].id;
      console.log(`   ✅ ${cat.title} (${result.results[0].id})`);
    } catch (err) {
      console.error(`   ❌ Failed to create ${cat.title}:`, err.message);
    }
  }
  
  // Step 2: Create tutorials with category references
  console.log('\n📄 Creating tutorials...');
  
  // Map tutorials to categories
  const categoryMap = {
    'clevertouch-basisgebruik': 'clevertouch',
    'scherm-delen': 'clevertouch',
    'handige-shortcuts': 'tips-tricks',
    'google-classroom-basis': 'google-workspace',
    'google-drive-organiseren': 'google-workspace'
  };
  
  for (const tutorial of tutorials) {
    const catSlug = categoryMap[tutorial.slug.current];
    tutorial.category._ref = categoryIds[catSlug];
    
    try {
      const result = await createDocument(tutorial);
      console.log(`   ✅ ${tutorial.title}`);
    } catch (err) {
      console.error(`   ❌ Failed to create ${tutorial.title}:`, err.message);
    }
  }
  
  console.log('\n✅ Migration complete!');
  console.log('📝 Open Sanity Studio to see your content');
}

migrate().catch(console.error);
