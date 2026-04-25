// Vercel serverless function — proxies the HTML payload to your private
// Google Apps Script, which creates a Google Doc in your Drive.
// The Apps Script URL is stored only in Vercel environment variables
// and is never sent to the browser.

export default async function handler(req, res) {
  // Allow the browser to call this from any Vercel preview URL
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    return res.status(500).json({
      error: 'GOOGLE_SCRIPT_URL is not set. Add it in your Vercel project → Settings → Environment Variables.'
    });
  }

  const body = JSON.stringify(req.body);
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    redirect: 'manual', // handle Apps Script redirects manually (see below)
  };

  try {
    // Apps Script web apps issue a redirect before executing — we must
    // re-POST to the redirect target rather than letting fetch() convert
    // it to a GET (which would call doGet instead of doPost).
    let response = await fetch(scriptUrl, opts);
    let hops = 0;
    while (response.status >= 300 && response.status < 400 && hops < 5) {
      const location = response.headers.get('location');
      if (!location) break;
      // If the redirect target is outside Apps Script's domain, it IS the
      // result URL (Drive creates the file and returns 302 → docs.google.com).
      // POSTing to docs.google.com would return 405, so capture it as success.
      if (!/script\.google(?:usercontent)?\.com/i.test(location)) {
        return res.status(200).json({ url: location });
      }
      response = await fetch(location, opts);
      hops++;
    }

    const text = await response.text();
    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      console.error('Non-JSON response from Apps Script (status ' + response.status + '):', text.slice(0, 1000));
      // Detect common failure modes from the HTML body so the user gets an actionable message
      let hint = '';
      if (/accounts\.google\.com|<title>[^<]*Sign in|ServiceLogin/i.test(text)) {
        hint = ' Google is asking the request to sign in. Redeploy the Apps Script web app with "Who has access: Anyone" (NOT "Anyone with Google account").';
      } else if (/authorization is required|needs your permission|requires authorization/i.test(text)) {
        hint = ' The script is not authorized. Open the Apps Script editor, run doPost once manually, and click through the permission prompts.';
      } else if (response.status === 404) {
        hint = ' Got 404 — GOOGLE_SCRIPT_URL is wrong, or the deployment was deleted. Re-copy the latest /exec URL into Vercel env vars.';
      } else if (/Drive is not defined|ReferenceError: Drive/i.test(text)) {
        hint = ' Drive API service is not enabled in the Apps Script project. Add it via "+ Services" → Drive API → v2.';
      }
      return res.status(502).json({
        error: 'Apps Script returned status ' + response.status + ' with non-JSON response.' + hint,
        snippet: text.slice(0, 300),
      });
    }
  } catch (e) {
    console.error('Fetch error:', e);
    return res.status(500).json({ error: e.message });
  }
}
