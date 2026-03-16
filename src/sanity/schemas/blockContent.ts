import { defineType, defineField } from 'sanity';

// YouTube embed block
export const youtube = defineType({
  name: 'youtube',
  title: 'YouTube Video',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
    }),
    defineField({
      name: 'caption',
      title: 'Onderschrift',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'caption',
      url: 'url',
    },
  },
});

// Video file upload block
export const videoFile = defineType({
  name: 'videoFile',
  title: 'Video Bestand',
  type: 'object',
  fields: [
    defineField({
      name: 'video',
      title: 'Video',
      type: 'file',
      options: {
        accept: 'video/*',
      },
    }),
    defineField({
      name: 'caption',
      title: 'Onderschrift',
      type: 'string',
    }),
  ],
});

// PDF file upload block
export const pdfFile = defineType({
  name: 'pdfFile',
  title: 'PDF Bestand',
  type: 'object',
  fields: [
    defineField({
      name: 'file',
      title: 'PDF Bestand',
      type: 'file',
      options: {
        accept: '.pdf',
      },
      description: 'Upload een PDF bestand dat deel uitmaakt van deze tutorial',
    }),
    defineField({
      name: 'title',
      title: 'Titel',
      type: 'string',
      description: 'Beschrijvende titel voor de PDF',
    }),
    defineField({
      name: 'description',
      title: 'Omschrijving',
      type: 'text',
      rows: 2,
      description: 'Korte omschrijving van wat de PDF bevat',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      filename: 'file.asset.originalFilename',
    },
    prepare({ title, filename }) {
      return {
        title: title || filename || 'PDF Bestand',
        subtitle: filename,
      };
    },
  },
});

// Export block content type
export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    { type: 'block' },
    { type: 'customImage', title: 'Afbeelding met opties' },
    { type: 'youtube' },
    { type: 'videoFile' },
    { type: 'twoColumn' },
  ],
});
