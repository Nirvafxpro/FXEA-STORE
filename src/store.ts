import { supabase, STORAGE_BUCKET } from './lib/supabase';
import { Robot, Order, AdminSettings } from './types';

// ─── Helpers ───────────────────────────────────────────
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}
export function formatFileSize(bytes: number): string {
  if (!bytes) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + s[i];
}
export function generateId(): string { return `ea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
export function generateDownloadToken(): string { return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`; }

// ─── Products ──────────────────────────────────────────
export async function getRobots(): Promise<Robot[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) { console.error('getRobots error:', error); return []; }
  return (data || []).map((p: any) => ({ 
    ...p, 
    pairs: typeof p.pairs === 'string' ? JSON.parse(p.pairs) : p.pairs || [], 
    specs: typeof p.specs === 'string' ? JSON.parse(p.specs) : p.specs || [] 
  }));
}

export async function getRobot(id: string): Promise<Robot | undefined> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) { console.error('getRobot error:', error); return undefined; }
  if (!data) return undefined;
  return { 
    ...data, 
    pairs: typeof data.pairs === 'string' ? JSON.parse(data.pairs) : data.pairs || [], 
    specs: typeof data.specs === 'string' ? JSON.parse(data.specs) : data.specs || [] 
  };
}

export async function saveRobot(robot: Partial<Robot> & { id: string }): Promise<void> {
  // Remove fields that don't exist in database
  const { file_type, file_path, ...rest } = robot as any;
  
  const row = { 
    ...rest,
    pairs: JSON.stringify(robot.pairs || []), 
    specs: JSON.stringify(robot.specs || []) 
  };
  
  console.log('Saving robot:', row);
  const { error } = await supabase.from('products').upsert(row);
  if (error) {
    console.error('saveRobot error:', error);
    throw error;
  }
}

export async function deleteRobot(id: string): Promise<void> {
  try {
    // Remove file from storage
    const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list(undefined, { search: id });
    if (files && files.length > 0) {
      await supabase.storage.from(STORAGE_BUCKET).remove(files.map((f: any) => f.name));
    }
  } catch (err) {
    console.error('Error deleting files:', err);
  }
  
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) {
    console.error('deleteRobot error:', error);
    throw error;
  }
}

export async function saveEAFile(robotId: string, file: File): Promise<{ path: string }> {
  const ext = file.name.substring(file.name.lastIndexOf('.'));
  const filePath = `${robotId}${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, { upsert: true });
  if (error) throw error;
  return { path: filePath };
}

export async function saveImageFile(file: File): Promise<string> {
  const ext = file.name.substring(file.name.lastIndexOf('.'));
  const fileName = `images/${Date.now()}${ext}`;
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, file, { upsert: true });
  if (error) throw error;
  
  // Get public URL
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
  return urlData.publicUrl;
}

export async function getEAFile(robotId: string): Promise<{ hasFile: boolean; fileName?: string; size?: number }> {
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(undefined, { search: robotId });
  if (error) console.error('getEAFile error:', error);
  if (data && data.length > 0) {
    const f = data[0];
    return { hasFile: true, fileName: f.name, size: (f as any).metadata?.size || 0 };
  }
  return { hasFile: false };
}

export function downloadEAFile(robotId: string, _token: string): void {
  supabase.storage.from(STORAGE_BUCKET).list(undefined, { search: robotId }).then(({ data }) => {
    if (data && data.length > 0) {
      const fileName = data[0].name;
      supabase.storage.from(STORAGE_BUCKET).download(fileName).then(({ data: blob }) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        }
      });
    }
  });
}

// ─── Orders ────────────────────────────────────────────
export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getOrder(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data;
}

export async function saveOrder(order: Partial<Order> & { id: string }): Promise<any> {
  const { data, error } = await supabase.from('orders').insert(order).select().single();
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const updates: any = { status };
  if (status === 'paid' || status === 'completed') updates.paid_at = new Date().toISOString();
  if (status === 'completed') updates.delivered_at = new Date().toISOString();
  const { error } = await supabase.from('orders').update(updates).eq('id', id);
  if (error) throw error;
}

// ─── Settings ──────────────────────────────────────────
export async function getSettings(): Promise<AdminSettings> {
  const { data, error } = await supabase.from('settings').select('value').eq('key', 'store').single();
  if (error) console.error('getSettings error:', error);
  const defaults: AdminSettings = { paymentPageUrl: '', webhookSecret: '', webhookUrl: '', redirectUrl: '', merchantName: 'FXEA Store', currency: 'USD', webhookServerUrl: '' };
  if (data?.value) return { ...defaults, ...(typeof data.value === 'string' ? JSON.parse(data.value) : data.value) };
  return defaults;
}

export async function saveSettings(s: AdminSettings): Promise<void> {
  const { error } = await supabase.from('settings').upsert({ key: 'store', value: s });
  if (error) throw error;
}

// ─── Auth ──────────────────────────────────────────────
export async function isAdminLoggedIn(): Promise<boolean> {
  return !!localStorage.getItem('fxea_admin_token');
}

export async function adminLogin(password: string): Promise<boolean> {
  const { data } = await supabase.from('settings').select('value').eq('key', 'admin_password').single();
  const correct = data?.value;
  if (correct && password === (typeof correct === 'string' ? correct.replace(/"/g, '') : correct)) {
    localStorage.setItem('fxea_admin_token', btoa(JSON.stringify({ pw: password, exp: Date.now() + 86400000 })));
    return true;
  }
  return false;
}

export function adminLogout(): void { localStorage.removeItem('fxea_admin_token'); }

// ─── Payment URL Builder ───────────────────────────────
export function buildPaymentPageUrl(url: string, meta: Record<string, string>): string {
  // Snippe expects base64 encoded JSON
  const jsonStr = JSON.stringify(meta);
  const base64 = typeof window !== 'undefined' 
    ? window.btoa(jsonStr)
    : Buffer.from(jsonStr).toString('base64');
  return `${url}${url.includes('?') ? '&' : '?'}meta=${base64}`;
}
