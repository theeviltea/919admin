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
| `/reports`, `/reports/:id` | Reports: All, Messages, Companies, People, Vacancies |

People photos are the licensed stock set only.
