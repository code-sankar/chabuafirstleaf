import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setProductList, setActiveProduct } from '../store';
import { listProducts } from '../services/productService';

export function useProductsInit() {
  const dispatch = useDispatch();
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const products = await listProducts();
        if (cancelled || products.length === 0) return;
        dispatch(setProductList(products));
        dispatch(setActiveProduct(products[0].id));
      } catch {
        /* keep the hardcoded seed as a fallback */
      }
    })();
    return () => { cancelled = true; };
  }, [dispatch]);
}