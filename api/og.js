export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const agencySlug = searchParams.get('agencySlug');
  const postSlug = searchParams.get('postSlug');

  // Default values
  let title = 'AI Visibility Insights';
  let description = 'Learn how AI assistants discover and recommend businesses';
  let imageUrl = 'https://myvisibility.ai/og-default.png';
  let agencyName = '';
  let canonicalUrl = 'https://myvisibility.ai';

  if (agencySlug && postSlug) {
    try {
      // Fetch agency
      const agencyRes = await fetch(
        `https://wkfqodynrugymgklfsvo.supabase.co/rest/v1/agencies?slug=eq.${encodeURIComponent(agencySlug)}&select=id,agency_name,logo_url`,
        {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZnFvZHlucnVneW1na2xmc3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjkyMDMsImV4cCI6MjA3NjcwNTIwM30.MzBJ8gE9IUHBdik_Qic7JOZWN63Bq1vOhGh32VH8_8I',
            'Content-Type': 'application/json',
          },
        }
      );
      const agencies = await agencyRes.json();
      
      if (agencies && agencies.length > 0) {
        const agency = agencies[0];
        agencyName = agency.agency_name || '';
        
        // Fetch blog post
        const postRes = await fetch(
          `https://wkfqodynrugymgklfsvo.supabase.co/rest/v1/agency_blog_posts?agency_id=eq.${agency.id}&slug=eq.${encodeURIComponent(postSlug)}&select=title,excerpt,featured_image`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZnFvZHlucnVneW1na2xmc3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjkyMDMsImV4cCI6MjA3NjcwNTIwM30.MzBJ8gE9IUHBdik_Qic7JOZWN63Bq1vOhGh32VH8_8I',
              'Content-Type': 'application/json',
            },
          }
        );
        const posts = await postRes.json();
        
        if (posts && posts.length > 0) {
          const post = posts[0];
          title = post.title || title;
          description = post.excerpt || description;
          if (post.featured_image) {
            imageUrl = post.featured_image;
          }
        }
      }
      
      canonicalUrl = `https://myvisibility.ai/agency/${agencySlug}/blog/${postSlug}`;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}${agencyName ? ` | ${agencyName}` : ''}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="${agencyName || 'MyVisibility.AI'}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  
  <!-- LinkedIn specific -->
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  
  <!-- Redirect browsers to actual page -->
  <meta http-equiv="refresh" content="0;url=${canonicalUrl}">
  <link rel="canonical" href="${canonicalUrl}">
</head>
<body>
  <p>Redirecting to <a href="${canonicalUrl}">${title}</a>...</p>
  <script>window.location.href = "${canonicalUrl}";</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
