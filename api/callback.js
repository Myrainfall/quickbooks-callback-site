export default function handler(req, res) {
  const callbackDetails = getCallbackDetails(req.query || {});
  const { code, realmId, state, error, error_description } = callbackDetails;
  const hasCallbackData = hasDetails(callbackDetails);
  const title = error
    ? 'QuickBooks auth failed'
    : hasCallbackData
      ? 'QuickBooks auth received'
      : 'QuickBooks callback endpoint';
  const message = getMessage({ error, error_description, hasCallbackData });
  const callbackSummary = summarizeCallbackDetails(callbackDetails);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QuickBooks callback</title>
  <style>
    body {
      font-family: system-ui, sans-serif;
      line-height: 1.5;
      margin: 2rem;
      color: #111827;
    }

    code, pre {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }

    pre {
      background: #f3f4f6;
      border-radius: 0.75rem;
      padding: 1rem;
      overflow-x: auto;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${message}
  ${callbackSummary.length ? `<ul>${callbackSummary.map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> <code>${escapeHtml(value)}</code></li>`).join('')}</ul>` : ''}
  <pre id="payload">${escapeHtml(JSON.stringify(callbackDetails, null, 2))}</pre>
</body>
</html>`);
}

function getCallbackDetails(query) {
  return {
    code: firstQueryValue(query.code),
    realmId: firstQueryValue(query.realmId),
    state: firstQueryValue(query.state),
    error: firstQueryValue(query.error),
    error_description: firstQueryValue(query.error_description),
  };
}

function hasDetails(details) {
  return Object.values(details).some(Boolean);
}

function getMessage({ error, error_description, hasCallbackData }) {
  if (error) {
    return `<p>Error: ${escapeHtml(error)}</p><p>${escapeHtml(error_description)}</p>`;
  }

  if (hasCallbackData) {
    return '<p>You can copy the callback details below back into your local terminal flow.</p>';
  }

  return '<p>This endpoint is ready. Configure Intuit to redirect to <code>/callback</code>, then return here after authorizing.</p>';
}

function summarizeCallbackDetails(details) {
  return Object.entries(details).filter(([, value]) => Boolean(value));
}

function firstQueryValue(value) {
  if (Array.isArray(value)) {
    return value.length ? String(value[0]) : '';
  }

  return value == null ? '' : String(value);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
