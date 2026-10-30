# Criico — Local Cricket Management Platform

A full-stack cricket management application built as part of the **Criico Full Stack Developer (Next.js) assessment**.

The application allows administrators to manage players and teams, record match performances, automatically update player statistics, and rank players using an Impact Score.

## 🔗 Live Demo

**Live Application:** https://criico-cricket-assessment.vercel.app

**GitHub Repository:** https://github.com/bbhanubhakta056/criico-cricket-assessment

---

## Features

- User registration and login
- JWT-based authentication
- HTTP-only session cookies
- Protected dashboard routes
- Protected mutation APIs
- Player CRUD
- Team management
- Team-player assignment
- Match recording
- Match performance tracking
- Automatic player statistics updates
- Impact Score calculation
- Player leaderboard
- Server-side leaderboard data fetching
- Server Action for registration
- Form validation with Zod
- Toast-based client-side validation feedback
- PostgreSQL database with Prisma ORM
- Unit tests with Vitest
- Responsive dashboard UI with Tailwind CSS

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 16 | Full-stack React framework |
| React 19 | UI |
| TypeScript | Type safety |
| PostgreSQL | Relational database |
| Prisma | ORM and database access |
| Tailwind CSS | Styling |
| Zod | Request and form validation |
| bcryptjs | Password hashing |
| jose | JWT creation and verification |
| Sonner | Toast notifications |
| Vitest | Unit testing |
| Vercel | Deployment |
| Neon PostgreSQL | Production database |

---

## Architecture

The application uses the Next.js App Router with a combination of Server Components, Client Components, Server Actions, and Route Handlers.

```text
                        Browser
                           │
                           ▼
                    Next.js App Router
                           │
             ┌─────────────┼─────────────┐
             │             │             │
             ▼             ▼             ▼
       Server Components  Client      Server Actions
             │          Components          │
             │             │                │
             │             ▼                │
             │          Forms/UI             │
             │                              │
             └──────────────┬───────────────┘
                            │
                            ▼
                     Route Handlers
                            │
                 ┌──────────┴──────────┐
                 │                     │
                 ▼                     ▼
             Auth/JWT              Prisma ORM
                                       │
                                       ▼
                                  PostgreSQL
```

---

## Why PostgreSQL?

PostgreSQL was selected instead of MongoDB because the application has several strongly related entities:

- Users
- Players
- Teams
- Team-player relationships
- Matches
- Match performances

The relationships are naturally relational:

```text
Team ───────< TeamPlayer >────── Player
  │                                │
  │                                │
  └──────────── Match ─────────────┘
                    │
                    ▼
             MatchPerformance
```

PostgreSQL provides:

- Referential integrity
- Foreign-key relationships
- Many-to-many relationships
- Transactions
- Consistent updates
- Strong data constraints

Transactions are particularly important when recording a match because a match and its player statistics need to be updated together.

---

## Database Schema

The main entities are:

```text
User

Player
 ├── name
 ├── role
 ├── basePrice
 ├── matchesPlayed
 ├── totalRuns
 └── totalWickets

Team
 └── TeamPlayer

Match
 ├── teamA
 ├── teamB
 └── MatchPerformance

MatchPerformance
 ├── player
 ├── runs
 └── wickets
```

### Player Roles

The application supports:

- Batsman
- Bowler
- All-rounder
- Wicketkeeper

---

## Authentication

Authentication uses JWT with HTTP-only cookies.

### Registration

Registration is implemented using a Next.js Server Action.

The process is:

```text
Registration Form
       │
       ▼
Server Action
       │
       ▼
Zod Validation
       │
       ▼
bcrypt Password Hash
       │
       ▼
PostgreSQL User
```

Passwords are never stored as plain text.

### Login

Login is handled through:

```http
POST /api/auth/login
```

The login flow is:

```text
Email + Password
       │
       ▼
Zod Validation
       │
       ▼
Find User
       │
       ▼
bcrypt.compare()
       │
       ▼
Create JWT
       │
       ▼
HTTP-only Cookie
```

The session cookie:

- Is HTTP-only
- Uses `SameSite=Lax`
- Uses `Secure` in production
- Has a seven-day lifetime

---

## Route Protection

Dashboard routes are protected using the Next.js 16 `proxy.ts` convention.

```text
/dashboard/*
      │
      ▼
    proxy
      │
      ├── No JWT ────────> /login
      │
      └── Valid JWT ─────> Dashboard
```

API mutation endpoints also perform server-side authentication checks.

This provides defense in depth rather than relying only on client-side navigation protection.

---

## Player Management

Administrators can:

- Create players
- View players
- Edit players
- Delete players

