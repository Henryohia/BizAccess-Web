// src/models/users.ts

import type Database from "better-sqlite3";

// Documentation for the users model
/**
 * Represents a business user in the system.
 */

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

export interface UserRoleSummary {
    name: UserRole;
    userCount: number;
}

// Counts the total number of users in the database.
/**
 * Counts the total number of users in the database.
 * @param db - The database instance.
 * @returns The total number of users.
 */

export function countUsers(db: Database.Database): number {
    return (db.prepare("SELECT COUNT(*) AS count FROM users").get() as { count: number }).count;
}

export function getUserRoleSummaries(db: Database.Database): UserRoleSummary[] {
    const counts = db.prepare(`
        SELECT role, COUNT(*) AS count FROM users GROUP BY role
    `).all() as Array<{ role: string; count: number }>;
    const countByRole = new Map(counts.map(({ role, count }) => [role, count]));

    return userRoles.map((name) => ({
        name,
        userCount: countByRole.get(name) ?? 0
    }));
}

// Retrieves the most recent users from the database.
/**
 * Retrieves the most recent users from the database.
 * @param db - The database instance.
 * @returns An array of the most recent business users.
 */

export function getRecentUsers(db: Database.Database): BusinessUser[] {
    return db.prepare(`
        SELECT id, name, email, role FROM users
        ORDER BY id DESC LIMIT 5
    `).all() as BusinessUser[];
}

// Retrieves users from the database based on a search query.
/**
 * Retrieves users from the database based on a search query.
 * @param db - The database instance.
 * @param query - The search query.
 * @returns An array of business users matching the search criteria.
 */

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


// Retrieves a user by ID from the database.
/**
 * Retrieves a user by ID from the database.
 * @param db - The database instance.
 * @param id - The ID of the user to retrieve.
 * @returns The business user with the specified ID, or undefined if not found.
 */

export function getUserById(db: Database.Database, id: number): BusinessUser | undefined {
    return db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(id) as BusinessUser | undefined;
}

// Checks if an email already exists in the database, optionally excluding a specific user ID.
/**
 * Checks if an email already exists in the database, optionally excluding a specific user ID.
 * @param db - The database instance.
 * @param email - The email to check for existence.
 * @param exceptId - An optional user ID to exclude from the check.
 * @returns True if the email exists (excluding the specified user ID), false otherwise.
 */

export function emailExists(db: Database.Database, email: string, exceptId?: number): boolean {
    const match = exceptId === undefined
        ? db.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE").get(email)
        : db.prepare("SELECT id FROM users WHERE email = ? COLLATE NOCASE AND id != ?").get(email, exceptId);
    return match !== undefined;
}

// Creates a new user in the database.
/**
 * Creates a new user in the database.
 * @param db - The database instance.
 * @param user - The user input values for the new user.
 */

export function createUser(db: Database.Database, user: UserInput): void {
    db.prepare("INSERT INTO users (name, email, role) VALUES (?, ?, ?)").run(
        user.name,
        user.email,
        user.role
    );
}

// Updates an existing user in the database by ID.
/**
 * Updates an existing user in the database by ID.
 *  @param db - The database instance.
 * @param id - The ID of the user to update.
 * @param user - The updated user input values.
 */

export function updateUser(db: Database.Database, id: number, user: UserInput): void {
    db.prepare("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?").run(
        user.name,
        user.email,
        user.role,
        id
    );
}

// Deletes a user from the database by ID.
/**
 * Deletes a user from the database by ID.
 * @param db - The database instance.
 * @param id - The ID of the user to delete.
 */

export function deleteUser(db: Database.Database, id: number): void {
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
}
