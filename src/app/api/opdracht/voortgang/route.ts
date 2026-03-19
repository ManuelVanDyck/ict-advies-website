import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_email = searchParams.get('user_email');

    if (!user_email) {
      return NextResponse.json(
        { error: 'user_email is required' },
        { status: 400 }
      );
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Haal voortgang uit beide tabellen
    const [voortgangResult, inzendingenResult] = await Promise.all([
      // Tabel 1: opdracht_voortgang (tekst-gebaseerde opdrachten)
      supabase
        .from('opdracht_voortgang')
        .select('*')
        .eq('user_email', user_email)
        .order('created_at', { ascending: false }),
      
      // Tabel 2: opdracht_inzendingen (screenshot/sheet opdrachten)
      supabase
        .from('opdracht_inzendingen')
        .select('*')
        .eq('user_email', user_email)
        .order('created_at', { ascending: false }),
    ]);

    if (voortgangResult.error) {
      console.error('Error fetching opdracht_voortgang:', voortgangResult.error);
    }
    
    if (inzendingenResult.error) {
      console.error('Error fetching opdracht_inzendingen:', inzendingenResult.error);
    }

    // Combineer beide resultaten
    const voortgang = voortgangResult.data || [];
    const inzendingen = (inzendingenResult.data || []).map((item: any) => ({
      ...item,
      // Normalizeer veldnamen voor consistency
      tutorial_slug: item.tutorial_slug,
      opdracht_titel: item.opdracht_titel,
    }));

    // Merge en deduplicate op basis van tutorial_slug (laatste versie wint)
    const allVoortgang = [...voortgang, ...inzendingen];
    
    // Sorteer op created_at
    allVoortgang.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return NextResponse.json({ voortgang: allVoortgang });
  } catch (error) {
    console.error('Error in /api/opdracht/voortgang:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
