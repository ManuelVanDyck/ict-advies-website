import { defineType, defineField } from 'sanity';

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
      description: 'Naam van het criterium (bv. "Draaitabel correct")',
    }),
    defineField({
      name: 'beschrijving',
      title: 'Beschrijving',
      type: 'text',
      rows: 2,
      description: 'Wat wordt er geëvalueerd',
    }),
    defineField({
      name: 'verwacht',
      title: 'Verwacht resultaat',
      type: 'text',
      rows: 3,
      description: 'Wat moet er precies in de sheet staan? (bv. "Eerste draaitabel toont geslacht vs geslaagd met GEMIDDELDE STUDIETIJD")',
    }),
    defineField({
      name: 'controleer',
      title: 'Controleer op',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Specifieke dingen om te controleren in de data',
    }),
    defineField({
      name: 'gewicht',
      title: 'Gewicht',
      type: 'number',
      initialValue: 1,
      description: 'Hoe zwaar dit criterium telt (1-10)',
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
  ],
});

export { criteriumType };
