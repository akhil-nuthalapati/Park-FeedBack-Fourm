import { supabase, supabaseAdmin } from './supabase';

const publicClient = () => supabaseAdmin || supabase;

export async function getAllParks() {
  const db = publicClient();
  const { data, error } = await db.from('parks').select('*').order('name');
  return { data: data || [], error };
}

export async function getParkById(id) {
  if (!id) return { data: null, error: 'Park ID is required' };
  const db = publicClient();
  const { data, error } = await db.from('parks').select('*').eq('id', id).single();
  return { data, error };
}

export async function getParkByQrCode(code) {
  if (!code) return { data: null, error: 'Invalid QR Code' };
  const db = publicClient();
  const cleanCode = String(code).trim().toUpperCase();

  let { data, error } = await db.from('parks').select('*').ilike('qr_code', cleanCode).single();
  if (error || !data) {
    const res = await db.from('parks').select('*').eq('qr_code', String(code).trim()).single();
    data = res.data;
    error = res.error;
  }
  return { data, error };
}

export async function createPark(payload) {
  let qrCode = payload.qr_code;
  if (!qrCode || !qrCode.trim()) {
    const slug = (payload.name || 'PARK')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 15);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    qrCode = `PARK-${slug}-${randomSuffix}`;
  } else {
    qrCode = qrCode.trim().toUpperCase().replace(/\s+/g, '-');
  }

  const db = publicClient();
  const finalPayload = { ...payload, qr_code: qrCode };
  const { data, error } = await db.from('parks').insert([finalPayload]).select().single();
  return { data, error };
}

export async function updatePark(id, payload) {
  if (!id) return { data: null, error: 'Park ID is required' };
  const db = publicClient();
  const finalPayload = { ...payload };
  if (finalPayload.qr_code) {
    finalPayload.qr_code = finalPayload.qr_code.trim().toUpperCase().replace(/\s+/g, '-');
  }
  const { data, error } = await db.from('parks').update(finalPayload).eq('id', id).select().single();
  return { data, error };
}

/** Delete a park — only SUPER_ADMIN can do this (enforced by RLS policy) */
export async function deletePark(id) {
  if (!id) return { error: 'Park ID is required' };
  const db = publicClient();
  const { error } = await db.from('parks').delete().eq('id', id);
  return { error };
}
