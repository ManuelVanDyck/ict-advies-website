import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateOpdrachtPDF, PDFData } from '@/lib/pdf/opdracht-pdf';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Haal voortgang uit beide tabellen
    const [voortgangResult, inzendingenResult] = await Promise.all([
      supabase
        .from('opdracht_voortgang')
        .select('*')
        .eq('id', id)
        .single(),
      supabase
        .from('opdracht_inzendingen')
        .select('*')
        .eq('id', id)
        .single(),
    ]);

    const voortgang = voortgangResult.data || inzendingenResult.data;

    if (!voortgang) {
      return NextResponse.json(
        { error: 'Voortgang niet gevonden' },
        { status: 404 }
      );
    }

    // Format the data for PDF
    const data: PDFData = {
      tutorial: voortgang.tutorial_slug || '',
      opdracht_titel: voortgang.opdracht_titel || '',
      instructie: 'Deze opdracht is gemaakt als onderdeel van een leerpad.',
      antwoorden: voortgang.antwoorden || {},
      score: voortgang.score || 0,
      feedback: voortgang.feedback || '',
      details: typeof voortgang.correctie_data === 'string' 
        ? JSON.parse(voortgang.correctie_data)
        : undefined,
      user_name: voortgang.user_name || 'Onbekend',
      date: new Date(voortgang.completed_at || voortgang.created_at).toLocaleDateString('nl-BE'),
    }

    // Generate PDF
    const pdfBlob = generateOpdrachtPDF(data)

    // Return PDF
    return new NextResponse(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="opdracht-${data.opdracht_titel.replace(/[^a-z0-9()]/g, '_')}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
