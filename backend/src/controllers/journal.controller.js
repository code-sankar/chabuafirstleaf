import { supabase } from '../config/supabase.js';

/* ─── GET /api/journal (public) — list ─────────────────────── */
export const getAllPosts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('journal_posts')
      .select('id, slug, tag, title, excerpt, date_label, image, featured, published_at')
      .order('published_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json({ success: true, posts: data || [] });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/journal/:slug (public) — full post ──────────── */
export const getPostBySlug = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('journal_posts')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Journal entry not found.' });
    }
    return res.status(200).json({ success: true, post: data });
  } catch (err) {
    next(err);
  }
};