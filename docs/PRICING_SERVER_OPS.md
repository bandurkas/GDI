# Managed Server Operations — pricing basis (INTERNAL, do not publish)

Prepared 7 September 2026. All public prices = market average × 1.20 (owner's requested +20% markup on cost).
Reminder: +20% on cost ≈ 16.67% gross margin on selling price.

## Scope boundary

Managed Server Operations = OS / application layer on the customer's own servers (monitoring, patching, hardening,
backups, incident response, admin work). It is **separate** from:
- data-center remote hands (facility physical tasks, priced in the colocation service levels), and
- hardware warranty / OEM support (Dell ProSupport, HPE, NVIDIA DGX Care) — offered as optional TPM add-on or pass-through.

## Benchmarks used (checked 7 Sep 2026)

| Segment | Source | Price |
|---|---|---|
| Indonesia managed VPS / server, 24/7 monitoring, hardening | IDSysadmin | Rp 300,000 / month |
| Indonesia managed service packages | AntaHost / Cloud Support Indonesia | "mulai 600 ribuan / bulan"; corporate on-prem "beberapa juta / bulan" |
| Indonesia annual maintenance contracts | AntaHost guide | Rp 10M–50M / year (≈ Rp 0.8M–4.2M / month) |
| Global mid-tier (patching, updates, business hours) | DCXV market overview | EUR 80–250 / server / month |
| Global single-server management, 24/7, unlimited tickets | Server Surgeon | USD 100 / server / month (USD 68–80 with volume/prepay) |
| Global enterprise 24/7 fully managed | DCXV | EUR 300–800+ / server / month |
| Managed dedicated (Liquid Web / Rackspace) | cybernews, liquidweb.com | from USD 199 / month; Rackspace Managed Ops +USD 500 / month |
| Third-party hardware maintenance | OSI Global | USD 800–2,000 / server / year (7–12% of server value) |
| Off-site backup storage | Server Surgeon | USD 15 / 100 GB, USD 75 / TB per month |
| NVIDIA DGX Care (OEM support, customer-purchased) | tech-insider, haink | USD 30k–60k / node / year (≈ USD 2.5k–5k / month) |
| Jakarta sysadmin salary (staffing basis) | Glassdoor / Indeed / Jobstreet | Rp 7M–12M / month; senior up to ~Rp 30M |

FX assumption: USD 1 ≈ Rp 16,500; EUR 1 ≈ Rp 18,000.

## Derivation

| Plan | Market average (cost basis) | ×1.20 → public |
|---|---|---|
| Essential Monitoring (monitoring + alerting, no admin) | Rp 400,000 (ID 300k, global "budget tier" ≤ EUR 30 ≈ Rp 540k) | **Rp 480,000** |
| Standard Managed OS (business hours, 4 h/month) | Rp 1,500,000 (ID 600k–1.5M, global USD 100 ≈ Rp 1.65M) | **Rp 1,800,000** |
| Advanced 24/7 Managed (30 min urgent, 10 h/month, app stack) | Rp 5,000,000 (global EUR 300–500 ≈ Rp 5.4–9M, ID corporate "several million") | **Rp 6,000,000** |
| GPU / AI Node Operations (per node, excl. DGX Care) | Rp 7,500,000 (1 senior GPU engineer per ~8–10 nodes ≈ Rp 3–4M/node + tooling, on-call, DCGM/firmware/RMA coordination; below OEM-managed USD 1k+/node) | **Rp 9,000,000** |

Add-ons:

| Add-on | Basis | ×1.20 → public |
|---|---|---|
| Extra admin hour | Jakarta MSP Rp 350–500k/h; global USD 75–150/h | **Rp 600,000 / hour** |
| Managed backup storage | USD 15 / 100 GB ≈ Rp 250k | **Rp 300,000 / 100 GB / month**, **Rp 1,500,000 / TB / month** |
| Hardware maintenance (TPM, NBD parts + labour) | USD 800–2,000 / year ≈ Rp 1.1–2.7M / month | **Rp 1,800,000 / server / month**; 4-hour 24×7 → quote |
| Monthly vulnerability scan + report | ~Rp 750k | **Rp 900,000 / server / month** |
| DR restore test / drill | ~Rp 1.25M | **Rp 1,500,000 / event** |
| Onboarding (standard server) | ~Rp 1M | **Rp 600k (Essential) / 1.2M (Standard) / 1.8M (Advanced)** |
| Onboarding (GPU node) | ~Rp 5M | **Rp 6,000,000 / node** |

Windows Server / SQL Server licensing (SPLA) and OEM support contracts are pass-through at cost + 20%, quoted separately.

## Review cadence

Re-check benchmarks quarterly; update `src/lib/colocation/config.ts` (`SERVER_OPS_PLANS`, `SERVER_OPS_ADDONS`) — the page and calculator read from there.
