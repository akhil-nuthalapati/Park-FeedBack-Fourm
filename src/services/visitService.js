import { supabase } from './supabase';

export async function logVisit(parkId, deviceId = null) {
  const { data, error } = await supabase
    .from('visits')
    .insert([{ park_id: parkId, device_id: deviceId }])
    .select()
    .single();
  return { data, error };
}

export async function getVisitCount(parkId = null, range = 'today') {
  let query = supabase.from('visits').select('id', { count: 'exact', head: true });
  if (parkId) query = query.eq('park_id', parkId);

  const now = new Date();
  switch (range) {
    case 'today':
      query = query.gte('visit_time', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString());
      break;
    case 'week':
      query = query.gte('visit_time', new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString());
      break;
    case 'month':
      query = query.gte('visit_time', new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString());
      break;
    default:
      break;
  }
  const { count, error } = await query;
  return { data: count, error };
}

export async function getDailyVisitors(parkId = null, days = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  let query = supabase
    .from('visits')
    .select('visit_time')
    .gte('visit_time', startDate)
    .order('visit_time', { ascending: true });
  if (parkId) query = query.eq('park_id', parkId);

  const { data, error } = await query;
  if (error) return { data: null, error };

  const grouped = {};
  data.forEach((visit) => {
    const date = new Date(visit.visit_time).toISOString().split('T')[0];
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const chartData = Object.entries(grouped).map(([date, count]) => ({ date, visitors: count }));
  return { data: chartData, error: null };
}
