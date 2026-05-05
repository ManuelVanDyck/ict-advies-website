import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Module volgorde voor AI Bewustzijn leerpad (stijgende moeilijkheid)
// Alle modules zijn direct beschikbaar (geen sequential unlock)
const MODULE_ORDER: Record<string, number> = {
  'ai-bewustzijn-module-5': 1, // Google AI Training
  'ai-bewustzijn-module-6': 2, // Concreet aan de slag met AI
  'ai-bewustzijn-module-1': 3, // Visievorming – De mens aan het roer
  'ai-bewustzijn-module-3': 4, // Het didactische proces
  'ai-bewustzijn-module-2': 5, // Betrouwbaarheid toetsen
  'ai-bewustzijn-module-4': 6, // Professionalisering & netwerk
};

// Geslaagd = score >= 50
const PASSING_SCORE = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('user_email');

  if (!userEmail) {
    return NextResponse.json({ error: 'user_email is required' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Haal voortgang uit BEIDE tabellen
  const [voortgangResult, inzendingenResult] = await Promise.all([
    supabase
      .from('opdracht_voortgang')
      .select('tutorial_slug, score, voltooid, status')
      .eq('user_email', userEmail),
    supabase
      .from('opdracht_inzendingen')
      .select('tutorial_slug, score, status')
      .eq('user_email', userEmail),
  ]);

  if (voortgangResult.error) {
    console.error('[Modules] opdracht_voortgang error:', voortgangResult.error);
  }
  if (inzendingenResult.error) {
    console.error('[Modules] opdracht_inzendingen error:', inzendingenResult.error);
  }

  // Combineer data - normaliseer naar gemeenschappelijk formaat
  const slugToData: Record<string, { score: number; completed: boolean }> = {};

  // Verwerk voortgang data
  (voortgangResult.data || []).forEach((v: any) => {
    const current = slugToData[v.tutorial_slug];
    const newScore = v.score || 0;
    if (!current || newScore > current.score) {
      slugToData[v.tutorial_slug] = {
        score: newScore,
        completed: v.voltooid || v.status === 'voltooid',
      };
    }
  });

  // Verwerk inzendingen data
  (inzendingenResult.data || []).forEach((v: any) => {
    const current = slugToData[v.tutorial_slug];
    const newScore = v.score || 0;
    if (!current || newScore > current.score) {
      slugToData[v.tutorial_slug] = {
        score: newScore,
        completed: v.status === 'voltooid',
      };
    }
  });

  console.log('[Modules] slugToData:', JSON.stringify(slugToData));

  // Bouw progress map
  const moduleProgress: Record<string, { completed: boolean; score: number; unlocked: boolean; passed: boolean }> = {};
  const moduleSlugs = Object.keys(MODULE_ORDER).sort((a, b) => MODULE_ORDER[a] - MODULE_ORDER[b]);

  moduleSlugs.forEach((slug, index) => {
    const data = slugToData[slug];
    const score = data?.score || 0;
    const passed = score >= PASSING_SCORE;
    const completed = data?.completed || false;

    // Alle modules zijn direct beschikbaar (geen sequential unlock)
    moduleProgress[slug] = {
      completed,
      score,
      unlocked: true,
      passed,
    };
  });

  return NextResponse.json({ moduleProgress });
}
