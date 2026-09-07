# GDI Platform — deploy notes

Site: https://gdiconsult.online (PT Global Digital Informasi, "gdi-platform").

## Production (VPS2 168.231.118.173)
- Code: `/var/www/gdi-platform` (clone of `bandurkas/GDI`, branch `main`)
- Process: pm2 `gdi-platform` → `next start -p 3003`
- DB: local PostgreSQL 16, database `gdi_platform`, role `styserg` (peer auth)
- Nginx: `/etc/nginx/sites-enabled/gdiconsult` → 127.0.0.1:3003, TLS by certbot (auto-renew)
- Env: `/var/www/gdi-platform/.env` (not in git)

## Deploy a new version
```bash
cd /var/www/gdi-platform
git pull origin main
npm ci --no-audit --no-fund            # only if package-lock changed
npx prisma generate && npx prisma db push
NODE_OPTIONS=--max-old-space-size=1536 npm run build
pm2 restart gdi-platform
```

## Env variables
| var | purpose |
|---|---|
| `DATABASE_URL` | postgres connection |
| `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | auth (URL must be https://gdiconsult.online) |
| `BANK_NAME`, `BANK_ACCOUNT_NUMBER`, `BANK_ACCOUNT_HOLDER`, `BANK_SWIFT`, `BANK_PAYMENT_NOTE` | bank requisites shown to customers |
| `ONLINE_PAYMENT_ENABLED` | `true` + `MIDTRANS_*` keys re-enable Midtrans checkout (off by default) |

## Payment flow (current)
Checkout creates an order with `paymentMethod=BANK_TRANSFER`, status `PENDING`.
Customer sees bank requisites + reference `GDI-<last 8 chars of order id>` on the dashboard.
Admin → Orders tab → "Confirm payment" marks it `COMPLETED` and credits cashback; "Cancel order" sets `FAILED`.

## Seed / admin
- Products: `GET /api/seed` (upserts 4 products)
- Admin user: create/reset via a small node script using `bcrypt` + Prisma (`role: ADMIN`)
