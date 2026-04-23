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

## Behavior
When Intuit redirects here, the page displays:
- `code`
- `realmId`
- `state`
- `error`
- `error_description`

## Notes
This is intentionally minimal. It does not store secrets or exchange tokens server-side.
