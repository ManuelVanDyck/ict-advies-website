const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'mgu8mw2o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false
});

const categoryId = 'sEXYKEM0YtrucL1vLCOH5s'; // Google - Online trainingen category

const trainings = [
  {
    title: "Makkelijk video's maken voor het onderwijs met Google Vids",
    slug: "google-vids-training",
    externalUrl: "https://edu.exceedlms.com/student/activity/1721248-makkelijk-video-s-maken-voor-het-onderwijs-met-google-vids",
    description: "Leer eenvoudig educatieve video's maken met Google Vids"
  },
  {
    title: "Basisprincipes van Google Workspace for Education Fundamentals",
    slug: "google-workspace-basis",
    externalUrl: "https://edu.exceedlms.com/student/activity/1720101-basisprincipes-van-google-workspace-for-education-fundamentals",
    description: "De fundamenten van Google Workspace voor in de klas"
  },
  {
    title: "Gevorderd gebruik van Google Workspace for Education Fundamentals",
    slug: "google-workspace-gevorderd",
    externalUrl: "https://edu.exceedlms.com/student/activity/1720586-gevorderd-gebruik-van-google-workspace-for-education-fundamentals",
    description: "Duik dieper in de mogelijkheden van Google Workspace"
  },
  {
    title: "Premium functies voor leerlingen en docenten",
    slug: "google-premium-functies",
    externalUrl: "https://edu.exceedlms.com/student/activity/1722046-premium-functies-voor-leerlingen-en-docenten",
    description: "Ontdek de extra mogelijkheden van de premium versie"
  },
  {
    title: "Cursus 'Digitaal burgerschap en veiligheid'",
    slug: "digitaal-burgerschap-veiligheid",
    externalUrl: "https://edu.exceedlms.com/student/activity/1719755-cursus-digitaal-burgerschap-en-veiligheid",
    description: "Leer over digitale veiligheid en burgerschap"
  },
  {
    title: "Onderwijs op afstand voor docenten",
    slug: "onderwijs-op-afstand",
    externalUrl: "https://edu.exceedlms.com/student/activity/1719121-onderwijs-op-afstand-voor-docenten",
    description: "Effectief lesgeven op afstand met Google tools"
  },
  {
    title: "Lesprogramma voor Certified Coaches",
    slug: "certified-coaches",
    externalUrl: "https://edu.exceedlms.com/student/activity/1718795-lesprogramma-voor-certified-coaches",
    description: "Word een gecertificeerde Google Coach"
  },
  {
    title: "Aan de slag met AI van Google in het basis- en middelbaar onderwijs",
    slug: "google-ai-onderwijs",
    externalUrl: "https://edu.exceedlms.com/student/activity/1781402-aan-de-slag-met-ai-van-google-in-het-basis-en-middelbaar-onderwijs",
    description: "Ontdek AI-mogelijkheden voor in de klas"
  }
];

async function createTraining(training) {
  const doc = {
    _type: 'tutorial',
    title: training.title,
    slug: { _type: 'slug', current: training.slug },
    excerpt: training.description,
    status: 'published',
    isSubtutorial: true,
    category: { _type: 'reference', _ref: categoryId },
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [
          {
            _type: 'span',
            marks: [],
            text: 'Google biedt kosteloze online trainingen aan voor docenten. Deze trainingen helpen je om je digitale vaardigheden te verbeteren en het maximale uit Google Workspace for Education te halen.'
          }
        ],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'space1',
        style: 'normal',
        children: [{ _type: 'span', marks: [], text: '' }],
        markDefs: []
      },
      {
        _type: 'block',
        _key: 'cta',
        style: 'normal',
        children: [
          {
            _type: 'span',
            marks: [],
            text: '👉 '
          },
          {
            _type: 'span',
            marks: ['link'],
            text: 'Start de training'
          }
        ],
        markDefs: [
          {
            _type: 'link',
            _key: 'link',
            href: training.externalUrl
          }
        ]
      }
    ]
  };
  
  try {
    const result = await client.create(doc);
    console.log(`✅ Created: ${training.title} (${result._id})`);
  } catch (err) {
    console.error(`❌ Error creating ${training.title}:`, err.message);
  }
}

async function main() {
  console.log('Creating 8 Google training subtutorials...\n');
  for (const training of trainings) {
    await createTraining(training);
  }
  console.log('\nDone!');
}

main();
