# Team Calendar Application

A full-stack team calendar application for tracking marketing events, PTO, and other team activities.

## Features

- **Horizontal Calendar Layout**: Continuous row-based calendar layout matching the design specification
- **Event Management**: Create events by clicking and dragging on date ranges
- **Color Coding**: Events are color-coded by event type for easy visual identification
- **User Tracking**: Associate events with team members
- **Event Types**: Categorize events (PTO, Marketing Launch, Conference, etc.)
- **Authentication**: User authentication via PocketBase (email/password and Google OAuth)

## Technology Stack

- **Frontend/Backend**: Next.js 14 with App Router
- **Database**: PocketBase (SQLite)
- **Authentication**: PocketBase Auth
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

3. **Initialize PocketBase**:
   - Open http://localhost:8090/_/ in your browser
   - Create your first admin account
   - Create the required collections via the admin UI:
     - **`events` collection:**
       - `title` (text, required)
       - `startDate` (date, required)
       - `endDate` (date, required)
       - `userId` (relation to `users`, required)
       - `eventTypeId` (relation to `eventTypes`, required)
     - **`eventTypes` collection:**
       - `name` (text, required, unique)
       - `colorHexCode` (text, required)
     - **`users` collection:** (already exists - managed by PocketBase auth)

4. **Access the application**:
   - Open http://localhost:3000 in your browser
   - Sign up or log in to create your first account

### Environment Variables

The application uses two PocketBase URLs for different contexts:

- **`NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090`**: Used by client-side code running in the browser. The browser cannot resolve Docker service names, so it must use `localhost`.
- **`POCKETBASE_INTERNAL_URL=http://pocketbase:8090`**: Used by Next.js API routes running server-side. Uses Docker service name for internal networking, providing better performance and reliability.

These are configured in `docker-compose.yml`. For local development, you can also set them in a `.env` file.

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
   Update `.env` with:
   - `NEXT_PUBLIC_POCKETBASE_URL=http://localhost:8090`
   - `POCKETBASE_INTERNAL_URL=http://pocketbase:8090` (if running in Docker)

3. **Generate TypeScript types** (optional, after creating PocketBase collections):
   ```bash
   npm run typegen
   ```
   This generates types from your PocketBase collections for better type safety.

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Usage

1. **View Calendar**: The calendar displays the full year in a horizontal row layout
2. **Create Events**: Click on a date to start selecting, then click another date to set the range. A modal will open to create the event.
3. **Event Details**: Select a user, event type, and enter a title for the event.
4. **Settings**: Access the settings page to create new event types with custom colors.
5. **Visual Indicators**: 
   - Weekends (Saturday and Sunday) are highlighted in red
   - Events appear as colored bars spanning their date range
   - Event colors match their event type

## Project Structure

```
├── app/
│   ├── api/          # API routes (using PocketBase)
│   ├── components/   # React components
│   ├── login/        # Authentication pages
│   ├── settings/     # Settings page
│   ├── globals.css   # Global styles
│   ├── layout.tsx    # Root layout
│   └── page.tsx      # Main page
├── lib/
│   └── pocketbase.ts # PocketBase client helper
├── types/            # TypeScript types
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Database Schema

All data is stored in PocketBase collections:

- **`users`**: Team members (managed by PocketBase auth)
- **`eventTypes`**: Event categories with color codes
- **`events`**: Calendar events with date ranges, associated user and event type

Relations are handled via PocketBase's relation fields and expanded using the `expand` parameter in API calls.

## Docker Services

The application runs with 2 Docker services:

1. **`pocketbase`**: PocketBase server (database and authentication)
2. **`app`**: Next.js application

PostgreSQL and Prisma have been removed in favor of PocketBase's built-in SQLite database.

## License

MIT
