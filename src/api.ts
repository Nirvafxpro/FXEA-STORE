const API_BASE = 'http://localhost:4000';

async function request(method: string, path: string, body?: any, headers?: Record<string, string>) {
  const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json', ...(headers || {}) } };
  if (body && !(body instanceof FormData)) opts.body = JSON.stringify(body);
  if (body instanceof FormData) { delete (opts.headers as any)['Content-Type']; opts.body = body; }
  const res = await fetch(`${API_BASE}${path}`, opts);
  if (!res.ok) { const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })); throw new Error(err.error || `HTTP ${res.status}`); }
  return res.json();
}

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('fxea_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGetProducts() { return request('GET', '/api/products'); }
export async function apiGetProduct(id: string) { return request('GET', `/api/products/${id}`); }
export async function apiCreateProduct(data: any) { return request('POST', '/api/products', data, authHeaders()); }
export async function apiUpdateProduct(id: string, data: any) { return request('PUT', `/api/products/${id}`, data, authHeaders()); }
export async function apiDeleteProduct(id: string) { return request('DELETE', `/api/products/${id}`, undefined, authHeaders()); }
export async function apiUploadFile(id: string, file: File) { return request('POST', `/api/products/${id}/file`, new FormData().append('file', file) as any || (() => { const fd = new FormData(); fd.append('file', file); return fd; })(), authHeaders()); }
export async function apiGetFileInfo(id: string) { return request('GET', `/api/products/${id}/file`, undefined, authHeaders()); }
export async function apiGetOrders() { return request('GET', '/api/orders', undefined, authHeaders()); }
export async function apiGetOrder(id: string) { return request('GET', `/api/orders/${id}`); }
export async function apiCreateOrder(data: any) { return request('POST', '/api/orders', data); }
export async function apiUpdateOrderStatus(id: string, status: string) { return request('PATCH', `/api/orders/${id}/status`, { status }, authHeaders()); }
export async function apiGetPublicSettings() { return request('GET', '/api/settings'); }
export async function apiGetSettings() { return request('GET', '/api/settings/admin', undefined, authHeaders()); }
export async function apiSaveSettings(data: any) { return request('PUT', '/api/settings', data, authHeaders()); }
export async function apiAdminLogin(password: string) { return request('POST', '/api/admin/login', { password }); }
export async function apiVerifyToken() { return request('GET', '/api/admin/verify', undefined, authHeaders()); }

// Fix: proper FormData upload
export async function apiUploadProductFile(id: string, file: File) {
  const fd = new FormData();
  fd.append('file', file);
  const token = localStorage.getItem('fxea_admin_token');
  const res = await fetch(`${API_BASE}/api/products/${id}/file`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) { const err = await res.json().catch(() => ({ error: 'Upload failed' })); throw new Error(err.error); }
  return res.json();
}
