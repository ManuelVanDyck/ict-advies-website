// Quiz Vraag Schema - Een vraag voor de module quiz
export default {
  name: 'quizVraag',
  title: 'Quiz Vraag',
  type: 'object',
  fields: [
    {
      name: 'vraag',
      title: 'Vraag',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'antwoorden',
      title: 'Antwoordopties',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (Rule) => Rule.required().min(2).max(5),
      description: 'Minstens 2, maximaal 5 antwoordopties',
    },
    {
      name: 'correctAntwoord',
      title: 'Correct Antwoord Index',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
      description: 'Index van het juiste antwoord (0 = eerste optie)',
    },
    {
      name: 'uitleg',
      title: 'Uitleg',
      type: 'text',
      rows: 2,
      description: 'Uitleg waarom dit antwoord correct is',
    },
  ],
  preview: {
    select: {
      title: 'vraag',
    },
  },
}
