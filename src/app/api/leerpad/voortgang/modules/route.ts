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

  // Haal alle voortgang voor deze user
  const { data, error } = await supabase
    .from('opdracht_voortgang')
    .select('tutorial_slug, score, voltooid, status')
    .eq('user_email', userEmail);

  if (error) {
    console.error('[Modules] Supabase error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  // Bouw progress map
  const moduleProgress: Record<string, { completed: boolean; score: number; unlocked: boolean; passed: boolean }> = {};
  const moduleSlugs = Object.keys(MODULE_ORDER).sort((a, b) => MODULE_ORDER[a] - MODULE_ORDER[b]);

  moduleSlugs.forEach((slug, index) => {
    const voortgang = data?.find((v: any) => v.tutorial_slug === slug);
    const score = voortgang?.score || 0;
    const passed = score >= PASSING_SCORE;
    const completed = voortgang?.voltooid || false;

    // Module 1 is altijd unlocked
    // Module N is unlocked als Module N-1 passed is
    let unlocked = index === 0;

    if (index > 0) {
      const prevSlug = moduleSlugs[index - 1];
      const prevVoortgang = data?.find((v: any) => v.tutorial_slug === prevSlug);
      const prevPassed = (prevVoortgang?.score || 0) >= PASSING_SCORE;
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
