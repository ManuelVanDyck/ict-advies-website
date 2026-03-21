import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Module volgorde voor AI Bewustzijn leerpad
const MODULE_ORDER = [
  'ai-bewustzijn-module-1',
  'ai-bewustzijn-module-2',
  'ai-bewustzijn-module-3',
  'ai-bewustzijn-module-4',
  'ai-bewustzijn-module-5',
];

const PASSING_SCORE = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userEmail = searchParams.get('user_email');
  const leerpadSlug = searchParams.get('leerpad') || 'ai-bewustzijn';

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

  console.log('[Certificaat] voortgang:', voortgangResult.data?.length, 'inzendingen:', inzendingenResult.data?.length);
  console.log('[Certificaat] inzendingen data:', JSON.stringify(inzendingenResult.data));

  if (voortgangResult.error) {
    console.error('[Certificaat] opdracht_voortgang error:', voortgangResult.error);
  }
  if (inzendingenResult.error) {
    console.error('[Certificaat] opdracht_inzendingen error:', inzendingenResult.error);
  }

  // Bouw een map van slug -> beste score
  const slugToScore: Record<string, number> = {};

  // Verwerk voortgang data
  (voortgangResult.data || []).forEach((v: any) => {
    const currentScore = slugToScore[v.tutorial_slug] || 0;
    const newScore = v.score || 0;
    if (newScore > currentScore) {
      slugToScore[v.tutorial_slug] = newScore;
    }
  });

  // Verwerk inzendingen data
  (inzendingenResult.data || []).forEach((v: any) => {
    const currentScore = slugToScore[v.tutorial_slug] || 0;
    const newScore = v.score || 0;
    if (newScore > currentScore) {
      slugToScore[v.tutorial_slug] = newScore;
    }
  });

  console.log('[Certificaat] slugToScore:', JSON.stringify(slugToScore));

  // Check alle modules
  const moduleResults: Array<{ slug: string; score: number; passed: boolean }> = [];
  let allPassed = true;
  let totaalScore = 0;

  MODULE_ORDER.forEach((slug) => {
    const score = slugToScore[slug] || 0;
    const passed = score >= PASSING_SCORE;

    if (!passed) {
      allPassed = false;
    }

    totaalScore += score;

    moduleResults.push({
      slug,
      score,
      passed,
    });
  });

  // Gemiddelde score
  const gemiddeldeScore = Math.round(totaalScore / MODULE_ORDER.length);

  return NextResponse.json({
    allPassed,
    modules: moduleResults,
    gemiddeldeScore,
  });
}