Each player contains:

```text
Name
Role
Base Price
Matches Played
Total Runs
Total Wickets
```

Player input is validated using Zod.

Negative statistical values are rejected.

The UI also displays a toast when invalid values such as negative total runs are entered.

---

## Team Management

Teams can be created and assigned players.

Each team contains:

```text
Team
 └── Players
      ├── Player A
      ├── Player B
      └── Player C
```

The application uses a many-to-many relationship between teams and players.

A player can therefore belong to multiple teams.

---

## Match Management

Administrators can record matches between two different teams.

A match contains:

- Team A
- Team B
- Match date
- Player performances

For each participating player:

- Runs
- Wickets

can be recorded.

The server validates that:

1. Both teams exist.
2. The teams are different.
3. Players belong to one of the participating teams.
4. Duplicate player performances are rejected.
5. Runs and wickets cannot be negative.

---

## Match Statistics

When a match is recorded, the application performs the following operations in a database transaction:

```text
Create Match
     │
     ├── Create MatchPerformance records
     │
     ├── Increment Player.matchesPlayed
     │
     ├── Add Player.totalRuns
     │
     └── Add Player.totalWickets
```

Using a transaction ensures the match and player statistics remain consistent.

---

## Impact Score

The Impact Score is calculated using the assessment formula.

### Base Formula

```text
Base Score =
(Total Runs × 1.2)
+
(Total Wickets × 20)
```

Additional role-specific adjustments are then applied.

### Batsman

Runs receive a `1.3x` multiplier.

```text
Adjusted Runs = Total Runs × 1.3
```

### Bowler

Wickets receive a `1.5x` multiplier.

```text
Adjusted Wickets = Total Wickets × 1.5
```

### Matches Played

Players with fewer than five matches receive:

```text
-50
```

Players with more than twenty matches receive:

```text
+100
```

### Wicketkeeper

Wicketkeepers receive:

```text
+30
```

The wicketkeeper bonus does not apply the bowler multiplier.

---

## Impact Score Implementation

The calculation is isolated in:

```text
lib/cricket/impact-score.ts
```

This keeps the business logic independent from the UI and API layers.

Conceptually:

```text
Player Statistics
       │
       ▼
Role Adjustment
       │
       ▼
Base Score
       │
       ▼
Match Experience Adjustment
       │
       ▼
Wicketkeeper Bonus
       │
       ▼
Impact Score
```

---

## Leaderboard

The leaderboard ranks players by Impact Score.

The leaderboard page intentionally uses a **React Server Component** for database fetching.

Instead of making the server render call its own API:

```text
Server Component
      │
      ▼
Prisma
      │
      ▼
PostgreSQL
```

The score is calculated on the server and the resulting players are sorted by Impact Score.

This satisfies the assessment requirement to use React Server Components for leaderboard fetching.

---

## API Endpoints

### Authentication

#### Login

```http
POST /api/auth/login
```

Example:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

---

### Players

#### Get Players

```http
GET /api/players
```

#### Create Player

```http
POST /api/players
```

#### Update Player

```http
PUT /api/players/:id
```

#### Delete Player

```http
DELETE /api/players/:id
```

---

### Teams

#### Get Teams

```http
GET /api/teams
```

#### Create Team

```http
POST /api/teams
```

#### Update Team

```http
PUT /api/teams/:id
```

#### Delete Team

```http
DELETE /api/teams/:id
```

---

### Matches

#### Get Matches

```http
GET /api/matches
```

#### Record Match

```http
POST /api/matches
```

---

### Leaderboard

#### Get Leaderboard

```http
GET /api/leaderboard
```

---

## Validation

Zod is used to validate incoming data.

Validation covers:

- Authentication
- Player data
- Team data
- Match data
- Player performance data

Examples of rejected input include:

- Negative base price
- Negative matches played
- Negative total runs
- Negative total wickets
- Invalid player role
- Invalid email
- Short password
- Duplicate team names
- Same team playing itself
- Invalid player/team relationships

Validation is performed on the server so it cannot be bypassed by modifying client-side requests.

---

## Testing

Vitest is used for unit testing.

The Impact Score calculation has dedicated unit tests covering:

1. Batsman run multiplier
2. Bowler wicket multiplier and rookie penalty
3. Wicketkeeper bonus without bowler multiplier
4. Veteran bonus

Run tests with:

```bash
npm test
```

For watch mode:

```bash
npm run test:watch
```

---

## Local Development

### Prerequisites

- Node.js
- PostgreSQL
- npm

### 1. Clone the repository

```bash
git clone https://github.com/bbhanubhakta056/criico-cricket-assessment.git
cd criico-cricket-assessment
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create:

```text
.env
```

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="your-long-random-secret"
```

