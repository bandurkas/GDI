# AI services packages — pricing basis (INTERNAL, do not publish)

Updated 7 September 2026. Owner's decision: replace the legacy Rp 8.5M / 17.5M / 26M / 34M list with market-based fixed fees.
Numbers live in `src/lib/services/config.ts` (`SERVICE_PACKAGES`); the page, the seed and the cart read from there.

## Rate assumptions

| Role | Blended day rate used |
|---|---:|
| Senior AI consultant / architect | Rp 4,500,000 |
| Automation / integration engineer | Rp 3,000,000 |
| Project coordination, QA, documentation | Rp 2,000,000 |

Jakarta agency benchmarks (Sep 2026): senior consultants Rp 3–6M/day, integration engineers Rp 2–4M/day; regional boutiques quote
USD 200–400 per person-day. Fixed fee = estimated effort × rate, +20 % for scope risk (fixed price), rounded to a clean figure.

## Packages

| Package (id) | Effort | Cost basis | Public fixed price |
|---|---|---:|---:|
| AI Readiness Sprint (`start-ai`) — 7 working days | 4 senior days + 1 coordination day | Rp 20.0M | **Rp 19,500,000** |
| Automation Pilot (`middle-scale`) — 3 weeks | 3 senior + 8 engineer + 2 coordination | Rp 41.5M | **Rp 45,000,000** |
| Automation Program (`automation-platform`) — 6–8 weeks | 8 senior + 22 engineer + 5 coordination | Rp 112M | **Rp 120,000,000** |
| Private AI Assistant (`ent-assistant`) — 4–6 weeks | 10 senior + 28 engineer + 5 coordination | Rp 139M | **Rp 150,000,000** |

Market cross-check: one-workflow automation pilots in Indonesia are quoted Rp 35–75M; RAG assistants for one department
USD 8–20k globally, Rp 120–250M locally; readiness assessments Rp 15–40M.

## Not included in fixed prices (pass-through / quoted)

- LLM API usage, n8n / Make / hosting subscriptions, WhatsApp Business API fees.
- Extra integrations beyond the included count: Rp 7,500,000 each (2.5 engineer days).
- Extra department / channel for the assistant: from Rp 35,000,000.
- Custom ML model training, mobile apps, data migration: custom quote.

Review quarterly together with `docs/PRICING_SERVER_OPS.md`.
