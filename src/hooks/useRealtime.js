import { useEffect } from 'react';
import { supabase } from '../services/supabase';

/**
 * Subscribe to realtime changes on a Supabase table.
 * @param {string} table - Table name to subscribe to
 * @param {Function} onInsert - Callback for INSERT events
 * @param {Function} onUpdate - Callback for UPDATE events
 * @param {Function} onDelete - Callback for DELETE events
 */
export function useRealtime(table, { onInsert, onUpdate, onDelete } = {}) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table },
        (payload) => onInsert?.(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table },
        (payload) => onUpdate?.(payload.new, payload.old)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table },
        (payload) => onDelete?.(payload.old)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, onInsert, onUpdate, onDelete]);
}

export default useRealtime;
