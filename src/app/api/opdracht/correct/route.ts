import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

interface Criterium {
  naam: string;
  beschrijving?: string;
  verwacht?: string; // Wat moet er precies in de sheet staan
  controleer?: string[]; // Specifieke dingen om te controleren
  gewicht: number;
}

interface CorrectionRequest {
  inzendingId: string;
  sheetUrl?: string;
  pdfUrl?: string;
  criteria: Criterium[];
  maxScore: number;
  screenshots?: string[]; // Base64 encoded images
}

// Helper: fetch with timeout
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

// Read Google Sheet content - prefer CSV export (works with public sheets)
async function readSheetContent(sheetUrl: string): Promise<string | null> {
  // Extract sheet ID from URL
  const sheetIdMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!sheetIdMatch) {
    console.log('[Correctie] Kon sheet ID niet vinden in URL');
    return null;
  }
  
  const sheetId = sheetIdMatch[1];
  
  // Try Google Sheets CSV export first (most reliable for public sheets)
  try {
    console.log('[Correctie] Sheet lezen via CSV export...');
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
    
    const response = await fetchWithTimeout(csvUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain',
      },
      redirect: 'follow', // Volg Google redirects
    }, 30000);

    if (response.ok) {
      const content = await response.text();
      if (content && content.length > 50 && !content.includes('<!DOCTYPE')) {
        console.log('[Correctie] CSV gelezen, lengte:', content.length);
        // Format CSV for better readability
        const formatted = formatCsvContent(content);
        return formatted.substring(0, 8000);
      }
      
      // If we got HTML, the sheet is not public
      if (content.includes('<!DOCTYPE') || content.includes('sign in')) {
        console.log('[Correctie] Sheet is niet publiek (kreeg HTML terug)');
        return null;
      }
    }
    
    console.log('[Correctie] CSV export faalde, status:', response.status);
  } catch (error) {
    console.error('[Correctie] CSV export error:', error instanceof Error ? error.message : error);
  }

  // Fallback: Try Jina AI Reader
  try {
    console.log('[Correctie] Fallback: Sheet lezen via Jina AI Reader...');
    
    const jinaUrl = `https://r.jina.ai/${sheetUrl}`;
    
    const response = await fetchWithTimeout(jinaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain',
      },
    }, 30000);

    if (response.ok) {
      const content = await response.text();
      if (content && content.length > 100) {
        console.log('[Correctie] Sheet gelezen via Jina, lengte:', content.length);
        return content.substring(0, 5000);
      }
    }
  } catch (error) {
    console.error('[Correctie] Jina Reader error:', error instanceof Error ? error.message : error);
  }

  return null;
}

// Format CSV content for better AI readability
function formatCsvContent(csv: string): string {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) return csv;
  
  // Parse CSV (handle quoted values)
  const parseRow = (row: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    
    return result;
  };
  
  // Get headers
  const headers = parseRow(lines[0]);
  
  // Format as markdown table (first 50 rows max)
  const maxRows = Math.min(lines.length, 51);
  let formatted = '| ' + headers.join(' | ') + ' |\n';
  formatted += '| ' + headers.map(() => '---').join(' | ') + ' |\n';
  
  for (let i = 1; i < maxRows; i++) {
    const row = parseRow(lines[i]);
    formatted += '| ' + row.join(' | ') + ' |\n';
  }
  
  if (lines.length > 51) {
    formatted += `\n... (${lines.length - 51} meer rijen)`;
  }
  
  return formatted;
}

