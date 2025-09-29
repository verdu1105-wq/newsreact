// RSS Feed Configuration
export const RSS_FEEDS = [
  { url: 'https://rss.cnn.com/rss/edition.rss', section: 'TOP STORIES', source: 'CNN' },
  { url: 'https://feeds.bbci.co.uk/news/rss.xml', section: 'TOP STORIES', source: 'BBC News' },
  { url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', section: 'TOP STORIES', source: 'NY Times' },
  { url: 'https://feeds.reuters.com/reuters/topNews', section: 'TOP STORIES', source: 'Reuters' },
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', section: 'WORLD NEWS', source: 'BBC World' },
  { url: 'https://rss.cnn.com/rss/edition_world.rss', section: 'WORLD NEWS', source: 'CNN World' },
  { url: 'https://feeds.feedburner.com/techcrunch', section: 'TECHNOLOGY', source: 'TechCrunch' },
  { url: 'https://rss.cnn.com/rss/edition_technology.rss', section: 'TECHNOLOGY', source: 'CNN Tech' },
  { url: 'https://rss.cnn.com/rss/edition_sport.rss', section: 'SPORTS', source: 'CNN Sports' },
  { url: 'https://feeds.bbci.co.uk/sport/rss.xml', section: 'SPORTS', source: 'BBC Sport' },
  { url: 'https://rss.cnn.com/rss/money_latest.rss', section: 'ECONOMY', source: 'CNN Business' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', section: 'ECONOMY', source: 'BBC Business' }
];

const CORS_PROXIES = [
  'https://api.rss2json.com/v1/api.json?rss_url=',
  'https://api.allorigins.win/get?url=',
  'https://corsproxy.io/?'
];

function stripHtml(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

export async function fetchRSSFeed(feedConfig, proxyIndex = 0) {
  try {
    const proxy = CORS_PROXIES[proxyIndex];
    const response = await fetch(`${proxy}${encodeURIComponent(feedConfig.url)}`);
    const data = await response.json();

    if (data.status === 'ok') {
      return data.items.slice(0, 10).map(item => ({
        id: item.guid || item.link || Math.random().toString(),
        title: item.title,
        section: feedConfig.section,
        source: feedConfig.source,
        minutes: Math.max(1, Math.ceil((item.description?.length || 0) / 1000)),
        image: item.enclosure?.link || item.thumbnail || `https://picsum.photos/seed/${encodeURIComponent(item.title)}/1280/720`,
        excerpt: stripHtml(item.description || '').substring(0, 200) + '...',
        body: stripHtml(item.content || item.description || ''),
        date: item.pubDate
      }));
    }
  } catch (error) {
    console.error(`Error fetching ${feedConfig.source}:`, error);
    if (proxyIndex < CORS_PROXIES.length - 1) {
      return fetchRSSFeed(feedConfig, proxyIndex + 1);
    }
  }
  return [];
}

export async function loadAllRSSFeeds() {
  const feedPromises = RSS_FEEDS.map(feed => fetchRSSFeed(feed));
  const results = await Promise.allSettled(feedPromises);

  const articles = results
    .filter(result => result.status === 'fulfilled')
    .flatMap(result => result.value)
    .filter(article => article && article.title);

  return articles;
}
