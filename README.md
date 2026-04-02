# 🎙️ Voice Ledger  


> **Voice-first udhaar (credit) management for Indian merchants**
> 
> **for detail command list of voice go to the branch 2 Readme.md**

🌐 **Live Demo Hosted URL**: [https://paytm-ai-project-hitansh-sondhi.vercel.app/](https://paytm-ai-project-hitansh-sondhi.vercel.app/)

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

<p align="center">
  <strong>Voice Ledger</strong> — Making credit management effortless for Indian merchants 🇮🇳
</p>
