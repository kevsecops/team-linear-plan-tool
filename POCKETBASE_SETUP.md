# PocketBase Setup Guide

**IMPORTANT**: You must create the PocketBase collections before using the application. The app will show errors until these collections exist.

## Step 1: Initialize PocketBase Admin Account

1. Open http://localhost:8090/_/ in your browser
2. You'll see the PocketBase admin setup page
3. Create your admin account:
   - Enter your email
   - Enter a secure password
   - Click "Create admin"

## Step 2: Create Collections

After logging into the PocketBase admin panel, create the following collections:

### Collection 1: `eventTypes`

1. Click "New collection" or the "+" button
2. Name: `eventTypes`
3. Click "Create"

**Fields to add:**
- `name` (Text, Required, Unique)
- `colorHexCode` (Text, Required)

**Settings:**
- **IMPORTANT**: All rules must allow authenticated users to read/write
- Enable "List rule" for authenticated users: `@request.auth.id != ""`
- Enable "View rule" for authenticated users: `@request.auth.id != ""`
- Enable "Create rule" for authenticated users: `@request.auth.id != ""`
- Enable "Update rule" for authenticated users: `@request.auth.id != ""`
- Enable "Delete rule" for authenticated users: `@request.auth.id != ""`

**Troubleshooting**: If event types disappear after refresh, check:
1. The security rules are set correctly (all should allow `@request.auth.id != ""`)
2. You are logged in (check browser console for auth errors)
3. The collection name is exactly `eventTypes` (case-sensitive)

### Collection 2: `events`

1. Click "New collection" or the "+" button
2. Name: `events`
3. Click "Create"

**Fields to add:**
- `title` (Text, Required)
- `startDate` (Date, Required)
- `endDate` (Date, Required)
- `userId` (Relation, Required)
  - Collection: `users`
  - Max select: 1
  - Display field: `email`
- `eventTypeId` (Relation, Required)
  - Collection: `eventTypes`
  - Max select: 1
  - Display field: `name`

**Settings:**
- Enable "List rule" for authenticated users: `@request.auth.id != ""`
- Enable "View rule" for authenticated users: `@request.auth.id != ""`
- Enable "Create rule" for authenticated users: `@request.auth.id != ""`
- Enable "Update rule" for authenticated users: `userId = @request.auth.id`
- Enable "Delete rule" for authenticated users: `userId = @request.auth.id`

## Step 3: Verify Setup

1. Check that both collections exist in the Collections list
2. Verify the fields are correctly configured
3. Test creating a record in each collection to ensure relations work

## Step 4: Test the Application

1. Open http://localhost:3000 in your browser
2. Sign up or log in
3. Try creating an event type in the Settings page
4. Try creating an event on the calendar

## Troubleshooting

- If you see "Collection not found" errors, verify the collection names are exactly `events` and `eventTypes` (case-sensitive)
- If relations don't work, check that the relation fields point to the correct collections
- If authentication fails, ensure the `users` collection exists (it's created automatically by PocketBase)
