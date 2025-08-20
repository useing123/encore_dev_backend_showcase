# Encore.dev Backend Tech Requirements
## PennyWise/Graphyn-Showcase Migration

### 1. Project Overview

**Current State**: React Native/Expo frontend with local AsyncStorage persistence
**Target State**: Full-stack application with Encore.dev TypeScript backend
**Application Type**: Personal finance management with AI insights and chat capabilities

### 2. Core Backend Requirements

#### 2.1 Authentication & User Management
- **Service**: `auth`
- **Features**:
  - User registration/login with email/password
  - JWT token-based authentication
  - User profile management
  - Session management with refresh tokens
- **Database**: PostgreSQL users table with encrypted passwords
- **Dependencies**: bcrypt for password hashing, jose for JWT handling

#### 2.2 Transactions Service
- **Service**: `transactions`
- **Features**:
  - CRUD operations for financial transactions
  - Category-based transaction filtering
  - Date-range queries for spending analysis
  - Real-time balance calculation
  - Transaction history with pagination
- **Database**: PostgreSQL transactions table
- **API Endpoints**:
  ```typescript
  POST   /transactions                 // Create transaction
  GET    /transactions                 // List with filters
  GET    /transactions/:id            // Get single transaction
  PUT    /transactions/:id            // Update transaction
  DELETE /transactions/:id            // Delete transaction
  GET    /transactions/balance        // Current balance
  GET    /transactions/analytics      // Spending analytics
  ```

#### 2.3 Categories Service
- **Service**: `categories`
- **Features**:
  - Predefined and custom categories
  - Icon mapping for categories
  - Category-based spending analytics
- **Database**: PostgreSQL categories table
- **API Endpoints**:
  ```typescript
  GET    /categories                  // List all categories
  POST   /categories                  // Create custom category
  PUT    /categories/:id              // Update category
  DELETE /categories/:id              // Delete custom category
  ```

#### 2.4 Chat Service
- **Service**: `chat`
- **Features**:
  - Real-time messaging
  - Message persistence
  - AI bot integration
  - WebSocket/SSE support for real-time updates
- **Database**: PostgreSQL messages table
- **API Endpoints**:
  ```typescript
  GET    /chat/messages               // Get chat history
  POST   /chat/messages               // Send message
  WS     /chat/stream                 // Real-time chat stream
  ```

#### 2.5 AI Insights Service
- **Service**: `ai-insights`
- **Features**:
  - Spending pattern analysis
  - Financial recommendations
  - Automated insights generation
  - Integration with external AI APIs (OpenAI, Claude)
- **API Endpoints**:
  ```typescript
  GET    /insights/spending           // Spending insights
  GET    /insights/recommendations    // Financial recommendations
  POST   /insights/generate           // Generate new insights
  ```

### 3. Database Schema

#### 3.1 PostgreSQL Tables

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  description TEXT,
  transaction_date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('user', 'bot')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insights table
CREATE TABLE insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

#### 3.2 Indexes
```sql
CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_messages_user_created ON messages(user_id, created_at DESC);
CREATE INDEX idx_insights_user_type ON insights(user_id, insight_type);
```

### 4. Caching Strategy

#### 4.1 Redis Cache
- **User sessions**: 24h TTL
- **Balance calculations**: 5min TTL
- **Analytics data**: 10min TTL
- **AI insights**: 1h TTL
- **Categories**: 24h TTL

#### 4.2 Cache Keys
```typescript
const CACHE_KEYS = {
  USER_SESSION: (userId: string) => `session:${userId}`,
  USER_BALANCE: (userId: string) => `balance:${userId}`,
  USER_ANALYTICS: (userId: string) => `analytics:${userId}`,
  USER_INSIGHTS: (userId: string) => `insights:${userId}`,
  CATEGORIES: 'categories:all'
};
```

### 5. Real-time Features

#### 5.1 WebSocket Implementation
- **Connection management**: User-based rooms
- **Events**: New messages, balance updates, insights notifications
- **Authentication**: JWT token validation on connection

#### 5.2 Server-Sent Events (SSE)
- **AI streaming responses**: For chat interactions
- **Real-time balance updates**: When transactions are added
- **Notification delivery**: For insights and recommendations

### 6. External Integrations

#### 6.1 AI Service Integration
- **OpenAI API**: For generating insights and chat responses
- **Rate limiting**: 100 requests/hour per user
- **Fallback**: Local analysis when API unavailable

#### 6.2 Payment Processing (Future)
- **Stripe integration**: For premium features
- **Webhook handling**: Payment confirmations

### 7. Security Requirements

