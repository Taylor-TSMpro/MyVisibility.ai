export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const agencySlug = searchParams.get('agencySlug');
  const postSlug = searchParams.get('postSlug');

  // Default OG data
  let ogData = {
    title: 'MyVisibility.AI Blog',
    description: 'AI Visibility insights for local businesses',
    image: 'https://myvisibility.ai/og-default.png',
    url: 'https://myvisibility.ai'
  };

  if (agencySlug && postSlug) {
    try {
      // Fetch blog post data from Supabase
      const supabaseUrl = 'https://wkfqodynrugymgklfsvo.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrZnFvZHlucnVneW1na2xmc3ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMjkyMDMsImV4cCI6MjA3NjcwNTIwM30.MzBJ8gE9IUHBdik_Qic7JOZWN63Bq1vOhGh32VH8_8I';
      
      const response = await fetch(
        `${supabaseUrl}/rest/v1/agency_blog_posts?slug=eq.${postSlug}&select=*,agencies!inner(slug,name)`,
        {
          headers: {
            'apikey': supabaseKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const posts = await response.json();
        const post = posts.find(p => p.agencies?.slug === agencySlug);
        
        if (post) {
          ogData = {
            title: post.title || ogData.title,
            description: post.meta_description || post.excerpt || ogData.description,
            image: post.featured_image || ogData.image,
            url: `https://myvisibility.ai/agency/${agencySlug}/blog/${postSlug}`
          };
        }
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
    }
  }

  // Clean description
  const cleanDescription = ogData.description
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 160);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${ogData.title}</title>
  <meta name="description" content="${cleanDescription}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${ogData.title}">
  <meta property="og:description" content="${cleanDescription}">
  <meta property="og:image" content="${ogData.image}">
  <meta property="og:url" content="${ogData.url}">
  <meta property="og:site_name" content="MyVisibility.AI">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogData.title}">
  <meta name="twitter:description" content="${cleanDescription}">
  <meta name="twitter:image" content="${ogData.image}">
  
  <!-- Redirect browsers to actual page -->
  <script>
    if (!/bot|crawl|spider|facebook|linkedin|twitter|slack|discord|telegram|whatsapp/i.test(navigator.userAgent)) {
      window.location.replace("${ogData.url}");
    }
  </script>
</head>
<body>
  <h1>${ogData.title}</h1>
  <p>${cleanDescription}</p>
  <p><a href="${ogData.url}">View Article</a></p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
