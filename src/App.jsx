import { useState, useEffect } from 'react';
import { loadAllRSSFeeds } from './rss-feeds';

export default function ThinkersNews() {
  const sections = ['Today', 'Top Stories', 'World', 'Business', 'Technology', 'Sports'];
  const sectionMap = {
    'Today': 'TOP STORIES',
    'Top Stories': 'TOP STORIES',
    'World': 'WORLD NEWS',
    'Business': 'ECONOMY',
    'Technology': 'TECHNOLOGY',
    'Sports': 'SPORTS'
  };
  
  const [activeSection, setActiveSection] = useState('Today');
  const [modalArticle, setModalArticle] = useState(null);
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeeds() {
      try {
        const articles = await loadAllRSSFeeds();
        setAllArticles(articles);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load RSS feeds:', error);
        setLoading(false);
      }
    }
    loadFeeds();
  }, []);

  const mappedSection = sectionMap[activeSection];
  const filteredArticles = mappedSection === 'TOP STORIES' && activeSection === 'Today'
    ? allArticles 
    : allArticles.filter(a => a.section === mappedSection);

  const featured = allArticles.find(a => a.section === mappedSection) || allArticles[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <Header sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="mx-auto max-w-7xl px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-zinc-200 rounded-lg w-2/3"></div>
            <div className="h-6 bg-zinc-200 rounded-lg w-1/2"></div>
            <div className="h-96 bg-zinc-200 rounded-3xl"></div>
          </div>
          <p className="mt-8 text-center text-sm text-zinc-500">Loading your personalized news...</p>
        </main>
      </div>
    );
  }

  if (!allArticles.length) {
    return (
      <div className="min-h-screen bg-white text-zinc-900">
        <Header sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">No Stories Available</h2>
          <p className="text-zinc-600 mb-6">We're having trouble loading stories right now.</p>
          <button 
            className="bg-zinc-900 text-white px-6 py-3 rounded-full hover:bg-zinc-800 transition-colors font-medium"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Header sections={sections} activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="mx-auto max-w-7xl px-6">
        <HeroSection featured={featured} setModalArticle={setModalArticle} />
        <TrendingStories articles={allArticles.slice(1, 4)} setModalArticle={setModalArticle} />
        <LatestHeadlines articles={allArticles.slice(4, 16)} setModalArticle={setModalArticle} />
        <StoriesGrid articles={filteredArticles} activeSection={activeSection} setModalArticle={setModalArticle} />
      </main>

      <footer className="border-t border-zinc-200 py-12 mt-16">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-500">
          © {new Date().getFullYear()} Thinkers.News · Powered by {allArticles.length} live stories
        </div>
      </footer>

      {modalArticle && (
        <Modal article={modalArticle} onClose={() => setModalArticle(null)} />
      )}
    </div>
  );
}

