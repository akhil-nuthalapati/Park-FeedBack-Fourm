import { supabase } from './supabase';

export async function getAllParks() {
  const { data, error } = await supabase.from('parks').select('*').order('name');
  return { data, error };
}

export async function getParkById(id) {
  const { data, error } = await supabase.from('parks').select('*').eq('id', id).single();
  return { data, error };
}

export async function getParkByQrCode(code) {
  const { data, error } = await supabase.from('parks').select('*').eq('qr_code', code).single();
  return { data, error };
}

export async function createPark(payload) {
  const { data, error } = await supabase.from('parks').insert([payload]).select().single();
  return { data, error };
}

export async function updatePark(id, payload) {
  const { data, error } = await supabase.from('parks').update(payload).eq('id', id).select().single();
  return { data, error };
}
