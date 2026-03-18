import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
      antwoorden,
      status = 'bezig',
    } = body;

    if (!user_email || !opdracht_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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
      const { error } = await supabase
        .from('opdracht_voortgang')
        .update({
          antwoorden,
          status,
        })
        .eq('id', existing.id);

      if (error) {
        throw error;
      }
    } else {
      // Maak nieuwe
      const { error } = await supabase
        .from('opdracht_voortgang')
        .insert({
          user_email,
          user_name: user_name || 'Onbekend',
          tutorial_id: tutorial_id || '',
          tutorial_slug: tutorial_slug || '',
          opdracht_id,
          opdracht_titel: opdracht_titel || '',
          antwoorden,
          status,
        });

      if (error) {
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in /api/opdracht/voortgang/draft:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