// Build the improved prompt
function buildPrompt(criteria: Criterium[], maxScore: number, sheetUrl: string | undefined, pdfUrl: string | undefined, sheetContent: string | null): string {
  const criteriaText = criteria
    .map((c, i) => `${i + 1}. ${c.naam} (gewicht: ${c.gewicht})${c.beschrijving ? ` - ${c.beschrijving}` : ''}`)
    .join('\n');

  // If we have sheet content, include it in the prompt
  const sheetSection = sheetContent
    ? `HIER IS DE INHOUD VAN DE GOOGLE SHEET (gebruik dit voor je beoordeling):

\`\`\`
${sheetContent}
\`\`\`

Beoordeel op basis van deze DAADWERKELIJKE data. Wees SPECIFIEK over wat je ziet!`
    : `⚠️ Ik kon de sheet NIET lezen (waarschijnlijk niet publiek gemaakt).

Geef de cursist aan dat:
- De sheet niet publiek toegankelijk was
- Je daarom geen specifieke feedback kunt geven
- Ze de sheet publiek moeten maken en opnieuw indienen voor betere feedback
- Geef voorlopig een voorzichtige score (60-70)`;

  // If we have a PDF, include a note about it
  const pdfSection = pdfUrl
    ? `

DE PDF WORDT DIRECT DOOR DE AI GEANALYSEERD:
\`\`\`
${pdfUrl}
\`\`\`

De PDF opent automatisch in een nieuw tabblad. Beoordeel op basis van deze INGEVOUDEN PDF.`
    : '';

  return `Je bent een ervaren trainer die opdrachten beoordeelt voor volwassen cursisten (leerkrachten). Je geeft CONCRETE feedback op basis van ALLEEN de criteria hieronder.

${criteriaText}

${sheetSection}${pdfSection}

Een cursist heeft een Google Sheets opdracht ingediend. Beoordeel deze op basis van de volgende criteria:

${criteriaText}

${sheetSection}

BELANGRIJK:
1. Geef een realistische score (60-90 voor een goede inzending)
2. Geef feedback ALLEEN over de criteria hierboven
3. Verzin GEEN extra eisen (geen grafieken, conclusies, etc. tenzij in criteria)
4. Spreek de cursist aan als "je" (niet "de leerling" of "de cursist")
5. Als je de sheet WEL kon lezen: wees specifiek over wat je ziet!
6. Als je de sheet NIET kon lezen: geef aan dat je de sheet niet kon controleren

Geef je beoordeling terug in het volgende JSON formaat (ALLEEN JSON):
{
  "score": <score uit ${maxScore}>,
  "feedback": "<feedback in het Nederlands:\n- Wat heb je goed gedaan (wees specifiek als je de sheet zag)\n- Waar zit er ruimte voor verbetering (alleen op basis van criteria)\n- Bemoedigende afsluiting>",
  "details": {
    "${criteria[0]?.naam || 'criterium1'}": <score 0-10>,
    "${criteria[1]?.naam || 'criterium2'}": <score 0-10>,
    "${criteria[2]?.naam || 'criterium3'}": <score 0-10>,
    "${criteria[3]?.naam || 'criterium4'}": <score 0-10>,
    "${criteria[4]?.naam || 'criterium5'}": <score 0-10>
  }
}

VOORBEELD GOEDE FEEDBACK (met sheet inhoud):
"Je hebt de eerste draaitabel correct opgezet: ik zie dat er 48 studenten zijn (27 mannen, 21 vrouwen). De gemiddelde studietijd is 14.5 uur. De tweede draaitabel toont correct de attitudes per categorie. Goed gedaan!"

VERMIJD:
- Vragen om grafieken als dat niet in de criteria staat
- Vragen om conclusies/interpretaties als dat niet in de criteria staat
- Generieke feedback zoals "controleer of alle kolommen correct zijn"
- De woorden "leerling" of "de cursist" - spreek direct aan met "je"`;
}