Do not commit `.env` to Git.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run database migrations

```bash
npx prisma migrate dev
```

### 6. Start development server

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3000
```

---

## Available Scripts

```bash
npm run dev
```

Starts the development server.

```bash
npm run lint
```

Runs ESLint.

```bash
npm test
```

Runs the Vitest test suite.

```bash
npm run test:watch
```

Runs Vitest in watch mode.

```bash
npm run build
```

Creates a production build.

```bash
npm start
```

Starts the production server.

---

## Production Validation

Before deployment, the project should pass:

```bash
npm run lint
npm test
npm run build
```

The project passes ESLint, Vitest, and the production Next.js build successfully.

---

## Deployment

The intended production architecture is:

```text
                    Vercel
                      │
                      ▼
                 Next.js App
                      │
                      ▼
                 Neon PostgreSQL
```

Production environment variables:

```env
DATABASE_URL="production-postgresql-connection-string"
JWT_SECRET="production-random-secret"
```

The production JWT secret should be different from any development secret.

---

## Security Considerations

The application includes several security measures:

- Password hashing with bcrypt
- JWT authentication
- HTTP-only cookies
- Secure cookies in production
- SameSite cookie protection
- Server-side Zod validation
- Protected dashboard routes
- Server-side API authentication
- Generic login failure messages
- Database transactions for match updates
- Referential integrity through PostgreSQL
- Environment variables for secrets

Sensitive values are not hardcoded into the application.

---

## Project Structure

```text
criico-cricket-assessment/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── leaderboard/
│   │   ├── matches/
│   │   ├── players/
│   │   └── teams/
│   │
│   ├── dashboard/
│   │   ├── leaderboard/
│   │   ├── matches/
│   │   ├── players/
│   │   └── teams/
│   │
│   ├── login/
│   ├── register/
│   └── page.tsx
│
├── components/
│   ├── matches/
│   ├── teams/
│   └── ...
│
├── generated/
│   └── prisma/
│
├── lib/
│   ├── auth/
│   ├── cricket/
│   ├── validations/
│   └── prisma.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── types/
│
├── proxy.ts
├── prisma.config.ts
├── vitest.config.ts
├── package.json
└── README.md
```

---

## Key Technical Decisions

### Next.js App Router

The App Router provides:

- Server Components
- Server Actions
- Route Handlers
- Integrated frontend and backend
- Route protection through the Next.js 16 proxy convention

This makes it suitable for the full-stack assessment without introducing an unnecessary separate backend service.

### Server Components

The leaderboard uses a Server Component to fetch database data directly.

### Server Actions

Registration uses a Server Action to demonstrate server-side form processing.

### API Route Handlers

REST-style Route Handlers are used where the assessment explicitly requires API endpoints.

### Prisma Transactions

Match recording uses a transaction so match creation and player statistic updates remain consistent.

---

## Assessment Requirements Coverage

| Requirement | Implementation |
|---|---|
| Next.js App Router | Yes |
| React | Yes |
| TypeScript | Yes |
| PostgreSQL / MongoDB | PostgreSQL |
| Database justification | PostgreSQL chosen for relational model |
| JWT / NextAuth | JWT |
| HTTP-only token cookie | Yes |
| Login/Register | Yes |
| Protected `/dashboard` | Yes |
| Player CRUD | Yes |
| Teams | Yes |
| Match recording | Yes |
| `POST /api/auth/login` | Yes |
| `GET/POST /api/players` | Yes |
| `PUT /api/players/[id]` | Yes |
| `POST /api/matches` | Yes |
| `GET /api/leaderboard` | Yes |
| Impact Score | Yes |
| Impact Score unit tests | Yes |
| Tailwind CSS | Yes |
| Jest/Vitest | Vitest |
| Server Action | Registration |
| React Server Component | Leaderboard |
| Negative runs UI toast | Yes |
| Production build | Passing |

---

## Future Improvements

The assessment focuses on the required functionality. Possible future improvements include:

- Role-based administrator accounts
- Player profile pages
- Match detail pages
- Advanced leaderboard filters
- Tournament management
- Pagination
- Search and filtering
- Player statistics charts
- Audit logging
- More comprehensive integration and end-to-end tests

These were intentionally kept outside the core assessment scope to keep the implementation focused.

---

## Author

**Bhanubhakta Bhandari**

Full Stack Developer

**Technologies:** Next.js · React · TypeScript · PostgreSQL · Prisma · NestJS

Built for the **Criico Full Stack Developer (Next.js) assessment**.

---

## License

This project was created for assessment purposes.