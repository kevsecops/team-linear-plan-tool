# Team Calendar Application

A full-stack team calendar application for tracking marketing events, PTO, and other team activities.

## Features

- **Horizontal Calendar Layout**: Continuous row-based calendar layout matching the design specification
- **Event Management**: Create events by clicking and dragging on date ranges
- **Color Coding**: Events are color-coded by event type for easy visual identification
- **User Tracking**: Associate events with team members
- **Event Types**: Categorize events (PTO, Marketing Launch, Conference, etc.)

## Technology Stack

- **Frontend/Backend**: Next.js 14 with App Router
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Containerization**: Docker & Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Setup

1. **Clone the repository** (if applicable)

2. **Start the services**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations**:
   ```bash
   docker-compose exec app npx prisma migrate dev --name init
   ```

4. **Seed the database** (optional):
   ```bash
   docker-compose exec app npm run db:seed
   ```

5. **Access the application**:
   - Open http://localhost:3000 in your browser

### Development

To work on the application locally:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database connection string if needed.

3. **Run Prisma migrations**:
   ```bash
   npm run db:migrate
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

1. **View Calendar**: The calendar displays the full year in a horizontal row layout
2. **Create Events**: Click on a date to start selecting, then click another date to set the range. A modal will open to create the event.
3. **Event Details**: Select a user, event type, and enter a title for the event.
4. **Visual Indicators**: 
   - Weekends (Saturday and Sunday) are highlighted in red
   - Events appear as colored bars spanning their date range
   - Event colors match their event type

## Project Structure

```
├── app/
│   ├── api/          # API routes
│   ├── components/   # React components
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main page
├── lib/
│   └── prisma.ts     # Prisma client
├── prisma/
│   ├── schema.prisma # Database schema
│   └── seed.ts       # Seed script
├── types/            # TypeScript types
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Database Schema

- **User**: Team members
- **EventType**: Event categories with color codes
- **Event**: Calendar events with date ranges, associated user and event type

## License

MIT

