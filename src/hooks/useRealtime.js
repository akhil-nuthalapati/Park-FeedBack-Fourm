import { useEffect } from 'react';
import { supabase } from '../services/supabase';

export function useRealtime(table, callback, filter = null) {
  useEffect(() => {
    let channel = supabase.channel(`realtime-${table}`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table, ...(filter ? { filter } : {}) },
      callback
    ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter]);
}
