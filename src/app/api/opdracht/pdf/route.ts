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
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Haal voortgang op
    const { data: voortgang, error } = await supabase
      .from('opdracht_voortgang')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !voortgang) {
      return NextResponse.json({ error: 'Voortgang niet gevonden' }, { status: 404 });
    }

    // Bouw PDF data
    const pdfData: PDFData = {
      tutorial: voortgang.tutorial_slug || 'Onbekende tutorial',
      opdracht_titel: voortgang.opdracht_titel || 'Onbekende opdracht',
      instructie: 'Raadpleeg de tutorial voor de volledige instructies.',
      antwoorden: voortgang.antwoorden || {},
      score: voortgang.score,
      feedback: voortgang.feedback,
      details: voortgang.correctie_data || undefined,
      user_name: voortgang.user_name || 'Onbekend',
      date: voortgang.completed_at 
        ? new Date(voortgang.completed_at).toLocaleDateString('nl-BE')
        : new Date(voortgang.created_at).toLocaleDateString('nl-BE'),
    };

    // Genereer PDF
    const blob = generateOpdrachtPDF(pdfData);
    const buffer = await blob.arrayBuffer();

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="opdracht-${voortgang.opdracht_titel?.replace(/\s+/g, '-') || 'export'}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('[PDF] Error:', error);
    return NextResponse.json({ error: 'PDF generatie mislukt' }, { status: 500 });
  }
}
