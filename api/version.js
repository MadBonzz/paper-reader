// Returns the current deployment's git commit SHA.
// The browser checks this on load — if it differs from the SHA seen last
// time, it means a new version was deployed and we clear stale notes.
export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.status(200).json({
    version: process.env.VERCEL_GIT_COMMIT_SHA || 'dev',
  });
}
