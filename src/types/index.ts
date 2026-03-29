export type Intent =
  | 'GET_COLLECTION' | 'CUSTOMER_PAYMENT' | 'UDHAAR_ADD'
  | 'DUE_LIST' | 'CREDIT_SCORE' | 'UNKNOWN';

export interface NLPResult {
  intent: Intent;
  entities: {
    customerName?: string;
    amount?: number;
    dueDays?: number;
    date?: string;
    period?: 'today' | 'week';
  };
}

export interface RouteResult {
  responseText: string;
  responseType: string;
  responseData: Record<string, unknown>;
  orbState: 'success' | 'warning';
}
