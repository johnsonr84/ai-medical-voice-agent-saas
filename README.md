# 🩺 CareSpeak — AI Medical Voice Agent SaaS

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)
![Clerk](https://img.shields.io/badge/Auth-Clerk-purple?logo=clerk)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)
![Neon](https://img.shields.io/badge/DB-Neon-green?logo=neon)
![AssemblyAI](https://img.shields.io/badge/Speech-AssemblyAI-orange)
![Vapi](https://img.shields.io/badge/Voice-Vapi-red)
![Stripe](https://img.shields.io/badge/Billing-Stripe-blue?logo=stripe)

> **Real-time AI-powered medical voice assistant platform built with Next.js, React, and TypeScript.**  
> Users can speak with AI medical specialists, receive symptom triage, generate consultation reports, and manage subscriptions — all with secure authentication and persistent medical session history.

---

## 🧠 What Is CareSpeak?

CareSpeak is a **voice-first healthcare SaaS platform** that lets users talk to AI medical specialists in real time.  
The system converts speech to text, processes symptoms using AI, and responds with natural voice output — simulating real medical consultations while logging structured medical reports for review.

### Patients can:
- 🎤 Speak with AI medical specialists in real time
- 🧾 Receive structured medical consultation reports
- 📜 Review past consultations and medical history
- 💳 Subscribe to premium medical plans

### Providers (future expansion):
- 🏥 Manage specialties and AI agent behaviors
- 📊 Analyze consultation trends
- 🔐 Ensure compliant data handling pipelines

---

## ✨ Key Features

### 🗣️ Real-Time Voice AI
- Live speech-to-text and AI responses
- Natural conversational medical triage
- Powered by **AssemblyAI + Vapi**

### 🧑‍⚕️ AI Medical Specialists
- General Physician
- Pediatrician
- Dermatologist
- Psychologist
- Cardiologist
- Dentist
- Orthopedic
- Gynecologist
- Nutritionist

### 📄 Medical Consultation Reports
- Structured session summaries
- Symptoms, duration, severity, and diagnosis notes
- Timestamped session history

### 🔐 Authentication & Profiles
- Secure login via **Clerk**
- User dashboards and consultation history

### 💳 Subscription Billing
- Free / Pro / Ultra plans
- Tier-based access to medical consultations and reports
- Stripe-powered billing via Clerk

### 🗄️ Persistent Storage
- PostgreSQL hosted on **Neon**
- Secure storage of sessions and reports

---

## 🖥️ Screenshots

### 🏠 Home & Specialists

| Home | AI Specialists |
|------|----------------|
| ![](/public/screenshots/home.png) | ![](/public/screenshots/doctors.png) |

### 🎤 Voice Consultation & History

| Live AI Consultation | Consultation History |
|----------------------|----------------------|
| ![](/public/screenshots/ai-consultation.png) | ![](/public/screenshots/history.png) |

### 💳 Subscription & Reports

| Subscription Plans | Medical Report |
|--------------------|---------------|
| ![](/public/screenshots/subscription.png) | ![](/public/screenshots/report-voice-agent.png) |

> 📌 Tip: Replace `/mnt/data/*.png` with `/public/screenshots/*.png` and store images in your repo for GitHub rendering.

---

## 🧱 Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**

### AI & Voice
- **AssemblyAI** — Speech-to-text
- **Vapi** — Voice agent orchestration
- **OpenRouter** — LLM routing for AI responses

### Auth & Billing
- **Clerk Authentication**
- **Clerk Billing (Stripe)**

### Database
- **PostgreSQL**
- **Neon Serverless DB**

---

## 🔄 How It Works

1. User selects medical specialist
2. Voice stream begins (Vapi)
3. Speech converted to text (AssemblyAI)
4. Prompt sent to AI via OpenRouter
5. AI response streamed back as voice
6. Session transcript stored in PostgreSQL
7. Structured medical report generated and saved

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js 18+
- pnpm or npm
- Clerk Account
- Neon Postgres Database
- AssemblyAI API Key
- Vapi Account
- OpenRouter API Key

---

## 📦 Installation

```bash
git clone https://github.com/johnsonr84/ai-medical-voice-agent-saas.git
cd ai-medical-voice-agent-saas
pnpm install
```

---

## 🔐 Environment Variables

Create `.env.local`:

```env
# ✅ Database Configuration
DATABASE_URL=postgresql://...

# ✅ Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ✅ Clerk Routing
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# ✅ AI LLM API
OPEN_ROUTER_API_KEY=

# ✅ Vapi Voice Assistant
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
NEXT_PUBLIC_VAPI_API_KEY=
```

> ⚠️ Never commit `.env.local` — it is ignored by `.gitignore`.

---

## ▶️ Run Locally

```bash
pnpm dev
```

Visit:  
http://localhost:3000

---

## 📁 Project Structure

```
app/
 ├─ page.tsx            # Landing page
 ├─ doctors/            # Specialist selection
 ├─ session/            # Voice consultation UI
 ├─ history/            # Consultation history
 ├─ pricing/            # Subscription plans
components/
 ├─ VoiceAgent.tsx
 ├─ SessionTranscript.tsx
 ├─ SubscriptionCards.tsx
lib/
 ├─ db.ts               # Neon DB client
 ├─ ai.ts               # OpenRouter client
 ├─ vapi.ts             # Voice agent helpers
middleware.ts           # Clerk route protection
```

---

## 🧩 Expansion Ideas

- HIPAA-compliant logging & encryption
- Provider dashboards
- EHR integrations
- Insurance verification
- Multi-language voice agents
- Wearable health data ingestion

---

## ⚠️ Disclaimer

This project is for **educational and demonstration purposes only**.  
It is **not a medical device** and does not replace professional healthcare services.

---

## 👨‍💻 Author

**Robert Johnson**  
Full-Stack Software Engineer  
🌐 https://robertjohnsonportfolio.com  
🐙 https://github.com/johnsonr84
