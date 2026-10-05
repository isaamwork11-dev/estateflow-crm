# EstateFlow CRM — architecture

## Product

Multi-tenant **Real Estate Sales & Property Management CRM** (SaaS). Core flows work **without AI**, paid APIs, or external property data.

Sales lifecycle: Lead → Qualification → Property matching → Follow-up → Site visit → Negotiation → Deal → Payment / Commission.

## Stack

| Layer | Technology |
|--------|------------|
| App | Next.js 15 (App Router), React 19, TypeScript |
| UI | Tailwind CSS, Radix primitives |
| Data | MongoDB + Mongoose |
| Auth | NextAuth (credentials), JWT session |
| Deploy | Vercel (serverless routes, optional Vercel Cron) |

## Tenancy

Every business record includes `organizationId`. Server actions use `orgFilter()` / `agentFilter()` from `src/lib/auth/tenant.ts` so agents only see assigned leads; managers/owners see the full org.

## MongoDB collections

| Collection | Purpose |
|------------|---------|
| `organizations` | Tenant workspace, currency, scoring weights, follow-up rules |
| `users` | Login, role, `organizationId` |
| `leads` | Pipeline, scoring, requirements, follow-up dates |
| `properties` | Inventory, pricing, location |
| `projects` | Developments (optional parent for units) |
| `tasks` | Calls, follow-ups, site visits |
| `sitevisits` | Scheduled visits and feedback |
| `deals` | Negotiation / booking / closed |
| `payments` | Deal payment entries |
| `activities` | Audit timeline |
| `notifications` | In-app alerts |
| `clientpresentations` | Share links `/p/[token]` (no client login) |

## Main modules (no AI)

| Module | Location |
|--------|----------|
| Lead scoring (0–100) | `src/lib/scoring/lead-score.ts`, weights in `src/lib/crm/scoring-config.ts` |
| Property matching | `src/lib/matching/property-match.ts` |
| Reverse matching | `src/lib/matching/reverse-match.ts` |
| Listing completeness | `src/lib/properties/completeness.ts` |
| Commission / installments | `src/lib/business/commission.ts` |
| ROI calculator | `src/lib/business/profit-calculator.ts` |
| Payment balance | `src/lib/business/payment-balance.ts` |
| Follow-up cron | `src/lib/services/follow-up-cron.ts` → `GET /api/cron/follow-ups` |
| Lead automation on create | `src/lib/services/lead-automation.ts` |

## API / routes

- `POST/GET` NextAuth — `/api/auth/[...nextauth]`
- Cron (Bearer `CRON_SECRET`) — `/api/cron/follow-ups`
- Settings — `/api/settings`
- App UI — `/dashboard`, `/pipeline`, `/leads`, `/properties`, `/site-visits`, `/deals`, `/reports`, `/settings`, `/tools/calculator`
- Public presentations — `/p/[token]`

Server logic is primarily **Server Actions** under `src/lib/actions/`.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_URL` | Yes | Canonical app URL |
| `NEXTAUTH_SECRET` | Yes | Session signing secret |
| `CRON_SECRET` | For cron | Bearer token for Vercel Cron |

## Vercel deployment

1. Connect GitHub repo, framework **Next.js**.
2. Set env vars above (including `CRON_SECRET` if using cron).
3. `vercel.json` defines daily cron at 06:00 UTC for stale/overdue follow-ups.
4. Use MongoDB Atlas; allow Vercel egress IPs.

## Legacy AI code

The `server/` directory is an optional Express + Ollama prototype — **not** part of the Vercel app. Future AI features should be optional plugins and must not block CRM operations.

## Tests

```bash
npm test
npm run build
```

Vitest covers scoring, matching, calculators, and tenant filter helpers.
