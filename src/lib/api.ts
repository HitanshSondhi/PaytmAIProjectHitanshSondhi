import type { Customer, DashboardStats, ScoreData, TransactionResult, UdhaarEntry, VoiceResponse } from "../types";

// Vercel production builds do not read local .env files from your machine.
// Set VITE_API_URL in the Vercel project dashboard Environment Variables.
const API_BASE = (import.meta.env.VITE_API_URL || 'https://paytmaiprojecthitanshsondhi.onrender.com').replace(/\/$/, '');

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('[API Error]', { method, url, status: res.status, errorText });
      throw new Error(`${path} failed: ${res.status} - ${errorText}`);
    }

    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    console.error('[API Network Error]', { method, url, error });
    throw new Error(`Failed to connect to ${path}.`);
  }
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  return request<T>('POST', path, body, signal);
}

async function get<T>(path: string): Promise<T> {
  return request<T>('GET', path);
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  return request<T>('PATCH', path, body);
}

async function del<T>(path: string): Promise<T> {
  return request<T>('DELETE', path);
}

export const api = {
  // Voice
  voice: (transcript: string, lang: string, signal?: AbortSignal) =>
    post<VoiceResponse>('/api/voice', { transcript, lang, merchantId: 1 }, signal),

  // Stats
  stats: () => get<DashboardStats>('/api/stats'),

  // Udhaar
  udhaar: () => get<{ ledger: UdhaarEntry[] }>('/api/udhaar'),
  addUdhaar: (customerId: number, amount: number, dueDays: number) =>
    post('/api/udhaar', { customerId, amount, dueDays }),
  confirmUdhaar: (customerId: number, amount: number, dueDays: number, lang: string) =>
    post<VoiceResponse & { success: boolean }>('/api/udhaar/confirm', { customerId, amount, dueDays, lang }),
  markPaid: (id: number) => post(`/api/udhaar/${id}/paid`, {}),

  // Customers
  customers: (sort?: 'name' | 'recent' | 'credit_score' | 'activity') => 
    get<{ customers: Customer[] }>(`/api/customers${sort ? `?sort=${sort}` : ''}`),
  addCustomer: (name: string, phone: string, whatsappConsent: boolean) =>
    post('/api/customers', { name, phone, whatsappConsent }),
  updateConsent: (id: number, consent: boolean) =>
    patch(`/api/customers/${id}/consent`, { consent }),
  deleteCustomer: (id: number) =>
    del<{ success: boolean; customer: { id: number; name: string } }>(`/api/customers/${id}`),

  // Transactions
  recordPayment: (customerId: number, amount: number, method: string) =>
    post<TransactionResult>('/api/transactions', { customerId, amount, method }),

  // Score
  score: (customerId: number) =>
    get<ScoreData & { customerId: number }>(`/api/score?customerId=${customerId}`),

  // Remind
  sendReminder: (udhaarId: number) =>
    post('/api/remind', { udhaarId }),

  // Health
  health: () => get<{ status: string }>('/health'),
};
