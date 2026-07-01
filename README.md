# IntelliGate — AI-Powered Self-Optimizing API Gateway 🧠

<p align="center">
  <b>Observe → Analyze → Decide → Act → Improve</b><br/>
  A production-grade, intelligent API Gateway designed to go beyond traditional request routing by embedding real-time observability, AI-driven analysis, and automated optimization into the core request lifecycle. Built with a fault-tolerant, event-driven clean architecture, IntelliGate ensures high availability, resilience under load, and the ability to adapt and improve system performance autonomously.
</p>

---

## 🏷️ Technologies & Badges

![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20API%20Gateway-orange)
![Node](https://img.shields.io/badge/Backend-Next.js%20\(API%20Routes\)-black)
![Database](https://img.shields.io/badge/Database-MongoDB-green)
![Cache](https://img.shields.io/badge/Cache-Redis-red)
![Queue](https://img.shields.io/badge/Queue-BullMQ-blue)
![AI](https://img.shields.io/badge/AI-Groq%20%7C%20Gemini%20%7C%20HuggingFace-purple)
![Testing](https://img.shields.io/badge/Testing-Jest%20%7C%20K6-yellow)
![Docs](https://img.shields.io/badge/API-Docs%20\(Swagger\)-brightgreen)

---

## 📌 Live Demo

🔗 **DEMO LINK:**[ [https://jp5vmikp4c.execute-api.ap-south-1.amazonaws.com](https://jp5vmikp4c.execute-api.ap-south-1.amazonaws.com)](https://hhxq3xtdzl.execute-api.ap-south-1.amazonaws.com/docs)

---

## 📸 API Preview

<p align="center">
  <br>
  <img width="1920" height="1080" alt="Swagger API Docs" src="https://github.com/user-attachments/assets/982e7d72-72f7-46a3-ba16-def7d697db40" />
  <br>
  <img width="1920" height="1080" alt="Telemetry View" src="https://github.com/user-attachments/assets/a5a19ac2-bf32-434a-9802-6b4d5c5d4da4" />
  <br>
  <img width="1886" height="707" alt="Request Logs" src="https://github.com/user-attachments/assets/17b8c493-9d88-4a5b-9a4c-562c1f14523f" />
</p>

---

## 🏗️ Architecture & System Flow

IntelliGate utilizes a strict **Clean Architecture** model. The core intelligence is isolated in `@intelligate/core` and remains decoupled from infrastructure adapters (Redis, MongoDB, Groq, Gemini) which are injected at runtime.

```mermaid
graph LR
  Client[Client Application] --> SDK[@intelligate/sdk]
  SDK --> Gateway[Next.js API Gateway]
  Gateway --> Cache[(Redis Cache)]
  Gateway --> Telemetry[(MongoDB)]
  Telemetry --> Optimizer[IntelliGate Core Engine]
  Optimizer --> AI(AI Providers)
  AI --> Optimizer
  Optimizer --> Action[Apply Decisions]
```

```text
Client Request
      ↓
API Gateway (Next.js on AWS Lambda)
      ↓
IntelliGate Core Engine (Observe & Formulate)
      ↓
Metrics Collector → MongoDB
      ↓
AI Engine (Groq / Gemini / HF Fallback)
      ↓
Decision Rules (Rate Limit / Cache / Circuit Break)
      ↓
Feedback Loop (Observe Performance Post-Action)
```

---

## 📦 Official TypeScript SDK

We provide an official, production-grade, zero-dependency TypeScript SDK to consume IntelliGate securely.

### Installation
```bash
npm install @intelligate/sdk
```

### Quick Start
```typescript
import { IntelliGate } from '@intelligate/sdk';

const client = new IntelliGate({
  baseURL: 'https://jp5vmikp4c.execute-api.ap-south-1.amazonaws.com/api',
  apiKey: 'YOUR_API_KEY', // Gotten from auth.login()
  timeout: 5000,
  maxRetries: 3
});

async function main() {
  const response = await client.gateway.private();
  console.log('Gateway Response:', response.data.message);
}
main();
```

### SDK API Reference
- **Gateway**: `client.gateway.public()`, `client.gateway.private()`
- **Auth**: `client.auth.register({ email, password })`, `client.auth.login({ email, password })`
- **Metrics**: `client.metrics.list()`
- **Decisions**: `client.decisions.list()`
- **Optimize**: `client.optimize.run({ endpoint, issue })`

---

## 🛡️ Fault Tolerance & Safety

- **AI Fallback System**: Primary Groq prompts fallback seamlessly to Gemini or HuggingFace in case of rate limits or service downtime.
- **Circuit Breaker**: Isolates problematic routes if error rates exceed acceptable thresholds.
- **Cooldown Periods**: Prevents AI decision flap by locking configuration changes for a configurable duration.
- **Exp Backoff**: SDK communications feature automatic retry backoffs for high network resiliency.

---

## 📂 Monorepo Structure

```text
├───apps
│   └───backend          # Next.js API Routes (AWS Lambda ready)
├───examples
│   └───basic            # SDK implementation demo application
├───packages
│   ├───core             # Decoupled Core Logic (Observe/Analyze/Decide)
│   ├───providers        # LLM Adapters (Groq, Gemini, HF)
│   ├───shared           # Shared DTOs and types
│   ├───store-mongo      # Mongo Telemetry Adapter
│   ├───store-redis      # Redis Cache & Rate-Limit Adapter
│   └───sdk              # Official TypeScript SDK Client
```

---

## 🚀 Local Installation & Setup

### Setup Workspace
```bash
git clone https://github.com/ankit18193/IntelliGate-API-Gateway.git
cd IntelliGate-API-Gateway
npm install
npm run build
```

### Environment Config
Create a `.env` file in the root directory:
```env
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=your_jwt_secret

GROQ_API_KEY=gsk_...
HF_API_KEY=hf_...
GEMINI_API_KEY=AIzaSy...
```

### Start Development Server
```bash
npm run dev
```

---

## 👨‍💻 Author

**Ankit Kumar Yadav**  
Backend Engineer | System Design Enthusiast
