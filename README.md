# Overview

BizAccess Web is a browser-based business user management application. It lets a user maintain a directory of business users, search for people, and review the roles in use across the organization. User information is stored in a local SQLite database.

To start the application on your computer, open a terminal in the project folder and run:

```powershell
npm install
npm test
npm start
```

The test command builds the TypeScript code and runs the automated tests. Once the server starts, open [http://localhost:3000](http://localhost:3000) to see the dashboard. The user directory is available at [http://localhost:3000/users](http://localhost:3000/users), and the roles page is at [http://localhost:3000/roles](http://localhost:3000/roles). The SQLite database is created automatically the first time the application starts.

I created this software to build on my TypeScript experience and develop practical skills in web application design. It brings together server-side routing, dynamic page rendering, form validation, database operations, and responsive user interfaces in one project.

**Software Demo Video:** Replace this placeholder with a 4–5 minute YouTube demonstration showing how to start the server, navigate the pages, and walk through the application code.

[Software Demo Video](http://youtube.link.goes.here)

# Web Pages

- **Dashboard (`/`)** — The home page summarizes the number of business users and displays up to five recently added records. Links take the user to the directory or an individual user's details.
- **Business Users (`/users`)** — This page combines a form for adding a user with the user directory. The directory is generated from database records and supports searching by name, email, or role. Each row links to user details and provides edit and delete actions. Successful actions display a status message.
- **User Details (`/users/:id`)** — Selecting a user's name opens a page showing that user's ID, name, email, and role. The page links to the edit form and provides a delete action.
- **Edit Business User (`/users/:id/edit`)** — The edit link opens a form pre-filled with the selected user's current information. Submitting valid changes updates the database and returns to that user's details.
- **Business Roles (`/roles`)** — The navigation links to a dynamically generated summary of all available roles and the number of users assigned to each. Each role links to a filtered user directory.
- **Error page** — Invalid page and user URLs show a helpful message and a link back to the dashboard.

The shared navigation connects the dashboard, user directory, and roles page. User actions and directory links transition between the directory, details, and edit pages.

# Development Environment

I used Visual Studio Code, Node.js, npm, Git, and PowerShell to develop and test the application.

The application is written in **TypeScript** and runs on **Node.js**. **Express** handles routes and form submissions, **EJS** renders pages using data from the application, and **better-sqlite3** stores the user records in SQLite. The interface uses HTML and CSS, and the automated tests use Node.js's built-in test runner.

# Useful Websites

* [Node.js Documentation](https://nodejs.org/docs/latest/api/)
* [TypeScript Documentation](https://www.typescriptlang.org/docs/)
* [Express Documentation](https://expressjs.com/)
* [EJS Documentation](https://ejs.co/)
* [SQLite Documentation](https://www.sqlite.org/docs.html)
* [better-sqlite3 Documentation](https://github.com/WiseLibs/better-sqlite3)
* [MDN Web Docs](https://developer.mozilla.org/)

# Future Work

* Add administrator authentication and protect user-management actions before using the application with real or sensitive records.
* Configure persistent database storage and migrate from SQLite to PostgreSQL if deploying with a hosted PostgreSQL service.
* Add pagination and sorting for larger user directories.
* Add audit history to record changes to business user information.
* Record and publish the 4–5 minute software demonstration video, then replace the placeholder link above.
