# BizAccess Web

BizAccess Web is a browser-based Business User Management System that builds on the original TypeScript terminal project. It uses TypeScript, Express, EJS, and SQLite to manage business users.

## Features

- Dashboard with the total user count and recently added users
- Search users by name, email address, or role
- Add, view, update, and delete users
- Server-side input validation
- Case-insensitive duplicate email prevention
- Responsive pages with accessible form labels and navigation

Each user has an automatically assigned ID, a name, an email address, and a role: Administrator, Director, Manager, Supervisor, Team Lead, Analyst, Developer, Support Specialist, or Staff.

## Technology

- Node.js and TypeScript
- Express 5 for routing and form handling
- EJS for server-rendered pages
- SQLite with `better-sqlite3` for data storage
- HTML and CSS for the browser interface

## Run locally

Install dependencies:

```powershell
npm install
```

Build the application and run the tests:

```powershell
npm test
```

Start the server:

```powershell
npm start
```

Open <http://localhost:3000>. The user directory is at <http://localhost:3000/users>. The server uses the `PORT` environment variable when provided, or port 3000 otherwise.

SQLite creates `database/bizaccess.db` automatically when the server starts. The `database` folder does not need to be created manually.

## Deploying to Render

Render deploys this project as a **Web Service** from a GitHub repository. Before deploying, commit and push the project to GitHub. In the Render dashboard, create a new Web Service, connect the BizAccess-Web repository, and configure:

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm ci && npm run build` |
| Start command | `npm start` |

Render sets the `PORT` environment variable automatically; BizAccess listens on that port. After the first successful deployment, Render provides a public `onrender.com` URL.

### Important: security and saved data

**The current app has no login or access control.** Anyone who can open the public URL can view, add, edit, and delete business-user records. Do not put real or confidential user information in a public deployment.

The app currently uses SQLite and stores its database in the service's local filesystem. Render's local filesystem is not persistent across all redeploys and service replacements, so user records may be lost. A persistent disk requires changes to configure the database path and a Render plan that supports disks. A managed Render PostgreSQL database is another option, but the current app does **not** use PostgreSQL yet.

Before using this app for real users, add administrator authentication and choose and implement persistent database storage. For the PostgreSQL option, migrate the database layer and queries to PostgreSQL before attaching a Render database. The current Render steps are suitable only for a no-sensitive-data demonstration.

## Project structure

```text
BizAccess-Web/
├── public/
│   └── styles.css
├── src/
│   ├── app.ts
│   ├── controllers/
│   │   ├── dashboard.ts
│   │   └── users.ts
│   ├── database.ts
│   ├── models/
│   │   └── users.ts
│   └── routes/
│       ├── index.ts
│       └── users.ts
├── test/
│   └── app.test.js
├── views/
│   ├── partials/
│   ├── index.ejs
│   ├── users.ejs
│   ├── user-details.ejs
│   ├── user-edit.ejs
│   └── error.ejs
├── package.json
└── tsconfig.json
```

`src/app.ts` configures Express and shared middleware. Route modules map URLs to controllers, controllers validate requests and prepare page data, and `src/models/users.ts` contains the SQLite queries. This MVC separation follows the structure of the related CSE 340 project while adapting it to BizAccess's business-user domain.

`src/database.ts` initializes the SQLite database. EJS templates render the dashboard and user workflows, and the integration tests exercise the HTTP routes against an in-memory database.

## Possible next steps

- Add administrator login and protect user-management routes
- Configure durable database storage for hosting
- Migrate to PostgreSQL if using a managed Render database
- Add pagination for larger directories and audit history for user changes
