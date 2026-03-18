# AI Bewustzijn Leerpad - Implementatie Compleet

📅 Datum: 18 Maart 2026
🎯 Status: BUILD MODE - Alle componenten gebouwd

---

## ✅ Voltooid

### 1. Database Setup
- **Nieuwe tabel:** `opdracht_voortgang` in Supabase
- **Locatie:** `supabase/schema.sql` (bijgewerkt)
- **Velden:** user_email, tutorial_id, opdracht_id, antwoorden, score, feedback, status, pdf_url
- **Actie nodig:** Voer SQL uit in Supabase Dashboard → SQL Editor

**SQL uitvoeren:**
1. Ga naar https://supabase.com/dashboard/project/sddepssclfnmelilxijh/sql
2. Kopieer de inhoud van `supabase/schema.sql`
3. Plak en voer uit (Ctrl+Enter)

---

### 2. Type Definitions
- **Bestand:** `src/types/index.ts`
- **Nieuwe types:** `OpdrachtVoortgang`, `CorrectieResultaat`
- **Compleet:** ✅

---

### 3. AI Prompts
- **Locatie:** `src/lib/opdracht-prompts/ai-bewustzijn.ts`
- **4 opdrachten:**
  - promptVerantwoordingsmatrix (Module 1)
  - promptBetrouwbaarheidsscan (Module 2)
  - promptParticipatieplan (Module 3)
  - promptEvaluatieprotocol (Module 4)
- **Compleet:** ✅

---

### 4. API Routes
- **POST** `/api/opdracht/voortgang/indienen` - Indienen + AI correctie
- **POST** `/api/opdracht/voortgang/draft` - Concept opslaan
- **GET** `/api/opdracht/voortgang?user_email=...` - Eigen voortgang ophalen
- **GET** `/api/admin/voortgang` - Alle voortgang (admin)
- **POST** `/api/admin/voortgang` - CSV export
- **Compleet:** ✅

---

### 5. PDF Export
- **Library:** `jspdf` (geïnstalleerd)
- **Bestand:** `src/lib/pdf/opdracht-pdf.ts`
- **Functionaliteit:** Generate PDF met instructies, antwoorden, feedback, score
- **Compleet:** ✅

---

### 6. UI Components
- **OpdrachtTekstComponent.tsx** - Tekst-based opdrachten met AI correctie
- **OpdrachtTekstClient.tsx** - Client wrapper (no SSR)
- **Mijn Voortgang page** - `/mijn-voortgang` - Eigen voortgang bekijken
- **Admin Voortgang page** - `/admin/voortgang` - Dashboard met filters + CSV export
- **Compleet:** ✅

---

### 7. Sanity Content (4 Modules)
Geïmporteerd in Sanity (production dataset):

1. **Module 1: Visievorming – De Mens aan het Roer**
   - Slug: `ai-bewustzijn-module-1`
   - Opdracht: De Verantwoordingsmatrix

2. **Module 2: Betrouwbaarheid Toetsen**
   - Slug: `ai-bewustzijn-module-2`
   - Opdracht: De Betrouwbaarheidsscan

3. **Module 3: Het Didactische Proces (6 Stappen)**
   - Slug: `ai-bewustzijn-module-3`
   - Opdracht: Participatieplan

4. **Module 4: Professionalisering & Netwerk**
   - Slug: `ai-bewustzijn-module-4`
   - Opdracht: Evaluatieprotocol

**Alle opdrachten zijn verplicht** (`verplicht: true`)

---

### 8. Tutorial Page Integratie
- **Bestand:** `src/app/tutorials/[slug]/page.tsx`
- **Logica:** Automatisch detecteert of tutorial in categorie "ai-bewustzijn" → gebruikt `OpdrachtTekstComponent`
- **Compleet:** ✅

---

## ⚠️ Nog te doen (Manual)

### 1. Supabase SQL Uitvoeren
Voer het schema uit in Supabase:
```bash
# Of handmatig:
https://supabase.com/dashboard/project/sddepssclfnmelilxijh/sql
# Kopieer supabase/schema.sql → Plak → Uitvoeren
```

### 2. Ollama Server Controleren
Zorg dat Ollama draait op http://localhost:11434
```bash
# Check of Ollama draait
curl http://localhost:11434/api/tags

# Start indien nodig
ollama serve
```

### 3. Sanity Controle
De 4 AI bewustzijn modules zijn nu in de "AI Tools" categorie.
Detectie werkt automatisch: `category.slug.current === 'ai-tools' && title.includes('Module')`

