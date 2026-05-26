# Lunasin.id — Deploy Guide v1.0

## Prerequisites
- GitHub repo: `github.com/Willybrenkman/Lunasin` (branch: `main`)
- Vercel account linked to that repo
- Supabase project with schema applied

---

## 1. Supabase Setup

### 1a. Run migrations (in this order, via SQL Editor)
1. `supabase_schema.sql` — base tables + RLS (only for fresh installs)
2. `supabase_migration_columns_fix.sql` — adds `tanggal_mulai`, `tanggal_tagihan`
3. `supabase_migration_durasi_hutang.sql` — idempotent, safe to re-run
4. `supabase_migration_auth_fix.sql` — voucher RLS + redeem function

All migrations use `IF NOT EXISTS` / `CREATE OR REPLACE` — safe to re-run.

### 1b. Get credentials
In your Supabase project → **Settings → API**:
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Vercel Setup

### 2a. Environment Variables
Go to Vercel project → **Settings → Environment Variables** and add:

| Variable | Value | Environments |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Production, Preview |
| `OPENAI_API_KEY` | `sk-...` | Production, Preview |

### 2b. Deploy
Push to `main` branch → Vercel auto-deploys. That's it.

To trigger a manual redeploy: Vercel dashboard → **Deployments → Redeploy**.

---

## 3. Adding Users

Users **cannot self-register** — accounts are created by:
- **Admin**: Insert directly into `auth.users` via Supabase dashboard, then insert into `public.profiles`
- **Skalev webhook**: POST to `/api/payment` (Skalev calls this after payment)

### Manually create a user (Supabase dashboard)
1. **Authentication → Users → Invite user** — send invite email
2. After user accepts, update their profile:
```sql
UPDATE public.profiles
SET is_pro = true, full_name = 'Nama User'
WHERE email = 'user@email.com';
```

### Set user as PRO
```sql
UPDATE public.profiles SET is_pro = true WHERE email = 'user@email.com';
```

### Set user as free
```sql
UPDATE public.profiles SET is_pro = false WHERE email = 'user@email.com';
```

---

## 4. PRO vs Free Access

| Path | Free | PRO |
|---|---|---|
| `/dashboard` | ✅ | ✅ |
| `/dashboard/simulasi` | ✅ | ✅ |
| `/dashboard/debts` | ✅ | ✅ |
| `/dashboard/add` | ✅ | ✅ |
| `/dashboard/panduan` | ✅ | ✅ |
| `/dashboard/pengaturan` | ✅ | ✅ |
| `/dashboard/pembayaran` | 🔒 ProLock | ✅ |
| `/dashboard/laporan` | 🔒 ProLock | ✅ |
| `/dashboard/bonus` | 🔒 ProLock | ✅ |
| `/dashboard/ai` | 🔒 ProLock | ✅ |
| `/dashboard/pengingat` | 🔒 ProLock | ✅ |

---

## 5. Voucher System

Vouchers are stored in `public.vouchers` table. Each voucher:
- Has a unique `code` (e.g., `LNSN-2024-0001`)
- Gets `claimed = true` and `claimed_email` set when redeemed
- Redeeming a voucher automatically sets `profiles.is_pro = true`

### Add vouchers via SQL
```sql
INSERT INTO public.vouchers (code) VALUES
  ('LNSN-2024-0001'),
  ('LNSN-2024-0002');
```

---

## 6. AI Chat Rate Limiting

- 30 messages per user per hour (in-memory, resets on Vercel cold start)
- Runs on `/api/chat` — uses `user_id` from Supabase session

---

## 7. Monitoring

- **Vercel**: Functions → `/api/chat`, `/api/debts`, `/api/payments` logs
- **Supabase**: Database → Logs for slow queries
- **Error budget**: If users report "Gagal memuat data", check Supabase → Auth logs first

---

## 8. Rollback

If a deploy breaks production:
1. Vercel dashboard → **Deployments** → find last working deploy → **Promote to Production**
2. Git: `git revert HEAD && git push` for code-level rollback
