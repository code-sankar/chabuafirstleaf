import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../services/supabaseClient';
import { setUser, setLoading, selectUser, selectAuthLoading } from '../store';

/**
 * Single auth hook that syncs Supabase sessions into Redux.
 * Call once at the app root. All other components read from Redux selectors.
 */
export function useAuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setUser(session?.user ?? null));
    });

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setUser(session?.user ?? null));
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);
}

/**
 * Read-only auth hook for any component that needs user state.
 */
export function useAuth() {
  const user = useSelector(selectUser);
  const loading = useSelector(selectAuthLoading);
  return { user, loading, isAuthenticated: !!user };
}
