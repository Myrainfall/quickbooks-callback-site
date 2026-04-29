# Manual Callback Verification

Quick operator checklist for validating the hosted QuickBooks callback page without reading the handler code.

## Before you start
- Use the public deployment URL, not the underlying serverless path.
- Base route should be `https://YOUR-DEPLOYMENT/callback`.
- In Intuit app settings, the redirect URI should exactly match that public URL, including the `/callback` suffix.
- Expect an HTML page with the document title `QuickBooks callback`.

## Ready state
Open:
- `/callback`

Confirm:
- page heading is `QuickBooks callback endpoint`
- setup guidance references `<code>/callback</code>`
- payload block is present
- no callback values are listed in the summary section

## Success state
Open:
- `/callback?code=test-code&realmId=12345&state=test-state`

Confirm:
- page heading is `QuickBooks auth received`
- copy guidance says the details can be copied back into the local terminal flow
- summary list shows only `code`, `realmId`, and `state`
- payload block includes those same values
- payload block does not introduce extra callback fields beyond the ones shown in the summary for this URL

## Partial callback state
Open:
- `/callback?state=only-state`

Confirm:
- page still uses the `QuickBooks auth received` heading
- summary list shows `state` only
- missing fields like `code` and `realmId` stay hidden rather than rendering empty placeholders
- payload block keeps missing callback fields as empty strings rather than inventing placeholder strings

## Repeated param normalization
Open:
- `/callback?code=first-code&code=second-code&state=first-state&state=second-state`

Confirm:
- summary list shows `code` as `first-code`
- summary list shows `state` as `first-state`
- later repeated values are ignored instead of rendering as arrays or comma-joined output
- payload block also shows only the first value for each repeated field

## Error state
Open:
- `/callback?error=access_denied&error_description=User%20cancelled`

Confirm:
- page heading is `QuickBooks auth failed`
- error summary is visible
- payload block includes the error values

## Error escaping spot-check
Open:
- `/callback?error=access_denied&error_description=%3Cscript%3Ealert(1)%3C%2Fscript%3E`

Confirm:
- the error description renders as the escaped text `&lt;script&gt;alert(1)&lt;/script&gt;`
- no raw `<script>` tag appears in the page output
- no script executes

## Escaping spot-check
Open:
- `/callback?state=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E`

Confirm:
- the page shows the escaped text `&lt;img src=x onerror=alert(1)&gt;`
- no image renders and no script executes

## Callback verification cue
If the browser lands on a different route, shows `/api/callback`, or omits the `/callback` suffix, treat that as a callback configuration mismatch before reviewing any page content.

## Local companion check
If you have the repo locally, run:

```bash
npm run check:callback
```

Expected final line:

```text
Verified 7 callback render scenarios.
```

This includes the escaped error-description scenario and the empty-array normalization check.
