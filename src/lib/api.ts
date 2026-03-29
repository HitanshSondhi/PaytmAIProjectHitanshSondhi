import type { Customer, DashboardStats, ScoreData, TransactionResult, UdhaarEntry, VoiceResponse } from "../types";

// In development with Vite proxy, use relative URLs (no base)
// In production, prefer VITE_API_URL from environment, fallback to deployed Render API.
const DEFAULT_PROD_API_URL = 'https://paytmaiprojecthitanshsondhi.onrender.com';
const envApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const resolvedBaseUrl = import.meta.env.DEV ? '' : (envApiUrl || DEFAULT_PROD_API_URL);
const BASE = resolvedBaseUrl.replace(/\/$/, '');

if (!import.meta.env.DEV && !envApiUrl) {
  console.warn(`VITE_API_URL is not set. Falling back to ${DEFAULT_PROD_API_URL}`);
}

async function post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error [${path}]:`, res.status, errorText);
      throw new Error(`${path} failed: ${res.status} - ${errorText}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    console.error(`Network Error [${path}]:`, error);
    throw new Error(`Failed to connect to ${path}. Is the backend running?`);
  }
}

async function get<T>(path: string): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`);
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error [${path}]:`, res.status, errorText);
      throw new Error(`${path} failed: ${res.status} - ${errorText}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    console.error(`Network Error [${path}]:`, error);
    throw new Error(`Failed to connect to ${path}. Is the backend running?`);
  }
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error [${path}]:`, res.status, errorText);
      throw new Error(`${path} failed: ${res.status} - ${errorText}`);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    console.error(`Network Error [${path}]:`, error);
    throw new Error(`Failed to connect to ${path}. Is the backend running?`);
  }
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
