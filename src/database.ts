import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

export function createDatabase(
    databasePath = resolve(__dirname, "..", "database", "bizaccess.db")
): Database.Database {
    if (databasePath !== ":memory:") {
        mkdirSync(dirname(databasePath), { recursive: true });
    }

    const db = new Database(databasePath);
    db.pragma("foreign_keys = ON");
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            role TEXT NOT NULL
        )
    `).run();
    db.prepare("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email COLLATE NOCASE)").run();

    console.log("Database connected successfully.");
    return db;
}
