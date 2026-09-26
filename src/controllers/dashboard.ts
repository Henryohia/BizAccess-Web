import type Database from "better-sqlite3";
import type { RequestHandler } from "express";
import { countUsers, getRecentUsers } from "../models/users";

export function createDashboardController(db: Database.Database): RequestHandler {
    return (_request, response) => {
        response.render("index", {
            title: "Dashboard",
            userCount: countUsers(db),
            recentUsers: getRecentUsers(db)
        });
    };
}
