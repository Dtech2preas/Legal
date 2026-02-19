export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    let siteUrl = url.searchParams.get('url');

    if (!siteUrl) {
      const referer = request.headers.get('Referer');
      if (referer) {
        try {
          siteUrl = new URL(referer).hostname;
        } catch (e) {
          // invalid referer, ignore
        }
      }
    }

    if (!siteUrl) {
      const origin = request.headers.get('Origin');
      if (origin) {
        try {
          siteUrl = new URL(origin).hostname;
        } catch (e) {
          // invalid origin, ignore
        }
      }
    }

    if (!siteUrl) {
      return new Response(JSON.stringify({ error: 'Missing "url" parameter or Referer/Origin header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    const siteKey = `site:${siteUrl}`;
    const globalKey = 'global:total';

    try {
      let siteCount = (await env.STATS_KV.get(siteKey)) || '0';
      let globalCount = (await env.STATS_KV.get(globalKey)) || '0';

      siteCount = parseInt(siteCount, 10) + 1;
      globalCount = parseInt(globalCount, 10) + 1;

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
      return new Response(JSON.stringify({ error: `Error updating stats: ${err.message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  },
};
