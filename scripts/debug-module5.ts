import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function main() {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('\n=== OPRACHT_VOORTGANG ===');
  const { data: voortgang, error: vError } = await supabase
    .from('opdracht_voortgang')
    .select('user_email, tutorial_slug, score, status')
    .eq('user_email', 'manuel.vandyck@classroomatheneum.be');
  
  if (vError) console.error('Error:', vError);
  console.log('Data:', JSON.stringify(voortgang, null, 2));

  console.log('\n=== OPRACHT_INZENDINGEN ===');
  const { data: inzendingen, error: iError } = await supabase
    .from('opdracht_inzendingen')
    .select('user_email, tutorial_slug, score, status')
    .eq('user_email', 'manuel.vandyck@classroomatheneum.be');
  
  if (iError) console.error('Error:', iError);
  console.log('Data:', JSON.stringify(inzendingen, null, 2));

  console.log('\n=== COMBINED ===');
  const all = [...(voortgang || []), ...(inzendingen || [])];
  console.log('All modules for Manuel:', all.map(v => v.tutorial_slug));
}

main().catch(console.error);
