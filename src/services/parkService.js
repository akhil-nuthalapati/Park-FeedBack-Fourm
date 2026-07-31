import { supabase } from './supabase';

/**
 * Get all parks (respects RLS — anon sees active only, auth sees all).
 */
export async function getAllParks() {
  const { data, error } = await supabase
    .from('parks')
    .select('*')
    .order('name');
  return { data, error };
}

/**
 * Get a single park by ID.
 */
export async function getParkById(id) {
  const { data, error } = await supabase
    .from('parks')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

/**
 * Get a park by its QR code string.
 */
export async function getParkByQrCode(code) {
  const { data, error } = await supabase
    .from('parks')
    .select('*')
    .eq('qr_code', code)
    .single();
  return { data, error };
}

/**
 * Create a new park (Admin/Super Admin only).
 */
export async function createPark(payload) {
  const { data, error } = await supabase
    .from('parks')
    .insert([payload])
    .select()
    .single();
  return { data, error };
}

/**
 * Update an existing park (Admin/Super Admin only).
 */
export async function updatePark(id, payload) {
  const { data, error } = await supabase
    .from('parks')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}
