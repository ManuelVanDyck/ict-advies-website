import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Complete answer to score mapping based on actual spreadsheet data
const ANSWER_SCORES: Record<string, number> = {
  // DigCompEdu - Communicatie
  'Regelmatig, verschillende tools voor verschillende doelen': 3,
  'Vaak, ik kies bewust de juiste tool voor elke situatie': 4,
  'Altijd, ik help anderen met digitale communicatie': 5,
  
  // DigCompEdu - Samenwerking
  'Ik gebruik gedeelde drives en documenten': 3,
  'Ik gebruik digitale communities om ideeën uit te wisselen': 4,
  'Ik leid samenwerkingsprojecten en help anderen': 5,
  
  // DigCompEdu - Reflectie
  'Ik ontwikkel visies voor digitale educatie': 6,
  
  // DigCompEdu - Leermaterialen
  'Ik creëer mijn eigen leermaterialen': 4,
  'Ik creëer mijn eigen digitale leermaterialen': 4,
  'Ik deel mijn materialen met collega\'s': 5,
  'Ik ontwikkel innovatieve digitale content': 6,
  
  // DigCompEdu - Lesgeven
  'Ik integreer ze regelmatig in mijn lessen': 3,
  'Ik integreer regelmatig digitale tools in mijn lessen': 3,
  'Ik kies bewust de juiste tools voor elke leersituatie': 4,
  'Ik begeleid collega\'s bij digitaal lesgeven': 5,
  'Ik ontwikkel nieuwe digitale lesmethoden': 6,
  
  // DigCompEdu - Evaluatie
  'Ik gebruik diverse digitale evaluatievormen': 3,
  'Ik gebruik diverse evaluatievormen': 3,
  'Ik analyseer digitale data om mijn lessen te verbeteren': 4,
  'Ik help collega\'s met digitale evaluatie': 5,
  'Ik ontwikkel innovatieve evaluatiemethoden': 6,
  
  // AI Literacy - Kennis
  'Ik kan AI-tools vergelijken en evalueren': 3,
  'Ik begrijp de technische principes achter AI': 4,
  
  // AI Literacy - Ethiek
  'Ik weet dat er ethische kwesties bestaan': 2,
  'Ik weet dat er ethische kwesties zijn': 2,
  'Ik kan voorbeelden noemen van AI ethiek': 2,
  'Ik bespreek AI ethiek met collega\'s/leerlingen': 3,
  'Ik ontwikkel richtlijnen voor verantwoord AI-gebruik': 4,
  
  // AI Literacy - Gebruik
  'Ik gebruik AI voor eenvoudige taken': 2,
  'Ik integreer AI creatief in mijn lessen': 3,
  'Ik configureer en pas AI-systemen aan': 4,
  
  // AI Literacy - Onderwijs
  'Ik zie kansen maar ben alert op de risico\'s': 2,
  'Ik zie kansen maar ook risico\'s': 2,
  'Ik integreer AI bewust in mijn pedagogiek': 3,
  'Ik ontwikkel nieuwe AI-onderwijsmethoden': 4,
  
  // Verantwoorde AI - Basisvoorwaarden
  'Ik heb er nog nooit van gehoord': 1,
  'Ik herken enkele termen': 2,
  'Ik kan de meeste voorwaarden uitleggen': 3,
  'Ik pas ze actief toe in mijn werk': 3,
  
  // Verantwoorde AI - Stappen
  'Ik test een tool en beslis direct': 2,
  'Ik vergelijk tools en lees reviews': 3,
  'Ik volg een systematische evaluatiemethode': 3,
  
  // Verantwoorde AI - Verantwoordelijkheid
  'Vooral de ICT-coördinator': 2,
  'Ik neem zelf verantwoordelijkheid': 3,
  'We delen verantwoordelijkheid als team': 3,
  
  // Verantwoorde AI - Evaluatie
  'Ik kijk naar gebruiksvriendelijkheid': 2,
  'Ik betrek collega\'s bij de keuze': 3,
  'Ik gebruik een evaluatiekader': 3,
  
  // Verantwoorde AI - Samenwerking
  'Ik deel soms ervaringen met collega\'s': 2,
  'Ik organiseer sessies om kennis te delen': 3,
  'Ik begeleid collega\'s bij AI-implementatie': 3,
};