#### 7.1 Authentication Security
- Password hashing with bcrypt (cost factor: 12)
- JWT tokens with short expiry (15min access, 7d refresh)
- Rate limiting on auth endpoints (5 attempts/5min)

#### 7.2 Data Security
- SQL injection prevention with parameterized queries
- Input validation and sanitization
- CORS configuration for frontend origins
- Request size limits (1MB max)

#### 7.3 API Security
- Request rate limiting (100 req/min per user)
- API key validation for admin endpoints
- Audit logging for sensitive operations

### 8. Performance Requirements

#### 8.1 Response Times
- Authentication: <200ms
- Transaction CRUD: <300ms
- Analytics queries: <500ms
- AI insights: <2s
- Chat messages: <100ms

#### 8.2 Scalability
- Horizontal scaling with load balancers
- Database connection pooling (max 50 connections)
- Cache warming strategies for analytics
- Background job processing for insights generation

### 9. Environment Configuration

#### 9.1 Development Environment
```typescript
export const config = {
  database: {
    url: process.env.DATABASE_URL!,
    maxConnections: 10
  },
  redis: {
    url: process.env.REDIS_URL!,
    maxRetries: 3
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiry: '15m',
    refreshExpiry: '7d'
  },
  ai: {
    openaiKey: process.env.OPENAI_API_KEY,
    claudeKey: process.env.CLAUDE_API_KEY
  }
};
```

#### 9.2 Production Environment
- Environment variable validation
- Health check endpoints
- Monitoring and logging setup
- SSL/TLS configuration
- Database backup strategy

### 10. API Documentation

#### 10.1 OpenAPI Specification
- Automatic generation with Encore.dev
- Interactive API docs
- Request/response examples
- Authentication requirements

#### 10.2 Client SDK Generation
- TypeScript SDK for React Native client
- Type-safe API calls
- Error handling utilities
- Retry logic implementation

### 11. Testing Requirements

#### 11.1 Unit Tests
- Service layer testing with 80%+ coverage
- Database operation testing
- Authentication flow testing
- Cache operation testing

#### 11.2 Integration Tests
- End-to-end API testing
- WebSocket connection testing
- External service integration testing
- Performance testing under load

#### 11.3 Test Data
- Mock user accounts
- Sample transaction data
- Test category configurations
- Staging environment setup

### 12. Deployment & Infrastructure

#### 12.1 Encore.dev Cloud
- Automatic deployment from Git
- Environment promotion (dev → staging → prod)
- Database migrations
- Redis cluster setup

#### 12.2 Monitoring
- Application performance monitoring
- Database query analysis
- Error tracking and alerting
- User analytics and metrics

### 13. Migration Strategy

#### 13.1 Data Migration
- Export existing AsyncStorage data
- Import to PostgreSQL with user assignment
- Category mapping and validation
- Transaction integrity verification

#### 13.2 Frontend Updates
- Replace AsyncStorage with API calls
- Implement authentication flow
- Add real-time WebSocket connection
- Update error handling for network requests

#### 13.3 Rollout Plan
1. **Phase 1**: Basic CRUD APIs (auth, transactions, categories)
2. **Phase 2**: Real-time features (chat, notifications)
3. **Phase 3**: AI insights and analytics
4. **Phase 4**: Advanced features and optimizations

### 14. Questions for Clarification

Before proceeding with implementation, please clarify:

1. **User Management**: Do you need multi-user support or single-user per app instance?
2. **AI Integration**: Which AI service should we integrate with (OpenAI, Claude, local model)?
3. **Real-time Features**: Priority level for WebSocket vs SSE implementation?
4. **Data Migration**: Do you have existing production data that needs migration?
5. **Authentication**: Do you need social login (Google, Apple) or email/password only?
6. **Deployment**: Should we use Encore.dev Cloud or self-hosted deployment?
7. **Premium Features**: Are there paid features that require payment integration?
8. **Analytics**: Do you need detailed user analytics and usage tracking?
9. **Internationalization**: Multi-language support requirements?
10. **Offline Support**: Should the app work offline with sync capabilities?

### 15. Next Steps

1. **Architecture Review**: Validate the proposed architecture
2. **Environment Setup**: Configure Encore.dev development environment
3. **Database Design**: Finalize schema and create migrations
4. **API Development**: Start with core services (auth, transactions)
5. **Frontend Integration**: Update React Native app to use new APIs
6. **Testing Setup**: Implement comprehensive testing strategy
7. **Deployment Pipeline**: Configure CI/CD with Encore.dev

---

**Total Estimated Development Time**: 6-8 weeks
**Complexity Level**: Medium-High
**Recommended Team Size**: 2-3 developers (1 backend, 1 frontend, 1 DevOps/QA)