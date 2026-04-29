# Deploy Smoke Checklist

Small post-deploy checklist for the hosted QuickBooks callback site.

## Route shape
Confirm the public deployment serves the callback page at the public route below:
- `/callback`

The underlying serverless handler may live at `/api/callback`, but operators should configure Intuit to use the public callback URL:
- production: `https://YOUR-DEPLOYMENT/callback`
- before saving Intuit settings, replace `YOUR-DEPLOYMENT` with the exact production hostname and double-check the final URL still ends with `/callback`
- Vercel preview branches are fine for temporary QA, but do not paste a preview URL into Intuit unless you intentionally want the callback tied to that preview deployment.

## Recommended browser checks
Open these URLs after deploy:
- `/callback`
- `/callback?code=test-code&realmId=12345&state=test-state`
- `/callback?error=access_denied&error_description=User%20cancelled`
- `/callback?code=first-code&code=second-code&realmId=12345&state=test-state`

## What to confirm
- each URL returns an HTML page rather than a JSON or framework error
- the ready state keeps the operator guidance visible at `/callback`
- success and error states still render escaped callback values
- the repeated-query-param case renders deterministically and shows the expected first `code` value
- the deployment URL configured in Intuit exactly matches the `/callback` route
- if you are validating a fresh production deploy, re-open the exact production hostname you pasted into Intuit instead of a preview alias or older deployment URL

## Follow-up reference
For a slightly more detailed operator walkthrough, including partial-callback and escaping spot-check examples, use:
- `docs/manual-callback-verification.md`
