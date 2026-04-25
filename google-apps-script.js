// ─────────────────────────────────────────────────────────────────────────────
//  PAPER READER — Google Apps Script
//
//  Setup (one-time, ~3 minutes):
//
//  1. Go to https://script.google.com  →  New project
//  2. Delete the default code and paste ALL of this file
//  3. Click the "+" next to "Services" in the left sidebar
//     → find "Drive API" → Version: v2 → Add
//  4. Click "Deploy" → "New deployment"
//     → Type: Web app
//     → Execute as: Me
//     → Who has access: Anyone
//     → Deploy
//  5. Copy the Web App URL (looks like https://script.google.com/macros/s/XXXX/exec)
//  6. In your Vercel project → Settings → Environment Variables
//     → Name: GOOGLE_SCRIPT_URL   Value: (paste the URL)
//  7. Redeploy your Vercel project
//
//  After that: clicking "Google Docs" in the app creates a doc in YOUR Drive,
//  nobody else can see the Apps Script URL, and nothing is stored in the browser.
// ─────────────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const data  = JSON.parse(e.postData.contents);
    const title = data.title || 'Paper Notes';
    const html  = data.html  || '';

    // Upload the HTML and have Drive convert it to a Google Doc automatically.
    // Requires Drive API v2 (added via Services panel — see setup step 3).
    const blob = Utilities.newBlob(html, MimeType.HTML);
    const file = Drive.Files.insert(
      { title: title, mimeType: MimeType.GOOGLE_DOCS },
      blob
    );

    const url = 'https://docs.google.com/document/d/' + file.id + '/edit';
    return ContentService
      .createTextOutput(JSON.stringify({ url: url }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doGet is required — Apps Script calls it on the first redirect.
// We return an error so it's clear something went wrong if GET is called directly.
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ error: 'This endpoint only accepts POST requests.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
