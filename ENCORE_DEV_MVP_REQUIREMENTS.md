# Encore.dev MVP Requirements - Hackathon Edition
## PennyWise Personal Finance App

### 🎯 MVP Scope (24-48 hour development)

**Goal**: Bootstrap a working personal finance app with AI insights for hackathon demo
**Complexity**: Minimal viable product - focus on core features only
**Timeline**: 1-2 days maximum development time

### 🏗️ Simplified Architecture

```
React Native App ←→ Encore.dev Backend ←→ PostgreSQL
                          ↓
                     Gemini AI API
```

**No Authentication**: Single-user app (demo purposes)
**No Real-time**: Simple REST API only
**No Caching**: Direct database queries
**Cloud Deploy**: Encore.dev Cloud for instant deployment

### 📋 Core Services (3 services only)

#### 1. Transactions Service
```typescript
// ~/transactions/transactions.ts
import { api } from "encore.dev/api";

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description?: string;
  date: Date;
}

export const addTransaction = api(
  { method: "POST", path: "/transactions" },
  async (req: Omit<Transaction, "id">): Promise<Transaction> => {
    // Insert into database
  }
);

export const getTransactions = api(
  { method: "GET", path: "/transactions" },
  async (): Promise<Transaction[]> => {
    // Return all transactions
  }
);

export const getBalance = api(
  { method: "GET", path: "/balance" },
  async (): Promise<{ balance: number }> => {
    // Calculate total balance
  }
);
```

#### 2. Categories Service
```typescript
// ~/categories/categories.ts
export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const getCategories = api(
  { method: "GET", path: "/categories" },
  async (): Promise<Category[]> => {
    // Return predefined categories
  }
);
```

#### 3. AI Insights Service
```typescript
// ~/insights/insights.ts
export const generateInsight = api(
  { method: "POST", path: "/insights" },
  async (): Promise<{ insight: string }> => {
    // Call Gemini AI with spending data
    // Return financial insight
  }
);
```

### 🗄️ Minimal Database Schema

```sql
-- Single table approach for MVP
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Predefined categories (no separate table needed)
-- Will be hardcoded in the service
```

### 🤖 Gemini AI Integration

#### Setup
```typescript
// ~/insights/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateFinancialInsight(transactions: Transaction[]): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `
    Analyze these financial transactions and provide a brief insight:
    ${JSON.stringify(transactions.slice(-10), null, 2)}
    
    Provide a single sentence insight about spending patterns or recommendations.
  `;
  
  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

#### API Configuration
```bash
# Environment variables needed
GEMINI_API_KEY=your_gemini_api_key_here
```

### 📱 Frontend Integration Points

#### Replace AsyncStorage calls with API calls:
```typescript
// Before: AsyncStorage.getItem('transactions')
// After: fetch('/transactions')

// Before: AsyncStorage.setItem('transactions', JSON.stringify(newTransactions))
// After: fetch('/transactions', { method: 'POST', body: JSON.stringify(transaction) })
```

#### Add AI insights to dashboard:
```typescript
// In dashboard component
const [insight, setInsight] = useState('');

const loadInsight = async () => {
  const response = await fetch('/insights', { method: 'POST' });
  const data = await response.json();
  setInsight(data.insight);
};
```

### 🚀 Deployment Strategy

#### 1. Encore.dev Project Setup
```bash
# Install Encore CLI
curl -L https://encore.dev/install.sh | bash

# Create new app
encore app create pennywise-backend

# Deploy to cloud
encore deploy
```

#### 2. Environment Configuration
```typescript
// encore.app
{
  "id": "pennywise-backend",
  "runtime": {
    "node": "18"
  }
}
```

#### 3. Database Setup
```bash
# Encore automatically provisions PostgreSQL
# No manual setup required - just define schema in migrations/
```

### 📂 Project Structure
```
pennywise-backend/
├── encore.app                 # App config
├── transactions/             
│   ├── transactions.ts       # Transaction CRUD API
│   └── migrations/           # Database migrations
├── categories/
│   └── categories.ts         # Categories API  
├── insights/
│   ├── insights.ts           # AI insights API
│   └── gemini.ts            # Gemini integration
└── package.json             # Dependencies
```

### 📦 Dependencies (package.json)
```json
{
  "name": "pennywise-backend",
  "dependencies": {
    "@google/generative-ai": "^0.1.3",
    "encore.dev": "^1.0.0"
  }
}
```

### 🎯 MVP Features Only

#### ✅ Include:
- Add/view transactions
- Basic categories (hardcoded list)
- Current balance calculation
- One AI insight generation
- Simple REST API

#### ❌ Exclude for MVP:
- User authentication
- Real-time updates
- Advanced analytics
- Transaction editing/deletion
- Custom categories
- Caching
- Rate limiting
- Comprehensive error handling

### 🚀 Quick Implementation Steps

#### Day 1 (4-6 hours):
1. **Setup Encore project** (30 min)
2. **Create transactions API** (2 hours)
3. **Add categories endpoint** (1 hour)
4. **Database schema & migrations** (1 hour)
5. **Test basic CRUD operations** (1 hour)

#### Day 2 (2-4 hours):
1. **Integrate Gemini AI** (2 hours)
2. **Update React Native app** (2 hours)
3. **Deploy to Encore Cloud** (30 min)
4. **Demo preparation** (30 min)

### 🔧 Quick Start Commands

```bash
# 1. Create Encore app
encore app create pennywise-backend
cd pennywise-backend

# 2. Add Gemini dependency
npm install @google/generative-ai

# 3. Create services
mkdir transactions categories insights

# 4. Deploy
encore deploy

# 5. Get API URL for React Native app
encore app open
```

### 🌐 Frontend API Calls

```typescript
// Replace existing storage calls
const API_BASE = 'https://your-app.encore.app'; // From encore deployment

// Add transaction
const addTransaction = async (transaction) => {
  const response = await fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  return response.json();
};

// Get transactions
const getTransactions = async () => {
  const response = await fetch(`${API_BASE}/transactions`);
  return response.json();
};

// Get AI insight
const getInsight = async () => {
  const response = await fetch(`${API_BASE}/insights`, { method: 'POST' });
  return response.json();
};
```

### 🎖️ Hackathon Demo Points

1. **"Look, real backend!"** - Show Encore.dev dashboard
2. **"AI-powered insights!"** - Demo Gemini integration
3. **"Cloud deployed!"** - Working API endpoints
4. **"Full-stack mobile app!"** - React Native + Backend
5. **"Built in 24 hours!"** - Rapid development story

### ⚡ Success Metrics for MVP
- ✅ App loads and shows transactions
- ✅ Can add new transactions via API
- ✅ Balance calculates correctly
- ✅ AI generates meaningful insights
- ✅ Deployed and accessible via URL
- ✅ Demo-ready in 24-48 hours

**Ready to implement? This is the absolute minimum viable backend that will impress hackathon judges while being buildable in 1-2 days.**