function Header({ sections, activeSection, setActiveSection }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-200">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <span className="rounded-xl bg-zinc-900 px-2.5 py-1 text-white">TN</span>
              <span>Thinkers.News</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Following
            </button>
            <button className="rounded-full p-2 hover:bg-zinc-100 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <div className="flex gap-1 px-6 pb-2">
            {sections.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`whitespace-nowrap px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeSection === section
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                {section}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

function HeroSection({ featured, setModalArticle }) {
  if (!featured) return null;

  return (
    <section className="pt-8 pb-12">
      <div 
        onClick={() => setModalArticle(featured)}
        className="relative overflow-hidden rounded-3xl cursor-pointer group shadow-xl"
      >
        <img 
          src={featured.image} 
          alt={featured.title} 
          className="h-[500px] w-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
        <div className="absolute inset-0 flex flex-col justify-end p-10">
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {featured.section}
            </span>
          </div>
          <h1 className="text-5xl font-bold leading-tight text-white mb-4 max-w-4xl">
            {featured.title}
          </h1>
          <p className="text-lg text-white/90 mb-6 max-w-3xl leading-relaxed">
            {featured.excerpt}
          </p>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="font-medium">{featured.source}</span>
            <span>·</span>
            <span>{featured.minutes} min read</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrendingStories({ articles, setModalArticle }) {
  if (!articles.length) return null;

  return (
    <section className="pb-12">
      <h2 className="text-2xl font-bold mb-6">Trending Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article, idx) => (
          <div
            key={article.id}
            onClick={() => setModalArticle(article)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-2xl mb-4 shadow-lg">
              <img 
                src={article.image} 
                alt="" 
                className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-black/60 backdrop-blur-sm rounded-full">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                  {article.section}
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-zinc-600 transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-zinc-600 mb-3 line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="font-medium">{article.source}</span>
              <span>·</span>
              <span>{article.minutes} min</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LatestHeadlines({ articles, setModalArticle }) {
  if (!articles.length) return null;

  return (
    <section className="pb-12">
      <h2 className="text-2xl font-bold mb-6">Latest Headlines</h2>
      <div className="overflow-x-auto -mx-6 px-6 pb-4" style={{ scrollSnapType: 'x mandatory' }}>
        <div className="flex gap-5 w-max">
          {articles.map(article => (
            <article
              key={article.id}
              onClick={() => setModalArticle(article)}
              className="w-80 shrink-0 cursor-pointer group"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className="overflow-hidden rounded-2xl mb-4 shadow-lg">
                <img 
                  src={article.image} 
                  alt="" 
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
              </div>
              <div className="px-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 rounded-full mb-3">
                  {article.section}
                </span>
                <h4 className="text-lg font-bold leading-tight mb-2 line-clamp-2 group-hover:text-zinc-600 transition-colors">
                  {article.title}
                </h4>
                <p className="text-sm text-zinc-600 line-clamp-2 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <span className="font-medium">{article.source}</span>
                  <span>·</span>
                  <span>{article.minutes} min</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoriesGrid({ articles, activeSection, setModalArticle }) {
  if (!articles.length) {
    return (
      <section className="py-16 text-center">
        <p className="text-zinc-600 text-lg">No stories in {activeSection} right now.</p>
        <p className="text-sm text-zinc-500 mt-2">Check back soon for updates.</p>
      </section>
    );
  }

  return (
    <section className="pb-12">
      <h2 className="text-2xl font-bold mb-6">More Stories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {articles.map(article => (
          <article
            key={article.id}
            onClick={() => setModalArticle(article)}
            className="group cursor-pointer"
          >
            <div className="overflow-hidden rounded-2xl mb-4 shadow-lg">
              <img 
                src={article.image} 
                alt="" 
                className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
            </div>
            <div className="px-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 rounded-full mb-3">
                {article.section}
              </span>
              <h4 className="text-lg font-bold leading-tight mb-2 line-clamp-2 group-hover:text-zinc-600 transition-colors">
                {article.title}
              </h4>
              <p className="text-sm text-zinc-600 line-clamp-2 mb-3">
                {article.excerpt}
              </p>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium">{article.source}</span>
                <span>·</span>
                <span>{article.minutes} min</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Modal({ article, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-20 rounded-full bg-white/90 backdrop-blur-sm p-2.5 shadow-lg hover:bg-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="relative h-80">
          <img src={article.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-white/20 backdrop-blur-sm rounded-full mb-4">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
              {article.section}
            </span>
            <h2 className="text-4xl font-bold text-white leading-tight">
              {article.title}
            </h2>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-20rem)] p-8">
          <div className="flex items-center gap-3 text-sm text-zinc-600 mb-6 pb-6 border-b border-zinc-200">
            <span className="font-semibold">{article.source}</span>
            <span>·</span>
            <span>{article.minutes} min read</span>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-zinc-700 leading-relaxed mb-6 font-medium">
              {article.excerpt}
            </p>
            <p className="text-zinc-700 leading-relaxed">
              {article.body}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
