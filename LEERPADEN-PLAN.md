# Leerpaden & Attestatie Systeem - Plan

## Overzicht

Een systeem waarbij leerkrachten:
1. Inloggen met hun school e-mail
2. Leerpaden volgen (reeksen van tutorials)
3. Opdrachten maken en indienen
4. Beoordeeld worden door ICT-coördinator
5. Attesten ontvangen bij geslaagde beoordeling

---

## Architectuur

### 1. Authenticatie

**Optie A: NextAuth.js + Google Workspace (Aanbevolen)**
- Gebruikt bestaande Google Workspace accounts
- Alleen @classroomatheneum.be emails toegelaten
- Geen extra wachtwoorden nodig

**Optie B: Magic Link (email-only)**
- Gebruiker voert email in
- Ontvangt login link per mail
- Simpel maar minder veilig

**Aanbeveling:** Optie A - NextAuth.js met Google provider

### 2. Sanity Schema's

#### Leerpad
```typescript
{
  name: 'leerpad',
  fields: [
    { name: 'titel', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'beschrijving', type: 'text' },
    { name: 'tutorials', type: 'array', of: [{ type: 'reference', to: [{ type: 'tutorial' }] }] },
    { name: 'opdracht', type: 'text' }, // Wat ze moeten doen
    { name: 'criteria', type: 'text' }, // Beoordelingscriteria
    { name: 'duur', type: 'string' }, // bv. "2 uur"
    { name: 'niveau', type: 'string', options: ['beginner', 'gevorderd'] },
    { name: 'actief', type: 'boolean' }
  ]
}
```

#### Deelnemer (in Supabase, niet Sanity)
```sql
CREATE TABLE deelnemers (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  naam VARCHAR,
  created_at TIMESTAMP
);
```

#### Voortgang (in Supabase)
```sql
CREATE TABLE voortgang (
  id UUID PRIMARY KEY,
  deelnemer_id UUID REFERENCES deelnemers(id),
  leerpad_id VARCHAR, // Sanity document ID
  status VARCHAR, // 'niet_begonnen', 'bezig', 'ingediend', 'goedgekeurd', 'afgewezen'
  tutorials_voltooid JSONB, // [{ tutorialId: string, voltooid: boolean }]
  opdracht_antwoord TEXT,
  ingediend_op TIMESTAMP,
  beoordeeld_op TIMESTAMP,
  beoordeling TEXT,
  attest_verzonden BOOLEAN DEFAULT false
);
```

### 3. Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEERPAD WORKFLOW                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. LOGIN                                                        │
│     └─> Google Workspace (alleen @school.be)                    │
│                                                                  │
│  2. LEERPAD KIEZEN                                               │
│     └─> Zie alle beschikbare leerpaden                          │
│     └─> Zie eigen voortgang                                      │
│                                                                  │
│  3. TUTORIALS VOLGEN                                             │
│     └─> Markeer als "gelezen"                                    │
│     └─> Alle tutorials moeten voltooid zijn                      │
│                                                                  │
│  4. OPDRACHT MAKEN                                               │
│     └─> Beschrijving van opdracht                                │
│     └─> Upload antwoord (tekst, bestand, link, etc.)            │
│     └─> Dien in                                                  │
│                                                                  │
│  5. BEOORDELING (door ICT-coördinator)                          │
│     └─> Bekijk ingediende opdrachten                             │
│     └─> Keur goed of afkeuren                                    │
│     └─> Optioneel: feedback                                      │
│                                                                  │
│  6. ATTEST                                                       │
│     └─> Bij goedkeuring: automatisch PDF attest                  │
│     └─> Verzend per email                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Pagina's

| Pagina | URL | Functie |
|--------|-----|---------|
| Login | `/login` | Google OAuth login |
| Dashboard | `/dashboard` | Overzicht leerpaden & voortgang |
| Leerpad | `/leerpaden/[slug]` | Tutorials + opdracht |
| Admin | `/admin` | Beoordelingen (alleen ICT-coörd) |

### 5. Technische Stack

| Component | Technologie |
|-----------|-------------|
| Frontend | Next.js 16 (bestaand) |
| CMS | Sanity (bestaand) |
| Authenticatie | NextAuth.js + Google |
| Database | Supabase (PostgreSQL) |
| Email | Resend (gratis 3000/dag) |
| PDF Attest | @react-pdf/renderer |

### 6. Sanity Schema Uitbreidingen

**Nieuwe schemas nodig:**
1. `leerpad` - Leerpaden definitie
2. `opdracht` - Opdrachten binnen leerpaden (optioneel apart)

**Aanpassingen aan `tutorial`:**
- Geen wijzigingen nodig - tutorials blijven hetzelfde

### 7. Supabase Setup

**Tabellen:**
1. `deelnemers` - Geregistreerde gebruikers
2. `voortgang` - Voortgang per leerpad
3. `beoordelingen` - Beoordelingen door admin

**Row Level Security:**
- Deelnemers zien alleen eigen voortgang
- Admin (ICT-coörd) ziet alles

### 8. Email Templates

**Attest Email:**
```
Beste [Naam],

Gefeliciteerd! Je hebt het leerpad "[Leerpad Titel]" succesvol afgerond.

In bijlage vind je je attest van deelname.

Met vriendelijke groeten,
ICT-coördinator
GO! atheneum Gentbrugge
```

### 9. Kosten

| Service | Maandelijkse Kosten |
|---------|---------------------|
| Sanity | €0 (free tier) |
| Supabase | €0 (free tier: 500MB, 50K users) |
| Resend (email) | €0 (3.000 emails/dag) |
| Vercel | €0 (free tier) |
| **Totaal** | **€0/maand** |

### 10. Ontwikkeling - Fases

#### Fase 1: Basis (1-2 dagen)
- [ ] NextAuth.js setup met Google
- [ ] Email whitelist (@classroomatheneum.be)
- [ ] Login pagina
- [ ] Dashboard basis

#### Fase 2: Leerpaden (2-3 dagen)
- [ ] Sanity schema `leerpad`
- [ ] Leerpaden overzicht pagina
- [ ] Leerpad detail pagina
- [ ] Tutorial voortgang tracking

#### Fase 3: Opdrachten (2-3 dagen)
- [ ] Opdracht formulier
- [ ] Bestanden upload (Supabase Storage)
- [ ] Indiening workflow

#### Fase 4: Beoordeling (1-2 dagen)
- [ ] Admin dashboard
- [ ] Beoordeling interface
- [ ] Goedkeuren/Afkeuren workflow

#### Fase 5: Attesten (1-2 dagen)
- [ ] PDF template
- [ ] PDF generatie
- [ ] Email verzending

#### Fase 6: Testing & Polish (1 dag)
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] UI polish

**Geschatte totaal tijd:** 8-13 dagen

---

## Volgende Stappen

1. **Goedkeuring plan** - Is dit wat je voor ogen hebt?
2. **Supabase account** - Aanmaken (gratis)
3. **Google OAuth** - Configureren in Google Cloud Console
4. **Start Fase 1** - Authenticatie setup

---

*Document versie: 1.0*
*Laatst geüpdatet: 2026-03-01*
