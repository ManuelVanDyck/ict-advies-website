import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'leerpad',
  title: 'Leerpad',
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
      description: 'Bepaal of dit leerpad zichtbaar is op de website',
    }),
    defineField({
      name: 'titel',
      title: 'Titel',
      type: 'string',
      description: 'Naam van het leerpad (bv. "AI Introductie")',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'titel',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'profiel',
      title: 'Doelgroep Profiel',
      type: 'string',
      options: {
        list: [
          { title: '🌱 Starter - Digitale basis (A1→A2)', value: 'starter' },
          { title: '🔍 Integrator - Digitale integratie (A2→B1)', value: 'integrator' },
          { title: '🔧 Expert - Digitale verdieping (B1→B2)', value: 'expert' },
          { title: '🚀 Leader - Digitale innovatie (B2+)', value: 'leader' },
          { title: '🤖 AI Verplicht - AI bewustzijn (allemaal)', value: 'ai-verplicht' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'doelgroep',
      title: 'Doelgroep Beschrijving',
      type: 'text',
      rows: 2,
      description: 'Voor wie is dit leerpad bedoeld?',
    }),
    defineField({
      name: 'beschrijving',
      title: 'Introductie',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Korte introductie van het leerpad',
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'module' }] }],
      description: 'Modules in dit leerpad (in volgorde)',
    }),
    defineField({
      name: 'totaleDuur',
      title: 'Totale Duur (uren)',
      type: 'number',
      description: 'Geschatte tijd om het leerpad te voltooien',
    }),
    defineField({
      name: 'doelstellingen',
      title: 'Leerdoelstellingen',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Wat leert de gebruiker in dit leerpad?',
    }),
    defineField({
      name: 'voorwaarden',
      title: 'Voorkennis',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Wat moet je al kennen voordat je start?',
    }),
    defineField({
      name: 'certificaat',
      title: 'Certificaat Beschikbaar',
      type: 'boolean',
      description: 'Krijgt de gebruiker een certificaat na voltooiing?',
      initialValue: false,
    }),
    defineField({
      name: 'featured',
      title: 'Uitgelicht',
      type: 'boolean',
      description: 'Toon dit leerpad prominent op de homepage',
      initialValue: false,
    }),
    defineField({
      name: 'afbeelding',
      title: 'Afbeelding',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Optionele afbeelding voor het leerpad',
    }),
  ],
  preview: {
    select: {
      title: 'titel',
      subtitle: 'profiel',
      media: 'afbeelding',
    },
    prepare({ title, subtitle, media }) {
      const profileEmoji = {
        starter: '🌱',
        integrator: '🔍',
        expert: '🔧',
        leader: '🚀',
        'ai-verplicht': '🤖',
      }
      return {
        title,
        subtitle: `${profileEmoji[subtitle] || ''} ${subtitle}`,
        media,
      }
    },
  },
});
