import { configureStore, createSlice, createListenerMiddleware } from '@reduxjs/toolkit';

/* ─── Product Catalog ─────────────────────────────────────────── */
/* Real catalogue is fetched from the backend; this seed lets the UI
   render instantly while the network resolves. */
const INITIAL_PRODUCTS = [
  {
    id: 'prod_orthodox_gold',
    name: 'Assam Orthodox Gold',
    slug: 'assam-orthodox-gold',
    tagline: 'The Imperial Standard',
    price: 180.0,
    currency: 'USD',
    weight: '100g',
    sku: 'CFL-001-GOLD',
    story:
      'Harvested during the absolute peak of the second flush cycle, this selection is composed almost entirely of downy, golden tips. It delivers an incredibly rich, amber liquor characterized by a profound malt density and delicate natural cacao undertones.',
    tastingNotes: ['Rich Malt', 'Sun-Dried Raisin', 'Dark Honey'],
    brewingNotes: { temp: '95°C', time: '4-5 Mins', ratio: '2.5g / 200ml' },
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    id: 'prod_chabua_clonal',
    name: 'Chabua Clonal Imperial',
    slug: 'chabua-clonal-imperial',
    tagline: 'The Artisan Micro-Lot',
    price: 210.0,
    currency: 'USD',
    weight: '100g',
    sku: 'CFL-002-CLONAL',
    story:
      'Culled from our oldest single-estate clonal plots, this reserve represents an unblended expression of pure terroir. It undergoes a slow, 18-hour ambient nocturnal wither to lock in high concentrations of volatile floral aromatic compounds.',
    tastingNotes: ['Orchid Blossom', 'Toasted Walnut', 'Muscatel'],
    brewingNotes: { temp: '90°C', time: '3-4 Mins', ratio: '2g / 200ml' },
    images: [
      'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1464254786740-b97e5420c299?auto=format&fit=crop&q=80&w=1200',
    ],
  },
  {
    id: 'prod_reserve_tippy',
    name: 'Tippy Golden Flowery Orange Pekoe',
    slug: 'tippy-gfop',
    tagline: "The Connoisseur's Selection",
    price: 245.0,
    currency: 'USD',
    weight: '75g',
    sku: 'CFL-003-TGFOP',
    story:
      'An ultra-exclusive harvest comprising solely the downy vegetative terminal buds. Plucked by hand during a three-day seasonal window, it yields an incredibly bright, golden-hued cup with zero astringency and a creamy, velvet-like body.',
    tastingNotes: ['Honeyed Apricot', 'Marzipan', 'Cream'],
    brewingNotes: { temp: '90°C', time: '3 Mins', ratio: '2g / 200ml' },
    images: [
      'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=1200',
    ],
  },
];

/* ─── localStorage hydration helpers ──────────────────────────── */
function loadCart() {
  try {
    const saved = localStorage.getItem('chabua_cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function loadWishlist() {
  try {
    const saved = localStorage.getItem('chabua_wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

/* ─── Cart Slice ─────────────────────────────────────────────── */
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    isOpen: false,
  },
  reducers: {
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    setCartOpen: (state, action) => { state.isOpen = action.payload; },
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({ ...product, quantity });
      }
      state.isOpen = true;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.id !== id);
      } else {
        const item = state.items.find((i) => i.id === id);
        if (item) item.quantity = quantity;
      }
    },
    clearCart: (state) => { state.items = []; },
  },
});

/* ─── Auth Slice ─────────────────────────────────────────────── */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    sessionChecked: false,
    loading: true,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.sessionChecked = true;
      state.loading = false;
    },
    setLoading: (state, action) => { state.loading = action.payload; },
  },
});

/* ─── UI Slice ───────────────────────────────────────────────── */
const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    isPreloaderDone: false,
    // Used by the checkout flow to remember selected display currency
    checkoutCurrency: 'INR',
  },
  reducers: {
    setPreloaderDone: (state) => { state.isPreloaderDone = true; },
    setCheckoutCurrency: (state, action) => { state.checkoutCurrency = action.payload; },
  },
});

