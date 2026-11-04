# 919 Admin

Admin panel for 919: moderation of employers and vacancies, directory of job seekers, companies, recruiters and vacancies, reports, platform dashboards. Responsive: sidebar on desktop, tab bar on phones. Light and dark themes follow the system, with a toggle in the sidebar.

Stack: Vite 5, React 18, TypeScript, react-router 6. Colours come from the 919 design-system tokens (`src/styles/tokens.css`).

```bash
npm install
npm run dev            # http://localhost:5173
npm run lint && npm run typecheck
npm run build          # dist/ — static SPA, serve with a fallback to index.html
npm run build:preview  # dist-preview/index.html — one self-contained file, in-memory routing
```

## Backend

Without `VITE_API_URL` the admin runs on mock data (`src/data/mock.ts`). With it (`VITE_API_URL=https://api.919.ae`):

- `GET  /admin/bootstrap` — `{ seekers, companies, recruiters, vacancies, reports, metrics }` (types in `src/data/types.ts`)
- `POST /admin/:entity/:id/:action` — `approve | reject | request-changes | hide | show | block | unblock | pause | resume | close | take | resolve | warn | edit | approve-licence | reject-licence`, body `{ reason?, note?, patch? }`
- `DELETE /admin/:entity/:id`

Sign-in: for now any email and password open the admin (`src/data/auth.tsx`); the session is kept in browser storage when “Keep me signed in” is on. To check real credentials, call `POST /admin/auth/login` → `{ token, name }` in `signIn` and store the token under `localStorage["919admin.token"]`, which the API client sends as a bearer token. The UI updates at once and rolls back if the request fails.

## Company verification

Two separate checks. **Account** (`status`: pending → approved / rejected) lets a company post vacancies. **Trade licence** (`licence.status`: none → review → verified / rejected) is a PDF only admins see; `approve-licence` gives the company the verified badge in the app, `reject-licence` sends the reason (`note`) to the employer. Companies without an approved licence have no badge. The PDF opens from `licence.file.url`.

## Hire confirmations

After an application is accepted, the app asks the employer “Who did you hire?” (`hired | nofit | deciding`) and the job seeker “Did you get the job?” (`yes | no | process | other` + optional note). The admin reads them from `GET /admin/bootstrap` as `hires[]`: `{ id, seekerId, vacancyId, companyId, employer, seeker, seekerNote?, updated }` (`none` = no answer yet), plus KPI tiles in `metrics.hires['7' | '30']`. The result is derived in the admin: both positive = confirmed hire, one side only = only employer / only job seeker, positive vs negative = mismatch, otherwise waiting.

## Push notifications and email campaigns

One screen for both channels (`src/pages/Broadcast.tsx`, data in `src/data/broadcast.ts`). The text is written in Russian and English; each person gets the language of their account, and if one language is empty everyone gets the other. Endpoints (`:channel` = `push | email`):

- `POST /admin/:channel/reach` — body `Audience` `{ who: all|seekers|employers, app: both|old|new (push only), country, city, from, to (YYYY-MM-DD, UTC, inclusive), lang: any|ru|en }` → `{ match, reach }`: everyone who matches, and those with a push token / an email address.
- `POST /admin/:channel/test` — `{ to, text, lang }`: `to` is an account email or ID for push, an address for email.
- `POST /admin/:channel/campaigns` — `{ text: { ru?: {title, body}, en?: {title, body} }, audience }` → the new `Campaign`.
- `GET /admin/:channel/campaigns` — history: `{ id, status: sending|done|failed, text, audience, total, sent, gone, failed, error?, by, started, ended? }`. `gone` = the token or address no longer exists (app removed, account closed); `failed` = delivery errors, with the last `error` message.
- `GET /admin/email/server` — `{ configured, from }`. Letters go over SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`); until it's set, sending is disabled. The server adds a footer with an unsubscribe link in the person's language.

Limits: push title 100 and text 500 characters; email subject 200 and text 20,000. In the letter a blank line starts a paragraph and links become clickable. Sending to everyone asks for confirmation and can't be called back.

## Sections

| Route | Page |
| --- | --- |
| `/` | Overview dashboards |
| `/checks/employers`, `/checks/employers/:id` | Employer checks: verify, request changes, reject |
| `/checks/vacancies`, `/checks/vacancies/:id` | Vacancy checks: approve, edit, request changes, reject |
| `/seekers`, `/seekers/:id` | Job seekers and full profile |
| `/companies`, `/companies/:id` | Companies and company page |
| `/recruiters/:id` | Recruiter page |
| `/vacancies`, `/vacancies/:id` | All vacancies and vacancy page |
| `/hires` | Hire confirmations from employers and job seekers |
| `/reports`, `/reports/:id` | Reports: All, Messages, Companies, People, Vacancies |
| `/push` | Push notifications: message in RU/EN, audience, live reach, lock-screen preview, test to one phone, send to everyone, history |
| `/email` | Email campaigns: the same flow for letters, plus the mail-server check |

People photos are the licensed stock set only.
