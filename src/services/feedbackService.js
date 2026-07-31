import { supabase } from './supabase';

export async function submitFeedback(payload) {
  const { data, error } = await supabase.from('feedback').insert([payload]).select().single();
  return { data, error };
}

export async function getFeedbackByPark(parkId, options = {}) {
  const { page = 1, limit = 20, sortBy = 'created_at', ascending = false } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('feedback')
    .select('*, parks(name)', { count: 'exact' })
    .order(sortBy, { ascending });
  if (parkId) query = query.eq('park_id', parkId);
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data, error, count };
}

export async function getAllFeedback(options = {}) {
  const { page = 1, limit = 20, sortBy = 'created_at', ascending = false, minRating, maxRating } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('feedback')
    .select('*, parks(name)', { count: 'exact' })
    .order(sortBy, { ascending });
  if (minRating) query = query.gte('overall_rating', minRating);
  if (maxRating) query = query.lte('overall_rating', maxRating);
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data, error, count };
}

export async function getAverageRatings(parkId = null) {
  let query = supabase
    .from('feedback')
    .select('overall_rating, cleanliness, safety, facilities, greenery, lighting, playground, washroom');
  if (parkId) query = query.eq('park_id', parkId);

  const { data, error } = await query;
  if (error || !data || data.length === 0) return { data: null, error };

  const avgFields = ['overall_rating', 'cleanliness', 'safety', 'facilities', 'greenery', 'lighting', 'playground', 'washroom'];
  const averages = {};
  avgFields.forEach((field) => {
    const values = data.filter((d) => d[field] != null).map((d) => d[field]);
    averages[field] = values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100
      : null;
  });
  averages.total_feedback = data.length;
  return { data: averages, error: null };
}
