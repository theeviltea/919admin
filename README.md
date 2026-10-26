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
- `POST /admin/:entity/:id/:action` — `approve | reject | request-changes | hide | show | block | unblock | pause | resume | close | take | resolve | warn | edit`, body `{ reason?, note?, patch? }`
- `DELETE /admin/:entity/:id`

Auth: bearer token from `localStorage["919admin.token"]`. The UI updates at once and rolls back if the request fails.

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
