# View Counter Worker

A simple Cloudflare Worker to track page views per domain/subdomain, with a global total counter.

## Features

- **Consolidated Worker**: All logic in a single `worker.js` file.
- **Site-specific tracking**: Counts views for each unique URL/domain.
- **Global tracking**: Maintains a total count of all views.
- **Automatic Detection**: Can detect site URL from `url` query parameter, `Referer` header, or `Origin` header.
- **CORS enabled**: Can be called from any frontend.
- **Fast**: Uses Cloudflare KV (Key-Value) storage.

## Project Structure

- `worker.js`: The complete worker script. Copy this to your Cloudflare Worker editor.
- `demo/`: Contains demo files.
    - `index.html`: A tester interface to manually check the worker.
    - `embeddable-widget.html`: The copy-paste widget code for your website.

## Deployment (Cloudflare Dashboard)

1.  **Create a Worker**:
    - Go to the Cloudflare Dashboard > Workers & Pages.
    - Click "Create Application" -> "Create Worker".
    - Give it a name (e.g., `view-counter`).
    - Click "Deploy".

2.  **Add KV Namespace**:
    - Go to "Workers & Pages" -> "KV".
    - Create a namespace (e.g., `STATS_KV`).
    - Go back to your Worker settings -> "Settings" -> "Variables" -> "KV Namespace Bindings".
    - Add a binding:
        - Variable name: `STATS_KV` (Must be exact).
        - KV Namespace: Select the namespace you created.
    - Save and Deploy.

3.  **Update Code**:
    - Click "Quick Edit" on your Worker.
    - Delete the default code.
    - Copy the contents of `worker.js` from this repository and paste it into the editor.
    - Click "Save and Deploy".

## Usage

### Using the Demo
1.  Open `demo/index.html` in your browser.
2.  Enter your deployed Worker URL (e.g., `https://view-counter.your-subdomain.workers.dev`).
3.  Enter a site URL to simulate (e.g., `mysite.com`).
4.  Click "Track View".

### Embeddable Widget (Recommended)

To add a visible view counter to your website:

1.  Open `demo/embeddable-widget.html`.
2.  Copy the entire code snippet.
3.  Paste it into your website's HTML `<body>` where you want the counter to appear.
4.  Update the `WORKER_URL` variable in the script to point to your deployed worker (e.g., `https://view-counter.your-subdomain.workers.dev`).

### Custom Integration (API Only)

If you want to build your own UI, simply make a fetch request to your Worker URL.

**Option 1: Automatic Detection**
```javascript
fetch('https://your-worker-url.workers.dev')
  .then(res => res.json())
  .then(data => {
    console.log('Site Views:', data.site_views);
    console.log('Global Views:', data.total_global_views);
  });
```
*Note: This relies on the browser sending `Referer` or `Origin` headers.*

**Option 2: Explicit URL**
```javascript
const currentUrl = window.location.hostname;
fetch(`https://your-worker-url.workers.dev?url=${encodeURIComponent(currentUrl)}`)
  .then(res => res.json())
  .then(data => {
    console.log('Site Views:', data.site_views);
  });
```
