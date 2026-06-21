import api from './api';

function toUiProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline,
    price: Number(row.price),
    currency: row.currency || 'USD',
    weight: row.weight,
    sku: row.sku,
    story: row.story,
    tastingNotes: row.tasting_notes || [],
    brewingNotes: row.brewing_notes || {},
    images: row.images || [],
    inventoryCount: row.inventory_count,
  };
}

export async function listProducts() {
  const { data } = await api.get('/api/products');
  return (data.products || []).map(toUiProduct);
}

export async function getProductBySlug(slug) {
  const { data } = await api.get(`/api/products/${slug}`);
  return data.product ? toUiProduct(data.product) : null;
}