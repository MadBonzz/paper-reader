# Paper Reader

An interactive paper reading interface for building research taste faster.

## Run

```
python -m http.server 8080
```

Then open **http://localhost:8080** in your browser.

(Any static file server works. Serving from localhost is required for Google Docs OAuth.)

## Features

**Left panel:** PDF viewer with page navigation and zoom. Drag the divider to resize.

**Right panel:** Structured notes with these sections:

| Phase | Section | Purpose |
|---|---|---|
| Before Reading | My Predicted Approach | Write YOUR approach before reading the method. The divergence is the learning. |
| Before Reading | My Predicted Experiments | Design your eval before seeing the paper's results. |
| Paper Notes | Problem Statement | The exact gap this paper fills |
| Paper Notes | Prior Assumption (Bit Flip) | Complete: "All prior work assumed ___ . This paper flips that by ___." |
| Paper Notes | Definitions [D1, D2...] | Key terms and concepts |
| Paper Notes | Techniques [T1, T2...] | Methods and architectures |
| Paper Notes | Insights [I1, I2...] | What you found interesting |
| Paper Notes | Bit Flips [B1, B2...] | Assumptions this paper overturns |
| Paper Notes | Research Questions [RQ1...] | Questions the paper formally asks |
| Paper Notes | Experiments [E1, E2...] | Experiments, datasets, baselines |
| My Analysis | My Questions [MQ1...] | Your own questions to explore |
| My Analysis | Core Insight | One sentence: what is NOW KNOWN. Not a method, not a result — an insight. |
| My Analysis | Extensions / Ideas | Research directions this opens |
| My Analysis | Issues / Limitations | Weaknesses, confounds, missing ablations |
| My Analysis | Apply to Own Work | How this connects to your research |

**Legend:** Auto-generated from all items that have a label. Use [D1], [T1], [I1], [B1] etc. in your notes to cross-reference.

## Saving Notes

- Notes **auto-save** to browser localStorage as you type
- **Save Notes** — downloads a `.json` file (recommended for backup)
- **Load Notes** — loads a previously saved `.json` file
- **Export HTML** — downloads a formatted `.html` file (can be uploaded to Google Drive and opened as a Google Doc — no setup needed)
- **Google Docs** — exports directly to your Google Drive (one-time setup required, see below)

## Google Docs Setup (one-time)

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a project
2. Enable **Google Drive API** (APIs & Services → Enable APIs)
3. Create credentials: **OAuth 2.0 Client ID** → Web application
4. Under "Authorized JavaScript origins" add `http://localhost:8080`
5. Copy the Client ID and paste it into the app (click **Google Docs** button or **Settings**)

Once set up, clicking **Google Docs** will open a Google sign-in, then create and open a new Google Doc with your notes.

## Keyboard Shortcuts

| Key | Action |
|---|---|
| ← / → | Previous / next page |
| + / - | Zoom in / out |
| Ctrl+S | Save notes as JSON |
