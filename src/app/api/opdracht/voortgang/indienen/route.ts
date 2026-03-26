import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getPromptForOpdracht, OpdrachtPromptInput } from '@/lib/opdracht-prompts/ai-bewustzijn';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const googleGeminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
const zaiApiKey = process.env.ZAI_API_KEY;
const claudeApiKey = process.env.ANTHROPIC_API_KEY;

// AI Correction via Ollama (primair - lokaal)
async function correctWithOllama(prompt: string): Promise<any> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'qwen2.5:7b', // TODO: qwen3.5:9b is too slow due to thinking mode
        prompt: prompt,
        stream: false,
        format: 'json',
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return JSON.parse(data.response);
  } catch (error) {
    console.error('Ollama error:', error);
    throw error;
  }
}

// AI Correction via Claude/Anthropic (primair - Vercel)
async function correctWithClaude(prompt: string): Promise<any> {
  if (!claudeApiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5', // Nieuwste Haiku model (2025)
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nGeef ALLEEN de JSON output, geen andere tekst.',
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Claude response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Claude error:', error);
    throw error;
  }
}

// AI Correction via Google Gemini (fallback)
async function correctWithGemini(prompt: string): Promise<any> {
  if (!googleGeminiApiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY is not set');
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleGeminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt + '\n\nGeef ALLEEN de JSON output, geen andere tekst.',
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in Gemini response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Google Gemini error:', error);
    throw error;
  }
}

// AI Correction via Z.ai (fallback)
async function correctWithZai(prompt: string): Promise<any> {
  if (!zaiApiKey) {
    throw new Error('ZAI_API_KEY is not set');
  }

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${zaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'glm-4.7',
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nGeef alleen de JSON output, geen andere tekst.',
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Z.ai API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Z.ai error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      user_email,
      user_name,
      tutorial_id,
      tutorial_slug,
      opdracht_id,
      opdracht_titel,
      instructie,
      criteria,
      antwoorden,
    } = body;

    console.log('[Indienen] Request ontvangen:', { user_email, tutorial_slug, opdracht_id });

    if (!user_email || !tutorial_id || !opdracht_id || !antwoorden) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // AI Correctie proberen
    let score: number | undefined;
    let feedback: string | undefined;
    let details: any = undefined;
    let aiError: string | undefined;

    try {
      const promptInput: OpdrachtPromptInput = {
        titel: opdracht_titel,
        instructie: instructie,
        criteria,
        antwoorden,
      };

      // Map tutorial slug to opdracht ID for AI prompts
      const opdrachtIdMap: Record<string, string> = {
        'ai-bewustzijn-module-1': 'verantwoordingsmatrix',
        'ai-bewustzijn-module-2': 'betrouwbaarheidsscan',
        'ai-bewustzijn-module-3': 'participatieplan',
        'ai-bewustzijn-module-4': 'evaluatieprotocol',
        'ai-bewustzijn-module-6': 'concreet-aan-de-slag',
      };

      const promptOpdrachtId = opdrachtIdMap[tutorial_slug] || opdracht_id;
      const prompt = getPromptForOpdracht(promptOpdrachtId, promptInput);

      // AI Correctie - Claude primair (Vercel), Ollama primair (lokaal)
      let correctieResult;
      const isLocalhost = process.env.NODE_ENV === 'development';

      if (isLocalhost) {
        // Lokaal: Ollama primair (gratis, ongelimiteerd)
        try {
          console.log('[Indienen] Trying Ollama (local)...');
          correctieResult = await correctWithOllama(prompt);
        } catch (error) {
          console.log('[Indienen] Ollama failed, trying Claude...');
          try {
            correctieResult = await correctWithClaude(prompt);
          } catch (error2) {
            console.log('[Indienen] Claude failed, trying Google Gemini...');
            correctieResult = await correctWithGemini(prompt);
          }
        }
      } else {
        // Vercel/Production: Claude primair, met fallback
        console.log('[Indienen] Trying Claude (production)...');
        console.log('[Indienen] Claude API key configured:', claudeApiKey ? 'YES' : 'NO');
        try {
          correctieResult = await correctWithClaude(prompt);
          console.log('[Indienen] Claude success!');
        } catch (error) {
          console.log('[Indienen] Claude failed:', error instanceof Error ? error.message : error);
          try {
            console.log('[Indienen] Trying Google Gemini...');
            correctieResult = await correctWithGemini(prompt);
            console.log('[Indienen] Gemini success!');
          } catch (error2) {
            console.log('[Indienen] Gemini failed:', error2 instanceof Error ? error2.message : error2);
            try {
              console.log('[Indienen] Trying Z.ai...');
              correctieResult = await correctWithZai(prompt);
              console.log('[Indienen] Z.ai success!');
            } catch (error3) {
              const errMsg = error3 instanceof Error ? error3.message : 'Unknown error';
              console.error('[Indienen] All AI providers failed:', errMsg);
              throw new Error(`AI correctie tijdelijk niet beschikbaar: ${errMsg}`);
            }
          }
        }
      }

      score = correctieResult.score;
      feedback = correctieResult.feedback;
      details = correctieResult.details;
      console.log('[Indienen] AI correctie voltooid, score:', score);

    } catch (error) {
      console.error('[Indienen] AI correctie error:', error);
      aiError = error instanceof Error ? error.message : 'Unknown error';
      // Continue zonder AI score - we slaan toch de voortgang op
    }

    // BELANGRIJK: Sla voortgang op ZELFS als AI faalt
    console.log('[Indienen] Opslaan in Supabase...');

    // Check of er al een voortgang bestaat
    const { data: existing, error: selectError } = await supabase
      .from('opdracht_voortgang')
      .select('id')
      .eq('user_email', user_email)
      .eq('opdracht_id', opdracht_id)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.error('[Indienen] Select error:', selectError);
    }

    const voortgangData = {
      antwoorden,
      voltooid: score !== undefined,
      score: score || null,
      feedback: feedback || null,
      status: score !== undefined ? 'voltooid' : 'ingediend',
      completed_at: score !== undefined ? new Date().toISOString() : null,
      correctie_data: details || null,
    };

    let saveError;
    if (existing) {
      // Update bestaande
      const result = await supabase
        .from('opdracht_voortgang')
        .update(voortgangData)
        .eq('id', existing.id);
      saveError = result.error;
      console.log('[Indienen] Update result:', saveError ? 'ERROR' : 'OK');
    } else {
      // Maak nieuwe
      const result = await supabase
        .from('opdracht_voortgang')
        .insert({
          user_email,
          user_name: user_name || 'Onbekend',
          tutorial_id: tutorial_id,
          tutorial_slug: tutorial_slug,
          opdracht_id: opdracht_id,
          opdracht_titel: opdracht_titel,
          ...voortgangData,
        });
      saveError = result.error;
      console.log('[Indienen] Insert result:', saveError ? 'ERROR' : 'OK', saveError);
    }

    if (saveError) {
      console.error('[Indienen] Save error:', saveError);
      return NextResponse.json(
        { error: `Database error: ${saveError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      score: score || null,
      feedback: feedback || aiError || 'Opgeslagen zonder AI correctie',
      details,
    });
  } catch (error) {
    console.error('[Indienen] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
