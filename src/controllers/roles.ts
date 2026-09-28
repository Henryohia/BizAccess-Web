import type Database from "better-sqlite3";
import type { RequestHandler } from "express";
import { getUserRoleSummaries } from "../models/users";

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
