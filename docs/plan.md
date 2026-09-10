# Umsetzungsplan: besigheim-connect

> Stand: 2026-09-09 · Lebendes Dokument - bei Fortschritt aktualisieren.

## Ausgangslage (Ist-Zustand)

- **Frontend:** Vite + React SPA (shadcn-ui, Tailwind), statisch auf GitHub Pages
  (`unser-besigheim.de`). Inhalte werden zur **Build-Zeit** aus JSON-Dateien
  gebacken (`import.meta.glob` in `src/data/*.ts`). Keine Laufzeit-DB fürs Frontend.
- **Inhalte:** JSON pro Eintrag in `src/content/<typ>/*.json`
  (`vereine`, `veranstaltungen`, `engagement`, `barrierefreiheit`).
- **Backend:** AWS CDK (Account `027825871768`, Region `eu-central-1`).
  - HTTP-API: `GET /health`, `POST /contact` (Rate-Limiting, DynamoDB, 180 Tage TTL).
  - SES-Inbound → S3 → Lambda (`mail-ingest.ts`) → Bedrock (Nova Lite) extrahiert
    strukturierte Daten → DynamoDB → bei vollständigen Daten **automatischer**
    GitHub-Commit als JSON.
- **Auth:** **Nicht vorhanden.** Kein Clerk, kein Hanko. Keine Login-/Admin-/
  Upload-/Edit-Seiten, keine Berechtigungen.

## Bekannte Probleme / Lücken

1. **Mail-Empfang nicht funktionsfähig:** Der Stack legt **keine SES-Domain-
   Verifizierung** und **keinen MX-Record** an. Domain-Mismatch: Hosted Zone ist
   `unser-besigheim.de`, konfigurierte Empfangsadresse aber `tanja.bayer@cubesoft.org`.
2. ~~**Regions-Risiko:** SES-Inbound in `eu-central-1`?~~ ✅ Geklärt (0.2): seit
   Sept 2023 verfügbar, kein Blocker.
3. **Keine Moderation:** Vollständig erkannte Mails werden ungeprüft live committet.
4. **Keine Benachrichtigungen:** Weder Kontaktformular- noch Mail-Eingänge lösen eine
   Info aus - es gibt kein Postfach, das jemand liest.
5. **Keine Vereins-Zuordnung** in den Inhalten (`orgId`), nötig für Org-Berechtigungen.
6. **Update vs. Duplikat:** Doc-ID basiert auf Hash → Korrektur erzeugt neue Datei.

## Zielarchitektur

**Content-Lifecycle:** `draft` → `needs_review` → `published` (+ `rejected`/`archived`)

- **DynamoDB = Quelle der Wahrheit** für den Editor (alle Einträge inkl. `orgId`,
  Typ, Feldern, Status, `createdBy`, Timestamps - auch veröffentlichte bleiben hier).
- **Git-Repo (`src/content/<typ>/*.json`) = nur veröffentlichte Inhalte** - Projektion,
  aus der das statische Frontend baut (Ladeweg unverändert).
- **Publish** = Admin gibt frei → Lambda committet JSON ins Repo → GitHub Actions
  baut & deployt. **Delete** (nur Admin) = JSON per Commit entfernen + DynamoDB auf
  `archived`.

**Auth (Clerk):** Jeder Verein = eine Clerk-Organization. Content trägt `orgId`.
Mitglieder bearbeiten nur Inhalte ihrer Org; Publish/Delete nur mit Admin-Rolle.
Backend-Lambdas verifizieren das Clerk-JWT (networkless via JWKS) und erzwingen die
Regeln - das SPA allein schützt nichts.

---

## Phasen

### Phase 0 - Grundlagen & Verifikation

- [ ] 0.1 **AWS-Deploy-Status live prüfen** (`BesigheimConnectBackend`). _Braucht AWS-Profil `unser-besigheim`._
- [x] 0.2 **SES-Inbound-Region klären** - ✅ Kein Blocker. SES-Inbound ist seit Sept 2023 in `eu-central-1` (Frankfurt) verfügbar. Region bleibt; MX-Ziel wird `inbound-smtp.eu-central-1.amazonaws.com` (Umsetzung in 2.3).
- [ ] 0.3 **Clerk einrichten** - Application, Organizations-Feature, Rollen (`member`, `admin`), Keys als Env-Vars. _Braucht Clerk-Account._
- [ ] 0.4 **Shared-Schema extrahieren** - Felddefinitionen (aus `mail-ingest.ts` `documentRequirements`) + TS-Interfaces (`src/data/*.ts`) in ein gemeinsames Modul.

### Phase 1 - Datenmodell & Backend-CRUD

- [ ] 1.1 DynamoDB-Content-Tabelle mit `status`, `orgId`, `type` + GSIs.
- [ ] 1.2 Clerk-JWT-Verifizierung als Lambda-Middleware (JWKS, Org-ID + Rolle aus Claims).
- [ ] 1.3 Authentifizierte API-Endpoints: list/get/create/update/publish/reject/delete (org-scoped, Delete = Admin).
- [ ] 1.4 Publish-/Delete-Service (GitHub-Commit-Logik aus `mail-ingest.ts` auslagern).

### Phase 2 - Mail-Ingest umbauen

- [ ] 2.1 Kein Auto-Commit mehr - immer nach DynamoDB als `needs_review`/`draft`.
- [ ] 2.2 Absender → Org-Mapping (best effort).
- [ ] 2.3 SES-Empfang einrichten: `EmailIdentity` + DKIM + MX-Record, Adresse `daten@unser-besigheim.de`.

### Phase 3 - Auth & Admin/Editor-Frontend

- [ ] 3.1 ClerkProvider + Login + `<OrganizationSwitcher>`, geschützte Routes.
- [ ] 3.2 Admin-Queue (`/admin`), Edit-Formular (`/admin/content/:id`), Neu-Anlegen - Formulare aus Shared-Schema, Delete nur Admin.

### Phase 4 - Notifications (Sandbox-Exit)

- [ ] 4.1 SES Production-Access beantragen + `noreply@unser-besigheim.de`-Identity mit DKIM.
- [ ] 4.2 Reviewer-Benachrichtigung bei neuer `needs_review`-Einreichung (Link zu `/admin`).
- [ ] 4.3 Optional: Bestätigung an Einreicher; Kontaktformular-Benachrichtigung.

### Phase 5 - Doku & Datenschutz

- [ ] 5.1 README aktualisieren (Lovable-Boilerplate entfernen).
- [ ] 5.2 Datenschutz-Seite um S3/DynamoDB-Speicherung ergänzen.
- [ ] 5.3 Tests für Permission-Logik.

---

## Risiken & Abhängigkeiten

- ~~SES-Inbound in `eu-central-1`~~ ✅ geklärt (0.2): verfügbar, kein Blocker.
- **SES Sandbox-Exit** (4.1) - nur fürs Versenden nötig, Vorlaufzeit (AWS-Request) einplanen.
- **Externe Zugänge** - AWS-Profil `unser-besigheim` (0.1) und Clerk-Account (0.3).
