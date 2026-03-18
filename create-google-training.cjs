const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'mgu8mw2o',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'skJA03pTLY6pf8wv6lfPfDBqZVAwEYY82FLUU2QlUDL6Syd7nQAdMtqgSf9kvC5YYMuBR4dLiDUSt6i7TffO212ihzAErqw2ryaPCdM3CO3uiEe8QsCDfvGoA4oDgAqir88YrGuKCLKWYEUZsG0AGXDwE3pAurx6ON8bhkBny5pA2bP0DslE',
  useCdn: false,
});

async function createCategory() {
  const existing = await client.fetch(`*[_type == "category" && slug.current == "google-online-trainingen"][0]`);
  
  if (existing) {
    console.log('Category already exists:', existing._id);
    return existing;
  }

  const category = await client.create({
    _type: 'category',
    title: 'Google - Online trainingen',
    slug: { _type: 'slug', current: 'google-online-trainingen' },
    description: 'Kosteloze online trainingen van Google voor Education.',
  });
  
  console.log('Created category:', category._id);
  return category;
}

async function createTutorial(categoryId) {
  const existing = await client.fetch(`*[_type == "tutorial" && slug.current == "google-online-trainingen"][0]`);
  
  if (existing) {
    console.log('Tutorial already exists:', existing._id);
    return existing;
  }

  const tutorial = await client.create({
    _type: 'tutorial',
    title: 'Google - Online trainingen',
    slug: { _type: 'slug', current: 'google-online-trainingen' },
    status: 'published',
    isSubtutorial: false,
    featured: false,
    excerpt: 'Overzicht van alle kosteloze online trainingen van Google voor docenten.',
    category: { _type: 'reference', _ref: categoryId },
    publishedAt: new Date().toISOString(),
    body: [
      {
        _type: 'block',
        _key: 'intro',
        style: 'normal',
        children: [{ _type: 'span', text: 'Google biedt kosteloze online trainingen aan voor docenten. Deze trainingen helpen je om je digitale vaardigheden te verbeteren en het maximale uit Google Workspace for Education te halen.', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 'h1',
        style: 'h2',
        children: [{ _type: 'span', text: 'Beschikbare trainingen', marks: [] }],
        markDefs: [],
      },
      {
        _type: 'block',
        _key: 't1',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Makkelijk video\'s maken voor het onderwijs met Google Vids (45 min) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link1'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link1', href: 'https://edu.exceedlms.com/student/activity/1721248-makkelijk-video-s-maken-voor-het-onderwijs-met-google-vids' }],
      },
      {
        _type: 'block',
        _key: 't2',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Basisprincipes van Google Workspace for Education Fundamentals (2,3 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link2'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link2', href: 'https://edu.exceedlms.com/student/activity/1720101-basisprincipes-van-google-workspace-for-education-fundamentals' }],
      },
      {
        _type: 'block',
        _key: 't3',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Gevorderd gebruik van Google Workspace for Education Fundamentals (2,2 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link3'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link3', href: 'https://edu.exceedlms.com/student/activity/1720586-gevorderd-gebruik-van-google-workspace-for-education-fundamentals' }],
      },
      {
        _type: 'block',
        _key: 't4',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Premium functies voor leerlingen en docenten (1,4 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link4'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link4', href: 'https://edu.exceedlms.com/student/activity/1722046-premium-functies-voor-leerlingen-en-docenten' }],
      },
      {
        _type: 'block',
        _key: 't5',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Cursus \'Digitaal burgerschap en veiligheid\' (2,2 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link5'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link5', href: 'https://edu.exceedlms.com/student/activity/1719755-cursus-digitaal-burgerschap-en-veiligheid' }],
      },
      {
        _type: 'block',
        _key: 't6',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Onderwijs op afstand voor docenten (2,6 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link6'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link6', href: 'https://edu.exceedlms.com/student/activity/1719121-onderwijs-op-afstand-voor-docenten' }],
      },
      {
        _type: 'block',
        _key: 't7',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Lesprogramma voor Certified Coaches (10 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link7'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link7', href: 'https://edu.exceedlms.com/student/activity/1718795-lesprogramma-voor-certified-coaches' }],
      },
      {
        _type: 'block',
        _key: 't8',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Aan de slag met AI van Google in het basis- en middelbaar onderwijs (2 uur) - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link8'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link8', href: 'https://edu.exceedlms.com/student/activity/1781402-aan-de-slag-met-ai-van-google-in-het-basis-en-middelbaar-onderwijs' }],
      },
      {
        _type: 'block',
        _key: 't9',
        style: 'normal',
        children: [
          { _type: 'span', text: '• Aan de slag met AI van Google in het hoger onderwijs - ', marks: [] },
          { _type: 'span', text: 'Start training', marks: ['link9'] },
        ],
        markDefs: [{ _type: 'link', _key: 'link9', href: 'https://edu.exceedlms.com/student/activity/1782781-aan-de-slag-met-ai-van-google-in-het-hoger-onderwijs' }],
      },
    ],
  });
  
  console.log('Created tutorial:', tutorial._id);
  return tutorial;
}

async function main() {
  const category = await createCategory();
  await createTutorial(category._id);
  console.log('Done!');
}

main().catch(console.error);
