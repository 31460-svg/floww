import { createClient } from '@supabase/supabase-js';
import { INITIAL_FLOWERS } from '../data/initialFlowers';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const STORAGE_KEYS = {
  PRODUCTS: 'bloom_pos_products_v1',
  ORDERS: 'bloom_pos_orders_v1'
};

// Initialize LocalStorage with default 20 flowers if empty
const getLocalProducts = () => {
  const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_FLOWERS));
    return INITIAL_FLOWERS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return INITIAL_FLOWERS;
  }
};

const saveLocalProducts = (products) => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

const getLocalOrders = () => {
  const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

const saveLocalOrders = (orders) => {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

// --- DATA ACCESS LAYER ---

export const fetchProducts = async () => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (!error && data && data.length > 0) {
        return { data, source: 'supabase' };
      }
      if (error) {
        console.warn('Supabase fetch error, using local fallback:', error);
      }
    } catch (err) {
      console.warn('Supabase error, using local fallback:', err);
    }
  }

  // Fallback to local storage
  return { data: getLocalProducts(), source: 'local' };
};

export const saveProduct = async (product) => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('products')
        .upsert(product)
        .select();

      if (!error) return { data, source: 'supabase' };
      console.warn('Supabase product save error:', error);
    } catch (err) {
      console.warn('Supabase product save error:', err);
    }
  }

  // Fallback to local storage
  const current = getLocalProducts();
  const index = current.findIndex(p => p.id === product.id);
  let updated;
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...product };
  } else {
    updated = [product, ...current];
  }
  saveLocalProducts(updated);
  return { data: product, source: 'local' };
};

export const updateStockBatch = async (items) => {
  // items: [{ id, quantity }]
  const productsResult = await fetchProducts();
  const products = productsResult.data;

  const updatedProducts = products.map(prod => {
    const itemInCart = items.find(i => i.id === prod.id);
    if (itemInCart) {
      const newStock = Math.max(0, prod.stock - itemInCart.quantity);
      return { ...prod, stock: newStock };
    }
    return prod;
  });

  if (isSupabaseConfigured && supabase) {
    try {
      for (const item of items) {
        const targetProd = updatedProducts.find(p => p.id === item.id);
        if (targetProd) {
          await supabase
            .from('products')
            .update({ stock: targetProd.stock })
            .eq('id', item.id);
        }
      }
    } catch (err) {
      console.warn('Error updating stock in Supabase:', err);
    }
  }

  saveLocalProducts(updatedProducts);
  return updatedProducts;
};

export const createOrder = async (orderPayload) => {
  // orderPayload: { order, items }
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert([orderPayload.order])
        .select();

      if (!orderErr && orderData) {
        const orderItemsWithId = orderPayload.items.map(item => ({
          order_id: orderPayload.order.id,
          product_id: item.id,
          product_name: item.name_th,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'ดอก',
          subtotal: item.price * item.quantity
        }));

        await supabase.from('order_items').insert(orderItemsWithId);
        
        // Update product stock
        await updateStockBatch(orderPayload.items);

        return { data: orderPayload.order, source: 'supabase' };
      }
      console.warn('Supabase order creation error:', orderErr);
    } catch (err) {
      console.warn('Supabase order creation exception:', err);
    }
  }

  // Fallback local storage
  const currentOrders = getLocalOrders();
  const fullOrderObj = {
    ...orderPayload.order,
    items: orderPayload.items
  };
  const updatedOrders = [fullOrderObj, ...currentOrders];
  saveLocalOrders(updatedOrders);
  
  // Update stock locally
  await updateStockBatch(orderPayload.items);

  return { data: fullOrderObj, source: 'local' };
};

export const fetchOrders = async () => {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (!error && orders) {
        return { data: orders, source: 'supabase' };
      }
      console.warn('Supabase orders fetch error:', error);
    } catch (err) {
      console.warn('Supabase orders fetch error:', err);
    }
  }

  return { data: getLocalOrders(), source: 'local' };
};

export const resetToSeedData = () => {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_FLOWERS));
  localStorage.removeItem(STORAGE_KEYS.ORDERS);
  return INITIAL_FLOWERS;
};
