# BizAccess Web

BizAccess Web is a browser-based Business User Management System that builds on the original TypeScript terminal project. It uses TypeScript, Express, EJS, and SQLite to manage a persistent directory of business users.

## Features

- Dashboard with the total user count and recently added users
- User directory with search by name, email address, or role
- Add, view, update, and delete business users
- Server-side validation for names, email addresses, and roles
- Duplicate email address prevention (case-insensitive)
- SQLite storage that persists between application restarts
- Responsive pages with accessible form labels and navigation

Each business user has an automatically assigned ID, a name, an email address, and one of three roles: Administrator, Manager, or Staff.

## Technology

- Node.js and TypeScript
- Express 5 for routing and form handling
- EJS for server-rendered pages
- SQLite with `better-sqlite3` for persistent data
- HTML and CSS for the browser interface

## Run locally

Install dependencies:

```powershell
npm install
```

Build the TypeScript application and run the tests:

```powershell
npm test
```

Start BizAccess Web:

```powershell
npm start
```

Open <http://localhost:3000> in a browser. The user directory is available at <http://localhost:3000/users>. To use another port, set the `PORT` environment variable before starting the application.

The SQLite database is created automatically at `database/bizaccess.db` the first time the server starts. The `database` folder does not need to be created manually.

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

`src/app.ts` configures Express and shared middleware. Route modules map URLs to controllers, controllers validate requests and prepare page data, and `src/models/users.ts` contains the SQLite queries. This MVC separation follows the structure of the related CSE 340 project while adapting it to BizAccess's business-user domain. BizAccess currently has no login or session layer; it is intended as a local coursework application.

`src/database.ts` initializes SQLite. EJS templates render the dashboard and user workflows, and the integration tests exercise the HTTP routes against an in-memory database.

## Next steps

Possible extensions include administrator authentication, pagination for larger directories, role customization, and audit history for user changes.
