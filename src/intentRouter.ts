import * as Q from "./queries";
import { KEYS, getCache, invalidateCache, setCache } from "./cache";
import { Intent, NLPResult } from "./nlp";
import { getScoreCategory } from "./scoringEngine";

export interface RouteResult {
  responseText: string;
  responseType: string;
  responseData: Record<string, unknown>;
  orbState: 'success' | 'warning';
}

// Response templates for different languages
const RESPONSES = {
  'hi-IN': {
    weekCollection: (total: number) => `Is hafte ka total collection ₹${total.toFixed(0)} raha.`,
    todayCollection: (total: number, txnCount: number) => `Aaj ka total collection ₹${total.toFixed(0)} raha. ${txnCount} transactions hue hain.`,
    customerNotFound: (name: string) => `${name} customer nahi mila.`,
    customerNameMissing: () => 'Customer ka naam nahi mila.',
    noPaymentToday: (name: string) => `Aaj ${name} se koi payment nahi aaya.`,
    customerPayment: (name: string, total: number, method: string) => `${name} ne aaj ₹${total.toFixed(0)} diye hain, ${method} se.`,
    udhaarMissingInfo: () => 'Customer ka naam aur amount dono boliye.',
    udhaarWarning: (name: string, score: number) => `Warning: ${name} ka credit score ${score} hai — Risky. Pichla payment late tha. Sure hain udhaar dena chahte hain?`,
    udhaarAdded: (name: string, amount: number, score: number, category: string, dueDate: string, createdAt: string) => `${name} ka ₹${amount} udhaar ${createdAt} ko add hua. Credit score ${score} — ${category}. Due date ${dueDate}.`,
    noDue: () => 'Koi payment due nahi hai.',
    dueList: (count: number, names: string) => `${count} payments due hain: ${names}.`,
    customerDue: (name: string, totalDue: number, pendingCount: number, score: number, category: string) => `${name} ka total due ₹${totalDue.toFixed(0)} hai. ${pendingCount} pending entries. Credit score ${score} — ${category}.`,
    customerNoDue: (name: string) => `${name} ka koi pending due nahi hai.`,
    totalPending: (total: number, pendingCount: number) => `Total pending udhaar ₹${total.toFixed(0)} hai. ${pendingCount} pending entries hain.`,
    totalOverdue: (total: number, overdueCount: number) => `Total overdue ₹${total.toFixed(0)} hai. ${overdueCount} entries late hain.`,
    noOverdue: () => 'Koi overdue nahi hai. Sab time pe hai!',
    scoreQuery: () => 'Kis customer ka score chahiye?',
    creditScore: (name: string, score: number, category: string) => `${name} ka credit score ${score} hai — ${category}.`,
    allDuesCleared: (name: string, count: number, total: number) => `${name} ke ${count} pending dues clear ho gaye. Total ₹${total.toFixed(0)} maaf kiya gaya.`,
    noDuesToClear: (name: string) => `${name} ka koi pending due nahi hai clear karne ke liye.`,
    singleDueCleared: (name: string, amount: number, date: string) => `${name} ka ₹${amount.toFixed(0)} wala udhaar clear ho gaya jo ${date} ko due tha.`,
    singleDueNotFound: (name: string, date: string) => `${name} ka ${date} wala koi pending udhaar nahi mila.`,
    dateMissing: () => 'Kaunsi date ka udhaar clear karna hai? Date bataiye.',
    confirmYes: () => 'Theek hai, udhaar add kar raha hoon.',
    confirmNo: () => 'Theek hai, udhaar cancel kar diya.',
    noConfirmationPending: () => 'Koi pending confirmation nahi hai.',
    unknown: () => 'Samajh nahi aaya. Boliye — collection, payment, ya score.',
  },
  'en-IN': {
    weekCollection: (total: number) => `This week's total collection is ₹${total.toFixed(0)}.`,
    todayCollection: (total: number, txnCount: number) => `Today's total collection is ₹${total.toFixed(0)}. ${txnCount} transactions completed.`,
    customerNotFound: (name: string) => `Customer ${name} not found.`,
    customerNameMissing: () => 'Customer name not provided.',
    noPaymentToday: (name: string) => `No payment received from ${name} today.`,
    customerPayment: (name: string, total: number, method: string) => `${name} paid ₹${total.toFixed(0)} today via ${method}.`,
    udhaarMissingInfo: () => 'Please provide both customer name and amount.',
    udhaarWarning: (name: string, score: number) => `Warning: ${name}'s credit score is ${score} — Risky. Previous payment was late. Are you sure you want to add udhaar?`,
    udhaarAdded: (name: string, amount: number, score: number, category: string, dueDate: string, createdAt: string) => `Added ₹${amount} udhaar for ${name} at ${createdAt}. Credit score ${score} — ${category}. Due date ${dueDate}.`,
    noDue: () => 'No payments due.',
    dueList: (count: number, names: string) => `${count} payments due: ${names}.`,
    customerDue: (name: string, totalDue: number, pendingCount: number, score: number, category: string) => `${name}'s total due is ₹${totalDue.toFixed(0)}. ${pendingCount} pending entries. Credit score ${score} — ${category}.`,
    customerNoDue: (name: string) => `${name} has no pending dues.`,
    totalPending: (total: number, pendingCount: number) => `Total pending udhaar is ₹${total.toFixed(0)} across ${pendingCount} pending entries.`,
    totalOverdue: (total: number, overdueCount: number) => `Total overdue is ₹${total.toFixed(0)}. ${overdueCount} entries are past due.`,
    noOverdue: () => 'No overdue payments. All payments are on time!',
    scoreQuery: () => 'Which customer\'s score do you need?',
    creditScore: (name: string, score: number, category: string) => `${name}'s credit score is ${score} — ${category}.`,
    allDuesCleared: (name: string, count: number, total: number) => `Cleared ${count} pending dues for ${name}. Total ₹${total.toFixed(0)} settled.`,
    noDuesToClear: (name: string) => `${name} has no pending dues to clear.`,
    singleDueCleared: (name: string, amount: number, date: string) => `Cleared ₹${amount.toFixed(0)} udhaar for ${name} due on ${date}.`,
    singleDueNotFound: (name: string, date: string) => `No pending udhaar found for ${name} on ${date}.`,
    dateMissing: () => 'Which date\'s udhaar do you want to clear? Please specify the date.',
    confirmYes: () => 'Okay, adding the udhaar now.',
    confirmNo: () => 'Okay, cancelled the udhaar.',
    noConfirmationPending: () => 'No pending confirmation.',
    unknown: () => 'I didn\'t understand. Try saying — collection, payment, or score.',
  },
};

