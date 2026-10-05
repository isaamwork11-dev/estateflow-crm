# Legacy Express prototype (optional)

This folder contains an early **AI-assisted WhatsApp lead** experiment (Ollama/OpenAI providers, `RealEstateAIService`, etc.).

It is **not** used by the Vercel-deployed CRM in the repository root (`src/`, Next.js App Router).

The commercial product is **EstateFlow CRM** — multi-tenant sales CRM with deterministic matching, scoring, pipeline, deals, and analytics. **No AI is required** for core features.

To run this legacy server locally (optional):

```bash
cd server
npm install
npm run dev
```

Do not deploy this alongside the Next.js app unless you explicitly maintain a separate host.
