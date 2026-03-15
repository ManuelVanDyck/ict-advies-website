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

// Export block content type
export default defineType({
  name: 'blockContent',
  title: 'Block Content',
  type: 'array',
  of: [
    { type: 'block' },
    { type: 'image' },
    { type: 'youtube' },
    { type: 'videoFile' },
    { type: 'twoColumn' },
  ],
});
