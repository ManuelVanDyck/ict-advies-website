# Sanity CMS Setup

## Stap 1: Sanity Account Aanmaken
1. Ga naar https://www.sanity.io
2. Klik op "Start free"
3. Maak account aan (Google/GitHub/Email)

## Stap 2: Nieuw Project
1. In Sanity dashboard, klik "New project"
2. Naam: "ICT-Advies"
3. Kies "Clean project with no pre-defined schemas"
4. Kopieer het **Project ID** (bv. abc123xyz)

## Stap 3: Environment Variables
1. Open `.env.local` in dit project
2. Vul in:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=abc123xyz
   NEXT_PUBLIC_SANITY_DATASET=production
   ```

## Stap 4: CORS Instellen
1. In Sanity dashboard → Settings → API
2. Voeg CORS origins toe:
   - http://localhost:3000
   - https://jouw-domein.vercel.app

## Stap 5: Start Development
```bash
npm run dev
```

## Stap 6: Open Studio
Ga naar: http://localhost:3000/studio

## Categorieën Toevoegen (Eerst doen!)
1. Open Studio
2. Maak categorieën aan:
   - Google Workspace
   - Clevertouch
   - Tips & Tricks
   - Basisgebruik

## Tutorials Schrijven
1. Klik "Create" → "Tutorial"
2. Vul titel, samenvatting in
3. Selecteer categorie
4. Voeg blokken toe:
   - Tekst (rich text editor)
   - Afbeelding (upload of sleep)
   - YouTube (plak URL)
   - Video bestand (upload)
5. Publiceer!

## Tutorials Weergeven
Na het aanmaken worden tutorials automatisch op de website getoond.
