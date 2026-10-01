// src/controllers/dashboard.ts
// Documentation for the dashboard controller
/**
 * Creates a dashboard controller for handling dashboard-related requests.
 * @param db - The database instance.
 * @returns A request handler for the dashboard route.
 */
import type Database from "better-sqlite3";
import type { RequestHandler } from "express";
import { countUsers, getRecentUsers } from "../models/users";

// Creates a dashboard controller for handling dashboard-related requests.
/**
 * Creates a dashboard controller for handling dashboard-related requests.
 * @param db - The database instance.
 * @returns A request handler for the dashboard route.
 */
export function createDashboardController(db: Database.Database): RequestHandler {
    return (_request, response) => {
        response.render("index", {
            title: "Dashboard",
            userCount: countUsers(db),
            recentUsers: getRecentUsers(db)
        });
    };
}
