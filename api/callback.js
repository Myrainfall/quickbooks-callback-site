export default function handler(req, res) {
  const { code = '', realmId = '', state = '', error = '', error_description = '' } = req.query || {};

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QuickBooks callback</title>
</head>
<body>
  <h1>${error ? 'QuickBooks auth failed' : 'QuickBooks auth received'}</h1>
  ${error ? `<p>Error: ${escapeHtml(error)}</p><p>${escapeHtml(error_description)}</p>` : '<p>You can copy the callback details below back into your local terminal flow.</p>'}
  <pre id="payload">${escapeHtml(JSON.stringify({ code, realmId, state, error, error_description }, null, 2))}</pre>
</body>
</html>`);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
