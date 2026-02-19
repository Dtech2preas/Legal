export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const siteUrl = url.searchParams.get('url');

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
      });
    }

    if (!siteUrl) {
      return new Response('Missing "url" query parameter', { status: 400, headers: corsHeaders });
    }

    // KV keys
    const siteKey = `site:${siteUrl}`;
    const globalKey = 'global:total';

    try {
      // Get current counts (default to 0 if not found)
      let siteCount = (await env.STATS_KV.get(siteKey)) || '0';
      let globalCount = (await env.STATS_KV.get(globalKey)) || '0';

      // Increment counts
      siteCount = parseInt(siteCount, 10) + 1;
      globalCount = parseInt(globalCount, 10) + 1;

      // Update KV (store as string)
      // Using Promise.all for parallel execution
      await Promise.all([
        env.STATS_KV.put(siteKey, siteCount.toString()),
        env.STATS_KV.put(globalKey, globalCount.toString()),
      ]);

      const responseData = {
        site_url: siteUrl,
        site_views: siteCount,
        total_global_views: globalCount,
      };

      return new Response(JSON.stringify(responseData), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    } catch (err) {
      return new Response(`Error updating stats: ${err.message}`, { status: 500, headers: corsHeaders });
    }
  },
};
