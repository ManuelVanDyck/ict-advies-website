import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'twoColumn',
  title: 'Twee Kolommen',
  type: 'object',
  icon: () => '⬜',
  fields: [
    defineField({
      name: 'layout',
      title: 'Indeling',
      type: 'string',
      options: {
        list: [
          { title: 'Tekst links, Afbeelding rechts', value: 'text-image' },
          { title: 'Afbeelding links, Tekst rechts', value: 'image-text' },
        ],
        layout: 'radio',
      },
      initialValue: 'text-image',
    }),
    defineField({
      name: 'textColumn',
      title: 'Tekst Kolom',
      type: 'array',
      of: [
        { type: 'block' },
      ],
    }),
    defineField({
      name: 'imageColumn',
      title: 'Afbeelding Kolom',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'imageCaption',
      title: 'Afbeelding Onderschrift',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      layout: 'layout',
      text: 'textColumn',
      image: 'imageColumn',
    },
    prepare({ layout, text, image }) {
      const firstBlock = text?.[0]?.children?.[0]?.text || 'Geen tekst';
      return {
        title: `Twee Kolommen: ${firstBlock.slice(0, 30)}...`,
        subtitle: layout === 'text-image' ? 'Tekst | Afbeelding' : 'Afbeelding | Tekst',
        media: image,
      };
    },
  },
});
