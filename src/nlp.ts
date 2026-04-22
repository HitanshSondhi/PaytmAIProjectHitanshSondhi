import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export type Intent =
  | 'GET_COLLECTION' | 'CUSTOMER_PAYMENT' | 'UDHAAR_ADD'
  | 'DUE_LIST' | 'CREDIT_SCORE' | 'CUSTOMER_DUE' | 'CLEAR_ALL_DUES' | 'CLEAR_SINGLE_DUE'
  | 'TOTAL_PENDING' | 'TOTAL_OVERDUE'
  | 'CONFIRM_YES' | 'CONFIRM_NO' | 'UNKNOWN';

export interface NLPResult {
  intent: Intent;
  entities: {
    customerName?: string;
    amount?: number;
    dueDays?: number;
    date?: string;
    period?: 'today' | 'week';
    clearDate?: string;
    overdueOnly?: boolean;
  };
}

const SYSTEM = `You are an intent engine for an Indian merchant voice app.
Extract intent and entities from Hindi/English/Hinglish transcripts.
Return ONLY valid JSON. No markdown. No explanation.

INTENTS:
GET_COLLECTION   → "overall collection","aaj ka total collection","store collection","sale","bikri"
CUSTOMER_PAYMENT → "[name] ka payment","[name] ne kitna diya","[name] ka collection","collection of [name]","payment from [name]"
UDHAAR_ADD       → "udhaar add","credit add","add karo","add kardo","account main","khata mein","daal do","likho","[name] ko [amount]"
CUSTOMER_DUE     → "[name] ka due","[name] ka total due","[name] kitna dena hai","[name] pe kitna baaki","[name] ka udhaar kitna"
TOTAL_PENDING    → "total udhaar pending","kitna udhaar pending","total pending udhar","overall due","pending amount"
TOTAL_OVERDUE    → "total overdue","kitna overdue","overdue kitna","late payments","baaki overdue","overdue amount","overdue total"
CLEAR_ALL_DUES   → "clear all dues","saare dues clear","[name] ka sara udhaar clear","[name] ke saare dues maaf","[name] ka hisab saaf","[name] ka account clear","[name] ke saare payment clear","settle [name]","[name] ka poora hisab clear","clear overdue","clear overdue of [name]","[name] ka overdue clear","[name] ke saare overdue clear"
CLEAR_SINGLE_DUE → "[name] ka [date] wala udhaar clear","[name] ka [date] ka due clear","remove [name] [date] entry","[name] ki [date] wali entry hatao","[name] ka ek udhaar clear","[name] ka [date] ka overdue clear","clear [name] [date] overdue"
DUE_LIST         → "aaj ke due","kal kaun","payment aana hai","due list"
CREDIT_SCORE     → "score","credit score","bharosa"
CONFIRM_YES      → "yes","haan","ji","theek hai","ok","theek","proceed","kar do","karo","sure","confirm","ha","han"
CONFIRM_NO       → "no","nahi","na","mana","reject","cancel","mat karo","ruko","nahi chahiye","band karo"

ENTITIES:
customerName: Extract the person's full name (can be 2-3 words like "Madhur Kumar", "Anita Patel"). Look for names before "ke/ka/ko/ki" or after mentions of account/udhaar.
amount: Convert to number. Hindi: ek hazaar=1000, do hazaar=2000, paanch sau=500, das hazaar=10000. Also match "2000 rupees", "₹5000", etc.
dueDays: number from "X din mein"
date: "today" | "tomorrow"
period: "today" | "week"
clearDate: For CLEAR_SINGLE_DUE - extract the specific date mentioned. Can be "today", "tomorrow", "aaj", "kal", or date like "15 march", "march 15", "15/03", etc. Convert to YYYY-MM-DD format if possible.
overdueOnly: true if the user explicitly says "overdue" or "late" while clearing dues (e.g., "clear overdue", "overdue clear", "late payment clear").

EXAMPLES:
"madhur kumar ke account main 2000 rupees add kardo" → {"intent":"UDHAAR_ADD","entities":{"customerName":"Madhur Kumar","amount":2000}}
"anita patel ka total due kitna hai" → {"intent":"CUSTOMER_DUE","entities":{"customerName":"Anita Patel"}}
"what is the total due of anita patel" → {"intent":"CUSTOMER_DUE","entities":{"customerName":"Anita Patel"}}
"anita patel pe kitna baaki hai" → {"intent":"CUSTOMER_DUE","entities":{"customerName":"Anita Patel"}}
"rahul ke khata mein 5000 daal do" → {"intent":"UDHAAR_ADD","entities":{"customerName":"Rahul","amount":5000}}
"aaj ka collection batao" → {"intent":"GET_COLLECTION","entities":{"period":"today"}}
"rahul ka credit score" → {"intent":"CREDIT_SCORE","entities":{"customerName":"Rahul"}}
"aaj ke due payments" → {"intent":"DUE_LIST","entities":{"date":"today"}}
"what is total udhar pending" → {"intent":"TOTAL_PENDING","entities":{}}
"total pending udhaar kitna hai" → {"intent":"TOTAL_PENDING","entities":{}}
"total overdue kitna hai" → {"intent":"TOTAL_OVERDUE","entities":{}}
"kitna overdue hai" → {"intent":"TOTAL_OVERDUE","entities":{}}
"late payments kitne hain" → {"intent":"TOTAL_OVERDUE","entities":{}}
"overdue amount batao" → {"intent":"TOTAL_OVERDUE","entities":{}}
"clear all dues of ramesh" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Ramesh"}}
"ramesh ka sara udhaar clear karo" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Ramesh"}}
"anita patel ke saare dues maaf karo" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Anita Patel"}}
"settle ramesh ka account" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Ramesh"}}
"ramesh ka poora hisab clear kardo" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Ramesh"}}
"ramesh ka aaj wala udhaar clear karo" → {"intent":"CLEAR_SINGLE_DUE","entities":{"customerName":"Ramesh","clearDate":"today"}}
"rahul ka 15 march ka due hatao" → {"intent":"CLEAR_SINGLE_DUE","entities":{"customerName":"Rahul","clearDate":"2026-03-15"}}
"anita ka kal wala entry remove karo" → {"intent":"CLEAR_SINGLE_DUE","entities":{"customerName":"Anita","clearDate":"tomorrow"}}
"clear overdue of ramesh" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Ramesh","overdueOnly":true}}
"ramesh ka overdue clear karo" → {"intent":"CLEAR_ALL_DUES","entities":{"customerName":"Ramesh","overdueOnly":true}}
"ramesh ka 15 march ka overdue clear karo" → {"intent":"CLEAR_SINGLE_DUE","entities":{"customerName":"Ramesh","clearDate":"2026-03-15","overdueOnly":true}}

IMPORTANT: 
- If user asks about a specific customer's due/pending amount, use CUSTOMER_DUE
- If user asks overall pending udhaar without a customer name, use TOTAL_PENDING
- If user asks about overdue/late payments (past due date), use TOTAL_OVERDUE
- If user asks collection/payment for a specific customer, use CUSTOMER_PAYMENT (NOT GET_COLLECTION)
- If user asks about today's/tomorrow's due list (without customer name), use DUE_LIST
- If user wants to clear/settle/maaf ALL dues of a customer, use CLEAR_ALL_DUES
- If user wants to clear a SPECIFIC date's udhaar entry, use CLEAR_SINGLE_DUE
- Always extract customerName even if it has multiple words
- If user ONLY says confirmation words like "yes","haan","ok","theek hai" without any business context, use CONFIRM_YES
- If user ONLY says rejection words like "no","nahi","cancel" without any business context, use CONFIRM_NO

OUTPUT FORMAT: {"intent":"INTENT_NAME","entities":{"customerName":"Name","amount":1234}}`;

