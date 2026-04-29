# QuickBooks Callback Site

Tiny hosted callback receiver for Intuit production OAuth.

## Purpose
Production Intuit redirect URIs cannot use localhost. This site provides a public HTTPS callback endpoint:

- `/callback`

The page simply renders the returned callback payload so it can be copied back into a local terminal flow.

## Suggested deploy target
- Vercel

## Expected production redirect URI
After deploy, use:
- `https://YOUR-DEPLOYMENT/callback`

Replace `YOUR-DEPLOYMENT` with the exact production hostname you intend to paste into Intuit. Avoid preview aliases unless you intentionally want QuickBooks callbacks tied to that preview deployment.

## Behavior
When Intuit redirects here, the page:
- always responds with a simple HTML document and `text/html; charset=utf-8`
- shows a ready-state message when visited directly
- displays any returned `code`, `realmId`, `state`, `error`, and `error_description`
- normalizes repeated query params / array values to the first value only before rendering
- hides missing callback fields instead of showing empty placeholders
- HTML-escapes rendered values before showing the summary or raw payload block
- includes a raw JSON payload block for copy/paste back into local troubleshooting flows

## Local check
Install dependencies if needed, then run the tiny render verification locally:
- `npm install`
- `npm run check:callback`

This exercises the callback handler for:
- ready state
- success rendering
- partial callback rendering
- error rendering
- consistent HTML response headers and document title
- HTML escaping in both summaries and payload output
- first-value normalization for repeated query params / array-shaped inputs
- empty-array normalization so missing repeated params stay hidden in the summary

Expected passing output:
- `PASS ready state`
- `PASS success callback`
- `PASS partial callback only shows present values`
- `PASS error callback escapes html`
- `PASS summary values escape html`
- `PASS array query values use the first value`
- `PASS empty array query values stay hidden`
- `Verified 7 callback render scenarios.`

## Operator quick path
For faster operator onboarding, use these together:
- `npm run check:callback` — local render sanity check before touching a deployment
- `docs/manual-callback-verification.md` — browser checklist for ready, success, partial, error, and escaping states

## Deploy on Vercel
1. Import this folder as a Vercel project.
2. Keep the default framework preset as “Other”.
3. Deploy without adding environment variables.
4. Copy the production URL and set your Intuit app redirect URI to `https://YOUR-DEPLOYMENT/callback`.

### Smoke test after deploy
Open each URL in a browser and confirm the page content matches expectations:
- `/callback`
- `/callback?code=test-code&realmId=12345&state=test-state`
- `/callback?error=access_denied&error_description=User%20cancelled`

For the full post-deploy browser checklist, including repeated-query-param coverage, see `docs/deploy-smoke-checklist.md`.

## Notes
This is intentionally minimal. It does not store secrets or exchange tokens server-side.

## File map
- `api/callback.js` — Vercel handler that renders the callback summary and raw JSON payload
- `render-callback-check.mjs` — tiny local verification script for callback HTML output
- `docs/deploy-smoke-checklist.md` — post-deploy route and browser smoke checklist for `/callback`
- `docs/manual-callback-verification.md` — concise manual verification checklist for ready, success, partial, error, and escaping states
- `vercel.json` — routes `/callback` to the serverless handler
