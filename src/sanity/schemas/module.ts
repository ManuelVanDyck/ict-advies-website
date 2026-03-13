// Module Schema - Een herbruikbare leermodule
export default {
  name: 'module',
  title: 'Module',
  type: 'document',
  fields: [
    {
      name: 'status',
      title: 'Publicatiestatus',
      type: 'string',
      options: {
        list: [
          { title: '📝 Draft - In bewerking', value: 'draft' },
          { title: '👀 Review - Klaar voor controle', value: 'review' },
          { title: '✅ Published - Zichtbaar op website', value: 'published' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      description: 'Bepaal of deze module zichtbaar is op de website',
    },
    {
      name: 'titel',
      title: 'Titel',
      type: 'string',
      description: 'Naam van de module (bv. "AI begrijpen")',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'titel',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'digcompeduDomein',
      title: 'DigCompEdu Domein',
      type: 'string',
      options: {
        list: [
          { title: '1. Professionele Engage', value: 'domein1' },
          { title: '2. Digitale Bronnen', value: 'domein2' },
          { title: '3. Lesgeven & Leren', value: 'domein3' },
          { title: '4. Beoordeling', value: 'domein4' },
          { title: '5. Lerenden Empoweren', value: 'domein5' },
          { title: '6. Lerenden Faciliteren', value: 'domein6' },
        ],
      },
      description: 'Welk DigCompEdu domein wordt behandeld?',
    },
    {
      name: 'aiStap',
      title: 'Verantwoorde AI Stap',
      type: 'number',
      options: {
        list: [
          { title: 'Stap 1: Doel bepalen', value: 1 },
          { title: 'Stap 2: Alternatieven wegen', value: 2 },
          { title: 'Stap 3: Waarden toepassen', value: 3 },
          { title: 'Stap 4: Samenwerken', value: 4 },
          { title: 'Stap 5: Verantwoordelijkheid', value: 5 },
          { title: 'Stap 6: Evalueren', value: 6 },
        ],
      },
      description: 'Welke stap uit de Visietekst wordt behandeld?',
    },
    {
      name: 'duur',
      title: 'Duur (minuten)',
      type: 'number',
      description: 'Geschatte tijd om de module te voltooien',
      validation: (Rule) => Rule.required().min(5),
    },
    {
      name: 'beschrijving',
      title: 'Korte Beschrijving',
      type: 'text',
      rows: 2,
      description: 'Wat leert de gebruiker in deze module?',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'inhoud',
      title: 'Module Inhoud',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'De volledige inhoud van de module (tekst, uitleg, voorbeelden)',
    },
    {
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube of Vimeo video die bij deze module hoort',
    },
    {
      name: 'praktijkopdracht',
      title: 'Praktijkopdracht',
      type: 'text',
      rows: 3,
      description: 'Opdracht die de gebruiker moet uitvoeren na de theorie',
    },
    {
      name: 'tools',
      title: 'AI Tools',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Welke AI tools komen aan bod? (bv. ChatGPT, NotebookLM)',
    },
    {
      name: 'tutorials',
      title: 'Gerelateerde Tutorials',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'tutorial' }] }],
      description: 'Tutorials die de gebruiker kan raadplegen',
    },
    {
      name: 'quiz',
      title: 'Quiz Vragen',
      type: 'array',
      of: [{ type: 'quizVraag' }],
      description: 'Optionele quiz om kennis te toetsen',
    },
  ],
  preview: {
    select: {
      title: 'titel',
      subtitle: 'duur',
    },
    prepare({ title, duur }) {
      return {
        title,
        subtitle: `${duur} min`,
      }
    },
  },
}
