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
  if (!code) return { data: null, error: 'Invalid QR Code' };
  const cleanCode = String(code).trim().toUpperCase();
  
  // Try ilike (case-insensitive) lookup first
  let { data, error } = await supabase.from('parks').select('*').ilike('qr_code', cleanCode).single();
  if (error || !data) {
    // Fallback: try raw exact match
    const res = await supabase.from('parks').select('*').eq('qr_code', String(code).trim()).single();
    data = res.data;
    error = res.error;
  }
  return { data, error };
}

export async function createPark(payload) {
  let qrCode = payload.qr_code;
  if (!qrCode || !qrCode.trim()) {
    // Auto-generate QR slug from name or random unique suffix
    const slug = (payload.name || 'PARK')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 15);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    qrCode = `PARK-${slug}-${randomSuffix}`;
  } else {
    // Sanitize user-provided QR code (convert spaces to hyphens, uppercase)
    qrCode = qrCode.trim().toUpperCase().replace(/\s+/g, '-');
  }

  const finalPayload = {
    ...payload,
    qr_code: qrCode,
  };

  const { data, error } = await supabase.from('parks').insert([finalPayload]).select().single();
  return { data, error };
}

export async function updatePark(id, payload) {
  const finalPayload = { ...payload };
  if (finalPayload.qr_code) {
    finalPayload.qr_code = finalPayload.qr_code.trim().toUpperCase().replace(/\s+/g, '-');
  }
  const { data, error } = await supabase.from('parks').update(finalPayload).eq('id', id).select().single();
  return { data, error };
}
