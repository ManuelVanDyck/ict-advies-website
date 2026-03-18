// AI Prompts voor AI Bewustzijn Leerpad
// Elk opdracht heeft zijn eigen prompt template

export interface OpdrachtPromptInput {
  titel: string;
  instructie: string;
  criteria: { naam: string; beschrijving: string; gewicht: number }[];
  antwoorden: Record<string, any>;
}

export interface OpdrachtPromptOutput {
  score: number;
  feedback: string;
  details: {
    criterium: string;
    score: number;
    feedback: string;
  }[];
}

// Opdracht 1: De Verantwoordingsmatrix
export const promptVerantwoordingsmatrix = (input: OpdrachtPromptInput): string => {
  const criteriaNames = input.criteria.map(c => c.naam).join(', ');

  return `
Je bent een pedagogisch coach die AI-bewustzijn opdrachten beoordeelt bij leerkrachten.

OPDRACHT: ${input.titel}
${input.instructie}

BEOORDELINGSCRITERIA (${criteriaNames}):
${input.criteria.map(c => `- ${c.naam} (${c.gewicht}%): ${c.beschrijving}`).join('\n')}

ANTWOORDEN VAN DE LEERKRACHT:
${JSON.stringify(input.antwoorden, null, 2)}

INSTRUCTIES:
1. Beoordeel elk criterium op basis van de antwoorden
2. Geef per criterium een score van 0-100
3. Schrijf constructieve feedback per criterium (in het Nederlands)
4. Bereken een totaalscore op basis van de gewichten
5. Schrijf een samenvattende, coachende feedback

ANTWOORD ALLEEN IN JSON-formaat:
{
  "score": totaalscore (0-100),
  "feedback": "korte samenvattende feedback in het Nederlands",
  "details": [
    {
      "criterium": "${input.criteria[0]?.naam || 'criterium'}",
      "score": score (0-100),
      "feedback": "constructieve feedback in het Nederlands"
    }
  ]
}
`;
};

// Opdracht 2: De Betrouwbaarheidsscan
export const promptBetrouwbaarheidsscan = (input: OpdrachtPromptInput): string => {
  const criteriaNames = input.criteria.map(c => c.naam).join(', ');

  return `
Je bent een AI-ethics expert die beoordeelt of leerkrachten kritisch omgaan met AI-tools.

OPDRACHT: ${input.titel}
${input.instructie}

BEOORDELINGSCRITERIA (${criteriaNames}):
${input.criteria.map(c => `- ${c.naam} (${c.gewicht}%): ${c.beschrijving}`).join('\n')}

ANTWOORDEN VAN DE LEERKRACHT:
${JSON.stringify(input.antwoorden, null, 2)}

INSTRUCTIES:
1. Beoordeel elk criterium op basis van de antwoorden
2. Kijk naar de diepgang van de analyse (oppervlakkig vs grondig)
3. Controleer of alle 7 sleutelvoorwaarden voor betrouwbare AI aan bod komen
4. Geef per criterium een score van 0-100
5. Schrijf constructieve feedback met concrete suggesties voor verbetering
6. Bereken een totaalscore op basis van de gewichten

ANTWOORD ALLEEN IN JSON-formaat:
{
  "score": totaalscore (0-100),
  "feedback": "korte samenvattende feedback in het Nederlands",
  "details": [
    {
      "criterium": "${input.criteria[0]?.naam || 'criterium'}",
      "score": score (0-100),
      "feedback": "constructieve feedback in het Nederlands"
    }
  ]
}
`;
};

// Opdracht 3: Participatieplan
export const promptParticipatieplan = (input: OpdrachtPromptInput): string => {
  const criteriaNames = input.criteria.map(c => c.naam).join(', ');

  return `
Je bent een onderwijsconsultant die beoordeelt hoe leerkrachten samenwerken met leerlingen en ouders.

OPDRACHT: ${input.titel}
${input.instructie}

BEOORDELINGSCRITERIA (${criteriaNames}):
${input.criteria.map(c => `- ${c.naam} (${c.gewicht}%): ${c.beschrijving}`).join('\n')}

ANTWOORDEN VAN DE LEERKRACHT:
${JSON.stringify(input.antwoorden, null, 2)}

INSTRUCTIES:
1. Beoordeel elk criterium op basis van de antwoorden
2. Kijk naar de praktische haalbaarheid van het plan
3. Controleer of er echt sprake is van participatie (niet slechts informeren)
4. Geef per criterium een score van 0-100
5. Schrijf constructieve feedback met concrete suggesties
6. Bereken een totaalscore op basis van de gewichten

ANTWOORD ALLEEN IN JSON-formaat:
{
  "score": totaalscore (0-100),
  "feedback": "korte samenvattende feedback in het Nederlands",
  "details": [
    {
      "criterium": "${input.criteria[0]?.naam || 'criterium'}",
      "score": score (0-100),
      "feedback": "constructieve feedback in het Nederlands"
    }
  ]
}
`;
};

// Opdracht 4: Evaluatieprotocol
export const promptEvaluatieprotocol = (input: OpdrachtPromptInput): string => {
  const criteriaNames = input.criteria.map(c => c.naam).join(', ');

  return `
Je bent een kwaliteitszorg specialist die beoordeelt hoe leerkrachten continuïteit en evaluatie toepassen.

OPDRACHT: ${input.titel}
${input.instructie}

BEOORDELINGSCRITERIA (${criteriaNames}):
${input.criteria.map(c => `- ${c.naam} (${c.gewicht}%): ${c.beschrijving}`).join('\n')}

ANTWOORDEN VAN DE LEERKRACHT:
${JSON.stringify(input.antwoorden, null, 2)}

INSTRUCTIES:
1. Beoordeel elk criterium op basis van de antwoorden
2. Controleer of de evaluatiemomenten realistisch en haalbaar zijn
3. Kijk naar de kwaliteit van de reflectievragen (critisch vs oppervlakkig)
4. Controleer of er sprake is van continu proces (niet eenmalig)
5. Geef per criterium een score van 0-100
6. Schrijf constructieve feedback met concrete suggesties
7. Bereken een totaalscore op basis van de gewichten

ANTWOORD ALLEEN IN JSON-formaat:
{
  "score": totaalscore (0-100),
  "feedback": "korte samenvattende feedback in het Nederlands",
  "details": [
    {
      "criterium": "${input.criteria[0]?.naam || 'criterium'}",
      "score": score (0-100),
      "feedback": "constructieve feedback in het Nederlands"
    }
  ]
}
`;
};

// Helper: Selecteer de juiste prompt op basis van opdracht ID
export const getPromptForOpdracht = (opdrachtId: string, input: OpdrachtPromptInput): string => {
  switch (opdrachtId) {
    case 'verantwoordingsmatrix':
      return promptVerantwoordingsmatrix(input);
    case 'betrouwbaarheidsscan':
      return promptBetrouwbaarheidsscan(input);
    case 'participatieplan':
      return promptParticipatieplan(input);
    case 'evaluatieprotocol':
      return promptEvaluatieprotocol(input);
    default:
      throw new Error(`Onbekende opdracht ID: ${opdrachtId}`);
  }
};
