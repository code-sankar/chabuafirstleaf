import { supabase } from '../config/supabase.js';

/* ─── GET /api/admin/overview (admin) ──────────────────────────
   One call that powers the admin dashboard landing view. */
export const getAdminOverview = async (req, res, next) => {
  try {
    const [orders, products, subscribers] = await Promise.all([
      supabase.from('orders').select('id, total_amount, status, created_at'),
      supabase.from('products').select('id, name, inventory_count'),
      supabase.from('subscribers').select('id', { count: 'exact', head: true }),
    ]);

    if (orders.error) throw orders.error;
    if (products.error) throw products.error;
    if (subscribers.error) throw subscribers.error;

    const orderRows = orders.data || [];
    const productRows = products.data || [];

    const revenue = orderRows
      .filter((o) => ['Paid', 'Processing', 'Packed', 'Shipped', 'Delivered'].includes(o.status))
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

    const lowStock = productRows
      .filter((p) => Number(p.inventory_count) <= 15)
      .map((p) => ({ id: p.id, name: p.name, inventory_count: p.inventory_count }));

    return res.status(200).json({
      success: true,
      overview: {
        totalOrders: orderRows.length,
        totalRevenue: Number(revenue.toFixed(2)),
        totalProducts: productRows.length,
        totalSubscribers: subscribers.count || 0,
        lowStock,
      },
    });
  } catch (err) {
    next(err);
  }
};