type ResponseLang = keyof typeof RESPONSES;

function getResponses(lang: string) {
  const key = (lang === 'en-IN' ? 'en-IN' : 'hi-IN') as ResponseLang;
  return RESPONSES[key];
}

function getIndiaDate(offsetDays: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export async function routeIntent(
  intent: Intent,
  entities: NLPResult['entities'],
  merchantId: number,
  lang: string = 'hi-IN'
): Promise<RouteResult> {

  const r = getResponses(lang);
  const today = getIndiaDate(0);
  const tomorrow = getIndiaDate(1);

  switch (intent) {

    case 'GET_COLLECTION': {
      if (entities.period === 'week') {
        const data = await Q.getWeekCollection(merchantId);
        const total = data.days.reduce((s, d) => s + d.total, 0);
        return {
          responseText: r.weekCollection(total),
          responseType: 'collection',
          responseData: { days: data.days, total },
          orbState: 'success',
        };
      }
      const cacheKey = KEYS.todayCollection(merchantId);
      let data = await getCache<{total:number,txnCount:number}>(cacheKey);
      if (!data) {
        data = await Q.getTodayCollection(merchantId);
        await setCache(cacheKey, data, 300);
      }
      return {
        responseText: r.todayCollection(data.total, data.txnCount),
        responseType: 'collection',
        responseData: data,
        orbState: 'success',
      };
    }

    case 'CUSTOMER_PAYMENT': {
      if (!entities.customerName)
        return { responseText: r.customerNameMissing(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const customer = await Q.fuzzyMatchCustomer(merchantId, entities.customerName);
      if (!customer)
        return { responseText: r.customerNotFound(entities.customerName), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const payments = await Q.getCustomerPayments(merchantId, customer.id, entities.date ?? today);
      if (payments.length === 0)
        return { responseText: r.noPaymentToday(customer.name), responseType: 'customer_payment', responseData: { customer: customer.name, amount: 0 }, orbState: 'success' };
      const total = payments.reduce((s, p) => s + p.amount, 0);
      return {
        responseText: r.customerPayment(customer.name, total, payments[0].method),
        responseType: 'customer_payment',
        responseData: { customer: customer.name, amount: total, method: payments[0].method },
        orbState: 'success',
      };
    }

    case 'UDHAAR_ADD': {
      if (!entities.customerName || !entities.amount)
        return { responseText: r.udhaarMissingInfo(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const customer = await Q.fuzzyMatchCustomer(merchantId, entities.customerName);
      if (!customer)
        return { responseText: r.customerNotFound(entities.customerName), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const cacheKey = KEYS.score(customer.id);
      let scoreData = await getCache<{score:number,category:string}>(cacheKey);
      if (!scoreData) {
        scoreData = await Q.getCustomerScore(customer.id);
        await setCache(cacheKey, scoreData, 120);
      }
      if (scoreData.score < 60) {
        return {
          responseText: r.udhaarWarning(customer.name, scoreData.score),
          responseType: 'credit_score',
          responseData: { customer: customer.name, score: scoreData.score, category: scoreData.category, warning: true, customerId: customer.id, amount: entities.amount, dueDays: entities.dueDays ?? 7 },
          orbState: 'warning',
        };
      }
      const udhaar = await Q.addUdhaar(merchantId, customer.id, entities.amount, entities.dueDays ?? 7);
      return {
        responseText: r.udhaarAdded(customer.name, entities.amount, scoreData.score, scoreData.category, udhaar.dueDate, udhaar.createdAt),
        responseType: 'udhaar_summary',
        responseData: { customer: customer.name, amount: entities.amount, dueDate: udhaar.dueDate, createdAt: udhaar.createdAt, score: scoreData.score, category: scoreData.category },
        orbState: 'success',
      };
    }

    case 'DUE_LIST': {
      const date = entities.date === 'tomorrow' ? tomorrow : today;
      const cacheKey = KEYS.dueList(merchantId, date);
      let list = await getCache<{customerName:string,amount:number,udhaarId:number}[]>(cacheKey);
      if (!list) {
        list = await Q.getDueList(merchantId, date);
        await setCache(cacheKey, list, 600);
      }
      if (list.length === 0)
        return { responseText: r.noDue(), responseType: 'due_list', responseData: { customers: [] }, orbState: 'success' };
      const separator = lang === 'en-IN' ? ' and ' : ' aur ';
      const names = list.slice(0, 2).map(c => `${c.customerName} ₹${c.amount}`).join(separator);
      return {
        responseText: r.dueList(list.length, names),
        responseType: 'due_list',
        responseData: { customers: list, date },
        orbState: 'success',
      };
    }

    case 'CREDIT_SCORE': {
      if (!entities.customerName)
        return { responseText: r.scoreQuery(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const customer = await Q.fuzzyMatchCustomer(merchantId, entities.customerName);
      if (!customer)
        return { responseText: r.customerNotFound(entities.customerName), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const cacheKey = KEYS.score(customer.id);
      let scoreData = await getCache<{score:number,category:string,events:unknown[]}>(cacheKey);
      if (!scoreData) {
        scoreData = await Q.getCustomerScore(customer.id);
        await setCache(cacheKey, scoreData, 120);
      }
      return {
        responseText: r.creditScore(customer.name, scoreData.score, scoreData.category),
        responseType: 'credit_score',
        responseData: { customer: customer.name, score: scoreData.score, category: scoreData.category, events: scoreData.events },
        orbState: scoreData.score >= 60 ? 'success' : 'warning',
      };
    }

    case 'CUSTOMER_DUE': {
      if (!entities.customerName)
        return { responseText: r.customerNameMissing(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const customer = await Q.fuzzyMatchCustomer(merchantId, entities.customerName);
      if (!customer)
        return { responseText: r.customerNotFound(entities.customerName), responseType: 'unknown', responseData: {}, orbState: 'success' };
      
      const dueData = await Q.getCustomerTotalDue(merchantId, customer.id);
      const cacheKey = KEYS.score(customer.id);
      let scoreData = await getCache<{score:number,category:string}>(cacheKey);
      if (!scoreData) {
        scoreData = await Q.getCustomerScore(customer.id);
        await setCache(cacheKey, scoreData, 120);
      }
      
      if (dueData.totalDue === 0) {
        return {
          responseText: r.customerNoDue(customer.name),
          responseType: 'customer_due',
          responseData: { customer: customer.name, totalDue: 0, pendingCount: 0, score: scoreData.score, category: scoreData.category },
          orbState: 'success',
        };
      }
      
      return {
        responseText: r.customerDue(customer.name, dueData.totalDue, dueData.pendingCount, scoreData.score, scoreData.category),
        responseType: 'customer_due',
        responseData: { customer: customer.name, totalDue: dueData.totalDue, pendingCount: dueData.pendingCount, score: scoreData.score, category: scoreData.category },
        orbState: scoreData.score >= 60 ? 'success' : 'warning',
      };
    }

    case 'TOTAL_PENDING': {
      const data = await Q.getTotalPendingUdhaar(merchantId);
      return {
        responseText: r.totalPending(data.totalPending, data.pendingCount),
        responseType: 'pending_summary',
        responseData: data,
        orbState: 'success',
      };
    }

    case 'TOTAL_OVERDUE': {
      const data = await Q.getDashboardStats(merchantId);
      if (data.overdueCount === 0) {
        return {
          responseText: r.noOverdue(),
          responseType: 'overdue_summary',
          responseData: { overdueTotal: 0, overdueCount: 0 },
          orbState: 'success',
        };
      }
      return {
        responseText: r.totalOverdue(data.overdueTotal, data.overdueCount),
        responseType: 'overdue_summary',
        responseData: { overdueTotal: data.overdueTotal, overdueCount: data.overdueCount },
        orbState: 'warning',
      };
    }

    case 'CLEAR_ALL_DUES': {
      if (!entities.customerName)
        return { responseText: r.customerNameMissing(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      const customer = await Q.fuzzyMatchCustomer(merchantId, entities.customerName);
      if (!customer)
        return { responseText: r.customerNotFound(entities.customerName), responseType: 'unknown', responseData: {}, orbState: 'success' };
      
      const result = await Q.clearAllCustomerDues(merchantId, customer.id);
      
      if (result.clearedCount === 0) {
        return {
          responseText: r.noDuesToClear(customer.name),
          responseType: 'clear_dues',
          responseData: { customer: customer.name, clearedCount: 0, totalCleared: 0 },
          orbState: 'success',
        };
      }
      
      // Invalidate caches for due list and score
      await invalidateCache(KEYS.dueList(merchantId, today));
      await invalidateCache(KEYS.score(customer.id));
      
      return {
        responseText: r.allDuesCleared(customer.name, result.clearedCount, result.totalCleared),
        responseType: 'clear_dues',
        responseData: { customer: customer.name, clearedCount: result.clearedCount, totalCleared: result.totalCleared, entries: result.entries },
        orbState: 'success',
      };
    }

    case 'CLEAR_SINGLE_DUE': {
      if (!entities.customerName)
        return { responseText: r.customerNameMissing(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      
      const customer = await Q.fuzzyMatchCustomer(merchantId, entities.customerName);
      if (!customer)
        return { responseText: r.customerNotFound(entities.customerName), responseType: 'unknown', responseData: {}, orbState: 'success' };
      
      // Parse the clearDate
      let targetDate: string;
      const clearDate = entities.clearDate;
      
      if (!clearDate) {
        return { responseText: r.dateMissing(), responseType: 'unknown', responseData: {}, orbState: 'success' };
      }
      
      if (clearDate === 'today' || clearDate === 'aaj') {
        targetDate = today;
      } else if (clearDate === 'tomorrow' || clearDate === 'kal') {
        targetDate = tomorrow;
      } else {
        // Assume it's already in YYYY-MM-DD format from NLP
        targetDate = clearDate;
      }
      
      const result = await Q.clearSingleDue(merchantId, customer.id, targetDate);
      
      if (result.clearedCount === 0) {
        return {
          responseText: r.singleDueNotFound(customer.name, targetDate),
          responseType: 'clear_single_due',
          responseData: { customer: customer.name, date: targetDate, cleared: false },
          orbState: 'warning',
        };
      }
      
      // Invalidate caches for due list and score
      await invalidateCache(KEYS.dueList(merchantId, targetDate));
      await invalidateCache(KEYS.score(customer.id));
      
      return {
        responseText: r.singleDueCleared(customer.name, result.totalCleared, targetDate),
        responseType: 'clear_single_due',
        responseData: { customer: customer.name, date: targetDate, amount: result.totalCleared, cleared: true },
        orbState: 'success',
      };
    }

    case 'CONFIRM_YES': {
      return {
        responseText: r.confirmYes(),
        responseType: 'confirm_yes',
        responseData: { confirmed: true },
        orbState: 'success',
      };
    }

    case 'CONFIRM_NO': {
      return {
        responseText: r.confirmNo(),
        responseType: 'confirm_no',
        responseData: { confirmed: false },
        orbState: 'success',
      };
    }

    default:
      return {
        responseText: r.unknown(),
        responseType: 'unknown',
        responseData: {},
        orbState: 'success',
      };
  }
}
