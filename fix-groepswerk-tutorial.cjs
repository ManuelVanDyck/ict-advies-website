const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'mgu8mw2o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function fixTutorial() {
  try {
    // Oude tutorial verwijderen
    const existing = await client.fetch('*[_type == "tutorial" && slug.current == "groepswerk-bouwer"]._id');
    if (existing.length > 0) {
      console.log('Oude tutorial verwijderen...');
      await client.delete(existing[0]);
    }
    
    const tutorial = {
      _type: 'tutorial',
      title: 'Groepswerk-bouwer',
      slug: { _type: 'slug', current: 'groepswerk-bouwer' },
      excerpt: 'Ontwerp snel een doordacht groepswerk op basis van je eigen cursusmateriaal.',
      category: { _type: 'reference', _ref: '36b14c4e-2acd-4bf8-a322-98bdef24cfe8' },
      status: 'published',
      featured: true,
      body: [
        {
          _key: 'intro',
          _type: 'block',
          style: 'normal',
          markDefs: [
            { _key: 'app-link', _type: 'link', href: 'https://ai.studio/apps/72cab915-c893-46d9-af0b-d8519b2326cf?fullscreenApplet=true' }
          ],
          children: [
            { _type: 'span', marks: ['app-link'], text: 'Groepswerk-bouwer' }
          ]
        },
        {
          _key: 'intro2',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'Deze app helpt leerkrachten om snel en doordacht een groepswerk te ontwerpen op basis van hun eigen cursusmateriaal.' }]
        },
        {
          _key: 'list-intro',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'Op basis van een geüploade PDF:' }]
        },
        {
          _key: 'list1',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: '• analyseert de app automatisch de leerstof' }]
        },
        {
          _key: 'list2',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: '• detecteert kernbegrippen, structuren en leeronderdelen' }]
        },
        {
          _key: 'list3',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: '• kiest een geschikte coöperatieve werkvorm' }]
        },
        {
          _key: 'list4',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: '• koppelt complementaire rollen voor groepjes van 4 leerlingen' }]
        },
        {
          _key: 'list5',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: '• genereert een kant-en-klare groepsopdracht met stappenplan' }]
        },
        {
          _key: 'h1',
          _type: 'block',
          style: 'h2',
          markDefs: [],
          children: [{ _type: 'span', text: 'Hoe gebruik je de app?' }]
        },
        {
          _key: 'step1-title',
          _type: 'block',
          style: 'h3',
          markDefs: [],
          children: [{ _type: 'span', text: '1. Vul de cursusgegevens in' }]
        },
        {
          _key: 'step1a',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            { _type: 'span', marks: ['strong'], text: 'Vak / Domein' },
            { _type: 'span', text: ' (bv. Wiskunde, Geschiedenis, Chemie)' }
          ]
        },
        {
          _key: 'step1b',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            { _type: 'span', marks: ['strong'], text: 'Onderwijsniveau' },
            { _type: 'span', text: ' (bv. 3e graad ASO)' }
          ]
        },
        {
          _key: 'step1c',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            { _type: 'span', marks: ['strong'], text: 'Geschatte lestijd' },
            { _type: 'span', text: ' (bv. 50 minuten of 2 lesuren)' }
          ]
        },
        {
          _key: 'step2-title',
          _type: 'block',
          style: 'h3',
          markDefs: [],
          children: [{ _type: 'span', text: '2. Upload je cursusmateriaal' }]
        },
        {
          _key: 'step2a',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'Sleep de PDF van je cursus in het uploadvak.' }]
        },
        {
          _key: 'step2b',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'Optioneel: upload extra invulnota\'s of werkbladen.' }]
        },
        {
          _key: 'step2c',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            { _type: 'span', marks: ['strong'], text: 'Let op: ' },
            { _type: 'span', text: 'De cursus-PDF is verplicht. Maximaal 10 MB per bestand.' }
          ]
        },
        {
          _key: 'step3-title',
          _type: 'block',
          style: 'h3',
          markDefs: [],
          children: [{ _type: 'span', text: '3. Genereer het groepswerk' }]
        },
        {
          _key: 'step3a',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'Klik op "Genereer Groepswerk".' }]
        },
        {
          _key: 'step3b',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'De app analyseert de leerstof, bepaalt een passende werkvorm, verdeelt de taken in 4 duidelijke rollen, stelt een concreet stappenplan op en formuleert het verwachte eindproduct.' }]
        },
        {
          _key: 'h2',
          _type: 'block',
          style: 'h2',
          markDefs: [],
          children: [{ _type: 'span', text: 'Wat krijgen je leerlingen?' }]
        },
        {
          _key: 'result-intro',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', text: 'Een duidelijke opdracht met:' }]
        },
        {
          _key: 'r1', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '🎯 Doel van het groepswerk' }]
        },
        {
          _key: 'r2', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '👥 Rollenverdeling (4 complementaire rollen)' }]
        },
        {
          _key: 'r3', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '📌 Concrete taken per rol' }]
        },
        {
          _key: 'r4', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '🪜 Stap-voor-stap werkwijze' }]
        },
        {
          _key: 'r5', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '📦 Verwacht eindproduct' }]
        },
        {
          _key: 'r6', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '📋 Eventuele evaluatiecriteria' }]
        },
        {
          _key: 'focus',
          _type: 'block',
          style: 'normal',
          markDefs: [],
          children: [
            { _type: 'span', marks: ['strong'], text: 'De focus ligt op actieve verwerking: ' },
            { _type: 'span', text: 'begrijpen, structureren, toepassen en uitleggen — niet op kopiëren of samenvatten.' }
          ]
        },
        {
          _key: 'h3',
          _type: 'block',
          style: 'h2',
          markDefs: [],
          children: [{ _type: 'span', text: 'Didactische meerwaarde' }]
        },
        {
          _key: 'm1', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '✅ Stimuleert eigenaarschap bij leerlingen' }]
        },
        {
          _key: 'm2', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '✅ Verhoogt betrokkenheid' }]
        },
        {
          _key: 'm3', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '✅ Structureert samenwerking' }]
        },
        {
          _key: 'm4', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '✅ Zorgt voor cognitieve spreiding via rollen' }]
        },
        {
          _key: 'm5', _type: 'block', style: 'normal', markDefs: [],
          children: [{ _type: 'span', text: '✅ Bespaart leerkrachten voorbereidingstijd' }]
        }
      ]
    };
    
    const result = await client.create(tutorial);
    console.log('✅ Tutorial bijgewerkt! ID:', result._id);
    console.log('   Link toegevoegd bovenaan');
    console.log('   Bekijk op: http://localhost:3000/tutorials/' + result.slug.current);
  } catch (error) {
    console.error('❌ Fout:', error.message);
  }
}

fixTutorial();
