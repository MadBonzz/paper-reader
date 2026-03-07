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
      response = await fetch(location, opts);
      hops++;
    }

    const text = await response.text();
    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      console.error('Non-JSON response from Apps Script:', text.slice(0, 500));
      return res.status(502).json({
        error: 'Apps Script returned an unexpected response. ' +
               'Check that the script is deployed as a web app and the Drive API is enabled.'
      });
    }
  } catch (e) {
    console.error('Fetch error:', e);
    return res.status(500).json({ error: e.message });
  }
}
