# Voice Ledger - Complete Voice Commands List

A comprehensive reference guide for all **actually implemented** voice commands in the Voice Ledger application.

---

## 📋 Table of Contents
1. [General Commands (5 commands)](#general-commands)
2. [Customer-Specific Commands (6 commands)](#customer-specific-commands)
3. [Confirmation Commands (2 types)](#confirmation-commands)
4. [Implementation Details](#implementation-details)

---

## 📊 General Commands

### 1. GET_COLLECTION - Today's or Weekly Collection
**Purpose:** Check your store's collection  
**Returns:** Total sales amount and transaction count

**For Today's Collection:**
- "What is today's collection?"
- "Today's collection"
- "Aaj ka collection kitna hai?"
- "Overall collection"
- "Store collection"
- "Total sale today"
- "Sale"
- "Bikri"

**For Weekly Collection:**
- "What is this week's collection?"
- "Weekly collection"
- "This week's sale"
- "Is hafte ka collection"

**Example Response (Today):**
```
Aaj ka total collection ₹12,500 raha. 15 transactions hue hain.
```

**Example Response (Week):**
```
Is hafte ka total collection ₹87,500 raha.
```

---

### 2. TOTAL_PENDING - Total Pending Udhaar
**Purpose:** Check overall pending credit across all customers  
**Returns:** Sum of all pending dues and entry count

**Supported Voice Commands:**
- "What is total pending udhaar?"
- "Total udhaar pending"
- "Total pending udhar"
- "Kitna udhaar pending hai?"
- "Overall due"
- "Pending amount"

**Example Response:**
```
Total pending udhaar ₹45,000 hai. 12 pending entries hain.
```

---

### 3. TOTAL_OVERDUE - Total Overdue Payments
**Purpose:** Check payments that are past their due date  
**Returns:** Total overdue amount and count of late entries

**Supported Voice Commands:**
- "Total overdue"
- "Kitna overdue hai?"
- "Overdue kitna"
- "Late payments"
- "Baaki overdue"
- "Overdue amount"
- "Overdue total"

**Example Response:**
```
Total overdue ₹8,500 hai. 4 entries late hain.
```

**No Overdue Response:**
```
Koi overdue nahi hai. Sab time pe hai!
```

---

### 4. DUE_LIST - Today's or Tomorrow's Due List
**Purpose:** See which customers have payments due  
**Returns:** List of customers with dues

**Supported Voice Commands:**
- "Aaj ke due"
- "Today's due list"
- "Who has payment due today?"
- "Kal kaun" (for tomorrow)
- "Tomorrow's due list"
- "Payment aana hai"
- "Due list"

**Example Response:**
```
3 payments due hain: Ramesh Kumar ₹2,000 aur Anita Patel ₹1,500.
```

---

## 👤 Customer-Specific Commands

### 5. CUSTOMER_DUE - Check Customer's Total Due
**Purpose:** Find out how much a specific customer owes  
**Returns:** Total pending amount, entry count, and credit score

**Supported Voice Commands:**
- "[name] ka due kitna hai?"
- "What is [name]'s total due?"
- "[name] pe kitna baaki hai?"
- "[name] kitna dena hai?"
- "[name] ka udhaar kitna?"

**Examples:**
- "Ramesh ka due kitna hai?"
- "Anita Patel ka due kitna hai?"
- "What is the total due of Anita Patel"

**Example Response:**
```
Ramesh Kumar ka total due ₹5,000 hai. 3 pending entries. Credit score 75 — Good.
```

**No Due Response:**
```
Ramesh ka koi pending due nahi hai.
```

---

### 6. CUSTOMER_PAYMENT - Check Customer's Payment
**Purpose:** See payments received from a specific customer today  
**Returns:** Payment amount and method

**Supported Voice Commands:**
- "[name] ka payment"
- "[name] ne kitna diya?"
- "Payment from [name]"
- "[name] ka collection"
- "Collection of [name]"
- "[name] ka jama"
- "[name] paid"

**Examples:**
- "Ramesh ka payment"
- "Anita ne kitna diya?"
- "Payment from Mohan Das"

**Example Response:**
```
Ramesh ne aaj ₹1,000 diye hain, Cash se.
```

**No Payment Response:**
```
Aaj Ramesh se koi payment nahi aaya.
```

---

### 7. UDHAAR_ADD - Add Udhaar (Credit Entry)
**Purpose:** Record new credit/udhaar entry for a customer  
**Returns:** Confirmation with due date and credit score (or warning if risky)

**Supported Voice Commands:**
- "[name] ko [amount] udhaar add karo"
- "Add [amount] udhaar for [name]"
- "[name] ke account main [amount]"
- "[name] ke khata mein [amount] daal do"
- "[name] ko [amount] add kardo"
- "[name] ko [amount] credit add"
- "[name] ko [amount] add karo"
- "[name] ko [amount] likho"

**With Due Days (Optional - default is 7 days):**
- "[name] ko [amount], [X] din mein due"

**Examples:**
- "Madhur Kumar ke account main 2000 rupees add kardo"
- "Rahul ke khata mein 5000 daal do"
- "Anita ko 1000, 10 din mein due"

**Example Response (Good Credit Score ≥60):**
```
Ramesh ka ₹500 udhaar 1st April 2026 ko add hua. Credit score 75 — Good. Due date 8th April.
```

**Example Response (Risky Credit Score <60):**
```
Warning: Ramesh ka credit score 45 hai — Risky. Pichla payment late tha. Sure hain udhaar dena chahte hain?
```
*(Then system waits for CONFIRM_YES or CONFIRM_NO)*

---

### 8. CREDIT_SCORE - Check Credit Score
**Purpose:** Get a customer's credit/reliability score  
**Returns:** Score (0-100) with category

**Supported Voice Commands:**
- "[name] ka credit score"
- "[name] ka score"
- "[name] ka bharosa"
- "Score" (requires customer name)

**Examples:**
- "Rahul ka credit score"
- "Anita ka score kya hai?"

**Example Response:**
```
Ramesh ka credit score 75 hai — Good.
```

---

### 9. CLEAR_ALL_DUES - Clear All Dues (Settle Account)
**Purpose:** Mark all pending dues of a customer as paid  
**Returns:** Count of entries cleared and total amount

**Supported Voice Commands:**
- "Clear all dues of [name]"
- "[name] ke saare dues clear karo"
- "Settle [name]'s account"
- "[name] ka poora hisab clear karo"
- "[name] ka sara udhaar maaf karo"
- "[name] ka hisab saaf karo"
- "[name] ka account clear"
- "[name] ke saare payment clear"

**Examples:**
- "Clear all dues of Ramesh"
- "Anita ke saare dues clear karo"
- "Ramesh ka poora hisab clear kardo"

**Example Response:**
```
Ramesh ke 3 pending dues clear ho gaye. Total ₹5,000 maaf kiya gaya.
```

**No Dues Response:**
```
Ramesh ka koi pending due nahi hai clear karne ke liye.
```

---

### 10. CLEAR_SINGLE_DUE - Clear Single Due Entry
**Purpose:** Clear a specific udhaar entry by date  
**Returns:** Confirmation with cleared amount

**Supported Voice Commands:**
- "[name] ka [date] wala udhaar clear karo"
- "[name] ka [date] ka due clear"
- "Remove [name] [date] entry"
- "[name] ki [date] wali entry hatao"
- "[name] ka ek udhaar clear"

**Date can be:**
- "aaj" or "today"
- "kal" or "tomorrow"
- Specific date: "15 march", "march 15", "15/03"

**Examples:**
- "Ramesh ka aaj wala udhaar clear karo"
- "Rahul ka 15 march ka due hatao"
- "Anita ka kal wala entry remove karo"

**Example Response:**
```
Ramesh ka ₹500 wala udhaar clear ho gaya jo 2026-04-01 ko due tha.
```

**Not Found Response:**
```
Ramesh ka 2026-04-01 wala koi pending udhaar nahi mila.
```

---

## ✅ Confirmation Commands

When the system shows a warning for risky customers (credit score <60), it waits for confirmation.

### 11. CONFIRM_YES - Proceed with Action
**Purpose:** Confirm adding udhaar after risky customer warning  
**Returns:** Proceeds to add the udhaar

**Supported Voice Commands:**
- "Yes"
- "Haan"
- "Ji"
- "Ji haan"
- "OK"
- "Okay"
- "Theek hai"
- "Proceed"
- "Kar do"
- "Karo"
- "Sure"
- "Confirm"
- "Ha"
- "Han"

**System Response:**
```
Theek hai, udhaar add kar raha hoon.
```
*(Then adds the udhaar)*

---

### 12. CONFIRM_NO - Cancel Action
**Purpose:** Cancel adding udhaar after risky customer warning  
**Returns:** Cancels the operation

**Supported Voice Commands:**
- "No"
- "Nahi"
- "Na"
- "Naa"
- "Cancel"
- "Mat karo"
- "Ruko"
- "Reject"
- "Nahi chahiye"
- "Band karo"
- "Mana"

**System Response:**
```
Theek hai, udhaar cancel kar diya.
```

---

## 🔢 Number Recognition

The system uses AI (Groq LLaMA 3.3) to understand numbers in multiple formats:

### Amount Recognition
| You Say | System Understands |
|---------|-------------------|
| "Five hundred" | ₹500 |
| "Paanch sau" | ₹500 |
| "Ek hazaar" | ₹1,000 |
| "Do hazaar" | ₹2,000 |
| "Das hazaar" | ₹10,000 |
| "500 rupees" | ₹500 |
| "2000 rupees" | ₹2,000 |
| "₹5000" | ₹5,000 |

### Due Days Recognition
| You Say | System Understands |
|---------|-------------------|
| "X din mein" | X days |
| Default (if not specified) | 7 days |

---

## 💡 Implementation Details

### How It Works

1. **Speech Recognition:** Your voice is converted to text using Web Speech API (browser-based)

2. **NLP Processing:** The text is sent to Groq AI (LLaMA 3.3-70B) which:
   - Identifies the intent (GET_COLLECTION, UDHAAR_ADD, etc.)
   - Extracts entities (customer name, amount, due days, date)
   - Handles Hindi/English/Hinglish mix

3. **Intent Routing:** Based on the intent, the appropriate query is executed

4. **Response:** You receive a voice + text response

### Smart Features

**Fuzzy Name Matching:**
- If you say "Rames" it finds "Ramesh Kumar"
- Handles multi-word names like "Anita Patel", "Madhur Kumar"

**Bilingual Support:**
- Mix Hindi and English freely
- "Ramesh ko 500 rupees add karo" ✓
- "Add 500 to Ramesh ka account" ✓

**Context-Aware:**
- Distinguishes between "total pending" (all customers) vs "[name] ka due" (specific customer)
- Handles collection queries differently for store vs specific customer

**Caching:**
- Frequently accessed data (scores, collections) are cached for faster responses
- Cache auto-invalidates when relevant data changes

---

## 📱 Response Examples

All responses are bilingual (Hindi/English based on language preference):

### Hindi Responses (hi-IN)
- Collection: "Aaj ka total collection ₹12,500 raha. 15 transactions hue hain."
- Udhaar Added: "Ramesh ka ₹500 udhaar add hua. Credit score 75 — Good."
- Warning: "Warning: Ramesh ka credit score 45 hai — Risky."

### English Responses (en-IN)
- Collection: "Today's total collection is ₹12,500. 15 transactions completed."
- Udhaar Added: "Added ₹500 udhaar for Ramesh. Credit score 75 — Good."
- Warning: "Warning: Ramesh's credit score is 45 — Risky."

---

## ⚠️ Important Notes

### Risky Customer Warning
- Triggered when credit score < 60
- Shows warning before adding udhaar
- Requires explicit confirmation (Yes/No)
- Prevents accidental credit to unreliable customers

### Customer Name Requirements
- Use full names (e.g., "Ramesh Kumar", not just "Ramesh")
- System handles fuzzy matching but clarity helps
- Multi-word names are supported

### Date Formats Supported
For CLEAR_SINGLE_DUE:
- "aaj" / "today" → Today's date
- "kal" / "tomorrow" → Tomorrow's date
- "15 march" → Specific date
- "march 15" → Specific date
- "15/03" → Specific date

---

## 🚀 Credit Score Categories

The system calculates credit scores (0-100) based on:
- Payment history
- On-time payment percentage
- Average delay in days
- Number of overdue entries

**Categories:**
- **Good (60-100):** Reliable customers, udhaar added directly
- **Risky (0-59):** Shows warning, requires confirmation

---

## 📊 Quick Reference

| What You Want | Say This |
|---------------|----------|
| Check today's sales | "Today's collection" |
| Add credit to customer | "[name] ko [amount] add karo" |
| Check customer's dues | "[name] ka due kitna hai?" |
| Check credit score | "[name] ka score" |
| Clear all dues | "Clear all dues of [name]" |
| Who owes today | "Aaj ke due" |
| Total pending | "Total pending udhaar" |
| Total late payments | "Total overdue" |

---

## 🔍 Supported Intents (Technical)

For developers:

```typescript
type Intent =
  | 'GET_COLLECTION'      // Today or weekly collection
  | 'CUSTOMER_PAYMENT'    // Customer's payment today
  | 'UDHAAR_ADD'          // Add credit to customer
  | 'DUE_LIST'            // Today/tomorrow due list
  | 'CREDIT_SCORE'        // Customer credit score
  | 'CUSTOMER_DUE'        // Customer's total due
  | 'CLEAR_ALL_DUES'      // Settle all customer dues
  | 'CLEAR_SINGLE_DUE'    // Clear specific date entry
  | 'TOTAL_PENDING'       // Total pending across all
  | 'TOTAL_OVERDUE'       // Total overdue payments
  | 'CONFIRM_YES'         // Confirmation: yes
  | 'CONFIRM_NO'          // Confirmation: no
  | 'UNKNOWN';            // Not understood
```

---

*Voice Ledger - Making credit management effortless for Indian merchants* 🇮🇳

**Version:** 1.0  
**Last Updated:** April 2026  
**NLP Engine:** Groq LLaMA 3.3-70B Versatile  
**Speech Recognition:** Web Speech API

---
