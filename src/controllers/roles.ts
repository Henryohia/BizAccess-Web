// src/controllers/roles.ts
// Documentation for the roles controller
/**
 * Creates a roles controller for handling role-related requests.
 * @param db - The database instance.
 * @returns A request handler for the roles route.
 */

import type Database from "better-sqlite3";
import type { RequestHandler } from "express";
import { getUserRoleSummaries } from "../models/users";

// Creates a roles controller for handling role-related requests.
/**
 * Creates a roles controller for handling role-related requests.
 * @param db - The database instance.
 * @returns A request handler for the roles route.
 */

export function createRolesController(db: Database.Database): RequestHandler {
    return (_request, response) => {
        const roles = getUserRoleSummaries(db);
        const userCount = roles.reduce((total, role) => total + role.userCount, 0);

        response.render("roles", {
            title: "Business roles",
            roles,
            userCount
        });
    };
}
