# 🎙️ AI Powered Voice Ledger  


> **Voice-first udhaar (credit) management for Indian merchants**
> 
> **for detail command list of voice go to the branch 2 Readme.md**

🌐 **Live Demo Hosted URL**: [https://paytm-ai-project-hitansh-sondhi.vercel.app/](https://paytm-ai-project-hitansh-sondhi.vercel.app/)

   **Detail Pitch Deck**:https://drive.google.com/file/d/1P0K_rnhP2tIwX6ND4IMFQD7yayL35jsY/view?usp=drive_link

   **Disclaimer**: server will take 60 seconds - 120 seconds to get reload after prolonged inactivity.
   
   **Disclaimer**: Default date of due of udhaar will be 1 week as it has been aleardy been set for the simplicity it can be dynamically be added in further patches 
   

Voice Ledger is a modern, AI voice-powered ledger application designed for Indian merchants. Track your business books (Udhaar/Credit, Transactions, Collections) completely hands-free using natural language voice commands in Hindi, English, or Hinglish.

---

## 🏗️ System Architecture & Design

<img width="1025" height="576" alt="image" src="https://github.com/user-attachments/assets/a3a7e173-3b22-484a-8dc6-d8807c6a653b" />


---

## ✨ Features

- 🎤 **Voice Commands** - Natural language processing in Hindi/English/Hinglish
- 📊 **Smart Dashboard** - Real-time metrics, collections, and due tracking
- 💳 **AI-Powered Simple Credit Scoring** - AI-powered customer reliability scores (0-100) based on payment history
- 📱 **WhatsApp Reminders** - Automated payment reminders via Twilio
- 🎨 **3D Voice Orb** - Interactive visual feedback with Three.js
- 🔊 **Text-to-Speech** - Human-like responses via ElevenLabs

---

## 🧠 AI-Powered Simple Credit Scoring System

Voice Ledger includes a lightweight, smart AI credit scoring system to help merchants easily determine customer reliability.
- **Score System (0-100)**: Evaluates a customer's creditworthiness. Higher means more reliable.
- **Analytical Factors**: 
  - Payment consistency and past behavior.
  - Frequency of on-time settlements vs. delayed payments.
  - Overall ratio of paid and pending dues.

  **Credit Score Adjustments:**
  ```text
  +5 → Pays before due date
  +3 → Pays on time
  +2 → Slight delay
  -1 → Late payment
  -3 → Frequently overdue
  ```

- **Merchant Benefit**: Empowers shopkeepers to decide whether to confidently extend more "Udhaar" to a specific individual, all processed seamlessly using intelligent AI context evaluation (Groq NLP).

---

## 🚀 How to Start the Project (For Forkers / Developers)

Follow these complete instructions to set up the project locally if you have forked or cloned the app.

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+
- **PostgreSQL** database (we recommend [Neon](https://neon.tech/))
- **Redis** instance (we recommend [Upstash](https://upstash.com/))

### 1. Fork & Clone the Repository

```bash
# Clone your forked repo
git clone https://github.com/<your-username>/voice-ledger.git
cd voice-ledger
```

### 2. Setup Backend API (`voice-ledger-api`)

```bash
cd voice-ledger-api

# Install dependencies
npm install

# Copy environment file
cp .env.sample .env

# Configure your .env file with:
# - DATABASE_URL (PostgreSQL connection string)
# - GROQ_API_KEY (from groq.com)
# - UPSTASH_REDIS_REST_URL & UPSTASH_REDIS_REST_TOKEN
# - TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN (for WhatsApp)
# - ELEVENLABS_API_KEY (for TTS)

# Run database migrations
npm run db:migrate

# Seed sample data (optional)
npm run db:seed

# Start development server
npm run dev
```

Backend runs on: `http://localhost:3001`

### 3. Setup Frontend (`voice-ledger-frontend`)

```bash
cd ../voice-ledger-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.sample .env

# Configure your .env file with:
# - VITE_ELEVENLABS_API_KEY (for TTS)

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🛠️ List of Commands That Can Be Executed

### NPM Scripts

**Backend (`voice-ledger-api`):**  
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot-reload |
| `npm run build` | Compile TypeScript into production JS |
| `npm run start` | Run production compiled build |
| `npm run db:migrate` | Execute database migrations |
| `npm run db:seed` | Seed database with sample customers/dues |

**Frontend (`voice-ledger-frontend`):**  
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build frontend for production deployment |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code formatting |

### Quick Start Batch Scripts (Windows OS)

For ease of use, we have included ready-to-use batch scripts in the root directory:

| Script Command | Description |
|----------------|-------------|
| `start-backend.bat` | Start backend server instantly |
| `start-frontend.bat` | Start frontend dev server instantly |
| `start-both.bat` | Start both frontend and backend side-by-side |
| `start-scheduler.bat` | Start WhatsApp reminder polling cron |
| `test-connection.bat` | Test backend & frontend connection health |
| `test-twilio.bat` | Verify Twilio integration |
| `run-whatsapp-test.bat`| Run the WhatsApp sending test logic |

---

## 🗣️ Voice Commands Executable List

Merchants can use the following voice commands through the Voice Orb interface:

### 📊 General Context Commands
| Command Example | Action |
|-----------------|--------|
| *"What is today's collection?"* | View total sales/collections for today |

| *"What is total pending udhaar?"* | Check overall pending credit |
| *"Who has payment due today?"* | List customers with dues today |

### 👤 Customer Specific Commands
| Command Example | Action |
|-----------------|--------|
| *"What is Rahul Sharma's total due?"* | Check customer's pending amount |
| *"Priya Patel ne aaj kitna diya?"* | Check customer's payment today |
| *"Amit Kumar ka score kya hai?"* | Get customer's AI reliability score |
| *"Neha Gupta ko 1000 udhaar add karo"* | Add new credit entry |
| *"Add 1500 for Rohit Singh, due in 7 days"* | Add new credit entry with a due date |
| *"Clear all dues of Vikram Rathore"* | Settle all pending dues |
| *"Anjali ka aaj wala udhaar clear karo"* | Clear specific calendar entry |

### ✅ Confirmation Examples
- *"Haan"*, *"Yes"*, *"Kar do"* → To confirm an action (e.g., adding udhaar to a risky customer)
- *"Nahi"*, *"Cancel"*, *"Ruko"* → To cancel an action

### 💡 Tips for Better Recognition
1. **Include customer names** - Always mention the full name when referring to a specific customer.
2. **Specify amounts clearly** - Say *"five hundred"* or *"500 rupees"* for ₹500.
3. **Wait for the beep** - Start speaking after the voice indicator activates.

*(For full extensive instructions, check `VOICE_COMMANDS.md`)*

---

## 📁 Project Structure

```text
voice-ledger/
├── voice-ledger-api/          # Backend (Node.js/Express)
│   ├── src/
│   │   ├── index.ts           # Entry point
│   │   ├── nlp.ts             # Groq NLP integration
│   │   ├── intentRouter.ts    # Voice command handlers
│   │   └── queries.ts         # Database queries
│   └── scheduler.js           # WhatsApp reminder cron
│
├── voice-ledger-frontend/     # Frontend (React/Vite)
│   └── src/
│       ├── components/        # UI components
│       ├── pages/             # Dashboard, Landing
│       └── store/             # Zustand state
│
├── Systrm_design.jpeg         # Architecture Diagram
├── SYSTEM_DESIGN.md           # Extensive System Design Details
├── VOICE_COMMANDS.md          # Full voice commands logic
└── README.md
```

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<<<<<<< HEAD
<p align="center">
  <strong>Voice Ledger</strong> — Making credit management effortless for Indian merchants 🇮🇳
</p>
=======
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
>>>>>>> parent of 462c8f8 (Update in README)
