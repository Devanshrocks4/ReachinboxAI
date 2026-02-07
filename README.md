# Email Job Scheduler

A production-ready, full-stack email scheduling system built with TypeScript, Express, BullMQ, Redis, PostgreSQL, and Next.js. This system allows scheduling emails with rate limiting, persistence across restarts, and a clean dashboard UI.

## Architecture

### Backend Architecture

The backend is built with a clean separation of concerns:

- **API Server** (`src/index.ts`): Express server handling HTTP requests
- **Worker** (`src/worker.ts`): BullMQ worker processing email jobs
- **Queues** (`src/queues/`): BullMQ queue management with delayed jobs
- **Services** (`src/services/`): Business logic for email operations
- **Database** (`src/db/`): Prisma ORM with PostgreSQL
- **Utils** (`src/utils/`): Email sending and rate limiting utilities
- **Config** (`src/config/`): Environment-driven configuration

### Frontend Architecture

- **Next.js App Router**: Modern React framework with TypeScript
- **Tailwind CSS**: Utility-first CSS framework
- **Components**: Reusable UI components (Header, ComposeEmail, EmailTable)
- **API Integration**: Client-side API calls to backend

### Key Components

1. **Email Scheduling API**: Accepts email data and creates delayed BullMQ jobs
2. **Job Processing Worker**: Processes jobs with concurrency control and SMTP sending
3. **Rate Limiting**: Redis-based hourly limits per sender with automatic rescheduling
4. **Persistence**: Jobs survive server restarts via BullMQ and database storage
5. **Dashboard UI**: Clean interface for composing and monitoring emails

## Scheduling Logic

### Job Creation
- API receives email data (subject, body, sender, recipients, scheduled time)
- Creates database record with PENDING status
- Adds delayed job to BullMQ queue

### Job Processing
- Worker picks up jobs at scheduled time
- Checks rate limit for sender
- If limit exceeded, reschedules to next available hour
- Sends email via SMTP
- Updates database status

### Rate Limiting Approach
- Redis keys: `sender:YYYY-MM-DD-HH` (e.g., `user@example.com:2024-01-15-14`)
- Increments counter on send attempt
- Keys expire after 1 hour
- If limit hit, finds next hour with available slots
- Reschedules job automatically

### Persistence Strategy
- **Database**: Email jobs stored with full lifecycle (PENDING → SENT/FAILED)
- **BullMQ**: Jobs persist in Redis, survive restarts
- **Idempotency**: Status checks prevent duplicate sends
- **Atomic Operations**: Rate limit checks and increments are atomic

### Concurrency Handling
- Worker concurrency: 5 (configurable)
- Rate limiting: Redis atomic operations
- Database transactions: Ensure consistency
- Queue isolation: Separate queues for different job types

### Restart Behavior
- **API Server Restart**: No impact, jobs continue in queue
- **Worker Restart**: BullMQ resumes processing from Redis
- **Database Restart**: Prisma handles reconnection
- **Redis Restart**: Jobs lost if not persisted (use Redis persistence in production)

## Tech Stack

### Backend
- **TypeScript**: Type safety and modern JavaScript
- **Express.js**: RESTful API server
- **BullMQ + Redis**: Job queuing with persistence
- **Prisma + PostgreSQL**: Database ORM and storage
- **Nodemailer + Ethereal**: SMTP email sending
- **dotenv**: Environment configuration

### Frontend
- **Next.js**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Google OAuth**: Authentication (placeholder implementation)

### Infrastructure
- **Docker Compose**: Redis and PostgreSQL containers
- **Environment Variables**: Configuration management

## Setup Instructions

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (via Docker)
- Redis (via Docker)

### Installation

1. **Clone and setup backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Start infrastructure:**
   ```bash
   docker-compose up -d
   ```

4. **Start backend services:**
   ```bash
   # Terminal 1: API server
   npm run dev

   # Terminal 2: Worker
   npm run worker
   ```

5. **Setup frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Environment Variables

**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/email_scheduler"
REDIS_URL="redis://localhost:6379"
SMTP_HOST="smtp.ethereal.email"
SMTP_PORT=587
SMTP_USER="your-ethereal-user"
SMTP_PASS="your-ethereal-pass"
PORT=3001
NODE_ENV="development"
MAX_EMAILS_PER_HOUR=10
MIN_DELAY_BETWEEN_SENDS=1000
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## API Endpoints

### POST /api/emails/schedule
Schedule a new email campaign.

**Request Body:**
```json
{
  "subject": "Welcome Email",
  "body": "Welcome to our service!",
  "sender": "noreply@example.com",
  "recipients": ["user1@example.com", "user2@example.com"],
  "scheduledAt": "2024-01-15T10:00:00Z",
  "delay": 1000,
  "maxEmailsPerHour": 10
}
```

**Response:**
```json
{
  "success": true,
  "emailJobId": "uuid"
}
```

### GET /api/emails/scheduled
Get all scheduled emails.

### GET /api/emails/sent
Get all sent emails.

## Database Schema

```sql
-- EmailJob table
CREATE TABLE "EmailJob" (
  "id" TEXT PRIMARY KEY,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "sender" TEXT NOT NULL,
  "recipients" TEXT[] NOT NULL,
  "scheduledAt" TIMESTAMP NOT NULL,
  "status" "EmailStatus" NOT NULL,
  "sentAt" TIMESTAMP,
  "failedAt" TIMESTAMP,
  "error" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EmailStatus enum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
```

## Production Considerations

### Scalability
- **Horizontal Scaling**: Multiple worker instances
- **Database Sharding**: For high-volume email jobs
- **Redis Cluster**: For distributed rate limiting

### Reliability
- **Monitoring**: BullMQ dashboard, database metrics
- **Logging**: Structured logging with Winston
- **Error Handling**: Comprehensive error boundaries
- **Retries**: BullMQ job retries with exponential backoff

### Security
- **Input Validation**: Zod schemas for API inputs
- **Rate Limiting**: Additional API rate limiting
- **Authentication**: JWT tokens for API access
- **Encryption**: Encrypt sensitive email data

### Performance
- **Connection Pooling**: Prisma connection pooling
- **Caching**: Redis caching for frequent queries
- **Batch Processing**: Group small email jobs
- **Async Processing**: Non-blocking email sending

## Development

### Scripts
```bash
# Backend
npm run build      # Build TypeScript
npm run dev        # Start API server with hot reload
npm run worker     # Start worker process
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio

# Frontend
npm run dev        # Start Next.js dev server
npm run build      # Build for production
npm run start      # Start production server
```

### Testing
- Unit tests for services and utilities
- Integration tests for API endpoints
- E2E tests for email scheduling flow
- Load testing for rate limiting

## Contributing

1. Follow TypeScript strict mode
2. Write comprehensive tests
3. Update documentation
4. Use conventional commits
5. Ensure code quality with ESLint

## License

MIT License - see LICENSE file for details.
# ReachinboxAI
