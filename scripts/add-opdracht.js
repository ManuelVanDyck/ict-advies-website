// Script om opdracht toe te voegen aan een tutorial
// Run: node scripts/add-opdracht.js

const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'mgu8mw2o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'process.env.SANITY_API_TOKEN',
  useCdn: false,
});

async function addOpdracht() {
  // 1. Find the tutorial
  const tutorials = await client.fetch(`
    *[_type == "tutorial" && title match "*Sheets data*" || title match "*data analyseren*"]{
      _id, 
      title, 
      slug
    }
  `);
  
  console.log('Gevonden tutorials:');
  console.log(JSON.stringify(tutorials, null, 2));
  
  if (tutorials.length === 0) {
    console.log('Geen tutorial gevonden. Zoek naar alle tutorials...');
    const allTutorials = await client.fetch('*[_type == "tutorial"]{_id, title, slug}');
    console.log('Alle tutorials:', JSON.stringify(allTutorials, null, 2));
    return;
  }
  
  const tutorial = tutorials[0];
  console.log('\nTutorial gevonden:', tutorial.title);
  
  // 2. Add opdracht to the tutorial
  const opdracht = {
    ingeschakeld: true,
    titel: 'Maak een draaitabel',
    instructie: `In deze opdracht ga je aan de slag met draaitabellen in Google Sheets.

Opdracht:
1. Open de template sheet (klik op de knop hieronder)
2. Maak een kopie van de sheet (Bestand > Kopie maken)
3. Maak een draaitabel van de leerlingdata
4. Groepeer de resultaten per klas
5. Bereken het gemiddelde per vak
6. Deel je sheet (rechtsboven > Delen > Iedereen met de link kan bekijken)
7. Plak de URL van jouw sheet hieronder en dien in`,
    templateSheetUrl: 'https://docs.google.com/spreadsheets/d/1H-dByTbHes-MndC2WeBTumuT7h5YKNhaqceHyYONdPY/copy',
    criteria: [
      {
        naam: 'Draaitabel correct aangemaakt',
        beschrijving: 'Is er een draaitabel gemaakt van de data?',
        gewicht: 3,
        _type: 'criterium',
        _key: 'crit1'
      },
      {
        naam: 'Groepering per klas',
        beschrijving: 'Zijn de resultaten gegroepeerd per klas?',
        gewicht: 2,
        _type: 'criterium',
        _key: 'crit2'
      },
      {
        naam: 'Gemiddelde berekend',
        beschrijving: 'Is het gemiddelde per vak berekend?',
        gewicht: 2,
        _type: 'criterium',
        _key: 'crit3'
      },
      {
        naam: 'Netheid en opmaak',
        beschrijving: 'Is de tabel netjes opgemaakt?',
        gewicht: 1,
        _type: 'criterium',
        _key: 'crit4'
      }
    ],
    maxScore: 100
  };
  
  // 3. Update the tutorial
  const result = await client
    .patch(tutorial._id)
    .set({ opdracht })
    .commit();
  
  console.log('\n✅ Opdracht toegevoegd aan:', result.title);
}

addOpdracht().catch(console.error);