// Analyze screenshots using Ollama vision model (llava)
async function correctWithScreenshots(
  screenshots: string[],
  criteria: Criterium[],
  maxScore: number
): Promise<{ score: number; feedback: string; details: Record<string, number> }> {
  console.log('[Correctie] Screenshots analyseren via Ollama llava:7b...');

  // Build criteria text with verwacht and controleer
  const criteriaText = criteria
    .map((c, i) => {
      let text = `${i + 1}. ${c.naam} (gewicht: ${c.gewicht})`;
      if (c.beschrijving) text += ` - ${c.beschrijving}`;
      if (c.verwacht) text += `\n   VERWACHT: ${c.verwacht}`;
      if (c.controleer && c.controleer.length > 0) {
        text += `\n   CONTROLEER: ${c.controleer.join(', ')}`;
      }
      return text;
    })
    .join('\n\n');

  // Verbeterde prompt voor llava - directe, persoonlijke feedback
  const criteriaList = criteria.map((c, i) => {
    let text = `${i + 1}. ${c.naam}`;
    if (c.verwacht) text += `\n   MODELOPLOSSING: ${c.verwacht}`;
    if (c.controleer && c.controleer.length > 0) {
      text += `\n   CONTROLEER: ${c.controleer.join(', ')}`;
    }
    return text;
  }).join('\n\n');

  const prompt = `Je bent een trainer die deze Google Sheets opdracht beoordeelt. Bekijk de ${screenshots.length} screenshots en VERGELIJK met de modeloplossing.

CRITERIA (beoordeel elk uit 10):
${criteriaList}

GEEF JE BEOORDELING IN DEZE EXACTE VORM:

TOTAAL: [0-100]

${criteria.map(c => `${c.naam}: [0-10]`).join('\n')}

FEEDBACK:
[Wat je goed hebt gedaan: noem 2-3 concrete dingen die KLOPPEN vergeleken met modeloplossing]

[Wat beter kan: 1-2 specifieke punten alleen als ze AFWIJKEN van modeloplossing]

[Bemoedigende afsluiting]

REGELS:
- Spreek de cursist direct aan met "je"
- VERGELIJK de screenshots met de MODELOPLOSSING hierboven
- Als de waarden KLOPPEN met modeloplossing → 10/10, geen verbeterpunt
- Als de waarden AFWIJKEN → lager score, geef aan wat er anders moet
- NOOIT zeggen "corrigeer" voor formule-resultaten (die berekent Sheets zelf!)
- Totaalscore = gemiddelde van criteria × 10`;

  // Use Ollama llava:7b
  // For Ollama vision, we need to send images as base64
  const imageData = screenshots.map(img => {
    // Extract base64 data from data URL
    const base64Match = img.match(/^data:image\/\w+;base64,(.+)$/);
    return base64Match ? base64Match[1] : img;
  });

  console.log('[Correctie] Sending to llava:7b with', imageData.length, 'images...');

  const response = await fetchWithTimeout('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llava:7b',
      prompt: prompt,
      images: imageData,
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 2000,
      }
    }),
  }, 300000); // 5 min timeout for image analysis (first time is slow)

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.response;

  if (!content) {
    throw new Error('No response from Ollama');
  }

  console.log('[Correctie] Llava raw response:', content.substring(0, 500));

  // Parse de nieuwe tekst output
  let score = 75;
  const details: Record<string, number> = {};
  let feedback = content;

  // Extract TOTAAL from text
  const scoreMatch = content.match(/TOTAAL:\s*(\d+)/i);
  if (scoreMatch) {
    score = parseInt(scoreMatch[1]);
    console.log('[Correctie] Found totaal:', score);
  }

  // Extract per criterium scores - verbeterde regex
  criteria.forEach(c => {
    // Match: "Draaitabel 1 correct: 8" or "Draaitabel 1 correct:8/10"
    const escapedName = c.naam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`${escapedName}:\\s*(\\d+)`, 'i');
    const match = content.match(regex);
    if (match) {
      details[c.naam] = Math.min(10, Math.max(0, parseInt(match[1])));
      console.log(`[Correctie] Found ${c.naam}:`, details[c.naam]);
    } else {
      details[c.naam] = 7; // default
    }
  });

  // Extract FEEDBACK section - alles na "FEEDBACK:"
  const feedbackMatch = content.match(/FEEDBACK:\s*([\s\S]*?)(?=$)/i);
  if (feedbackMatch) {
    feedback = feedbackMatch[1].trim();
  }

  // Bereken totaalscore uit criteria als TOTAAL niet gevonden
  if (!scoreMatch && Object.keys(details).length > 0) {
    const avg = Object.values(details).reduce((a, b) => a + b, 0) / Object.values(details).length;
    score = Math.round(avg * 10);
  }
  
  return {
    score: Math.min(score, maxScore),
    feedback: feedback,
    details: details,
  };
}

// Ollama API call for correction (local, free)
async function correctWithAI(
  sheetUrl: string | undefined,
  pdfUrl: string | undefined,
  criteria: Criterium[],
  maxScore: number,
  sheetContent: string | null,
  screenshots?: string[]
): Promise<{ score: number; feedback: string; details: Record<string, number> }> {
  // If we have screenshots, use vision model
  if (screenshots && screenshots.length > 0) {
    return correctWithScreenshots(screenshots, criteria, maxScore);
  }
  const prompt = buildPrompt(criteria, maxScore, sheetUrl, pdfUrl, sheetContent);

  // Try Ollama first (local, free) - with 90 second timeout
  try {
    console.log('[Correctie] Ollama starten...');
    const response = await fetchWithTimeout('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral:7b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3,
          num_predict: 2000,
        }
      }),
    }, 90000); // 90 seconden timeout

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.response;

    if (!content) {
      throw new Error('No response from Ollama');
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    return {
      score: Math.min(result.score || 0, maxScore),
      feedback: result.feedback || 'Geen feedback beschikbaar.',
      details: result.details || {},
    };
  } catch (ollamaError) {
    console.error('[Correctie] Ollama error:', ollamaError);
    
    // Fallback to Z.ai
    return correctWithZai(sheetUrl, pdfUrl, criteria, maxScore, sheetContent);
  }
}

