import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'customImage',
  title: 'Afbeelding met opties',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Afbeelding',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'alt',
      title: 'Alt tekst',
      type: 'string',
      description: 'Beschrijving voor screen readers en SEO',
    }),
    defineField({
      name: 'caption',
      title: 'Onderschrift',
      type: 'string',
      description: 'Optioneel onderschrift onder de afbeelding',
    }),
    defineField({
      name: 'size',
      title: 'Grootte',
      type: 'string',
      options: {
        list: [
          { title: '🟢 Klein (max 400px)', value: 'small' },
          { title: '🟡 Medium (max 600px)', value: 'medium' },
          { title: '🟠 Groot (max 800px)', value: 'large' },
          { title: '🔴 Volledige breedte', value: 'full' },
          { title: '📐 Passend - breedte (geen bijsnijden)', value: 'fit-width' },
          { title: '📏 Passend - hoogte (lange afbeeldingen)', value: 'fit-height' },
        ],
        layout: 'radio',
      },
      initialValue: 'large',
      description: 'Kies hoe de afbeelding wordt weergegeven',
    }),
  ],
  preview: {
    select: {
      title: 'alt',
      media: 'image',
    },
  },
});
