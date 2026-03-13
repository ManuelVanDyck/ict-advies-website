# Google OAuth Setup Handleiding

Volg deze stappen om Google OAuth credentials aan te maken.

## Stap 1: Ga naar Google Cloud Console

1. Open https://console.cloud.google.com/
2. Log in met je Google account
3. Maak een nieuw project of selecteer een bestaand project

## Stap 2: API's inschakelen

1. In het linkermenu, klik op **APIs & Services** → **Library**
2. Zoek naar **Google+ API** en klik erop
3. Klik op **Enable**

## Stap 3: OAuth Consent Screen

1. In het linkermenu, klik op **APIs & Services** → **OAuth consent screen**
2. Kies **External** user type (of Internal als je een Google Workspace organisatie hebt)
3. Klik **Create**

Vul de volgende velden in:
- **App name:** ICT-Advies
- **User support email:** Jouw email
- **App logo:** (optioneel)
- **Application home page:** http://localhost:3000 (later: je productie URL)
- **Application privacy policy link:** (optioneel)
- **Application terms of service link:** (optioneel)
- **Authorized domains:** (optioneel)
- **Developer contact information:** Jouw email

Klik **Save and Continue**

## Stap 4: Scopes

1. Klik op **Add or Remove Scopes**
2. Selecteer:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
3. Klik **Update** en dan **Save and Continue**

## Stap 5: Test Users (alleen voor External)

1. Voeg je eigen email toe als test user
2. Klik **Add** en dan **Save and Continue**

## Stap 6: OAuth Client ID aanmaken

1. In het linkermenu, klik op **APIs & Services** → **Credentials**
2. Klik op **Create Credentials** → **OAuth client ID**
3. Selecteer **Web application**
4. Vul in:
   - **Name:** ICT-Advies Web Client
   - **Authorized JavaScript origins:** 
     - `http://localhost:3000`
     - (later: je productie URL)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - (later: `https://jouw-domein.be/api/auth/callback/google`)
5. Klik **Create**

## Stap 7: Credentials kopiëren

Na het aanmaken zie je:
- **Your Client ID** - Kopieer dit
- **Your Client Secret** - Kopieer dit

## Stap 8: Toevoegen aan .env.local

Open `.env.local` en vul in:

```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
```

## Stap 9: Herstart Next.js

```bash
# Stop de huidige server (Ctrl+C)
cd ~/Dev/ict-advies-website
npm run dev
```

## Stap 10: Testen

1. Ga naar http://localhost:3000/login
2. Klik op "Inloggen met Google"
3. Log in met je @atheneumgentbrugge.be email
4. Je wordt doorgestuurd naar het dashboard

---

## Probleemoplossing

**Fout: "Access blocked: This app's request is invalid"**
- Check of de redirect URI exact overeenkomt
- Zorg dat je bent toegevoegd als test user (bij External)

**Fout: "Sign in failed"**
- Check of je email eindigt op @atheneumgentbrugge.be
- Check de console logs voor meer details

**Fout: "Invalid Client"**
- Check of GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET correct zijn
- Herstart de server na het wijzigen van .env.local

---

*Laatst geüpdatet: 2026-03-01*