Optioneel: Maak een nieuwe "AI bewustzijn" categorie in Sanity Studio als je ze apart wilt houden.

### 4. Leerpad "AI Bewustzijn" aanmaken
Maak een nieuw leerpad in Sanity met de 4 modules:
```json
{
  "_type": "leerpad",
  "title": "AI Bewustzijn",
  "slug": "ai-bewustzijn",
  "modules": [
    "ai-bewustzijn-module-1",
    "ai-bewustzijn-module-2",
    "ai-bewustzijn-module-3",
    "ai-bewustzijn-module-4"
  ]
}
```

---

## 🧪 Testing Flow

### Als Leerkracht:
1. Ga naar `/tutorials/ai-bewustzijn-module-1`
2. Vul de vragen in
3. Klik "Concept opslaan" → status wordt "bezig"
4. Vul alles in → klik "Indienen"
5. AI correctie wordt uitgevoerd (Ollama qwen2.5:7b)
6. Score + feedback verschijnt
7. Download PDF knop beschikbaar
8. Bekijk voortgang op `/mijn-voortgang`

### Als Admin:
1. Ga naar `/admin/voortgang`
2. Bekijk overzicht van alle inzendingen
3. Filter op status
4. Exporteer CSV

---

## 📊 Database Schema

**Tabel: `opdracht_voortgang`**
```sql
CREATE TABLE opdracht_voortgang (
  id UUID PRIMARY KEY,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  tutorial_id TEXT NOT NULL,
  tutorial_slug TEXT NOT NULL,
  opdracht_id TEXT NOT NULL,
  opdracht_titel TEXT NOT NULL,
  antwoorden JSONB NOT NULL DEFAULT '{}',
  voltooid BOOLEAN NOT NULL DEFAULT FALSE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  feedback TEXT,
  correctie_data JSONB,
  pdf_url TEXT,
  status TEXT NOT NULL DEFAULT 'niet_begonnen',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

**Statussen:**
- `niet_begonnen` - Opdracht nog niet gestart
- `bezig` - Concept opgeslagen, nog niet ingediend
- `ingediend` - Ingediend, wacht op correctie
- `voltooid` - Gecorrigeerd met score + feedback
- `gekeurd` - Handmatige review (optioneel)

---

## 🔐 Security

**RLS Policies:**
- Users zien alleen hun eigen voortgang (`user_email = auth.jwt() ->> 'email'`)
- Service role (server-side) kan alles (admin endpoints)

**API Routes:**
- `/api/admin/voortgang` → Gebruikt `SUPABASE_SERVICE_ROLE_KEY` → Server-side only
- `/api/opdracht/voortgang/*` → Gebruikt `SUPABASE_ANON_KEY` → Client-side met RLS

---

## 🚀 Deploy Checklist

- [ ] Supabase SQL uitvoeren
- [ ] Sanity categorie "AI bewustzijn" aanmaken
- [ ] Sanity leerpad aanmaken
- [ ] Ollama server draaiend (lokaal)
- [ ] Test alle 4 modules
- [ ] Test AI correctie
- [ ] Test PDF download
- [ ] Test admin dashboard
- [ ] Deploy naar Vercel (als alles werkt)

---

## 📝 Notes

**AI Correctie:**
- Primair: Ollama qwen2.5:7b (lokaal, gratis)
- Fallback: Z.ai GLM-4.7 (cloud API)
- JSON output: Strikte parsing met regex

**PDF Export:**
- Client-side generatie via jsPDF
- Wordt niet opgeslagen in Supabase (op aanvraag gegenereerd)

**UI:**
- Responsive design
- Loading states
- Error handling
- Draft save functionality

---

## 🆘 Troubleshooting

**Probleem:** AI geeft geen JSON terug
**Oplossing:** Controleer prompt in `src/lib/opdracht-prompts/ai-bewustzijn.ts` → Zorg dat "ANTWOORD ALLEEN IN JSON-formaat" duidelijk is

**Probleem:** Ollama connection error
**Oplossing:** Check of `http://localhost:11434/api/generate` bereikbaar is → `curl http://localhost:11434/api/tags`

**Probleem:** Sanity tutorials niet zichtbaar
**Oplossing:** Controleer status → moet `published` zijn

**Probleem:** Supabase RLS policies blokkeren
**Oplossing:** Check SQL output → Controleer policies met `SELECT * FROM pg_policies WHERE tablename = 'opdracht_voortgang';`

---

**Gebouwd door:** ManuJunior
**Versie:** 1.0.0
**Datum:** 2026-03-18
