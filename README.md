# Notice Board CRUD Application

## How to Run the Project Locally

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file by copying `.env.example` and add your Supabase PostgreSQL connection string.

```env
DATABASE_URL="your_supabase_postgresql_connection_string"
```

### 3. Push the Database Schema

```bash
npx prisma db push
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:

```
http://localhost:3000
```

---

## What I Would Improve with More Time

Given more time, I would enhance the application with additional features such as:

- **Filtering and Search** – Filter notices by category, priority, and publish date, along with a keyword search.
- **Pagination** – Implement pagination or infinite scrolling to efficiently handle a large number of notices.
- **Draft Notices** – Allow users to save notices as drafts before publishing them.
- **Authentication** – Add user authentication (Sign Up/Login) to restrict CRUD operations to authorized users.

---

## AI Usage

AI was used as a development assistant during this assignment.

Approximately 50% of the project, including the initial project setup, database configuration, Prisma schema, API routes, backend logic, and debugging, was implemented manually.

The remaining 50%, primarily involving UI design, component styling, frontend integration, and code refinement, was assisted using Antigravity Flash 3.5 (Free Tier).
