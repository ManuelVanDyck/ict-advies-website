import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'accordionSection',
  title: 'Openklapbare Sectie',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      description: 'De titel die altijd zichtbaar is',
    }),
    defineField({
      name: 'defaultOpen',
      title: 'Standaard opengeklapt',
      type: 'boolean',
      initialValue: false,
      description: 'Vink aan om deze sectie standaard open te klappen',
    }),
    defineField({
      name: 'content',
      title: 'Inhoud',
      type: 'array',
      of: [
        { type: 'block' },
        { type: 'customImage', title: 'Afbeelding met opties' },
        { type: 'youtube' },
        { type: 'videoFile' },
        { type: 'pdfFile', title: 'PDF Bestand' },
        { type: 'twoColumn', title: 'Twee Kolommen' },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title: title || 'Openklapbare sectie',
        subtitle: 'Klik om inhoud te zien',
      };
    },
  },
});
