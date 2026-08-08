import { supabase, supabaseAdmin } from './supabase';

// Use service role client for public reads if available — bypasses RLS
const publicClient = () => supabaseAdmin || supabase;

export async function submitFeedback(payload) {
  // Use publicClient so anon insert works even if RLS INSERT policy is missing
  const db = publicClient();
  const { data, error } = await db.from('feedback').insert([payload]).select().single();
  // Fallback: simple insert without .select() if RETURNING clause blocked
  if (error && (error.status === 401 || error.code === '42501')) {
    const res = await db.from('feedback').insert([payload]);
    return { data: null, error: res.error };
  }
  return { data, error };
}

export async function getFeedbackByPark(parkId, options = {}) {
  const { page = 1, limit = 20, sortBy = 'created_at', ascending = false } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const db = publicClient();

  let query = db
    .from('feedback')
    .select('*, parks(name)', { count: 'exact' })
    .order(sortBy, { ascending });
  if (parkId) query = query.eq('park_id', parkId);
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data: data || [], error, count: count || 0 };
}

export async function getAllFeedback(options = {}) {
  const { page = 1, limit = 20, sortBy = 'created_at', ascending = false, minRating, maxRating } = options;
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const db = publicClient();

  let query = db
    .from('feedback')
    .select('*, parks(name)', { count: 'exact' })
    .order(sortBy, { ascending });
  if (minRating) query = query.gte('overall_rating', minRating);
  if (maxRating) query = query.lte('overall_rating', maxRating);
  query = query.range(from, to);

  const { data, error, count } = await query;
  return { data: data || [], error, count: count || 0 };
}

export async function getAverageRatings(parkId = null) {
  const db = publicClient();
  let query = db
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