/* ─── Collection Slice ───────────────────────────────────────── */
const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    list: INITIAL_PRODUCTS,
    activeId: 'prod_orthodox_gold',
  },
  reducers: {
    setActiveProduct: (state, action) => { state.activeId = action.payload; },
    setProductList: (state, action) => { state.list = action.payload; },
  },
});

/* ─── Wishlist Slice ─────────────────────────────────────────── */
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: {
    items: loadWishlist(),
  },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const exists = state.items.find((i) => i.id === product.id);
      if (exists) {
        state.items = state.items.filter((i) => i.id !== product.id);
      } else {
        state.items.push(product);
      }
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
    clearWishlist: (state) => { state.items = []; },
  },
});

/* ─── Orders Slice ───────────────────────────────────────────── */
/* Cached order history for the signed-in customer. Refreshed on Account/Orders. */
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    list: [],
    loading: false,
    lastFetched: null,
  },
  reducers: {
    setOrders: (state, action) => {
      state.list = action.payload;
      state.lastFetched = Date.now();
      state.loading = false;
    },
    setOrdersLoading: (state, action) => { state.loading = action.payload; },
    clearOrders: (state) => { state.list = []; state.lastFetched = null; },
  },
});

/* ─── Persistence middleware ─────────────────────────────────── */
const persistenceListener = createListenerMiddleware();

persistenceListener.startListening({
  predicate: (action) => action.type.startsWith('cart/'),
  effect: (_action, listenerApi) => {
    try {
      localStorage.setItem(
        'chabua_cart',
        JSON.stringify(listenerApi.getState().cart.items)
      );
    } catch { /* quota exceeded — fail silently */ }
  },
});

persistenceListener.startListening({
  predicate: (action) => action.type.startsWith('wishlist/'),
  effect: (_action, listenerApi) => {
    try {
      localStorage.setItem(
        'chabua_wishlist',
        JSON.stringify(listenerApi.getState().wishlist.items)
      );
    } catch { /* fail silently */ }
  },
});

/* ─── Action exports ─────────────────────────────────────────── */
export const {
  toggleCart, setCartOpen, addToCart, removeFromCart, updateQuantity, clearCart,
} = cartSlice.actions;

export const { setUser, setLoading } = authSlice.actions;

export const { setPreloaderDone, setCheckoutCurrency } = uiSlice.actions;

export const { setActiveProduct, setProductList } = collectionSlice.actions;

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

export const { setOrders, setOrdersLoading, clearOrders } = ordersSlice.actions;

/* ─── Selectors ──────────────────────────────────────────────── */
export const selectCartItems = (s) => s.cart.items;
export const selectCartOpen = (s) => s.cart.isOpen;
export const selectCartTotal = (s) =>
  s.cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
export const selectCartCount = (s) =>
  s.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectUser = (s) => s.auth.user;
export const selectAuthLoading = (s) => s.auth.loading;
export const selectIsAuthenticated = (s) => Boolean(s.auth.user);

export const selectPreloaderDone = (s) => s.ui.isPreloaderDone;
export const selectCheckoutCurrency = (s) => s.ui.checkoutCurrency;

export const selectProducts = (s) => s.collection.list;
export const selectActiveProduct = (s) =>
  s.collection.list.find((p) => p.id === s.collection.activeId);

export const selectWishlist = (s) => s.wishlist.items;
export const selectWishlistCount = (s) => s.wishlist.items.length;
export const selectIsWishlisted = (productId) => (s) =>
  Boolean(s.wishlist.items.find((i) => i.id === productId));

export const selectOrders = (s) => s.orders.list;
export const selectOrdersLoading = (s) => s.orders.loading;

/* ─── Store ──────────────────────────────────────────────────── */
export const store = configureStore({
  reducer: {
    cart: cartSlice.reducer,
    auth: authSlice.reducer,
    ui: uiSlice.reducer,
    collection: collectionSlice.reducer,
    wishlist: wishlistSlice.reducer,
    orders: ordersSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceListener.middleware),
});