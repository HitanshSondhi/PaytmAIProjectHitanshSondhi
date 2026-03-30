export type Intent =
  | 'GET_COLLECTION' | 'CUSTOMER_PAYMENT' | 'UDHAAR_ADD'
  | 'DUE_LIST' | 'CREDIT_SCORE' | 'CUSTOMER_DUE' | 'CLEAR_ALL_DUES' | 'CLEAR_SINGLE_DUE'
  | 'TOTAL_PENDING' | 'CONFIRM_YES' | 'CONFIRM_NO' | 'UNKNOWN';

export interface NLPResult {
  intent: Intent;
  entities: {
    customerName?: string;
    amount?: number;
    dueDays?: number;
    date?: string;
    period?: 'today' | 'week';
    clearDate?: string;
  };
}

export interface RouteResult {
  responseText: string;
  responseType: string;
  responseData: Record<string, unknown>;
  orbState: 'success' | 'warning';
}
