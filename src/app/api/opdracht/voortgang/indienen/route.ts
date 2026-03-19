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
        model: 'qwen2.5:7b',
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
        model: 'claude-3-5-haiku', // Let's try the alias instead
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

    if (!user_email || !tutorial_id || !opdracht_id || !antwoorden) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // AI Correctie
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
    };

    const promptOpdrachtId = opdrachtIdMap[tutorial_slug] || opdracht_id;
    const prompt = getPromptForOpdracht(promptOpdrachtId, promptInput);

    // AI Correctie - Claude primair (Vercel), Ollama primair (lokaal)
    let correctieResult;
    const isLocalhost = process.env.NODE_ENV === 'development';

    if (isLocalhost) {
      // Lokaal: Ollama primair (gratis, ongelimiteerd)
      try {
        console.log('Trying Ollama (local)...');
        correctieResult = await correctWithOllama(prompt);
      } catch (error) {
        console.log('Ollama failed, trying Claude...');
        try {
          correctieResult = await correctWithClaude(prompt);
        } catch (error2) {
          console.log('Claude failed, trying Google Gemini...');
          correctieResult = await correctWithGemini(prompt);
        }
      }
    } else {
      // Vercel/Production: Claude primair, met fallback
      console.log('Trying Claude (production)...');
      console.log('Claude API key configured:', claudeApiKey ? 'YES' : 'NO');
      try {
        correctieResult = await correctWithClaude(prompt);
      } catch (error) {
        console.log('Claude failed, trying Google Gemini...');
        try {
          correctieResult = await correctWithGemini(prompt);
        } catch (error2) {
          console.log('Google Gemini failed, trying Z.ai fallback...');
          try {
            correctieResult = await correctWithZai(prompt);
          } catch (error3) {
            console.error('All AI providers failed:', { error: error.message, error2: error2.message, error3: error3.message });
            throw new Error(`Alle AI providers failed. Claude: ${error.message}, Gemini: ${error2.message}, Z.ai: ${error3.message}`);
          }
        }
      }
    }

    const score = correctieResult.score;
    const feedback = correctieResult.feedback;
    const details = correctieResult.details;

    // Opslaan in Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check of er al een voortgang bestaat
    const { data: existing } = await supabase
      .from('opdracht_voortgang')
      .select('id')
      .eq('user_email', user_email)
      .eq('opdracht_id', opdracht_id)
      .single();

    if (existing) {
      // Update bestaande
      await supabase
        .from('opdracht_voortgang')
        .update({
          antwoorden,
          voltooid: true,
          score,
          feedback,
          correctie_data: details,
          status: 'voltooid',
          completed_at: new Date().toISOString(),
        })
        .eq('id', existing.id);
    } else {
      // Maak nieuwe
      await supabase
        .from('opdracht_voortgang')
        .insert({
          user_email,
          user_name: user_name || 'Onbekend',
          tutorial_id: tutorial_id,
          tutorial_slug: tutorial_slug,
          opdracht_id: opdracht_id,
          opdracht_titel: opdracht_titel,
          antwoorden,
          voltooid: true,
          score,
          feedback,
          correctie_data: details,
          status: 'voltooid',
          completed_at: new Date().toISOString(),
        });
    }

    return NextResponse.json({
      success: true,
      score,
      feedback,
      details,
    });
  } catch (error) {
    console.error('Error in /api/opdracht/voortgang/indienen:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