// Z.ai fallback - with 60 second timeout
async function correctWithZai(
  sheetUrl: string | undefined,
  pdfUrl: string | undefined,
  criteria: Criterium[],
  maxScore: number,
  sheetContent: string | null
): Promise<{ score: number; feedback: string; details: Record<string, number> }> {
  const ZAI_API_KEY = process.env.ZAI_API_KEY;
  
  if (!ZAI_API_KEY) {
    throw new Error('No AI service available (Ollama failed, ZAI_API_KEY not configured)');
  }

  console.log('[Correctie] Z.ai fallback starten...');

  const prompt = buildPrompt(criteria, maxScore, sheetUrl, pdfUrl, sheetContent);

  const response = await fetchWithTimeout('https://api.z.ai/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ZAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'glm-4-plus',
      messages: [
        {
          role: 'system',
          content: 'Je bent een behulpzame trainer die opdrachten beoordeelt. Je antwoordt ALLEEN met geldige JSON, zonder enige uitleg of redenatie ervoor of erachter.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
    }),
  }, 60000); // 60 seconden timeout

  if (!response.ok) {
    const error = await response.text();
    console.error('[Correctie] Z.ai API error:', error);
    throw new Error(`Z.ai API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content || data.choices[0]?.message?.reasoning_content;

  if (!content) {
    console.error('[Correctie] Geen response van Z.ai:', data);
    throw new Error('No response from AI');
  }

  console.log('[Correctie] Z.ai response ontvangen');

  // Parse JSON from response
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    console.log('[Correctie] JSON geparsed, score:', result.score);
    
    return {
      score: Math.min(result.score || 0, maxScore),
      feedback: result.feedback || 'Geen feedback beschikbaar.',
      details: result.details || {},
    };
  } catch (parseError) {
    console.error('[Correctie] Failed to parse AI response:', content);
    throw new Error('Failed to parse AI response');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CorrectionRequest = await request.json();
    const { inzendingId, sheetUrl, criteria, maxScore, screenshots } = body;

    console.log('[Correctie] Request ontvangen:', { 
      inzendingId, 
      sheetUrl: sheetUrl || 'none',
      screenshots: screenshots ? `${screenshots.length} screenshots` : 'none'
    });

    if (!inzendingId || (!sheetUrl && (!screenshots || screenshots.length === 0)) || !criteria || !maxScore) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (need sheetUrl OR screenshots)' },
        { status: 400 }
      );
    }

    // Update status to "bezig"
    const admin = supabaseAdmin();
    await admin
      .from('opdracht_inzendingen')
      .update({ status: 'bezig' })
      .eq('id', inzendingId);

    // Read sheet content if URL provided
    const sheetContent = sheetUrl ? await readSheetContent(sheetUrl) : null;

    // Get AI correction (with screenshots, sheet content, or both)
    const correction = await correctWithAI(sheetUrl, pdfUrl, criteria, maxScore, sheetContent, screenshots);

    // Update with results
    const { error: updateError } = await admin
      .from('opdracht_inzendingen')
      .update({
        score: correction.score,
        feedback: correction.feedback,
        correctie_data: correction.details,
        status: 'voltooid',
        completed_at: new Date().toISOString(),
      })
      .eq('id', inzendingId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save correction' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      score: correction.score,
      feedback: correction.feedback,
      details: correction.details,
    });
  } catch (error) {
    console.error('[Correctie] Error:', error);
    
    // Check for timeout/abort
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isTimeout = errorMessage.includes('abort') || errorMessage.includes('timeout');
    
    return NextResponse.json(
      { 
        success: false, 
        error: isTimeout 
          ? 'De AI reageerde te traag. Probeer opnieuw (Ollama kan traag zijn bij eerste gebruik).'
          : errorMessage
      },
      { status: 500 }
    );
  }
}
