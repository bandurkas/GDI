# Managed Server Operations — pricing basis (INTERNAL, do not publish)

Updated 7 September 2026. Public price = (labour & tooling cost basis + hardware-responsibility reserve) × **1.30**
(owner's requested +30% on market averages; ≈ 23% gross margin on selling price).
Formula lives in `src/lib/colocation/config.ts` → `opsMonthlyIdr()`; page and calculator read from there.

## Why prices scale with server value

On Advanced and GPU plans GDI carries hardware responsibility ("if it breaks, we fix or replace it"). The cost of that risk is
proportional to the hardware value. Third-party maintenance (TPM) market: 7–12% of server value per year (OSI Global);
NVIDIA DGX Care: USD 30k–60k per DGX node per year ≈ 10–20% of a USD 290k node. We reserve:

| Plan | Labour & tooling basis / month | Hardware reserve (per year of hardware value) | Onboarding basis (hours) |
|---|---:|---:|---:|
| Essential Monitoring | Rp 400,000 | 0% (no coverage) | Rp 500,000 (2 h) |
| Standard Managed OS | Rp 1,500,000 | 5% (diagnostics, RMA, labour; parts at cost) | Rp 2,000,000 (6 h) |
| Advanced 24/7 Managed | Rp 5,000,000 | 10% (parts + labour + replacement, NBD) | Rp 3,000,000 (10 h) |
| GPU / AI Node Operations | Rp 7,500,000 | 10% (diagnostics, RMA, module/node replacement) | Rp 9,000,000 (24 h) |

Hardware value (typical market price, USD, Sep 2026): 1U 6,000 · 2U 9,000 · storage 2U 16,000 · 4U L40S 50,000 ·
DGX H100 230,000 · DGX H200 315,000 · DGX B200 290,000 · DGX B300 330,000 (planning FX Rp 17,600/USD).
Custom servers: value entered by the customer; otherwise heuristic (standard: max(6,000; 4,500×U) USD; GPU: 50,000 × kW/3).

## Resulting public prices (monthly, rounded to Rp 10,000)

| Server class | Essential | Standard | Advanced | GPU ops |
|---|---:|---:|---:|---:|
| Standard 1U | 520,000 | 2,520,000 | 7,640,000 | — |
| Standard 2U | 520,000 | 2,810,000 | 8,220,000 | — |
| Storage 2U | 520,000 | 3,480,000 | 9,550,000 | — |
| 4U L40S | — | — | — | 19,280,000 |
| DGX H100 | — | — | — | 53,600,000 |
| DGX H200 | — | — | — | 69,810,000 |
| DGX B200 | — | — | — | 65,040,000 |
| DGX B300 | — | — | — | 72,670,000 |

Onboarding (one-time, ×1.30): Essential Rp 650,000 · Standard Rp 2,600,000 · Advanced Rp 3,900,000 · GPU Rp 11,700,000.
Onboarding includes connection handover, OS install / baseline, security, monitoring/backup agents and installation of the
customer's required software within the included hours; extra work at the admin-hour rate.

Sanity check: B200 GPU ops ≈ Rp 780M / year ≈ USD 44k ≈ 15% of node value — inside the DGX Care + staffing band.

## Add-ons (market average × 1.30)

| Add-on | Basis | Public |
|---|---|---|
| Extra admin hour | Jakarta MSP Rp 350–500k/h; global USD 75–150/h | Rp 650,000 / hour |
| Managed backup storage | USD 15 / 100 GB, USD 75 / TB (Server Surgeon) | Rp 325,000 / 100 GB · Rp 1,625,000 / TB per month |
| Monthly vulnerability scan + report | ~Rp 750k | Rp 975,000 / server / month |
| DR restore test / drill | ~Rp 1.25M | Rp 1,625,000 / event |
| Hardware parts on Essential / Standard | pass-through | at cost + coordination hours |
| Windows / SQL Server SPLA, OEM support (DGX Care) | pass-through | quoted separately |

## Benchmarks used (checked 7 Sep 2026)

- IDSysadmin managed VPS Rp 300,000/mo; AntaHost / Cloud Support Indonesia "mulai 600 ribuan", corporate "beberapa juta"/mo; annual contracts Rp 10–50M/yr.
- DCXV market overview: mid-tier EUR 80–250, enterprise 24/7 EUR 300–800+ per server/month; Server Surgeon USD 100/server (24/7, unlimited tickets).
- Liquid Web managed dedicated from USD 199/mo; Rackspace Managed Ops +USD 500/mo.
- OSI Global TPM: USD 800–2,000/server/year, 7–12% of value; NVIDIA DGX Care USD 30–60k/node/year.
- Server prices: aloinfousa Dell guide (R650/R660 ~USD 5–6k base), L40S ~USD 9k/card (Thunder Compute), DGX H200 8-GPU USD 315k (IntuitionLabs), DGX B300 USD 300–350k (GPUSmith), DGX B200 USD 275–300k.
- Jakarta sysadmin salaries Rp 7–12M/mo (Glassdoor / Indeed / Jobstreet).

Review quarterly.