// Bepaal niveau op basis van totaalscore
function getNiveau(totaalscore: number): { niveau: string; profiel: string; leerpaden: string[]; volgendNiveau: string | null } {
  // AI bewustzijn is verplicht voor iedereen
  const aiBewustzijn = 'ai-bewustzijn';
  
  if (totaalscore < 25) {
    return {
      niveau: 'A1 - Newcomer',
      profiel: 'starter',
      leerpaden: ['digitale-basis', aiBewustzijn],
      volgendNiveau: 'A2 - Explorer'
    };
  } else if (totaalscore < 35) {
    return {
      niveau: 'A2 - Explorer',
      profiel: 'starter',
      leerpaden: ['digitale-basis', 'digitale-integratie', aiBewustzijn],
      volgendNiveau: 'B1 - Integrator'
    };
  } else if (totaalscore < 45) {
    return {
      niveau: 'B1 - Integrator',
      profiel: 'integrator',
      leerpaden: ['digitale-integratie', 'digitale-verdieping', aiBewustzijn],
      volgendNiveau: 'B2 - Expert'
    };
  } else if (totaalscore < 55) {
    return {
      niveau: 'B2 - Expert',
      profiel: 'expert',
      leerpaden: ['digitale-verdieping', 'digitale-innovatie', aiBewustzijn],
      volgendNiveau: 'C1 - Leader'
    };
  } else {
    return {
      niveau: 'C1 - Leader',
      profiel: 'leader',
      leerpaden: ['digitale-innovatie', aiBewustzijn],
      volgendNiveau: null
    };
  }
}

