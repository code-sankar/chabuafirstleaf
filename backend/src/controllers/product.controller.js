import { supabase } from '../config/supabase.js';

/* ─── GET /api/products (public) ───────────────────────────── */
export const getAllProducts = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('price', { ascending: true });
    if (error) throw error;
    return res.status(200).json({ success: true, products: data || [] });
  } catch (err) {
    next(err);
  }
};

/* ─── GET /api/products/:slug (public) ─────────────────────── */
export const getProductBySlug = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', req.params.slug)
      .single();
    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    return res.status(200).json({ success: true, product: data });
  } catch (err) {
    next(err);
  }
};

/* ─── PATCH /api/products/:id (admin) — price + stock edits ── */
export const updateProduct = async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.price != null) updates.price = Number(req.body.price);
    if (req.body.inventory_count != null) updates.inventory_count = Number(req.body.inventory_count);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, error: 'No editable fields supplied.' });
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error || !data) {
      return res.status(404).json({ success: false, error: 'Product not found.' });
    }
    return res.status(200).json({ success: true, product: data });
  } catch (err) {
    next(err);
  }
};