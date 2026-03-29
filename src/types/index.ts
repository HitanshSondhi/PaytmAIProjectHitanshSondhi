export type OrbState = 'idle' | 'listening' | 'responding';
export type Lang = 'hi-IN' | 'ta-IN' | 'te-IN' | 'en-IN';
export type ScoreCategory = 'Good' | 'Average' | 'Risky';
export type UdhaarStatus = 'PENDING' | 'PAID' | 'OVERDUE';
export type PaymentMethod = 'upi' | 'cash' | 'card';
export type ToastType = 'success' | 'error' | 'info';

export interface VoiceResponse {
  intent: string;
  entities: Record<string, unknown>;
  responseText: string;
  responseType: string;
  responseData: Record<string, unknown>;
  orbState: 'success' | 'warning';
}

export interface Customer {
  id: number;
  name: string;
  credit_score: number;
  whatsapp_consent: boolean;
}

export interface UdhaarEntry {
  id: number;
  amount: number;
  due_date: string;
  status: UdhaarStatus;
  reminder_sent_at: string | null;
  customer_name: string;
  customer_id: number;
  credit_score: number;
  whatsapp_consent: boolean;
}

export interface ScoreData {
  score: number;
  category: ScoreCategory;
  events: ScoreEvent[];
}

export interface ScoreEvent {
  event_type: string;
  delta: number;
  note: string;
  created_at: string;
}

export interface DashboardStats {
  todayCollection: number;
  todayTxnCount: number;
  pendingCount: number;
  pendingTotal: number;
  overdueCount: number;
  overdueTotal: number;
}

export interface TransactionResult {
  success: boolean;
  id: number;
  hasPendingUdhaar: boolean;
  pendingUdhaarId: number | null;
  pendingAmount: number | null;
}