// Haal bevraging data op uit JSON cache
function getBevragingData(): { headers: string[]; rows: any[]; updated: string } | null {
  try {
    const dataPath = join(process.env.HOME || '/Users/manu', '.openclaw', 'workspace', 'data', 'bevraging-data.json');
    if (!existsSync(dataPath)) {
      return null;
    }
    const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
    return data;
  } catch (error) {
    console.error('Kon bevraging data niet lezen:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 });
    }

    const bevragingData = getBevragingData();
    
    if (!bevragingData || bevragingData.rows.length === 0) {
      return NextResponse.json({
        email: session.user.email,
        heeftBevraging: false,
        message: 'Nog geen bevragingsdata beschikbaar'
      });
    }

    const { headers, rows } = bevragingData;
    
    // Zoek de email kolom
    const emailKolom = headers.find((h: string) => 
      h.toLowerCase().includes('e-mail') || 
      h.toLowerCase().includes('email') ||
      h.toLowerCase().includes('mail')
    );
    
    if (!emailKolom) {
      return NextResponse.json({
        email: session.user.email,
        heeftBevraging: false,
        message: 'Email kolom niet gevonden in bevraging data'
      });
    }
    
    // Zoek de rij die overeenkomt met het ingelogde emailadres
    const userEmail = session.user?.email;
    if (!userEmail) {
      return NextResponse.json({
        email: session.user?.email,
        heeftBevraging: false,
        message: 'Geen email gevonden'
      });
    }

    const userRow = rows.find((row: any) => {
      const email = row[emailKolom];
      return email && email.toString().toLowerCase() === userEmail.toLowerCase();
    });
    
    if (!userRow) {
      return NextResponse.json({
        email: session.user.email,
        heeftBevraging: false,
        message: 'Je hebt de bevraging nog niet ingevuld'
      });
    }
    
    // Kolom namen mapping (exacte namen uit spreadsheet)
    const kolomNamen = {
      communicatie: 'Hoe vaak gebruik je digitale tools voor communicatie met collega\'s, leerlingen of ouders?',
      samenwerking: 'Hoe werk je digitaal samen met collega\'s?',
      reflectie: 'Hoe evalueer je je eigen digitale vaardigheden?',
      leermaterialen: 'Hoe gebruik je digitale leermaterialen?',
      lesgeven: 'Hoe integreer je digitale tools in je lessen?',
      evaluatie: 'Hoe gebruik je digitale tools voor evaluatie?',
      ai_kennis: 'Hoe goed begrijp je wat AI is en hoe het werkt?',
      ai_ethiek: 'Hoe bewust ben je van ethische kwesties rond AI?',
      ai_gebruik: 'Hoe gebruik je AI tools in je werk?',
      ai_onderwijs: 'Hoe zie je de rol van AI in het onderwijs?',
      va_basis: 'Ken je de 7 basisvoorwaarden voor verantwoorde AI in het onderwijs?',
      va_sleutel: 'Hoe goed ken je de 7 sleutelvoorwaarden voor betrouwbare AI?',
      va_stappen: 'Welke stappen doorloop je bij het gebruiken van AI-tools?',
      va_verantwoordelijkheid: 'Wie is verantwoordelijk voor verantwoorde AI in jouw school?',
      va_evaluatie: 'Hoe evalueer je een nieuwe AI-tool voor gebruik in de les?',
      va_samenwerking: 'Hoe betrek je anderen bij AI-gebruik in je school?'
    };
    
    // Bereken scores
    let totaalscore = 0;
    const scores: { categorie: string; score: number; max: number }[] = [];
    
    // DigCompEdu (6 vragen)
    let digcompeduScore = 0;
    const digcompeduVragen = [
      kolomNamen.communicatie,
      kolomNamen.samenwerking,
      kolomNamen.reflectie,
      kolomNamen.leermaterialen,
      kolomNamen.lesgeven,
      kolomNamen.evaluatie
    ];
    
    for (const kolom of digcompeduVragen) {
      if (kolom && userRow[kolom]) {
        const score = ANSWER_SCORES[userRow[kolom]] || 0;
        digcompeduScore += score;
      }
    }
    scores.push({ categorie: 'DigCompEdu', score: digcompeduScore, max: 36 });
    totaalscore += digcompeduScore;
    
    // AI Literacy (4 vragen)
    let aiLiteracyScore = 0;
    const aiVragen = [
      kolomNamen.ai_kennis,
      kolomNamen.ai_ethiek,
      kolomNamen.ai_gebruik,
      kolomNamen.ai_onderwijs
    ];
    
    for (const kolom of aiVragen) {
      if (kolom && userRow[kolom]) {
        const score = ANSWER_SCORES[userRow[kolom]] || 0;
        aiLiteracyScore += score;
      }
    }
    scores.push({ categorie: 'AI Literacy', score: aiLiteracyScore, max: 16 });
    totaalscore += aiLiteracyScore;
    
    // Verantwoorde AI (6 vragen)
    let verantwoordeAiScore = 0;
    const vaVragen = [
      kolomNamen.va_basis,
      kolomNamen.va_sleutel,
      kolomNamen.va_stappen,
      kolomNamen.va_verantwoordelijkheid,
      kolomNamen.va_evaluatie,
      kolomNamen.va_samenwerking
    ];
    
    for (const kolom of vaVragen) {
      if (kolom && userRow[kolom]) {
        const score = ANSWER_SCORES[userRow[kolom]] || 0;
        verantwoordeAiScore += score;
      }
    }
    scores.push({ categorie: 'Verantwoorde AI', score: verantwoordeAiScore, max: 18 });
    totaalscore += verantwoordeAiScore;

    const resultaat = getNiveau(totaalscore);

    return NextResponse.json({
      email: session.user.email,
      heeftBevraging: true,
      totaalscore,
      maxScore: 70,
      scores,
      niveau: resultaat.niveau,
      profiel: resultaat.profiel,
      aanbevolenLeerpaden: resultaat.leerpaden,
      volgendNiveau: resultaat.volgendNiveau,
      timestamp: userRow[headers[0]],
      dataUpdated: bevragingData.updated
    });

  } catch (error) {
    console.error('Bevraging API error:', error);
    return NextResponse.json({ 
      error: 'Er ging iets mis bij het ophalen van de resultaten' 
    }, { status: 500 });
  }
}
