import { defineType, defineField } from 'sanity';

// Multiple choice optie
const multipleChoiceOptieType = defineType({
  name: 'multipleChoiceOptie',
  title: 'Optie',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Optie tekst',
      type: 'string',
      description: 'De tekst van deze optie (bv. "A) Tekst aanpassen naar leesniveau")',
    }),
    defineField({
      name: 'waarde',
      title: 'Waarde',
      type: 'string',
      description: 'Korte waarde voor interne verwerking (bv. "A", "B", "C", "D")',
    }),
    defineField({
      name: 'correct',
      title: 'Correct antwoord',
      type: 'boolean',
      initialValue: false,
      description: 'Vink aan als dit het correcte antwoord is',
    }),
  ],
});

// Criteria voor beoordeling
const criteriumType = defineType({
  name: 'criterium',
  title: 'Criterium',
  type: 'object',
  fields: [
    defineField({
      name: 'naam',
      title: 'Naam',
      type: 'string',
      description: 'Naam van het criterium (bv. "Kennis AI-tools")',
    }),
    defineField({
      name: 'vraag',
      title: 'Vraag',
      type: 'text',
      rows: 3,
      description: 'De vraag die aan de gebruiker gesteld wordt',
    }),
    defineField({
      name: 'vraagType',
      title: 'Type vraag',
      type: 'string',
      options: {
        list: [
          { title: '📝 Tekst antwoord', value: 'tekst' },
          { title: '⭕ Multiple choice', value: 'multiple-choice' },
        ],
        layout: 'radio',
      },
      initialValue: 'tekst',
      description: 'Kies hoe de gebruiker moet antwoorden',
    }),
    defineField({
      name: 'opties',
      title: 'Multiple choice opties',
      type: 'array',
      of: [{ type: 'multipleChoiceOptie' }],
      description: 'De opties voor multiple choice vragen',
      hidden: ({ parent }) => parent?.vraagType !== 'multiple-choice',
    }),
    defineField({
      name: 'beschrijving',
      title: 'Beschrijving (voor AI correctie)',
      type: 'text',
      rows: 2,
      description: 'Wat wordt er geëvalueerd - dit wordt gebruikt door de AI voor correctie',
    }),
    defineField({
      name: 'verwacht',
      title: 'Verwacht resultaat',
      type: 'text',
      rows: 3,
      description: 'Wat moet er precies in het antwoord staan?',
    }),
    defineField({
      name: 'controleer',
      title: 'Controleer op',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Specifieke dingen om te controleren',
    }),
    defineField({
      name: 'gewicht',
      title: 'Gewicht (%)',
      type: 'number',
      initialValue: 25,
      description: 'Hoe zwaar dit criterium telt',
    }),
  ],
});

// Opdracht schema
export default defineType({
  name: 'opdracht',
  title: 'Opdracht',
  type: 'object',
  fields: [
    defineField({
      name: 'ingeschakeld',
      title: 'Opdracht ingeschakeld',
      type: 'boolean',
      initialValue: false,
      description: 'Zet aan om een opdracht aan deze tutorial toe te voegen',
    }),
    defineField({
      name: 'titel',
      title: 'Opdracht Titel',
      type: 'string',
      description: 'De titel van de opdracht',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'instructie',
      title: 'Instructie',
      type: 'text',
      rows: 5,
      description: 'Wat moet de gebruiker doen?',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'templateSheetUrl',
      title: 'Google Sheets Template URL',
      type: 'url',
      description: 'URL naar de Google Sheets template (kopieer-link)',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'aantalTabs',
      title: 'Aantal tabbladen',
      type: 'number',
      initialValue: 1,
      description: 'Hoeveel tabbladen moet cursist uploaden? (meestal 5: data + draaitabellen + analyse)',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'criteria',
      title: 'Beoordelingscriteria',
      type: 'array',
      of: [{ type: 'criterium' }],
      description: 'Waarop wordt de opdracht beoordeeld?',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'maxScore',
      title: 'Maximum Score',
      type: 'number',
      initialValue: 100,
      description: 'Maximum haalbare score',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'deadline',
      title: 'Deadline',
      type: 'datetime',
      description: 'Optionele deadline',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'voorbeeld',
      title: 'Voorbeeld oplossing',
      type: 'text',
      rows: 8,
      description: 'Een voorbeeld van een goede oplossing. Dit wordt getoond aan cursisten als hulp, maar ze kunnen het niet kopiëren als hun eigen antwoord.',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
    defineField({
      name: 'screenshotOnly',
      title: 'Alleen screenshot upload',
      type: 'boolean',
      initialValue: false,
      description: 'Vink aan om alleen screenshot upload te tonen (geen URL of PDF opties)',
      hidden: ({ parent }) => !parent?.ingeschakeld,
    }),
  ],
});

export { criteriumType, multipleChoiceOptieType };
