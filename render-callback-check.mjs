import handler from './api/callback.js';

function render(query = {}) {
  let statusCode = null;
  const headers = {};
  let html = '';

  const req = { query };
  const res = {
    setHeader(name, value) {
      headers[name.toLowerCase()] = value;
    },
    status(code) {
      statusCode = code;
      return this;
    },
    send(body) {
      html = body;
      return this;
    },
  };

  handler(req, res);

  return { statusCode, headers, html };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const cases = [
  {
    name: 'ready state',
    query: {},
    checks: ({ statusCode, headers, html }) => {
      assert(statusCode === 200, 'expected 200 for ready state');
      assert(headers['content-type'] === 'text/html; charset=utf-8', 'expected html content-type');
      assert(html.includes('<title>QuickBooks callback</title>'), 'expected document title');
      assert(html.includes('QuickBooks callback endpoint'), 'expected ready-state heading');
      assert(html.includes('&lt;/callback&gt;') === false, 'sanity check');
      assert(html.includes('Configure Intuit to redirect to <code>/callback</code>'), 'expected setup instructions');
      assert(!html.includes('/api/callback'), 'expected public guidance to reference the friendly callback route only');
    },
  },
  {
    name: 'success callback',
    query: { code: 'abc123', realmId: '913', state: 'xyz' },
    checks: ({ statusCode, headers, html }) => {
      assert(statusCode === 200, 'expected 200 for success callback');
      assert(headers['content-type'] === 'text/html; charset=utf-8', 'expected html content-type for success callback');
      assert(html.includes('QuickBooks auth received'), 'expected success heading');
      assert(html.includes('You can copy the callback details below back into your local terminal flow.'), 'expected copy guidance');
      assert(html.includes('<strong>code:</strong> <code>abc123</code>'), 'expected rendered code');
      assert(html.includes('<strong>realmId:</strong> <code>913</code>'), 'expected rendered realmId');
      assert(html.includes('<strong>state:</strong> <code>xyz</code>'), 'expected rendered state');
      assert(html.includes('&quot;code&quot;: &quot;abc123&quot;'), 'expected payload json to include code');
    },
  },
  {
    name: 'partial callback only shows present values',
    query: { state: 'just-state' },
    checks: ({ html }) => {
      assert(html.includes('QuickBooks auth received'), 'expected partial callback heading');
      assert(html.includes('<strong>state:</strong> <code>just-state</code>'), 'expected rendered state');
      assert(!html.includes('<strong>code:</strong>'), 'expected missing code to stay hidden');
      assert(!html.includes('<strong>realmId:</strong>'), 'expected missing realmId to stay hidden');
    },
  },
  {
    name: 'error callback escapes html',
    query: { error: 'access_denied', error_description: '<script>alert(1)</script>' },
    checks: ({ statusCode, headers, html }) => {
      assert(statusCode === 200, 'expected 200 for error callback');
      assert(headers['content-type'] === 'text/html; charset=utf-8', 'expected html content-type for error callback');
      assert(html.includes('QuickBooks auth failed'), 'expected error heading');
      assert(html.includes('<p>Error: access_denied</p>'), 'expected rendered error code');
      assert(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'), 'expected escaped error description');
      assert(!html.includes('<script>alert(1)</script>'), 'expected raw script tag to be escaped');
    },
  },
  {
    name: 'summary values escape html',
    query: { state: '<img src=x onerror=alert(1)>' },
    checks: ({ html }) => {
      assert(html.includes('&lt;img src=x onerror=alert(1)&gt;'), 'expected escaped summary value');
      assert(!html.includes('<strong>state:</strong> <code><img src=x onerror=alert(1)></code>'), 'expected raw summary value to be escaped');
    },
  },
  {
    name: 'array query values use the first value',
    query: { code: ['first-code', 'second-code'], state: ['primary-state', 'backup-state'] },
    checks: ({ html }) => {
      assert(html.includes('<strong>code:</strong> <code>first-code</code>'), 'expected first code value');
      assert(html.includes('<strong>state:</strong> <code>primary-state</code>'), 'expected first state value');
      assert(!html.includes('second-code'), 'expected secondary code value to stay hidden');
      assert(!html.includes('backup-state'), 'expected secondary state value to stay hidden');
    },
  },
  {
    name: 'empty array query values stay hidden',
    query: { code: [], state: ['visible-state'] },
    checks: ({ html }) => {
      assert(!html.includes('<strong>code:</strong>'), 'expected empty array code to stay hidden');
      assert(html.includes('<strong>state:</strong> <code>visible-state</code>'), 'expected non-empty state to render');
      assert(html.includes('&quot;code&quot;: &quot;&quot;'), 'expected payload to normalize empty array code to empty string');
    },
  },
];

for (const testCase of cases) {
  const result = render(testCase.query);
  testCase.checks(result);
  console.log(`PASS ${testCase.name}`);
}

console.log(`Verified ${cases.length} callback render scenarios.`);
