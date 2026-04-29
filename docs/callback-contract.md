# Callback Render Contract

This note captures the current HTML contract for the hosted QuickBooks OAuth callback page so future tweaks can stay intentional.

## Route
- Public callback URL exposed to Intuit and operators: `GET /callback`
- Internal app handler implementation path: `GET /api/callback`
- The hosted page mirrors the same callback UI at the public URL; docs and operator guidance should point humans and QuickBooks app settings to `/callback`, not `/api/callback`.

## Response contract
- Returns `200 OK`
- Returns `Content-Type: text/html; charset=utf-8`
- Always renders the document title `QuickBooks callback`

## Page states

### Ready state
Triggered when no callback query fields are present.

Expected visible cues:
- heading: `QuickBooks callback endpoint`
- guidance copy telling the operator to configure Intuit to redirect to the public callback URL `/callback` rather than the internal handler path `/api/callback`
- payload block showing empty callback fields as JSON

Example URL:
- `/callback`

### Success or partial callback state
Triggered when one or more of these query fields are present:
- `code`
- `realmId`
- `state`

Expected visible cues:
- heading: `QuickBooks auth received`
- copy telling the operator they can copy details back into the local terminal flow
- summary list only for fields that are present
- payload block with the full escaped JSON object
- payload block shows missing fields as empty strings even when the visible summary intentionally hides those fields

Example URL:
- `/callback?code=test-code&realmId=12345&state=test-state`
- `/callback?state=only-state`
- `/callback?code=first-code&code=second-code&state=first-state&state=second-state`

Normalized payload example for repeated query params:

```json
{
  "code": "first-code",
  "realmId": "",
  "state": "first-state",
  "error": "",
  "error_description": ""
}
```

When duplicate `code` or `state` params are present, the rendered callback payload keeps the first value from the query string.

### Error state
Triggered when `error` is present.

Expected visible cues:
- heading: `QuickBooks auth failed`
- error summary paragraphs
- payload block with the full escaped JSON object

Example URL:
- `/callback?error=access_denied&error_description=User%20cancelled`

## Escaping expectations
The page must HTML-escape callback-derived values everywhere they are rendered, including:
- summary list values
- error description text
- raw payload JSON block

## Local verification
Run:

```bash
npm run check:callback
```

The current check covers:
- ready state rendering
- success rendering
- partial callback rendering
- error rendering
- header/title contract
- HTML escaping for summaries and payload output
- first-value normalization for repeated query params / array-shaped inputs
- empty-array normalization so missing repeated params stay hidden in the summary
