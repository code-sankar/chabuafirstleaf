import api from './api';

function toUiPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    tag: row.tag,
    title: row.title,
    excerpt: row.excerpt,
    date: row.date_label,
    datePublished: row.published_at,   // ← add this
    image: row.image,
    featured: row.featured,
    subtitle: row.subtitle,
    readTime: row.read_time,
    content: Array.isArray(row.content) ? row.content : [],
    relatedSlugs: row.related_slugs || [],
  };
}
export async function listJournalPosts() {
  const { data } = await api.get('/api/journal');
  return (data.posts || []).map(toUiPost);
}

export async function getJournalPostBySlug(slug) {
  const { data } = await api.get(`/api/journal/${slug}`);
  return toUiPost(data.post);
}