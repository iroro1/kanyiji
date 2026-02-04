# Supabase setup for pending features

This doc describes what to configure or create in **Supabase** so the following can be implemented in the app:

0. **Email confirmation (required for signup)** – accounts must verify email before they are active
1. **2FA for email signup**
2. **Vendor account information field**
3. **Vendor payouts and account statement**
4. **Email marketing and analytics** (optional Supabase part only)

---

## 0. Email confirmation (required for signup)

**Goal:** Users who sign up with email must click a confirmation link in their email before the account is active. No session is created until they verify.

### In Supabase Dashboard

1. Go to **Authentication** → **Providers** → **Email**.
2. Enable **Confirm email**.
3. Go to **Authentication** → **URL Configuration**.
4. Add your redirect URLs to the allow list (if not already present), including:
   - `https://yourdomain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for local dev)

When "Confirm email" is enabled, Supabase sends a confirmation email with a link. Users click the link, are redirected to `/auth/callback` with tokens, and their session is established. Until they click the link, they cannot sign in.

Supabase docs: [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls), [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates).

---

## 1. 2FA for email signup

**Goal:** Allow users who sign up with email/password to use TOTP (authenticator app) 2FA, like Google sign-in already does.

### In Supabase Dashboard

1. Go to **Authentication** → **Providers**.
2. Ensure **Email** is enabled (for email/password signup).
3. Go to **Authentication** → **Multi-Factor Authentication** (or **MFA** in the sidebar).
4. **Enable MFA** (TOTP).
5. Optionally set **MFA factor limit** (e.g. 1 factor per user).

No new tables are required; Supabase stores MFA factors in `auth.mfa_factors`.

### In your app (after Supabase is set)

- After login/signup, call Supabase MFA APIs:
  - **Enroll:** `supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: '...' })` → show QR/code to user.
  - **Verify enrollment:** `supabase.auth.mfa.challengeAndVerify({ ... })`.
  - **Sign-in with MFA:** when Supabase returns a session that requires MFA, call `supabase.auth.mfa.challengeAndVerify` with the TOTP code, then complete sign-in.
- Add UI: “Enable 2FA” in settings, “Enter code” when MFA is required at login.

Supabase docs: [Multi-Factor Authentication](https://supabase.com/docs/guides/auth/auth-mfa).

---

## 2. Vendor account information field

**Goal:** Store “vendor account information” (e.g. bank/business account details or notes) and show it on vendor signup, vendor profile, and admin dashboard.

### In Supabase (SQL)

Run the migration that adds the new column to `vendors`:

- **File:** `supabase_migrations/vendor_account_information_and_payout_tables.sql`
- **Action:** Adds `account_information` (TEXT, nullable) to `vendors`.

After running it:

- **Vendor signup:** Add a form field (e.g. textarea) and on submit send `account_information` when creating/updating the vendor row.
- **Vendor profile:** In the API that returns the vendor (e.g. `/api/vendor/me` or profile), include `account_information`; show it on the vendor profile page.
- **Admin dashboard:** In the admin vendors API and UI, include and display `account_information`.

No RLS change is strictly required if you already restrict vendor rows by `user_id` for vendors and use service role for admin; otherwise ensure only the vendor (own row) and admins can read/update it.

---

## 3. Vendor payouts and account statement

**Goal:** Use existing payout/earnings logic and show “payouts” and “account statement” in vendor and admin dashboards.

### In Supabase (SQL)

The app already expects these tables:

- **vendor_earnings** – per-vendor earnings (e.g. order-based), with amounts and status.
- **vendor_payouts** – payout requests and history.
- **vendor_bank_accounts** – vendor bank accounts for payouts.

If any of these tables are missing, run:

- **File:** `supabase_migrations/vendor_account_information_and_payout_tables.sql`

It creates:

- **vendor_earnings** – `id`, `vendor_id`, `order_id` (nullable), `gross_amount`, `commission_amount`, `net_amount`, `status` (`available` | `pending` | `paid`), `created_at`, etc.
- **vendor_payouts** – `id`, `vendor_id`, `amount`, `status`, `payment_method`, `payment_details` (JSONB), `reference`, `processed_at`, `created_at`, etc.
- **vendor_bank_accounts** – `id`, `vendor_id`, `account_name`, `account_number`, `bank_name`, `bank_code`, `account_type`, `is_primary`, `created_at`, `updated_at`.

Plus the `account_information` column on `vendors` as above.

### What you need to do

1. Run the migration in the Supabase SQL Editor so that:
   - `vendors.account_information` exists.
   - `vendor_earnings`, `vendor_payouts`, and `vendor_bank_accounts` exist with the expected columns (or adjust the migration if your schema already differs).
2. Ensure **RLS** (Row Level Security) allows:
   - Vendors: read/update only their own rows in these tables (e.g. `vendor_id` = current vendor).
   - Admins: read/update via service role or an admin policy.
3. In the app:
   - **Vendor dashboard:** Use existing `/api/vendor/payouts` (and bank accounts) to show “Payouts” and “Account statement” (e.g. list of earnings + payouts).
   - **Admin dashboard:** Use existing `/api/admin/payouts` to list/process payouts and, if needed, an admin view of vendor statements.

So the “fix” in Supabase is: **create the tables and column if missing**, and **set RLS** so vendor and admin access match the app’s expectations.

---

## 4. Email marketing and analytics

**Goal:** Later integrate an email marketing tool (e.g. Mailchimp, Resend) and/or analytics (e.g. PostHog, Mixpanel).

### In Supabase (optional)

- No change is **required** for email marketing or analytics; those are usually external services.
- If you want to store **consent** or **preferences** in Supabase:
  - Add to **profiles** (or a dedicated table):
    - e.g. `email_marketing_consent` (boolean) and/or `newsletter_opted_in_at` (timestamptz).
  - Update signup/settings to set these when the user opts in; your app or a cron can sync them to the email tool.

So for “what to fix in Supabase” for this item: **nothing** unless you decide to store consent/preferences in Supabase; then add the columns/tables above and use them in the app.

---

## Summary

| Feature                      | In Supabase                                                                 | In the app (after Supabase) |
|-----------------------------|-----------------------------------------------------------------------------|-----------------------------|
| **Email confirmation**      | Auth → Providers → Email: enable "Confirm email". Add `/auth/callback` to redirect URLs. | Already implemented. |
| **2FA for email signup**    | Auth → MFA: enable TOTP. No new tables.                                    | MFA enroll + verify + login UI. |
| **Vendor account info**     | Add `vendors.account_information` (migration).                             | Signup field, profile + admin read/update. |
| **Payouts & statement**     | Ensure `vendor_earnings`, `vendor_payouts`, `vendor_bank_accounts` exist; RLS. | Wire vendor/admin dashboards to existing APIs. |
| **Email marketing/analytics** | Optional: profile columns for consent.                                    | Choose tool; sync consent if stored in Supabase. |

Run the SQL migration(s) in **Supabase → SQL Editor**, then implement or wire the UI and APIs as above.
