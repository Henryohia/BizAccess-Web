import type Database from "better-sqlite3";

export const userRoles = [
    "Administrator",
    "Director",
    "Manager",
    "Supervisor",
    "Team Lead",
    "Analyst",
    "Developer",
    "Support Specialist",
    "Staff"
] as const;
export type UserRole = (typeof userRoles)[number];

export interface BusinessUser {
    id: number;
    name: string;
    email: string;
    role: UserRole;
}

export interface UserInput {
    name: string;
    email: string;
    role: string;
}

export function countUsers(db: Database.Database): number {
    return (db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number }).count;
}

export function getRecentUsers(db: Database.Database): BusinessUser[] {
    return db.prepare(`
        SELECT id, name, email, role FROM users
        ORDER BY id DESC LIMIT 5
    `).all() as BusinessUser[];
}

export function getUsers(db: Database.Database, query = ""): BusinessUser[] {
    if (!query) {
        return db.prepare(`
            SELECT id, name, email, role FROM users
            ORDER BY name COLLATE NOCASE
        `).all() as BusinessUser[];
    }

    const searchTerm = query.replace(/[\\%_]/g, "\\$&");
    return db.prepare(`
        SELECT id, name, email, role FROM users
        WHERE name LIKE ? ESCAPE '\\' COLLATE NOCASE
            OR email LIKE ? ESCAPE '\\' COLLATE NOCASE
            OR role LIKE ? ESCAPE '\\' COLLATE NOCASE
        ORDER BY name COLLATE NOCASE
    `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`) as BusinessUser[];
}

export function getUserById(db: Database.Database, id: number): BusinessUser | undefined {
    return db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id) as BusinessUser | undefined;
}

export function emailExists(db: Database.Database, email: string, exceptId?: number): boolean {
    const match = exceptId === undefined
        ? db.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE").get(email)
        : db.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE AND id != ?").get(email, exceptId);
    return match !== undefined;
}

export function createUser(db: Database.Database, user: UserInput): void {
    db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run(
        user.name,
        user.email,
        user.role
    );
}

export function updateUser(db: Database.Database, id: number, user: UserInput): void {
    db.prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?").run(
        user.name,
        user.email,
        user.role,
        id
    );
}

export function deleteUser(db: Database.Database, id: number): void {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
}
