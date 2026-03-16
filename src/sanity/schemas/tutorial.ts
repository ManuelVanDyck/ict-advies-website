import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'tutorial',
  title: 'Tutorial',
  type: 'document',
  fields: [
    defineField({
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
      description: 'Bepaal of deze tutorial zichtbaar is op de website',
    }),
    defineField({
      name: 'isSubtutorial',
      title: 'Is sub-tutorial',
      type: 'boolean',
      initialValue: false,
      description: 'Vink aan om deze tutorial te verbergen uit de lijst. De tutorial blijft bereikbaar via de link in de hoofd-tutorial.',
    }),
    defineField({
      name: 'featured',
      title: 'Uitlichten op startpagina',
      type: 'boolean',
      initialValue: false,
      description: 'Vink aan om deze tutorial te tonen in "Populaire Handleidingen" op de startpagina.',
    }),
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    }),
    defineField({
      name: 'excerpt',
      title: 'Samenvatting',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'category',
      title: 'Categorie',
      type: 'reference',
      to: [{ type: 'category' }],
    }),
    defineField({
      name: 'publishedAt',
      title: 'Publicatiedatum',
      type: 'datetime',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Afbeelding',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'body',
      title: 'Inhoud',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'customImage',
          title: 'Afbeelding met opties',
        },
        {
          type: 'youtube',
        },
        {
          type: 'videoFile',
        },
        {
          type: 'pdfFile',
          title: 'PDF Bestand',
        },
        {
          type: 'twoColumn',
          title: 'Twee Kolommen',
        },
      ],
    }),
    defineField({
      name: 'opdracht',
      title: 'Opdracht',
      type: 'opdracht',
      description: 'Optionele opdracht bij deze tutorial',
    }),
  ],
});
