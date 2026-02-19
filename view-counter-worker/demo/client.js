document.addEventListener('DOMContentLoaded', () => {
    const trackBtn = document.getElementById('trackBtn');
    const workerUrlInput = document.getElementById('workerUrl');
    const pageUrlInput = document.getElementById('pageUrl');
    const statsDisplay = document.getElementById('statsDisplay');
    const siteCountEl = document.getElementById('siteCount');
    const globalCountEl = document.getElementById('globalCount');
    const siteUrlDisplay = document.getElementById('siteUrlDisplay');
    const errorMsg = document.getElementById('errorMsg');
    const snippetCode = document.getElementById('snippetCode');

    // Update snippet on input change
    function updateSnippet() {
        const workerUrl = workerUrlInput.value || 'YOUR_WORKER_URL';
        // Simple escaping for display
        const safeWorkerUrl = workerUrl.replace(/'/g, "\\'");

        snippetCode.textContent = `<script>
  // 1. Define your Worker URL
  const workerUrl = '${safeWorkerUrl}';

  // 2. Get the current page identifier (e.g., domain or full URL)
  const currentIdentifier = window.location.hostname;

  // 3. Fetch stats
  fetch(\`\${workerUrl}?url=\${encodeURIComponent(currentIdentifier)}\`)
    .then(res => res.json())
    .then(data => {
      // 4. Update your UI elements
      if (document.getElementById('site-views')) {
        document.getElementById('site-views').innerText = data.site_views;
      }
      if (document.getElementById('global-views')) {
        document.getElementById('global-views').innerText = data.total_global_views;
      }
    })
    .catch(err => console.error('View tracking failed:', err));
</script>`;
    }

    workerUrlInput.addEventListener('input', updateSnippet);
    // Initialize snippet
    updateSnippet();

    trackBtn.addEventListener('click', async () => {
        const workerUrl = workerUrlInput.value;
        const pageUrl = pageUrlInput.value;

        if (!workerUrl || !pageUrl) {
            showError('Please enter both Worker URL and Page URL.');
            return;
        }

        hideError();
        trackBtn.disabled = true;
        trackBtn.textContent = 'Tracking...';

        // Simulating the request
        try {
            // Validate URL format roughly
            let fetchUrl = workerUrl;
            if (!fetchUrl.startsWith('http')) {
                fetchUrl = 'https://' + fetchUrl;
            }

            // Append query param
            const urlObj = new URL(fetchUrl);
            urlObj.searchParams.set('url', pageUrl);

            const response = await fetch(urlObj.toString());

            if (!response.ok) {
                throw new Error(`Worker returned ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // Update UI
            siteCountEl.textContent = data.site_views;
            globalCountEl.textContent = data.total_global_views;
            siteUrlDisplay.textContent = data.site_url; // or pageUrl

            statsDisplay.style.display = 'flex';

        } catch (err) {
            showError(`Failed to fetch stats: ${err.message}. Make sure the Worker is running and URL is correct.`);
            console.error(err);
        } finally {
            trackBtn.disabled = false;
            trackBtn.textContent = 'Track View';
        }
    });

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = 'block';
        statsDisplay.style.display = 'none';
    }

    function hideError() {
        errorMsg.style.display = 'none';
    }
});
