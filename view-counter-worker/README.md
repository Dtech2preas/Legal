# View Counter Worker

A simple Cloudflare Worker to track page views per domain/subdomain, with a global total counter.

## Features

- **Site-specific tracking**: Counts views for each unique URL/domain provided.
- **Global tracking**: Maintains a total count of all views across all sites.
- **Fast**: Uses Cloudflare KV (Key-Value) storage for low-latency updates.
- **CORS enabled**: Can be called from any frontend.

## Project Structure

- `src/index.js`: The worker logic.
- `demo/`: A simple HTML/JS demo to test the worker.
- `wrangler.toml`: Configuration file.

## Setup & Deployment

1.  **Install Wrangler**:
    You need Cloudflare's CLI tool `wrangler`.
    ```bash
    npm install -g wrangler
    ```

2.  **Login to Cloudflare**:
    ```bash
    wrangler login
    ```

3.  **Create KV Namespace**:
    You need to create a KV namespace to store the counts.
    ```bash
    wrangler kv:namespace create STATS_KV
    ```
    This command will output a binding configuration like:
    ```toml
    [[kv_namespaces]]
    binding = "STATS_KV"
    id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    ```

    Copy the `id` and replace the placeholder in `wrangler.toml`.

4.  **Deploy**:
    ```bash
    cd view-counter-worker
    wrangler deploy
    ```

    After deployment, you will get a URL like `https://view-counter-worker.your-subdomain.workers.dev`.

## Usage

### Using the Demo
1.  Open `demo/index.html` in your browser.
2.  Enter your Worker URL (e.g., `https://view-counter-worker.your-subdomain.workers.dev`).
3.  Enter a site URL to simulate (e.g., `mysite.com`).
4.  Click "Track View".

### Integration on Your Website
Add the following script to your website's HTML:

```html
<script>
  (function() {
    const workerUrl = 'YOUR_WORKER_URL'; // Replace with your actual Worker URL
    const pageUrl = window.location.hostname; // Or window.location.href for full path

    fetch(`${workerUrl}?url=${encodeURIComponent(pageUrl)}`)
      .then(response => response.json())
      .then(data => {
        // Update your UI with the data
        // data.site_views -> Views for this site
        // data.total_global_views -> Total views across all sites

        // Example:
        const counterEl = document.getElementById('view-counter');
        if (counterEl) counterEl.innerText = data.site_views;
      })
      .catch(console.error);
  })();
</script>
```

## Testing Locally
You can test the worker locally using `wrangler dev`.
```bash
wrangler dev
```
This will start a local server (usually at `http://localhost:8787`). You can point the demo page to this local URL.
