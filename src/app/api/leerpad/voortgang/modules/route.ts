import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Module volgorde voor AI Bewustzijn leerpad
const MODULE_ORDER: Record<string, number> = {
  'ai-bewustzijn-module-1': 1,
  'ai-bewustzijn-module-2': 2,
  'ai-bewustzijn-module-3': 3,
  'ai-bewustzijn-module-4': 4,
  'ai-bewustzijn-module-5': 5,
  'ai-bewustzijn-module-6': 6,
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

    // Module 1 is altijd unlocked
    // Module N is unlocked als Module N-1 passed is
    let unlocked = index === 0;

    if (index > 0) {
      const prevSlug = moduleSlugs[index - 1];
      const prevData = slugToData[prevSlug];
      const prevScore = prevData?.score || 0;
      const prevPassed = prevScore >= PASSING_SCORE;
      unlocked = prevPassed;
    }

    moduleProgress[slug] = {
      completed,
      score,
      unlocked,
      passed,
    };
  });

  return NextResponse.json({ moduleProgress });
}