function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function isInvalidNameCandidate(value: string): boolean {
  const v = normalizeSpaces(value.toLowerCase());
  const stopWords = new Set([
    'aaj', 'kal', 'today', 'tomorrow', 'week', 'hafte', 'is hafte',
    'total', 'overall', 'collection', 'payment', 'sale', 'bikri', 'store',
  ]);
  return !v || stopWords.has(v);
}

function extractCustomerNameForCollection(transcript: string): string | undefined {
  const text = normalizeSpaces(transcript.toLowerCase());

  const byPossessive = text.match(
    /([a-z\u0900-\u097f]+(?:\s+[a-z\u0900-\u097f]+){0,2})\s+(?:ka|ke|ki)\s+(?:collection|payment|jama|paid|diya)/i
  );
  const byOfFrom = text.match(
    /(?:collection|payment|paid|diya|jama)\s+(?:of|from)\s+([a-z\u0900-\u097f]+(?:\s+[a-z\u0900-\u097f]+){0,2})/i
  );

  const candidate = byPossessive?.[1] ?? byOfFrom?.[1];
  if (!candidate) return undefined;
  const cleaned = normalizeSpaces(candidate);
  if (isInvalidNameCandidate(cleaned)) return undefined;
  return cleaned;
}

export async function extractIntent(transcript: string): Promise<NLPResult> {
  try {
    console.log('[NLP] Processing transcript:', transcript);

    // Deterministic guardrail: don't let "total pending udhaar" fall back to collection.
    const isPendingQuery = /(pending|baaki|due)\b/.test(transcript) && /(udha?r|udhaar|credit)/.test(transcript);
    const isCollectionQuery = /(collection|sale|bikri|kitna aaya)/.test(transcript);
    if (isPendingQuery && !isCollectionQuery) {
      return { intent: 'TOTAL_PENDING', entities: {} };
    }

    // Deterministic guardrail: customer-specific collection should not map to overall collection.
    const customerNameFromCollection = extractCustomerNameForCollection(transcript);
    const looksLikeCustomerCollection = /(collection|payment|jama|paid|diya)/.test(transcript);
    if (looksLikeCustomerCollection && customerNameFromCollection) {
      return { intent: 'CUSTOMER_PAYMENT', entities: { customerName: customerNameFromCollection } };
    }

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: transcript },
      ],
      temperature: 0,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });
    const raw = completion.choices[0]?.message?.content ?? '{}';
    console.log('[NLP] Raw response:', raw);
    const result = JSON.parse(raw.trim()) as NLPResult;
    const normalized = normalizeSpaces(transcript.toLowerCase());
    const wantsClear = /(clear|settle|maaf|hatao|hata|remove|delete|cancel)/.test(normalized);
    const mentionsOverdue = /(overdue|late|past due|baaki overdue)/.test(normalized);
    if (wantsClear && mentionsOverdue) {
      result.entities = result.entities ?? {};
      result.entities.overdueOnly = true;
      if (result.intent === 'TOTAL_OVERDUE') {
        result.intent = result.entities.clearDate ? 'CLEAR_SINGLE_DUE' : 'CLEAR_ALL_DUES';
      } else if (result.intent === 'CLEAR_ALL_DUES' && result.entities.clearDate) {
        result.intent = 'CLEAR_SINGLE_DUE';
      } else if (result.intent === 'CLEAR_SINGLE_DUE' && !result.entities.clearDate) {
        result.intent = 'CLEAR_ALL_DUES';
      }
    }
    console.log('[NLP] Parsed result:', result);
    return result;
  } catch (e) {
    console.error('[Groq NLP] Error:', e);
    return { intent: 'UNKNOWN', entities: {} };
  }
}
