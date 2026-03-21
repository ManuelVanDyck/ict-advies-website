import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@/lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin: Alle voortgang ophalen (uit beide tabellen)
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userEmail = session.user.email;
  const hasAdminAccess = userEmail.includes('@classroomatheneum.be');

  if (!hasAdminAccess) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const tutorial_id = searchParams.get('tutorial_id');
    const status = searchParams.get('status');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Haal uit beide tabellen
    const [voortgangResult, inzendingenResult] = await Promise.all([
      supabase
        .from('opdracht_voortgang')
        .select('id, user_name, user_email, tutorial_slug, opdracht_titel, antwoorden, score, feedback, correctie_data, status, created_at, completed_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('opdracht_inzendingen')
        .select('id, user_name, user_email, tutorial_slug, opdracht_titel, sheet_url, pdf_url, score, feedback, correctie_data, status, created_at, completed_at')
        .order('created_at', { ascending: false }),
    ]);

    let voortgang = voortgangResult.data || [];
    let inzendingen = inzendingenResult.data || [];

    // Apply filters
    if (tutorial_id) {
      voortgang = voortgang.filter((v: any) => v.tutorial_id === tutorial_id);
      inzendingen = inzendingen.filter((v: any) => v.tutorial_id === tutorial_id);
    }

    if (status) {
      voortgang = voortgang.filter((v: any) => v.status === status);
      inzendingen = inzendingen.filter((v: any) => v.status === status);
    }

    // Combineer en sorteer
    const allVoortgang = [...voortgang, ...inzendingen];
    allVoortgang.sort((a: any, b: any) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    if (voortgangResult.error || inzendingenResult.error) {
      console.error('Errors:', voortgangResult.error, inzendingenResult.error);
    }

    return NextResponse.json({ voortgang: allVoortgang });
  } catch (error) {
    console.error('Error in /api/admin/voortgang:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin: CSV Export
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userEmail = session.user.email;
  const hasAdminAccess = userEmail.includes('@classroomatheneum.be');

  if (!hasAdminAccess) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }
  try {
    const { searchParams } = new URL(request.url);
    const tutorial_id = searchParams.get('tutorial_id');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let query = supabase
      .from('opdracht_voortgang')
      .select('id, user_name, user_email, tutorial_slug, opdracht_titel, score, status, created_at')
      .order('created_at', { ascending: false });

    if (tutorial_id) {
      query = query.eq('tutorial_id', tutorial_id);
    }

    const { data: voortgang, error } = await query;

    if (error) {
      throw error;
    }

    // Generate CSV
    const headers = ['Naam', 'Email', 'Tutorial', 'Opdracht', 'Score', 'Status', 'Datum'];
    const rows = voortgang.map((v: any) => [
      v.user_name,
      v.user_email,
      v.opdracht_titel,
      v.score || '-',
      v.status,
      new Date(v.created_at).toLocaleDateString('nl-BE'),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="voortgang-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error in /api/admin/voortgang (POST):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
